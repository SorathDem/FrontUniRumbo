import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Link } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "src/styles/Home.css";
import { crearSolicitudRuta, crearSolicitudAlojamiento } from "../api/solicitudesService";
import HeaderUsuario from "./HeaderUsuario";

const API_RUTAS = "https://localhost:7086/api/Rutas";
const API_ALOJAMIENTOS = "https://localhost:7086/api/Alojamiento";

export default function Home() {
  const [rutas, setRutas] = useState([]);
  const [alojamientos, setAlojamientos] = useState([]);
  const [tab, setTab] = useState("ruta");

  // 🔹 Obtener usuario logueado desde localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.idUsuario;

  useEffect(() => {
    const obtenerRutas = async () => {
      try {
        const res = await axios.get(API_RUTAS);
        setRutas(res.data);
      } catch (error) {
        console.error("Error al obtener rutas:", error);
      }
    };

    const obtenerAlojamientos = async () => {
      try {
        const res = await axios.get(API_ALOJAMIENTOS);
        setAlojamientos(res.data);
      } catch (error) {
        console.error("Error al obtener alojamientos:", error);
      }
    };

    obtenerRutas();
    obtenerAlojamientos();
  }, []);

  return (
    <div className="page-home">
      <HeaderUsuario />
      <main className="home-wrap">
        <h2 className="welcome">
          Bienvenido,{" "}
          <span id="welcomeName">
            {usuario?.nombre || "Usuario"}
          </span>
        </h2>

        {/* Botones de pestañas */}
        <div className="segmented">
          <button
            className={`seg-btn ${tab === "ruta" ? "active" : ""}`}
            onClick={() => setTab("ruta")}
          >
            Servicio de Ruta
          </button>
          <button
            className={`seg-btn ${tab === "alojamiento" ? "active" : ""}`}
            onClick={() => setTab("alojamiento")}
          >
            Servicio de Alojamiento
          </button>
        </div>

        {/* Sección de Rutas */}
        {tab === "ruta" && (
          <section id="route" className="tab-pane active">
            <div className="cards-2col">
              {rutas.map((ruta) => (
                <article key={ruta.idRuta} className="service-card">
                  <div className="head">
                    🚗 <span className="title">Ruta - {ruta.puntoDestino}</span>
                  </div>
                  <ul className="list">
                    <li>📍 <strong>Origen:</strong> {ruta.puntoOrigen}</li>
                    <li>📍 <strong>Destino:</strong> {ruta.puntoDestino}</li>
                    <li>👥 <strong>Cupos ida:</strong> {ruta.cuposIda}</li>
                    <li>👥 <strong>Cupos vuelta:</strong> {ruta.cuposVuelta}</li>
                    <li>
                      🕒 <strong>Salida:</strong>{" "}
                      {new Date(ruta.horaSalida).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{" "}
                      <strong>- Regreso:</strong>{" "}
                      {ruta.horaRegreso
                        ? new Date(ruta.horaRegreso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "N/A"}
                    </li>
                    <li>📅 <strong>Días:</strong> {ruta.diasRuta || "No especificado"}</li>
                  </ul>
                  <div className="actions">
                    <Link to={`/rutas/${ruta.idRuta}`} className="btn btn--dark">
                      Ver detalles
                    </Link>

                    <Link to={`/chat/`} className="btn btn--dark">
                      Contactar
                    </Link>

                    <button 
                      className="btn btn--light"
                      onClick={async () => {
                        try {
                          await crearSolicitudRuta(ruta.idRuta);
                          alert("Solicitud enviada correctamente ✅");
                        } catch (err) {
                          console.error(err);
                          alert("Error al enviar la solicitud ❌");
                        }
                      }}
                    >
                      Aplicar
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Sección de Alojamientos */}
        {tab === "alojamiento" && (
          <section id="alojamientos" className="tab-pane active">
            <div className="cards-2col">
              {alojamientos.length === 0 ? (
                <p>No hay alojamientos registrados.</p>
              ) : (
                alojamientos.map((a) => {
                  // Obtener coordenadas si existen
                  let lat = null;
                  let lon = null;
                  if (a.ubicacion && a.ubicacion.includes("lat:") && a.ubicacion.includes("lon:")) {
                    try {
                      const latMatch = a.ubicacion.match(/lat:([0-9,\.\-]+)/i);
                      const lonMatch = a.ubicacion.match(/lon:([0-9,\.\-]+)/i);
                      if (latMatch && lonMatch) {
                        lat = parseFloat(latMatch[1].replace(",", "."));
                        lon = parseFloat(lonMatch[1].replace(",", "."));
                      }
                    } catch (err) {
                      console.error("Error procesando coordenadas:", err);
                    }
                  }

                  return (
                    <article key={a.idAlojamiento} className="service-card">
                      <div className="head">
                        🏡 <span className="title">{a.titulo || "Alojamiento sin título"}</span>
                      </div>
                      <ul className="list">
                        <li>📍 <strong>Dirección:</strong> {a.direccion || "No registrada"}</li>
                        <li>📝 <strong>Descripción:</strong> {a.descripcion || "Sin descripción"}</li>
                        <li>👤 <strong>Publicado por:</strong> {a.nombreUsuario || "Desconocido"}</li>
                      </ul>

                      {/* Mapa del alojamiento */}
                      {lat && lon ? (
                        <div style={{ height: "250px", width: "100%", borderRadius: "10px", marginTop: "10px", overflow: "hidden" }}>
                          <MapContainer
                            center={[lat, lon]}
                            zoom={15}
                            style={{ height: "100%", width: "100%" }}
                            scrollWheelZoom={false}
                            dragging={false}
                            doubleClickZoom={false}
                            zoomControl={false}
                          >
                            <TileLayer
                              attribution="&copy; OpenStreetMap"
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker
                              position={[lat, lon]}
                              icon={
                                new L.Icon({
                                  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
                                  iconSize: [32, 32],
                                  iconAnchor: [16, 32],
                                })
                              }
                            />
                          </MapContainer>
                        </div>
                      ) : (
                        <p style={{ color: "#888" }}>📍 Mapa no disponible</p>
                      )}

                      <div className="actions" style={{ marginTop: "12px" }}>
                        <Link to={`/alojamientos/${a.idAlojamiento}`} className="btn btn--dark">
                          Ver detalles
                        </Link>
                        <button
                          className="btn btn--light"
                          onClick={async () => {
                            try {
                              await crearSolicitudAlojamiento(a.idAlojamiento);
                              alert("Solicitud de alojamiento enviada correctamente ✅");
                            } catch (err) {
                              console.error(err);
                              alert("Error al enviar la solicitud ❌");
                            }
                          }}
                        >
                          Aplicar
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
