// src/components/AlojamientoAdmin.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import "../styles/DetalleAlojamiento.css";
import HeaderAdmin from "./HeaderAdmin";

// Íconos estilo header
import {
  FaMapMarkedAlt,
  FaUserCircle,
  FaMapPin,
  FaRegCompass,
  FaInfoCircle,
  FaCheckCircle,
} from "react-icons/fa";

const API_URL =
  process.env.REACT_APP_API_URL_ALOJAMIENTO ||
  "https://unirumbobakend.onrender.com/api/Alojamiento";

const iconUbicacion = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function AlojamientoAdmin() {
  const [alojamientos, setAlojamientos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const source = axios.CancelToken.source();

    const obtenerAlojamientos = async () => {
      try {
        const res = await axios.get(API_URL, {
          cancelToken: source.token,
          // withCredentials: true, // 👈 Actívalo si usas cookies seguras desde el backend
        });

        const data = Array.isArray(res.data) ? res.data : [];

        const alojamientosConCoords = data.map((a) => {
          let lat = null;
          let lon = null;

          // Coordenadas embebidas en texto tipo "lat:4.123 lon:-74.123"
          if (typeof a.ubicacion === "string" && a.ubicacion.includes("lat:") && a.ubicacion.includes("lon:")) {
            const latMatch = a.ubicacion.match(/lat:([0-9,.\-]+)/i);
            const lonMatch = a.ubicacion.match(/lon:([0-9,.\-]+)/i);
            if (latMatch && lonMatch) {
              lat = parseFloat(latMatch[1].replace(",", "."));
              lon = parseFloat(lonMatch[1].replace(",", "."));
            }
          } else if (a.latitud && a.longitud) {
            // O campos separados
            const parsedLat = parseFloat(a.latitud);
            const parsedLon = parseFloat(a.longitud);
            if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) {
              lat = parsedLat;
              lon = parsedLon;
            }
          }

          return { ...a, lat, lon };
        });

        setAlojamientos(alojamientosConCoords);
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error al obtener alojamientos:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    obtenerAlojamientos();

    // Cleanup para evitar fugas / warnings
    return () => {
      source.cancel("Componente desmontado: petición cancelada.");
    };
  }, []);

  const handleVerDetalles = (alojamiento) => {
    // Aquí podrías navegar a un detalle o abrir modal
    console.log("Ver detalles de alojamiento:", alojamiento.idAlojamiento);
  };

  const handleAplicar = (alojamiento) => {
    console.log("Aplicar a alojamiento:", alojamiento.idAlojamiento);
  };

  return (
    <>
      {/* Fuente Poppins */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="page-detalle">
        <HeaderAdmin />

        <h2 className="detalle-main-title">
          <FaMapMarkedAlt className="detalle-main-icon" />
          Administrar Alojamientos
        </h2>

        {/* Toggle de tipo de servicio (ejemplo) */}
        <div className="service-toggle" aria-label="Seleccionar tipo de servicio">
          <button type="button" className="service-toggle-btn active">
            Servicio de Ruta
          </button>
          <button type="button" className="service-toggle-btn">
            Servicio de Alojamiento
          </button>
        </div>

        {loading && (
          <p className="detalle-empty">Cargando alojamientos…</p>
        )}

        {!loading && (
          <div className="detalle-wrap">
            {alojamientos.length === 0 ? (
              <p className="detalle-empty">No hay alojamientos disponibles</p>
            ) : (
              alojamientos.map((a) => (
                <article
                  key={a.idAlojamiento}
                  className="detalle-card detalle-card--blanca"
                >
                  {/* Cabecera tarjeta */}
                  <div className="detalle-header">
                    <span className="detalle-header-icon">
                      <FaMapPin />
                    </span>
                    <h3 className="detalle-title">
                      {a.descripcion || "Alojamiento sin descripción"}
                    </h3>
                  </div>

                  {/* Info principal */}
                  <div className="detalle-info">
                    <p>
                      <span className="detalle-icon">
                        <FaUserCircle />
                      </span>
                      <strong>Publicado por:</strong>&nbsp;
                      {a.nombreUsuario || "No disponible"}
                    </p>

                    {a.lat && a.lon ? (
                      <p>
                        <span className="detalle-icon">
                          <FaRegCompass />
                        </span>
                        <strong>Latitud:</strong>&nbsp;
                        {a.lat.toFixed(6)}&nbsp;|&nbsp;
                        <strong>Longitud:</strong>&nbsp;
                        {a.lon.toFixed(6)}
                      </p>
                    ) : (
                      <p>
                        <span className="detalle-icon">
                          <FaMapPin />
                        </span>
                        <strong>Ubicación:</strong>&nbsp;No disponible
                      </p>
                    )}
                  </div>

                  {/* Mapa con borde en gradiente */}
                  <div className="mapa-gradiente">
                    {a.lat && a.lon ? (
                      <div className="detalle-mapa-inner">
                        <MapContainer
                          center={[a.lat, a.lon]}
                          zoom={14}
                          className="detalle-mapa"
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                          />
                          <Marker
                            position={[a.lat, a.lon]}
                            icon={iconUbicacion}
                          >
                            <Popup>{a.descripcion}</Popup>
                          </Marker>
                        </MapContainer>
                      </div>
                    ) : (
                      <p className="detalle-mapa-empty">
                        Mapa no disponible
                      </p>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className="detalle-actions">
                    <button
                      type="button"
                      className="btn-accion btn-accion-secundario"
                      onClick={() => handleVerDetalles(a)}
                    >
                      <FaInfoCircle className="btn-accion-icon" />
                      Ver detalles
                    </button>

                    <button
                      type="button"
                      className="btn-accion"
                      onClick={() => handleAplicar(a)}
                    >
                      <FaCheckCircle className="btn-accion-icon" />
                      Aplicar
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
