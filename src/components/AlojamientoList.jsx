// src/components/AlojamientoList.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import HeaderArrendatario from "./HeaderArrendatario";
import "../styles/Alojamiento.css";

// Íconos
import { FaHome, FaEdit, FaTrashAlt, FaPlusCircle } from "react-icons/fa";

// 🔹 Icono personalizado
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// 🔹 Selección de ubicación en el mapa
const LocationPicker = ({ setNuevaUbicacion }) => {
  useMapEvents({
    click(e) {
      setNuevaUbicacion(e.latlng);
    },
  });
  return null;
};

const AlojamientoList = () => {
  const [alojamientos, setAlojamientos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [imagenes, setImagenes] = useState([]);

  // 🔹 Cargar alojamientos desde API
  const obtenerAlojamientos = async () => {
    try {
      const response = await fetch("https://unirumbobakend.onrender.com/api/Alojamiento");
      const data = await response.json();
      setAlojamientos(data);
    } catch (error) {
      console.error("Error al obtener alojamientos:", error);
    }
  };

  useEffect(() => {
    obtenerAlojamientos();
  }, []);

  // 🔹 Guardar un nuevo alojamiento
  const handleGuardar = async () => {
    if (!nuevaUbicacion) {
      alert("Selecciona un punto en el mapa.");
      return;
    }

    const user = JSON.parse(localStorage.getItem("usuario"));
    const idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");

    const body = {
      titulo,
      direccion,
      descripcion,
      latitud: nuevaUbicacion.lat,
      longitud: nuevaUbicacion.lng,
      id_Usuario: parseInt(idUsuario),
      imagenesBase64: imagenes,
    };

    try {
      const res = await fetch(
        "https://unirumbobakend.onrender.com/api/Alojamiento/con-imagenes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Error creando alojamiento");
      alert("Alojamiento creado con éxito");

      setTitulo("");
      setDireccion("");
      setDescripcion("");
      setNuevaUbicacion(null);
      setImagenes([]);
      setMostrarFormulario(false);
      obtenerAlojamientos();
    } catch (error) {
      console.error(error);
      alert("Error al guardar alojamiento");
    }
  };

  // 🔹 Eliminar
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este alojamiento?")) return;

    try {
      const res = await fetch(
        `https://unirumbobakend.onrender.com/api/Alojamiento/${id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Error al eliminar");

      alert("Alojamiento eliminado");
      setAlojamientos(alojamientos.filter((a) => a.idAlojamiento !== id));
    } catch (error) {
      alert("Error al eliminar alojamiento");
    }
  };

  // 🔹 Editar (simple, usando prompt)
  const handleEditar = async (a) => {
    const nuevoTitulo = prompt("Nuevo título:", a.titulo);
    if (nuevoTitulo === null) return;

    const nuevaDireccion = prompt("Nueva dirección:", a.direccion);
    if (nuevaDireccion === null) return;

    const nuevaDescripcion = prompt("Nueva descripción:", a.descripcion);
    if (nuevaDescripcion === null) return;

    const body = {
      titulo: nuevoTitulo,
      direccion: nuevaDireccion,
      descripcion: nuevaDescripcion,
    };

    try {
      const res = await fetch(
        `https://unirumbobakend.onrender.com/api/Alojamiento/${a.idAlojamiento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error("Error al editar");
      alert("Alojamiento actualizado");

      obtenerAlojamientos();
    } catch (error) {
      alert("Error actualizando");
    }
  };

  return (
    <div className="aloj-list-page">
      <HeaderArrendatario />

      <h2 className="aloj-title">
        <FaHome /> Lista de Alojamientos
      </h2>

      {/* Botón agregar */}
      <button
        className="btn-gradient add-btn"
        onClick={() => setMostrarFormulario(!mostrarFormulario)}
      >
        <FaPlusCircle />
        {mostrarFormulario ? "Cancelar" : "Agregar Alojamiento"}
      </button>

      {/* Formulario */}
      {mostrarFormulario && (
        <div className="aloj-form-card">
          <input
            type="text"
            placeholder="Municipio o barrio"
            className="input"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
          <input
            type="text"
            placeholder="Dirección"
            className="input"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
          <input
            type="text"
            placeholder="Descripción"
            className="input"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <input
            type="file"
            multiple
            accept="image/*"
            className="input-file"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              Promise.all(
                files.map(
                  (file) =>
                    new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onload = () =>
                        resolve(reader.result.split(",")[1]);
                      reader.readAsDataURL(file);
                    })
                )
              ).then((Imgs) => setImagenes(Imgs));
            }}
          />

          <div className="map-card">
            <MapContainer center={[4.65, -74.1]} zoom={13} className="map">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <LocationPicker setNuevaUbicacion={setNuevaUbicacion} />
              {nuevaUbicacion && <Marker position={nuevaUbicacion} icon={markerIcon} />}
            </MapContainer>
          </div>

          <button className="btn-gradient save-btn" onClick={handleGuardar}>
            Guardar Alojamiento
          </button>
        </div>
      )}

      {/* Lista */}
      <div className="aloj-cards">
        {alojamientos.map((a) => {
          // extraer lat/lon
          let lat = null,
            lon = null;
          if (a.ubicacion) {
            try {
              const latMatch = a.ubicacion.match(/lat:([-0-9.]+)/);
              const lonMatch = a.ubicacion.match(/lon:([-0-9.]+)/);
              lat = parseFloat(latMatch?.[1]);
              lon = parseFloat(lonMatch?.[1]);
            } catch {}
          }

          return (
            <div key={a.idAlojamiento} className="aloj-card">
              <h3>{a.titulo}</h3>
              <p className="dir">{a.direccion}</p>
              <p className="desc">{a.descripcion}</p>
              <p className="owner">👤 {a.nombreUsuario}</p>

              {/* Mapa */}
              {lat && lon ? (
                <MapContainer
                  center={[lat, lon]}
                  zoom={15}
                  className="map small-map"
                  scrollWheelZoom={false}
                  dragging={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[lat, lon]} icon={markerIcon} />
                </MapContainer>
              ) : (
                <p className="no-map">Mapa no disponible</p>
              )}

              {/* Galería */}
              {a.imagenes && a.imagenes.length > 0 && (
                <div className="galeria">
                  {a.imagenes.map((img, i) => (
                    <img
                      key={i}
                      src={`data:image/jpeg;base64,${img}`}
                      alt="img"
                      className="aloj-img"
                    />
                  ))}
                </div>
              )}

              <div className="card-actions">
                <button className="btn-edit" onClick={() => handleEditar(a)}>
                  <FaEdit /> Editar
                </button>

                <button
                  className="btn-delete"
                  onClick={() => handleEliminar(a.idAlojamiento)}
                >
                  <FaTrashAlt /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AlojamientoList;
