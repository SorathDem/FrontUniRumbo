// src/components/AlojamientoList.jsx
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import HeaderArrendatario from "./HeaderArrendatario";
import "../styles/Alojamiento.css";

// Íconos bonitos
import {
  FaMapMarkerAlt,
  FaPlusCircle,
  FaTrashAlt,
  FaEdit,
  FaHome,
  FaUserCircle,
} from "react-icons/fa";

// 🔹 Icono personalizado del mapa
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// 🔹 Componente para seleccionar ubicación en el mapa
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

  // 🔹 Cargar alojamientos desde la API
  const obtenerAlojamientos = async () => {
    try {
      const response = await fetch(
        "https://unirumbobakend.onrender.com/api/Alojamiento"
      );
      const data = await response.json();
      setAlojamientos(data);
    } catch (error) {
      console.error("Error al obtener alojamientos:", error);
    }
  };

  useEffect(() => {
    obtenerAlojamientos();
  }, []);

  // 🔹 Guardar alojamiento con imágenes
  const handleGuardar = async () => {
    if (!nuevaUbicacion) {
      alert("Selecciona un punto en el mapa primero.");
      return;
    }

    let idUsuario = null;
    try {
      const user = JSON.parse(localStorage.getItem("usuario"));
      idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");
    } catch (e) {
      console.warn("⚠️ Error al leer usuario del localStorage:", e);
      idUsuario = localStorage.getItem("idUsuario");
    }

    if (!idUsuario) {
      alert("❌ No se encontró el ID del usuario. Inicia sesión nuevamente.");
      return;
    }

    const alojamiento = {
      descripcion,
      direccion,
      titulo,
      latitud: nuevaUbicacion.lat,
      longitud: nuevaUbicacion.lng,
      id_Usuario: parseInt(idUsuario, 10),
      imagenesBase64: imagenes,
    };

    try {
      const response = await fetch(
        "https://unirumbobakend.onrender.com/api/Alojamiento/con-imagenes",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(alojamiento),
        }
      );

      if (!response.ok) throw new Error("Error al guardar alojamiento");

      alert("✅ Alojamiento guardado correctamente");
      setDescripcion("");
      setDireccion("");
      setTitulo("");
      setNuevaUbicacion(null);
      setMostrarFormulario(false);
      setImagenes([]);
      obtenerAlojamientos();
    } catch (error) {
      console.error("Error al guardar alojamiento:", error);
    }
  };

  // 🔹 Eliminar alojamiento
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este alojamiento?")) return;

    try {
      const res = await fetch(
        `https://unirumbobakend.onrender.com/api/Alojamiento/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Error al eliminar alojamiento");

      alert("Alojamiento eliminado correctamente");
      setAlojamientos((prev) => prev.filter((a) => a.idAlojamiento !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar alojamiento");
    }
  };

  // 🔹 Editar alojamiento (simple con prompt)
  const handleEditar = async (alojamiento) => {
    const nuevoTitulo = prompt(
      "Ingrese el nuevo título:",
      alojamiento.titulo || ""
    );
    if (nuevoTitulo === null) return;

    const nuevaDireccion = prompt(
      "Ingrese la nueva dirección:",
      alojamiento.direccion || ""
    );
    if (nuevaDireccion === null) return;

    const nuevaDescripcion = prompt(
      "Ingrese la nueva descripción:",
      alojamiento.descripcion || ""
    );
    if (nuevaDescripcion === null) return;

    try {
      const payload = {
        titulo: nuevoTitulo,
        direccion: nuevaDireccion,
        descripcion: nuevaDescripcion,
      };

      const res = await fetch(
        `https://unirumbobakend.onrender.com/api/Alojamiento/${alojamiento.idAlojamiento}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar alojamiento");

      alert("Alojamiento actualizado correctamente");
      obtenerAlojamientos();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar alojamiento");
    }
  };

  return (
<<<<<<< HEAD
    
    <div className="alojamiento-container">
=======
    <>
      {/* Fuente Poppins para toda la vista */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

>>>>>>> 57e2824f3f057fc79f1c7a6bd008a1defc6c0544
      <HeaderArrendatario />

      {/* 🔹 Caja principal grande que define el ancho visual de la página */}
      <div className="aloj-shell">
        <main className="aloj-page">
          {/* Encabezado de la sección */}
          <section className="aloj-header-section">
            <h2 className="aloj-title">
              <FaHome className="aloj-title-icon" />
              Lista de Alojamientos
            </h2>

            <button
              className="btn-gradient"
              onClick={() => setMostrarFormulario(!mostrarFormulario)}
            >
              <FaPlusCircle />
              {mostrarFormulario ? "Cancelar" : "Agregar Alojamiento"}
            </button>
          </section>

          {/* Formulario para crear alojamiento */}
          {mostrarFormulario && (
            <section className="aloj-form-card">
              <h3 className="aloj-form-title">
                <FaMapMarkerAlt className="aloj-form-icon" />
                Nuevo alojamiento
              </h3>

              <div className="aloj-form-grid">
                <input
                  type="text"
                  placeholder="Municipio o barrio del alojamiento"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="input-descripcion"
                />
                <input
                  type="text"
                  placeholder="Dirección del alojamiento"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="input-descripcion"
                />
                <input
                  type="text"
                  placeholder="Descripción del alojamiento"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="input-descripcion"
                />

                <div className="aloj-input-file">
                  <label className="aloj-input-file-label">
                    📷 Imágenes del alojamiento
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => {
                      const files = Array.from(e.target.files);
                      Promise.all(
                        files.map(
                          (file) =>
                            new Promise((resolve, reject) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const base64 = reader.result.split(",")[1];
                                resolve(base64);
                              };
                              reader.onerror = (error) => reject(error);
                              reader.readAsDataURL(file);
                            })
                        )
                      ).then((results) => setImagenes(results));
                    }}
                  />
                </div>
              </div>

              <div className="mapa-container">
                <MapContainer
                  center={[4.65, -74.1]}
                  zoom={13}
                  className="aloj-map-form"
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker setNuevaUbicacion={setNuevaUbicacion} />
                  {nuevaUbicacion && (
                    <Marker position={nuevaUbicacion} icon={markerIcon} />
                  )}
                </MapContainer>
                <p className="aloj-map-help">
                  Haz clic en el mapa para marcar la ubicación del alojamiento.
                </p>
              </div>

              <button onClick={handleGuardar} className="btn-gradient full">
                Guardar alojamiento
              </button>
            </section>
          )}

          {/* Lista de alojamientos existentes */}
          <section className="lista-alojamientos">
            {alojamientos.length === 0 ? (
              <p className="aloj-empty">No hay alojamientos registrados.</p>
            ) : (
              alojamientos.map((a) => {
                let lat = null;
                let lon = null;

                if (
                  a.ubicacion &&
                  a.ubicacion.includes("lat:") &&
                  a.ubicacion.includes("lon:")
                ) {
                  try {
                    const latMatch = a.ubicacion.match(/lat:([0-9,\.\-]+)/i);
                    const lonMatch = a.ubicacion.match(/lon:([0-9,\.\-]+)/i);

                    if (latMatch && lonMatch) {
                      const latStr = latMatch[1]
                        .replace(",", ".")
                        .replace(",,", ",");
                      const lonStr = lonMatch[1]
                        .replace(",", ".")
                        .replace(",,", ",");

                      lat = parseFloat(latStr);
                      lon = parseFloat(lonStr);
                    }
                  } catch (err) {
                    console.error("Error procesando coordenadas:", err);
                  }
                }

                return (
                  <article key={a.idAlojamiento} className="aloj-card">
                    <header className="aloj-card-header">
                      <div>
                        <h3 className="aloj-card-title">
                          {a.titulo || "Alojamiento sin título"}
                        </h3>
                        <p className="aloj-card-subtitle">{a.descripcion}</p>
                        <p className="aloj-card-address">
                          <FaMapMarkerAlt className="aloj-card-address-icon" />
                          {a.direccion}
                        </p>
                        <p className="aloj-card-user">
                          <FaUserCircle className="aloj-card-user-icon" />
                          Publicado por: <strong>{a.nombreUsuario}</strong>
                        </p>
                      </div>
                    </header>

                    {lat && lon ? (
                      <div className="aloj-card-map-wrapper">
                        <MapContainer
                          center={[lat, lon]}
                          zoom={15}
                          scrollWheelZoom={false}
                          dragging={false}
                          doubleClickZoom={false}
                          zoomControl={false}
                          className="aloj-map-card"
                        >
                          <TileLayer
                            attribution="&copy; OpenStreetMap"
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <Marker position={[lat, lon]} icon={markerIcon} />
                        </MapContainer>
                      </div>
                    ) : (
                      <p className="aloj-map-unavailable">
                        Mapa no disponible
                      </p>
                    )}

                    {a.imagenes && a.imagenes.length > 0 && (
                      <div className="imagenes-alojamiento">
                        {a.imagenes.map((base64, index) => (
                          <img
                            key={index}
                            src={`data:image/jpeg;base64,${base64}`}
                            alt={`Alojamiento ${a.idAlojamiento} - ${index}`}
                          />
                        ))}
                      </div>
                    )}

                    <footer className="aloj-card-actions">
                      <button
                        onClick={() => handleEditar(a)}
                        className="btn-outline"
                      >
                        <FaEdit />
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(a.idAlojamiento)}
                        className="btn-danger"
                      >
                        <FaTrashAlt />
                        Eliminar
                      </button>
                    </footer>
                  </article>
                );
              })
            )}
          </section>
        </main>
      </div>
    </>
  );
};

export default AlojamientoList;
