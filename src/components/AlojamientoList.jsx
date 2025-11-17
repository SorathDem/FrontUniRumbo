import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import HeaderArrendatario from "./HeaderArrendatario";
import "../styles/Alojamiento.css"

// 🔹 Icono personalizado
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// 🔹 Componente para seleccionar ubicación
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
  const [alojamientoEditar, setAlojamientoEditar] = useState(null); // estado del alojamiento a editar
  const [mostrarEditar, setMostrarEditar] = useState(false);

  // 🔹 Cargar alojamientos
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
      id_Usuario: parseInt(idUsuario),
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
  
const handleEliminar = async (id) => {
    if (!window.confirm("¿Deseas eliminar este alojamiento?")) return;

    try {
      const res = await fetch(`https://unirumbobakend.onrender.com/api/Alojamiento/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Error al eliminar alojamiento");

      alert("Alojamiento eliminado correctamente");
      setAlojamientos(alojamientos.filter((a) => a.idAlojamiento !== id));
    } catch (error) {
      console.error(error);
      alert("Error al eliminar alojamiento");
    }
  };

  // 🔹 Función para eliminar alojamiento
  const handleEditar = async (alojamiento) => {
  // Pedir nuevos valores
  const nuevoTitulo = prompt("Ingrese el nuevo título:", alojamiento.titulo || "");
  if (nuevoTitulo === null) return; // usuario canceló

  const nuevaDireccion = prompt("Ingrese la nueva dirección:", alojamiento.direccion || "");
  if (nuevaDireccion === null) return; // usuario canceló

  const nuevaDescripcion = prompt("Ingrese la nueva descripción:", alojamiento.descripcion || "");
  if (nuevaDescripcion === null) return; // usuario canceló

  try {
    // Solo enviamos los campos editables
    const payload = {
      titulo: nuevoTitulo,
      direccion: nuevaDireccion,
      descripcion: nuevaDescripcion
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
    obtenerAlojamientos(); // recargar lista
  } catch (error) {
    console.error(error);
    alert("Error al actualizar alojamiento");
  }
};

  return (
    <div className="alojamiento-container">
      <HeaderArrendatario />
      <h2 className="titulo">🏡 Lista de Alojamientos</h2>

      {/* Botón agregar */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button
          className="btn-agregar"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? "Cancelar" : "Agregar Alojamiento"}
        </button>
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        
        <div className="formulario">
          <input
            type="text"
            placeholder="Municipio o barrio del alojamiento"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="input-descripcion"
          />
          <input
            type="text"
            placeholder="Direccion del alojamiento"
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
                        console.log("Archivo convertido a base64:", base64.slice(0, 30)); // 👈 solo primeras letras
                        resolve(base64);
                      };
                      reader.onerror = (error) => reject(error);
                      reader.readAsDataURL(file);
                    })
                )
              ).then((results) => setImagenes(results));
            }}
          />
          <button onClick={handleGuardar} className="btn-guardar">
            Guardar
          </button>

          <div className="mapa-container">
            <MapContainer
              center={[4.65, -74.1]}
              zoom={13}
              style={{ height: "350px", width: "100%", borderRadius: "10px" }}
            >
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationPicker setNuevaUbicacion={setNuevaUbicacion} />
              {nuevaUbicacion && <Marker position={nuevaUbicacion} icon={markerIcon} />}
            </MapContainer>
          </div>
        </div>
      )}

      {/* Lista de alojamientos */}
      <div className="lista-alojamientos">
        {alojamientos.length === 0 ? (
          <p>No hay alojamientos registrados.</p>
        ) : (
          alojamientos.map((a) => {
            let lat = null;
            let lon = null;

            if (a.ubicacion && a.ubicacion.includes("lat:") && a.ubicacion.includes("lon:")) {
              try {
                const latMatch = a.ubicacion.match(/lat:([0-9,\.\-]+)/i);
                const lonMatch = a.ubicacion.match(/lon:([0-9,\.\-]+)/i);

                if (latMatch && lonMatch) {
                  const latStr = latMatch[1].replace(",", ".").replace(",,", ",");
                  const lonStr = lonMatch[1].replace(",", ".").replace(",,", ",");

                  lat = parseFloat(latStr);
                  lon = parseFloat(lonStr);
                }
              } catch (err) {
                console.error("Error procesando coordenadas:", err);
              }
            }

            return (
              <div key={a.idAlojamiento} className="card-alojamiento">
                <h3>{a.titulo}</h3>
                <h3>{a.descripcion}</h3>
                <h3>{a.direccion}</h3>
                <p>👤 Publicado por: {a.nombreUsuario}</p>

                {lat && lon ? (
                  <>
                    <MapContainer
                      center={[lat, lon]}
                      zoom={15}
                      style={{
                        height: "250px",
                        width: "100%",
                        borderRadius: "10px",
                        marginTop: "10px",
                      }}
                      scrollWheelZoom={false}
                      dragging={false}
                      doubleClickZoom={false}
                      zoomControl={false}
                    >
                      <TileLayer
                        attribution="&copy; OpenStreetMap"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[lat, lon]} icon={markerIcon}></Marker>
                    </MapContainer>
                  </>
                ) : (
                  <p style={{ color: "#888" }}>Mapa no disponible</p>
                )}

                  {a.imagenes && a.imagenes.length > 0 && (
                  <div className="imagenes-alojamiento">
                    {a.imagenes.map((base64, index) => (
                      <img
                        key={index}
                        src={`data:image/jpeg;base64,${base64}`}
                        alt={`Alojamiento ${a.idAlojamiento} - ${index}`}
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          flexShrink: 0,
                        }}
                      />
                    ))}
                  </div>
                )}

                {mostrarEditar && alojamientoEditar && (
                  <div className="formulario">
                    <input
                      type="text"
                      value={alojamientoEditar.titulo}
                      onChange={(e) => setAlojamientoEditar({ ...alojamientoEditar, titulo: e.target.value })}
                    />
                    <input
                      type="text"
                      value={alojamientoEditar.direccion}
                      onChange={(e) => setAlojamientoEditar({ ...alojamientoEditar, direccion: e.target.value })}
                    />
                    <input
                      type="text"
                      value={alojamientoEditar.descripcion}
                      onChange={(e) => setAlojamientoEditar({ ...alojamientoEditar, descripcion: e.target.value })}
                    />

                    {/* Guardar cambios */}
                    <button onClick={handleEditar} className="btn-guardar">Guardar Cambios</button>
                    <button onClick={() => setMostrarEditar(false)} className="btn-cancelar">Cancelar</button>
                  </div>
                )}

                {/* 🔹 Botones de acción */}
                <div style={{ marginTop: "10px" }}>
                  <button onClick={() => handleEditar(a)} className="btn-editar">
                    Editar
                  </button>
                  <button onClick={() => handleEliminar(a.idAlojamiento)} className="btn-eliminar">
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 🔹 Estilos */}
      <style>{`
        .alojamiento-container {
          max-width: 900px;
          margin: 20px auto;
          padding: 20px;
          background: #f9fafb;
          border-radius: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .titulo {
          text-align: center;
          font-size: 1.8rem;
          color: #333;
          margin-bottom: 20px;
        }

        .btn-agregar {
          background-color: #10b981;
          color: white;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.2s;
        }

        .btn-agregar:hover {
          background-color: #059669;
        }

        .formulario {
          background: #ffffff;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .input-descripcion {
          width: 100%;
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          margin-bottom: 10px;
        }

        .btn-guardar {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          width: 100%;
        }

        .btn-guardar:hover {
          background-color: #1d4ed8;
        }

        .mapa-container {
          margin-top: 15px;
          border-radius: 12px;
          overflow: hidden;
        }

        .card-alojamiento {
          background: white;
          padding: 15px;
          border-radius: 12px;
          margin-bottom: 15px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .card-alojamiento h3 {
          margin-bottom: 5px;
          color: #1e40af;
        }

        .card-alojamiento p {
          margin: 0 0 10px;
          color: #555;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
};

export default AlojamientoList;