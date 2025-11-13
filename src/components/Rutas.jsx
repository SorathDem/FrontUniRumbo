import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import HeaderConductor from "./HeaderConductor";
import "../styles/Rutas.css";

const API_URL = "https://localhost:7086/api/Rutas";

// Iconos personalizados
const iconOrigen = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});
const iconDestino = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});

export default function MapaRutas() {
  const [rutas, setRutas] = useState([]);
  const [trazadas, setTrazadas] = useState({});
  const [modalEditarRuta, setModalEditarRuta] = useState(false);
  const [rutaActualEditar, setRutaActualEditar] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaRuta, setNuevaRuta] = useState({
    puntoOrigen: "",
    puntoDestino: "",
    horaSalida: "",
    horaRegreso: "",
    desVehiculo: "",
    cuposIda: "",
    cuposVuelta: "",
    idUsuario: Number(localStorage.getItem("idUsuario") || 0),
    idVehiculo: "",
    diasRuta: "",
  });
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const diasSemana = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];

  const idUsuarioLogueado = Number(localStorage.getItem("idUsuario") || 0);
  const centerDefault = [4.60971, -74.08175]; // Bogotá

  // =========================
  // Obtener rutas
  // =========================
  const obtenerRutas = async () => {
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      setRutas(
        data.map((r) => ({
          idRuta: r.idRuta ?? r.IdRuta ?? r.id ?? r.Id,
          puntoOrigen: r.puntoOrigen ?? r.PuntoOrigen ?? r.origen ?? r.Origen ?? r.punto_origen,
          puntoDestino: r.puntoDestino ?? r.PuntoDestino ?? r.destino ?? r.Destino ?? r.punto_destino,
          horaSalida: r.horaSalida ?? r.HoraSalida ?? r.hora_salida ?? r.HoraSalida,
          horaRegreso: r.horaRegreso ?? r.HoraRegreso ?? r.hora_regreso ?? r.HoraRegreso,
          desVehiculo: r.desVehiculo ?? r.desVehiculo ?? r.desVehiculo ?? r.desVehiculo,
          cuposIda: r.cuposIda ?? r.CuposIda ?? r.cupos_ida ?? r.CuposIda,
          cuposVuelta: r.cuposVuelta ?? r.CuposVuelta ?? r.cupos_vuelta ?? r.CuposVuelta,
          idUsuario: r.idUsuario ?? r.IdUsuario ?? r.id_usuario ?? r.IdUsuario,
          idVehiculo: r.idVehiculo ?? r.IdVehiculo ?? r.id_vehiculo ?? r.IdVehiculo,
          diasRuta: r.diasRuta ?? r.DiasRuta ?? r.dias_ruta ?? r.DiasRuta,
        }))
      );
    } catch (error) {
      console.error("Error al cargar rutas:", error);
      alert("Error al cargar rutas");
    }
  };

  useEffect(() => {
    obtenerRutas();
  }, []);

  // =========================
  // Geocodificar
  // =========================
  const geocodificar = async (direccion) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`
      );
      if (res.data && res.data.length > 0) {
        return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
      }
      return null;
    } catch (error) {
      console.error("Error geocodificando:", error);
      return null;
    }
  };

  // =========================
  // Obtener ruta real con OSRM
  // =========================
  const obtenerRutaReal = async (origen, destino) => {
    try {
      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`
      );
      if (res.data?.routes && res.data.routes.length > 0) {
        return res.data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      }
      return null;
    } catch (error) {
      console.error("Error al obtener ruta OSRM:", error);
      return null;
    }
  };

  // =========================
  // Trazar ruta
  // =========================
  const trazarRuta = async (ruta) => {
    try {
      const id = ruta.idRuta;
      const origenText = ruta.puntoOrigen;
      const destinoText = ruta.puntoDestino;
      if (!origenText || !destinoText) return;

      const origen = await geocodificar(origenText);
      const destino = await geocodificar(destinoText);
      if (!origen || !destino) return;

      const camino = await obtenerRutaReal(origen, destino);
      setTrazadas((prev) => ({
        ...prev,
        [id]: { origen, destino, camino: camino || [origen, destino] },
      }));
    } catch (error) {
      console.error("Error trazando la ruta:", error);
    }
  };

  // =========================
  // Manejar días seleccionados
  // =========================
  const manejarDiaSeleccionado = (dia) => {
    setDiasSeleccionados((prev) => (prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]));
  };

  // =========================
  // Crear ruta
  // =========================
  const crearRuta = async (e) => {
    e.preventDefault();
    const diasConcatenados = diasSeleccionados.join(",");

    try {
      const hoy = new Date().toISOString().split("T")[0];
      const horaSalidaCompleta = nuevaRuta.horaSalida ? `${hoy}T${nuevaRuta.horaSalida}` : null;
      const horaRegresoCompleta = nuevaRuta.horaRegreso ? `${hoy}T${nuevaRuta.horaRegreso}` : null;

      const payload = {
        puntoOrigen: nuevaRuta.puntoOrigen,
        puntoDestino: nuevaRuta.puntoDestino,
        horaSalida: horaSalidaCompleta,
        horaRegreso: horaRegresoCompleta,
        desVehiculo: nuevaRuta.desVehiculo,
        cuposIda: parseInt(nuevaRuta.cuposIda, 10) || 0,
        cuposVuelta: parseInt(nuevaRuta.cuposVuelta, 10) || 0,
        idVehiculo: nuevaRuta.idVehiculo === "1" ? 1 : 0,
        idUsuario: idUsuarioLogueado,
        diasRuta: diasConcatenados,
      };

      const res = await axios.post(API_URL, payload);
      alert("Ruta creada ✅");
      await obtenerRutas();

      const nueva = res?.data;
      if (nueva) trazarRuta(nueva);

      setNuevaRuta({
        puntoOrigen: "",
        puntoDestino: "",
        horaSalida: "",
        horaRegreso: "",
        desVehiculo: "",
        cuposIda: "",
        cuposVuelta: "",
        idUsuario: idUsuarioLogueado,
        idVehiculo: "",
        diasRuta: "",
      });
      setDiasSeleccionados([]);
      setMostrarFormulario(false);
    } catch (error) {
      console.error("Error crear ruta:", error);
      alert("Error al crear la ruta ❌");
    }
  };

  // =========================
  // Editar ruta
  // =========================
  const handleEditarRuta = async (ruta) => {
    const nuevaHoraSalida = prompt(
      "Nueva hora de salida (HH:MM):",
      ruta.horaSalida ? ruta.horaSalida.split("T")[1] : ""
    );
    if (nuevaHoraSalida === null) return;

    const nuevaHoraRegreso = prompt(
      "Nueva hora de regreso (HH:MM):",
      ruta.horaRegreso ? ruta.horaRegreso.split("T")[1] : ""
    );
    if (nuevaHoraRegreso === null) return;

    const nuevosCuposIda = prompt("Cupos ida:", ruta.cuposIda ?? "");
    if (nuevosCuposIda === null) return;

    const nuevosCuposVuelta = prompt("Cupos vuelta:", ruta.cuposVuelta ?? "");
    if (nuevosCuposVuelta === null) return;

    const nuevoIdVehiculo = prompt("Tipo de vehículo (1=Carro, 0=Moto):", ruta.idVehiculo ?? "");
    if (nuevoIdVehiculo === null) return;

    const nuevosDiasRuta = prompt("Días de ruta (coma separados):", ruta.diasRuta ?? "");
    if (nuevosDiasRuta === null) return;

    try {
      const hoy = new Date().toISOString().split("T")[0];
      const payload = {
        horaSalida: nuevaHoraSalida ? `${hoy}T${nuevaHoraSalida}` : null,
        horaRegreso: nuevaHoraRegreso ? `${hoy}T${nuevaHoraRegreso}` : null,
        cuposIda: parseInt(nuevosCuposIda, 10) || 0,
        cuposVuelta: parseInt(nuevosCuposVuelta, 10) || 0,
        idVehiculo: parseInt(nuevoIdVehiculo, 10),
        diasRuta: nuevosDiasRuta,
        desVehiculo: ruta.desVehiculo,
        puntoOrigen: ruta.puntoOrigen,
        puntoDestino: ruta.puntoDestino,
        idUsuario: ruta.idUsuario,
      };

      const res = await fetch(`${API_URL}/${ruta.idRuta}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al actualizar la ruta");
      alert("Ruta actualizada ✅");
      obtenerRutas();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la ruta ❌");
    }
  };

  // =========================
  // Eliminar ruta
  // =========================
  const handleEliminarRuta = async (idRuta) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta ruta?")) return;
    try {
      const res = await fetch(`${API_URL}/${idRuta}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar la ruta");
      alert("Ruta eliminada ✅");
      obtenerRutas();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la ruta ❌");
    }
  };

  // =========================
  // Filtrar rutas del usuario logueado
  // =========================
  const misRutas = rutas.filter((ruta) => Number(ruta.idUsuario) === idUsuarioLogueado);

  // =========================
  // Render
  // =========================
  return (
   <div className="rutas-page">
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <HeaderConductor />

      {/* Formulario Crear Ruta */}
{mostrarFormulario && (
  <form onSubmit={crearRuta} className="form-ruta">
    <h3>Crear nueva ruta</h3>
    <input 
      className="input-format"
      placeholder="Origen"
      value={nuevaRuta.puntoOrigen}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, puntoOrigen: e.target.value })}
      required
    />
    <input
      className="input-format"
      placeholder="Destino"
      value={nuevaRuta.puntoDestino}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, puntoDestino: e.target.value })}
      required
    />
    <input
    className="input-format"
      type="time"
      placeholder="Hora salida"
      value={nuevaRuta.horaSalida}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, horaSalida: e.target.value })}
    />
    <input
    className="input-format"
      type="time"
      placeholder="Hora regreso"
      value={nuevaRuta.horaRegreso}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, horaRegreso: e.target.value })}
    />
    <input
    className="input-format"
      placeholder="Descripción vehículo"
      value={nuevaRuta.desVehiculo}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, desVehiculo: e.target.value })}
    />
    <input
    className="input-format"
      type="number"
      placeholder="Cupos ida"
      value={nuevaRuta.cuposIda}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, cuposIda: e.target.value })}
    />
    <input
    className="input-format"
      type="number"
      placeholder="Cupos vuelta"
      value={nuevaRuta.cuposVuelta}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, cuposVuelta: e.target.value })}
    />
    <select
    className="input-format"
      value={nuevaRuta.idVehiculo}
      onChange={(e) => setNuevaRuta({ ...nuevaRuta, idVehiculo: e.target.value })}
    >
      <option value="">Seleccionar vehículo</option>
      <option value="1">Carro</option>
      <option value="0">Moto</option>
    </select>
    <div>
      {diasSemana.map((dia) => (
        <label key={dia}>
          <input
            type="checkbox"
            checked={diasSeleccionados.includes(dia)}
            onChange={() => manejarDiaSeleccionado(dia)}
          />
          {dia}
        </label>
      ))}
    </div>
    <button type="submit">Crear Ruta</button>
  </form>
)}

<button className="btn-toggle-form" onClick={() => setMostrarFormulario((prev) => !prev)} style={{ marginTop: 10 }}>
  {mostrarFormulario ? "Cancelar" : "Nueva Ruta"}
</button>


      {/* Listado de rutas */}
      {misRutas.length === 0 && <p>No tienes rutas registradas.</p>}

      {misRutas.map((r) => {
        const id = r.idRuta;
        return (
          <div key={id} style={{ padding: 10, border: "1px solid #ccc", borderRadius: 5, backgroundColor: "#fff" }}>
            <strong>Origen:</strong> {r.puntoOrigen}<br />
            <strong>Destino:</strong> {r.puntoDestino}<br />
            <strong>Hora salida:</strong> {r.horaSalida ? new Date(r.horaSalida).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}<br />
            <strong>Hora regreso:</strong> {r.horaRegreso ? new Date(r.horaRegreso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}<br />
            <strong>Descripción vehículo:</strong> {r.desVehiculo}<br />
            <strong>Cupos ida:</strong> {r.cuposIda}<br />
            <strong>Cupos vuelta:</strong> {r.cuposVuelta}<br />
            <strong>Tipo Vehículo:</strong> {r.idVehiculo === 1 ? "Carro 🚗" : "Moto 🏍️"}<br />
            <strong>Días Ruta:</strong> {r.diasRuta ?? "No especificado"}<br />

            {/* Mini mapa */}
            <div style={{ border: "1px solid #007bff", borderRadius: 5, overflow: "hidden", marginTop: 10 }}>
              <MapContainer center={trazadas[id]?.origen || centerDefault} zoom={8} style={{ height: "240px", width: "100%" }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
                {trazadas[id]?.camino && <Polyline positions={trazadas[id].camino} weight={4} />}
                {trazadas[id]?.origen && <Marker position={trazadas[id].origen} icon={iconOrigen}><Popup>Origen: {r.puntoOrigen}</Popup></Marker>}
                {trazadas[id]?.destino && <Marker position={trazadas[id].destino} icon={iconDestino}><Popup>Destino: {r.puntoDestino}</Popup></Marker>}
              </MapContainer>
            </div>

            {/* Botones */}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => handleEditarRuta(r)} className="btn-editar">Editar</button>
              <button onClick={() => handleEliminarRuta(r.idRuta)} className="btn-editar">Eliminar</button>
              <button onClick={() => trazarRuta(r)} className="btn-editar">Trazar Ruta</button>
            </div>
          </div>
        );
      })}
    </div>
    </div> 
  );
}
