import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import HeaderConductor from "./HeaderConductor";
import "../styles/Rutas.css";

import {
  FaRoute,
  FaPlusCircle,
  FaClock,
  FaCarSide,
  FaMotorcycle,
  FaMapMarkerAlt,
  FaUsers,
  FaTrashAlt,
  FaEdit,
  FaDrawPolygon,
} from "react-icons/fa";

const API_URL = "https://unirumbobakend.onrender.com/api/Rutas";

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

// ====== MODAL BONITO DE EDITAR RUTA (pégalo aquí) ======
const EditarRutaModal = ({ ruta, isOpen, onClose, onGuardar }) => {
  const [form, setForm] = useState({
    horaSalida: ruta.horaSalida ? ruta.horaSalida.split("T")[1].slice(0, 5) : "",
    horaRegreso: ruta.horaRegreso ? ruta.horaRegreso.split("T")[1].slice(0, 5) : "",
    cuposIda: ruta.cuposIda || "",
    cuposVuelta: ruta.cuposVuelta || "",
    idVehiculo: ruta.idVehiculo?.toString() || "",
    diasRuta: ruta.diasRuta || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const hoy = new Date().toISOString().split("T")[0];
    const payload = {
      horaSalida: form.horaSalida ? `${hoy}T${form.horaSalida}` : null,
      horaRegreso: form.horaRegreso ? `${hoy}T${form.horaRegreso}` : null,
      cuposIda: parseInt(form.cuposIda, 10) || 0,
      cuposVuelta: parseInt(form.cuposVuelta, 10) || 0,
      idVehiculo: parseInt(form.idVehiculo, 10),
      diasRuta: form.diasRuta,
      desVehiculo: ruta.desVehiculo,
      puntoOrigen: ruta.puntoOrigen,
      puntoDestino: ruta.puntoDestino,
      idUsuario: ruta.idUsuario,
    };
    onGuardar(ruta.idRuta, payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Editar Ruta
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hora Salida</label>
              <input type="time" name="horaSalida" value={form.horaSalida} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hora Regreso</label>
              <input type="time" name="horaRegreso" value={form.horaRegreso} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cupos Ida</label>
              <input type="number" name="cuposIda" value={form.cuposIda} onChange={handleChange} min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Cupos Vuelta</label>
              <input type="number" name="cuposVuelta" value={form.cuposVuelta} onChange={handleChange} min="0"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Vehículo</label>
            <select name="idVehiculo" value={form.idVehiculo} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
              <option value="">Selecciona...</option>
              <option value="1">Carro</option>
              <option value="0">Moto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Días (separados por coma)</label>
            <input type="text" name="diasRuta" value={form.diasRuta} onChange={handleChange}
              placeholder="Lunes, Miércoles, Viernes"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" />
          </div>

          <div className="flex gap-4 pt-6">
            <button type="submit" className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">
              Guardar
            </button>
            <button type="button" onClick={onClose} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function MapaRutas() {
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [rutaAEditar, setRutaAEditar] = useState(null);
  const [rutas, setRutas] = useState([]);
  const [trazadas, setTrazadas] = useState({});
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

  const diasSemana = [
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
    "domingo",
  ];

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
          puntoOrigen:
            r.puntoOrigen ??
            r.PuntoOrigen ??
            r.origen ??
            r.Origen ??
            r.punto_origen,
          puntoDestino:
            r.puntoDestino ??
            r.PuntoDestino ??
            r.destino ??
            r.Destino ??
            r.punto_destino,
          horaSalida:
            r.horaSalida ?? r.HoraSalida ?? r.hora_salida ?? r.HoraSalida,
          horaRegreso:
            r.horaRegreso ?? r.HoraRegreso ?? r.hora_regreso ?? r.HoraRegreso,
          desVehiculo: r.desVehiculo ?? r.DesVehiculo ?? "",
          cuposIda: r.cuposIda ?? r.CuposIda ?? r.cupos_ida ?? r.CuposIda,
          cuposVuelta:
            r.cuposVuelta ?? r.CuposVuelta ?? r.cupos_vuelta ?? r.CuposVuelta,
          idUsuario: r.idUsuario ?? r.IdUsuario ?? r.id_usuario ?? r.IdUsuario,
          idVehiculo:
            r.idVehiculo ?? r.IdVehiculo ?? r.id_vehiculo ?? r.IdVehiculo,
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
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          direccion
        )}`
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
        return res.data.routes[0].geometry.coordinates.map((c) => [
          c[1],
          c[0],
        ]);
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
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  // =========================
  // Crear ruta
  // =========================
  const crearRuta = async (e) => {
    e.preventDefault();
    const diasConcatenados = diasSeleccionados.join(",");

    try {
      const hoy = new Date().toISOString().split("T")[0];
      const horaSalidaCompleta = nuevaRuta.horaSalida
        ? `${hoy}T${nuevaRuta.horaSalida}`
        : null;
      const horaRegresoCompleta = nuevaRuta.horaRegreso
        ? `${hoy}T${nuevaRuta.horaRegreso}`
        : null;

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
  // Editar ruta (simple con prompt)
  // =========================
  const abrirModalEditar = (ruta) => {
  setRutaAEditar(ruta);
  setModalEditarAbierto(true);
};

// =========================
// GUARDAR EDICIÓN DE RUTA
// =========================
const handleGuardarEdicion = async (idRuta, payload) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/${idRuta}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Error al actualizar ruta");
    }

    alert("Ruta actualizada con éxito");
    obtenerRutas();
    setModalEditarAbierto(false);
    setRutaAEditar(null);
  } catch (error) {
    console.error("Error actualizando ruta:", error);
    alert("Error al actualizar la ruta");
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
  const misRutas = rutas.filter(
    (ruta) => Number(ruta.idUsuario) === idUsuarioLogueado
  );

  return (
    <>
      {/* Fuente Poppins global para esta vista */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="rutas-page">
        <HeaderConductor />

        <div className="rutas-content">
          {/* Header de sección */}
          <header className="rutas-header">
            <h2 className="rutas-title">
              <FaRoute className="rutas-title-icon" />
              Mis rutas
            </h2>

            <button
              className="btn-toggle-form"
              onClick={() => setMostrarFormulario((prev) => !prev)}
            >
              <FaPlusCircle />
              {mostrarFormulario ? "Cancelar" : "Nueva ruta"}
            </button>
          </header>

          {/* Formulario Crear Ruta */}
          {mostrarFormulario && (
            <form onSubmit={crearRuta} className="form-ruta">
              <h3>Crear nueva ruta</h3>

              <div className="form-row">
                <input
                  className="input-format"
                  placeholder="Origen (ej. Funza, Mosquera)"
                  value={nuevaRuta.puntoOrigen}
                  onChange={(e) =>
                    setNuevaRuta({
                      ...nuevaRuta,
                      puntoOrigen: e.target.value,
                    })
                  }
                  required
                />

                <input
                  className="input-format"
                  placeholder="Destino (ej. UdeC Facatativá)"
                  value={nuevaRuta.puntoDestino}
                  onChange={(e) =>
                    setNuevaRuta({
                      ...nuevaRuta,
                      puntoDestino: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaClock className="label-icon" />
                    Hora salida
                  </label>
                  <input
                    className="input-format"
                    type="time"
                    value={nuevaRuta.horaSalida}
                    onChange={(e) =>
                      setNuevaRuta({
                        ...nuevaRuta,
                        horaSalida: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaClock className="label-icon" />
                    Hora regreso
                  </label>
                  <input
                    className="input-format"
                    type="time"
                    value={nuevaRuta.horaRegreso}
                    onChange={(e) =>
                      setNuevaRuta({
                        ...nuevaRuta,
                        horaRegreso: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaCarSide className="label-icon" />
                    Descripción vehículo
                  </label>
                  <input
                    className="input-format"
                    placeholder="Ej. Mazda 3 blanco"
                    value={nuevaRuta.desVehiculo}
                    onChange={(e) =>
                      setNuevaRuta({
                        ...nuevaRuta,
                        desVehiculo: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaUsers className="label-icon" />
                    Cupos ida
                  </label>
                  <input
                    className="input-format"
                    type="number"
                    min="0"
                    value={nuevaRuta.cuposIda}
                    onChange={(e) =>
                      setNuevaRuta({
                        ...nuevaRuta,
                        cuposIda: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaUsers className="label-icon" />
                    Cupos vuelta
                  </label>
                  <input
                    className="input-format"
                    type="number"
                    min="0"
                    value={nuevaRuta.cuposVuelta}
                    onChange={(e) =>
                      setNuevaRuta({
                        ...nuevaRuta,
                        cuposVuelta: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaMotorcycle className="label-icon" />
                    Tipo de vehículo
                  </label>
                  <select
                    className="input-format"
                    value={nuevaRuta.idVehiculo}
                    onChange={(e) =>
                      setNuevaRuta({
                        ...nuevaRuta,
                        idVehiculo: e.target.value,
                      })
                    }
                  >
                    <option value="">Seleccionar vehículo</option>
                    <option value="1">Carro</option>
                    <option value="0">Moto</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group dias-semana">
                  <label>
                    <FaMapMarkerAlt className="label-icon" />
                    Días de la ruta
                  </label>
                  <div className="dias-semana-checkboxes">
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
                </div>
              </div>

              <button type="submit" className="btn-crear-ruta">
                Crear ruta
              </button>
            </form>
          )}

          {/* Listado de rutas */}
          {misRutas.length === 0 ? (
            <p className="no-rutas">No tienes rutas registradas.</p>
          ) : (
            <div className="rutas-list">
              {misRutas.map((r) => {
                const id = r.idRuta;
                const infoTrazada = trazadas[id];

                return (
                  <article key={id} className="ruta-card">
                    <div className="ruta-card-head">
                      <div>
                        <h3>
                          <FaRoute className="ruta-icon" />
                          {r.puntoOrigen} → {r.puntoDestino}
                        </h3>
                        <p className="ruta-text">
                          <FaClock className="ruta-inline-icon" />
                          Salida:{" "}
                          {r.horaSalida
                            ? new Date(r.horaSalida).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}{" "}
                          | Regreso:{" "}
                          {r.horaRegreso
                            ? new Date(r.horaRegreso).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </p>
                        <p className="ruta-text">
                          <FaCarSide className="ruta-inline-icon" />
                          Vehículo: {r.desVehiculo || "Sin descripción"} (
                          {r.idVehiculo === 1 ? "Carro 🚗" : "Moto 🏍️"})
                        </p>
                        <p className="ruta-text">
                          <FaUsers className="ruta-inline-icon" />
                          Cupos ida: {r.cuposIda ?? 0} | Cupos vuelta:{" "}
                          {r.cuposVuelta ?? 0}
                        </p>
                        <p className="ruta-text">
                          <FaMapMarkerAlt className="ruta-inline-icon" />
                          Días: {r.diasRuta ?? "No especificado"}
                        </p>
                      </div>
                    </div>

                    {/* Mini mapa */}
                    <div className="mapa-mini">
                      <MapContainer
                        center={infoTrazada?.origen || centerDefault}
                        zoom={10}
                        scrollWheelZoom={false}
                        dragging={true}
                        style={{ height: "100%", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution="&copy; OpenStreetMap contributors"
                        />
                        {infoTrazada?.camino && (
                          <Polyline
                            positions={infoTrazada.camino}
                            weight={4}
                          />
                        )}
                        {infoTrazada?.origen && (
                          <Marker
                            position={infoTrazada.origen}
                            icon={iconOrigen}
                          >
                            <Popup>Origen: {r.puntoOrigen}</Popup>
                          </Marker>
                        )}
                        {infoTrazada?.destino && (
                          <Marker
                            position={infoTrazada.destino}
                            icon={iconDestino}
                          >
                            <Popup>Destino: {r.puntoDestino}</Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    </div>

                    {/* Botones */}
                    <div className="ruta-actions">
                    <button
                      onClick={() => abrirModalEditar(r)}  // ← CAMBIA ESTO
                      className="btn-editar"
                      type="button"
                    >
                      <FaEdit /> Editar
                    </button>
                      <button
                        onClick={() => handleEliminarRuta(r.idRuta)}
                        className="btn-eliminar"
                        type="button"
                      >
                        <FaTrashAlt />
                        Eliminar
                      </button>
                      <button
                        onClick={() => trazarRuta(r)}
                        className="btn-trazar"
                        type="button"
                      >
                        <FaDrawPolygon />
                        Trazar ruta
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
        {/* MODAL DE EDITAR RUTA */}
        {rutaAEditar && (
          <EditarRutaModal
            ruta={rutaAEditar}
            isOpen={modalEditarAbierto}
            onClose={() => setModalEditarAbierto(false)}
            onGuardar={handleGuardarEdicion}
          />
        )}
      </div>
    </>
  );
}
