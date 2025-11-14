// src/components/AlojamientoAdmin.jsx
import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import "../styles/DetalleAlojamiento.css";
import HeaderAdmin from "./HeaderAdmin";

// Íconos estilo header
import { FaMapMarkedAlt, FaUserCircle, FaMapPin, FaRegCompass } from "react-icons/fa";

const API_URL = "https://unirumbobakend.onrender.com/api/Alojamiento";

const iconUbicacion = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function AlojamientoAdmin() {
  const [alojamientos, setAlojamientos] = useState([]);

  useEffect(() => {
    const obtenerAlojamientos = async () => {
      try {
        const res = await axios.get(API_URL);
        const data = res.data;

        const alojamientosConCoords = data.map((a) => {
          let lat = null;
          let lon = null;

          // Coordenadas en texto tipo "lat:4.123 lon:-74.123"
          if (a.ubicacion?.includes("lat:") && a.ubicacion?.includes("lon:")) {
            const latMatch = a.ubicacion.match(/lat:([0-9,\.\-]+)/i);
            const lonMatch = a.ubicacion.match(/lon:([0-9,\.\-]+)/i);
            if (latMatch && lonMatch) {
              lat = parseFloat(latMatch[1].replace(",", "."));
              lon = parseFloat(lonMatch[1].replace(",", "."));
            }
          } else if (a.latitud && a.longitud) {
            // O campos latitud / longitud separados
            lat = parseFloat(a.latitud);
            lon = parseFloat(a.longitud);
          }

          return { ...a, lat, lon };
        });

        setAlojamientos(alojamientosConCoords);
      } catch (error) {
        console.error("Error al obtener alojamientos:", error);
      }
    };

    obtenerAlojamientos();
  }, []);

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

        <div className="detalle-wrap">
          {alojamientos.length === 0 ? (
            <p className="detalle-empty">No hay alojamientos disponibles</p>
          ) : (
            alojamientos.map((a) => (
              <article key={a.idAlojamiento} className="detalle-card">
                {/* Cabecera tarjeta */}
                <div className="detalle-header">
                  <span className="detalle-header-icon">
                    <FaMapPin />
                  </span>
                  <h3 className="detalle-title">{a.descripcion}</h3>
                </div>

                {/* Info principal */}
                <div className="detalle-info">
                  <p>
                    <span className="detalle-icon">
                      <FaUserCircle />
                    </span>
                    <strong>Publicado por:</strong>&nbsp;{a.nombreUsuario}
                  </p>

                  {a.lat && a.lon ? (
                    <p>
                      <span className="detalle-icon">
                        <FaRegCompass />
                      </span>
                      <strong>Latitud:</strong>&nbsp;{a.lat.toFixed(6)}&nbsp;|&nbsp;
                      <strong>Longitud:</strong>&nbsp;{a.lon.toFixed(6)}
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

                {/* Mapa */}
                <div className="detalle-mapa-box">
                  {a.lat && a.lon ? (
                    <MapContainer
                      center={[a.lat, a.lon]}
                      zoom={14}
                      className="detalle-mapa"
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; OpenStreetMap contributors"
                      />
                      <Marker position={[a.lat, a.lon]} icon={iconUbicacion}>
                        <Popup>{a.descripcion}</Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <p className="detalle-mapa-empty">Mapa no disponible</p>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </>
  );
}