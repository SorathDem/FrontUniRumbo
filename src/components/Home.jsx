import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { Link } from "react-router-dom";
import axios from "axios";
import L from "leaflet";
import "../styles/Home.css";
import {
  crearSolicitudRuta,
  crearSolicitudAlojamiento,
} from "../api/solicitudesService";
import HeaderUsuario from "./HeaderUsuario";

import {
  FaSearch,
  FaRoute,
  FaHome as FaHomeIcon,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaBed,
  FaUserCircle,
} from "react-icons/fa";

const API_RUTAS = "https://unirumbobakend.onrender.com/api/Rutas";
const API_ALOJAMIENTOS = "https://unirumbobakend.onrender.com/api/Alojamiento";

// Ícono del mapa
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function Home() {
  const [rutas, setRutas] = useState([]);
  const [alojamientos, setAlojamientos] = useState([]);
  const [tab, setTab] = useState("ruta");
  const [searchTerm, setSearchTerm] = useState("");

  const usuario =
    JSON.parse(localStorage.getItem("usuario")) ||
    JSON.parse(localStorage.getItem("user"));
  const idUsuario = usuario?.idUsuario;

  useEffect(() => {
    const obtenerRutas = async () => {
      try {
        const res = await axios.get(API_RUTAS);
        setRutas(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error al obtener rutas:", error);
      }
    };

    const obtenerAlojamientos = async () => {
      try {
        const res = await axios.get(API_ALOJAMIENTOS);
        setAlojamientos(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error al obtener alojamientos:", error);
      }
    };

    obtenerRutas();
    obtenerAlojamientos();
  }, []);

  // 🔍 Filtros por buscador
  const term = searchTerm.trim().toLowerCase();

  const rutasFiltradas = rutas.filter((ruta) => {
    if (!term) return true;
    const texto = `${ruta.puntoOrigen} ${ruta.puntoDestino} ${ruta.diasRuta}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const t = term
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return texto.includes(t);
  });

  const alojamientosFiltrados = alojamientos.filter((a) => {
    if (!term) return true;
    const texto = `${a.titulo} ${a.direccion} ${a.descripcion} ${a.nombreUsuario}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const t = term
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    return texto.includes(t);
  });

  return (
    <>
      {/* Fuente Poppins por si acaso */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="page-home">
        <HeaderUsuario />

        <main className="home-wrap">
          {/* Bienvenida */}
          <h2 className="welcome">
            <FaUserCircle className="welcome-icon" />
            Bienvenido,{" "}
            <span id="welcomeName">{usuario?.nombre || "Usuario"}</span>
          </h2>

          {/* Buscador bonito */}
          <div className="home-search">
            <div className="home-search-inner">
              <FaSearch className="home-search-icon" />
              <input
                type="text"
                placeholder={
                  tab === "ruta"
                    ? "Buscar por origen, destino o días de ruta..."
                    : "Buscar por título, dirección o nombre del arrendador..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Pestañas */}
          <div className="segmented">
            <button
              className={`seg-btn ${tab === "ruta" ? "active" : ""}`}
              onClick={() => setTab("ruta")}
            >
              <FaRoute />
              <span>Servicio de Ruta</span>
            </button>
            <button
              className={`seg-btn ${tab === "alojamiento" ? "active" : ""}`}
              onClick={() => setTab("alojamiento")}
            >
              <FaBed />
              <span>Servicio de Alojamiento</span>
            </button>
          </div>

          {/* ---------- Sección de Rutas ---------- */}
          {tab === "ruta" && (
            <section id="route" className="tab-pane active">
              {rutasFiltradas.length === 0 ? (
                <p className="empty-text">
                  No se encontraron rutas con ese criterio.
                </p>
              ) : (
                <div className="cards-2col">
                  {rutasFiltradas.map((ruta) => (
                    <article key={ruta.idRuta} className="service-card">
                      <div className="card-head">
                        <div className="card-icon bubble">
                          <FaRoute />
                        </div>
                        <div className="card-head-text">
                          <span className="card-tag">Ruta compartida</span>
                          <h3 className="card-title">
                            {ruta.puntoOrigen} → {ruta.puntoDestino}
                          </h3>
                        </div>
                      </div>

                      <ul className="list">
                        <li>
                          <FaMapMarkerAlt className="list-icon" />
                          <span>
                            <strong>Origen:</strong> {ruta.puntoOrigen}
                          </span>
                        </li>
                        <li>
                          <FaMapMarkerAlt className="list-icon" />
                          <span>
                            <strong>Destino:</strong> {ruta.puntoDestino}
                          </span>
                        </li>
                        <li>
                          <FaUsers className="list-icon" />
                          <span>
                            <strong>Cupos ida:</strong> {ruta.cuposIda} |{" "}
                            <strong>vuelta:</strong> {ruta.cuposVuelta}
                          </span>
                        </li>
                        <li>
                          <FaClock className="list-icon" />
                          <span>
                            <strong>Salida:</strong>{" "}
                            {new Date(ruta.horaSalida).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            {ruta.horaRegreso && (
                              <>
                                {" "}
                                · <strong>Regreso:</strong>{" "}
                                {new Date(
                                  ruta.horaRegreso
                                ).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </>
                            )}
                          </span>
                        </li>
                        <li>
                          <FaCalendarAlt className="list-icon" />
                          <span>
                            <strong>Días:</strong>{" "}
                            {ruta.diasRuta || "No especificado"}
                          </span>
                        </li>
                      </ul>

                      <div className="actions">
                        <Link
                          to={`/rutas/${ruta.idRuta}`}
                          className="btn btn--dark"
                        >
                          Ver detalles
                        </Link>

                        <Link to={`/chat/`} className="btn btn--light">
                          Contactar
                        </Link>

                        <button
                          className="btn btn--apply"
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
              )}
            </section>
          )}

          {/* ---------- Sección de Alojamientos ---------- */}
          {tab === "alojamiento" && (
            <section id="alojamientos" className="tab-pane active">
              {alojamientosFiltrados.length === 0 ? (
                <p className="empty-text">
                  No se encontraron alojamientos con ese criterio.
                </p>
              ) : (
                <div className="cards-2col">
                  {alojamientosFiltrados.map((a) => {
                    let lat = null;
                    let lon = null;

                    if (
                      a.ubicacion &&
                      a.ubicacion.includes("lat:") &&
                      a.ubicacion.includes("lon:")
                    ) {
                      try {
                        const latMatch = a.ubicacion.match(
                          /lat:([0-9,\.\-]+)/i
                        );
                        const lonMatch = a.ubicacion.match(
                          /lon:([0-9,\.\-]+)/i
                        );
                        if (latMatch && lonMatch) {
                          lat = parseFloat(latMatch[1].replace(",", "."));
                          lon = parseFloat(lonMatch[1].replace(",", "."));
                        }
                      } catch (err) {
                        console.error("Error procesando coordenadas:", err);
                      }
                    }

                    return (
                      <article
                        key={a.idAlojamiento}
                        className="service-card"
                      >
                        <div className="card-head">
                          <div className="card-icon bubble">
                            <FaHomeIcon />
                          </div>
                          <div className="card-head-text">
                            <span className="card-tag">Alojamiento</span>
                            <h3 className="card-title">
                              {a.titulo || "Alojamiento sin título"}
                            </h3>
                          </div>
                        </div>

                        <ul className="list">
                          <li>
                            <FaMapMarkerAlt className="list-icon" />
                            <span>
                              <strong>Dirección:</strong>{" "}
                              {a.direccion || "No registrada"}
                            </span>
                          </li>
                          <li>
                            <FaBed className="list-icon" />
                            <span>
                              <strong>Descripción:</strong>{" "}
                              {a.descripcion || "Sin descripción"}
                            </span>
                          </li>
                          <li>
                            <FaUserCircle className="list-icon" />
                            <span>
                              <strong>Publicado por:</strong>{" "}
                              {a.nombreUsuario || "Desconocido"}
                            </span>
                          </li>
                        </ul>

                        {lat && lon ? (
                          <div className="home-map-wrapper">
                            <MapContainer
                              center={[lat, lon]}
                              zoom={15}
                              scrollWheelZoom={false}
                              dragging={false}
                              doubleClickZoom={false}
                              zoomControl={false}
                              className="home-map-card"
                            >
                              <TileLayer
                                attribution="&copy; OpenStreetMap"
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                              />
                              <Marker
                                position={[lat, lon]}
                                icon={markerIcon}
                              />
                            </MapContainer>
                          </div>
                        ) : (
                          <p className="map-unavailable">
                            📍 Mapa no disponible
                          </p>
                        )}

                        <div className="actions">
                          <Link
                            to={`/alojamientos/${a.idAlojamiento}`}
                            className="btn btn--dark"
                          >
                            Ver detalles
                          </Link>
                          <button
                            className="btn btn--apply"
                            onClick={async () => {
                              try {
                                await crearSolicitudAlojamiento(
                                  a.idAlojamiento
                                );
                                alert(
                                  "Solicitud de alojamiento enviada correctamente ✅"
                                );
                              } catch (err) {
                                console.error(err);
                                alert(
                                  "Error al enviar la solicitud de alojamiento ❌"
                                );
                              }
                            }}
                          >
                            Aplicar
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </>
  );
}
