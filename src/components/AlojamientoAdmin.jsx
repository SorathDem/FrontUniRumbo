import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import "../styles/DetalleAlojamiento.css"; // puedes usar el mismo CSS del detalle
import HeaderAdmin from "./HeaderAdmin";

const API_URL = "https://localhost:7086/api/Alojamiento";

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

        // Procesar coordenadas (parsear lat/lon si vienen dentro de "ubicacion")
        const alojamientosConCoords = data.map((a) => {
          let lat = null;
          let lon = null;

          if (a.ubicacion?.includes("lat:") && a.ubicacion?.includes("lon:")) {
            const latMatch = a.ubicacion.match(/lat:([0-9,\.\-]+)/i);
            const lonMatch = a.ubicacion.match(/lon:([0-9,\.\-]+)/i);
            if (latMatch && lonMatch) {
              lat = parseFloat(latMatch[1].replace(",", "."));
              lon = parseFloat(lonMatch[1].replace(",", "."));
            }
          } else if (a.latitud && a.longitud) {
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
    <div className="page-detalle">
        <HeaderAdmin />
      <header id="app-header">Administrar Alojamientos</header>

      <div className="detalle-wrap" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {alojamientos.length === 0 ? (
          <p style={{ textAlign: "center" }}>No hay alojamientos disponibles</p>
        ) : (
          alojamientos.map((a) => (
            <div key={a.idAlojamiento} className="detalle-card">
              <h2 className="detalle-title">{a.descripcion}</h2>

              <div className="detalle-info">
                <p><strong>Publicado por:</strong> {a.nombreUsuario}</p>
                {a.lat && a.lon ? (
                  <p>
                    🧭 <strong>Latitud:</strong> {a.lat.toFixed(6)} |{" "}
                    <strong>Longitud:</strong> {a.lon.toFixed(6)}
                  </p>
                ) : (
                  <p>📍 <strong>Ubicación:</strong> No disponible</p>
                )}
              </div>

              <div className="mapa-box">
                {a.lat && a.lon ? (
                  <MapContainer
                    center={[a.lat, a.lon]}
                    zoom={14}
                    style={{ height: "400px", width: "100%", borderRadius: "12px" }}
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
                  <p style={{ textAlign: "center", color: "#777" }}>Mapa no disponible</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
