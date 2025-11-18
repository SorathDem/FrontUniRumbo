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

// ====== MODAL DE EDITAR ALOJAMIENTO (BONITO) ======
const EditarAlojamientoModal = ({ alojamiento, isOpen, onClose, onGuardar }) => {
  const [form, setForm] = useState({
    titulo: alojamiento?.titulo || "",
    direccion: alojamiento?.direccion || "",
    descripcion: alojamiento?.descripcion || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(alojamiento.idAlojamiento, form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4">
        <h2 className="text-3xl font-bold text-green-700 mb-6 text-center">
          Editar Alojamiento
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título del alojamiento
            </label>
            <input
              type="text"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ej. Habitación cómoda cerca de la U"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dirección completa
            </label>
            <input
              type="text"
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
              placeholder="Ej. Cra 5 #10-20, Facatativá"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows="4"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
              placeholder="Amplia habitación con baño privado, WiFi, cerca del campus..."
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition shadow-lg"
            >
              Guardar Cambios
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AlojamientoList = () => {
  const [alojamientos, setAlojamientos] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [direccion, setDireccion] = useState("");
  const [nuevaUbicacion, setNuevaUbicacion] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [modalEditarAlojamiento, setModalEditarAlojamiento] = useState(false);
  const [alojamientoAEditar, setAlojamientoAEditar] = useState(null);

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
      console.warn("⚠ Error al leer usuario del localStorage:", e);
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
  // Abrir modal
const abrirModalEditarAlojamiento = (alojamiento) => {
  setAlojamientoAEditar(alojamiento);
  setModalEditarAlojamiento(true);
};

// Guardar cambios
const handleGuardarEdicionAlojamiento = async (idAlojamiento, datos) => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(
      `https://unirumbobakend.onrender.com/api/Alojamiento/${idAlojamiento}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
      }
    );

    if (!res.ok) throw new Error("Error al actualizar");

    alert("Alojamiento actualizado correctamente");
    obtenerAlojamientos(); // ← tu función para recargar
    setModalEditarAlojamiento(false);
    setAlojamientoAEditar(null);
  } catch (error) {
    console.error(error);
    alert("Error al actualizar el alojamiento");
  }
};

  return (
    <>
      {/* Fuente Poppins para toda la vista */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

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
                      onClick={() => abrirModalEditarAlojamiento(a)}
                      className="btn-editar"
                    >
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
        {/* MODAL EDITAR ALOJAMIENTO */}
        {alojamientoAEditar && (
          <EditarAlojamientoModal
            alojamiento={alojamientoAEditar}
            isOpen={modalEditarAlojamiento}
            onClose={() => setModalEditarAlojamiento(false)}
            onGuardar={handleGuardarEdicionAlojamiento}
          />
        )}
      </div>
    </>
  );
};

export default AlojamientoList;