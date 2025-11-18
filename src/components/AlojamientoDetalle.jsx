import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import "../styles/RutaDetalle.css"; // puedes reutilizar estos estilos o ajustarlos

const API_URL = "https://unirumbobakend.onrender.com/api/Alojamiento";

const iconUbicacion = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

export default function AlojamientoDetalle() {
  const { idAlojamiento } = useParams();
  const [alojamiento, setAlojamiento] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerAlojamiento = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/${idAlojamiento}`);
        const data = res.data;
        setAlojamiento(data || null);

        // 🧭 Parsear coordenadas si vienen en campo `ubicacion` (ej: "lat:4.65, lon:-74.1" u otros formatos)
        if (data?.ubicacion && typeof data.ubicacion === "string") {
          try {
            const latMatch = data.ubicacion.match(/lat:?\s*([0-9\.\-\,]+)/i);
            const lonMatch = data.ubicacion.match(/lon:?\s*([0-9\.\-\,]+)/i);
            if (latMatch && lonMatch) {
              const lat = parseFloat(latMatch[1].replace(",", "."));
              const lon = parseFloat(lonMatch[1].replace(",", "."));
              if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
                setCoords([lat, lon]);
              }
            }
          } catch (err) {
            console.warn("No se pudieron parsear coordenadas:", err);
          }
        }

        // Si el backend usa latitud/longitud separados:
        if (!coords && data?.latitud != null && data?.longitud != null) {
          const lat = parseFloat(data.latitud);
          const lon = parseFloat(data.longitud);
          if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
            setCoords([lat, lon]);
          }
        }
      } catch (error) {
        console.error("Error al obtener alojamiento:", error);
        setAlojamiento(null);
      } finally {
        setLoading(false);
      }
    };
    obtenerAlojamiento();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idAlojamiento]);

  if (loading) return <p style={{ textAlign: "center" }}>Cargando alojamiento...</p>;
  if (!alojamiento) return <p style={{ textAlign: "center" }}>Alojamiento no encontrado.</p>;

  // imágenes - puede venir como array de base64 o undefined
  const imagenes = Array.isArray(alojamiento.imagenes) ? alojamiento.imagenes : [];

  return (
    <div className="page-detalle">
      <header id="app-header">Detalle del Alojamiento</header>

      <div className="detalle-wrap">
        <div className="detalle-card">
          {/* Título */}
          <h2 className="detalle-title">{alojamiento.titulo || alojamiento.descripcion || "Alojamiento"}</h2>

          {/* Información principal */}
          <div className="detalle-info">
            <p><strong>Publicado por:</strong> {alojamiento.nombreUsuario ?? "Desconocido"}</p>
            <p><strong>Dirección:</strong> {alojamiento.direccion ?? "No registrada"}</p>
            <p><strong>Descripción:</strong> {alojamiento.descripcion ?? "Sin descripción"}</p>

            {alojamiento.latitud && alojamiento.longitud && (
              <p>
                🧭 <strong>Latitud:</strong> {parseFloat(alojamiento.latitud).toFixed(6)} |{" "}
                <strong>Longitud:</strong> {parseFloat(alojamiento.longitud).toFixed(6)}
              </p>
            )}

            {!alojamiento.latitud && !alojamiento.longitud && !alojamiento.ubicacion && (
              <p style={{ color: "#666" }}>📍 Ubicación no disponible</p>
            )}
          </div>

          {/* Galería de imágenes */}
          <div style={{ marginTop: 12 }}>
            <strong>Imágenes:</strong>
            {imagenes.length > 0 ? (
              <div style={{ display: "flex", gap: 10, marginTop: 8, overflowX: "auto" }}>
                {imagenes.map((b64, i) => (
                  <div key={i} style={{ minWidth: 140, height: 100, borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <img
                      src={`data:image/jpeg;base64,${b64}`}
                      alt={`Alojamiento ${alojamiento.idAlojamiento} - ${i}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#777", marginTop: 8 }}>No hay imágenes disponibles</p>
            )}
          </div>

          <div className="actions" style={{ marginTop: 18 }}>
            <Link to="/home" className="btn btn--light">← Volver</Link>
          </div>
        </div>

        {/* Mapa — solo si hay coords válidas */}
        <div className="mapa-box">
          {coords ? (
            <MapContainer
              center={coords}
              zoom={14}
              style={{ height: "400px", width: "100%", borderRadius: "12px" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker position={coords} icon={iconUbicacion}>
                <Popup>
                  {alojamiento.titulo ?? alojamiento.descripcion ?? "Alojamiento"}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <p style={{ textAlign: "center", color: "#777" }}>Mapa no disponible</p>
          )}
        </div>
      </div>
    </div>
  );
}
