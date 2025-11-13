import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import "../styles/RutaDetalle.css";

const API_URL = "https://unirumbobakend.onrender.com/api/Rutas";

const iconOrigen = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});

const iconDestino = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/190/190411.png",
  iconSize: [25, 25],
  iconAnchor: [12, 25],
});

export default function RutaDetalle() {
  const { idRuta } = useParams();
  const [ruta, setRuta] = useState(null);
  const [camino, setCamino] = useState(null);
  const [coordenadas, setCoordenadas] = useState({ origen: null, destino: null });

  useEffect(() => {
    const obtenerRuta = async () => {
      try {
        const res = await axios.get(`${API_URL}/${idRuta}`);
        setRuta(res.data);
      } catch (error) {
        console.error("Error al obtener la ruta:", error);
      }
    };
    obtenerRuta();
  }, [idRuta]);

  const geocodificar = async (direccion) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion)}`
      );
      if (res.data && res.data.length > 0) {
        return [parseFloat(res.data[0].lat), parseFloat(res.data[0].lon)];
      }
      return null;
    } catch {
      return null;
    }
  };

  const obtenerRutaReal = async (origen, destino) => {
    try {
      const res = await axios.get(
        `https://router.project-osrm.org/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`
      );
      if (res.data.routes?.length > 0) {
        return res.data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
      }
      return null;
    } catch {
      return null;
    }
  };

  const trazarRuta = async () => {
    if (!ruta) return;
    const origen = await geocodificar(ruta.puntoOrigen);
    const destino = await geocodificar(ruta.puntoDestino);
    if (!origen || !destino) {
      alert("No se pudieron geocodificar las direcciones");
      return;
    }
    const camino = await obtenerRutaReal(origen, destino);
    setCoordenadas({ origen, destino });
    setCamino(camino || [origen, destino]);
  };

  if (!ruta) return <p style={{ textAlign: "center" }}>Cargando ruta...</p>;

  return (
    <div className="page-detalle">
      <header id="app-header">Detalle de la Ruta</header>

      <div className="detalle-wrap">
        <div className="detalle-card">
          <h2 className="detalle-title">{ruta.puntoOrigen} → {ruta.puntoDestino}</h2>

          <div className="detalle-info">
            <p><strong>Hora salida:</strong> {new Date(ruta.horaSalida).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <p><strong>Hora regreso:</strong> {ruta.horaRegreso ? new Date(ruta.horaRegreso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</p>
            <p><strong>Cupos ida:</strong> {ruta.cuposIda}</p>
            <p><strong>Cupos vuelta:</strong> {ruta.cuposVuelta}</p>
            <p><strong>Días:</strong> {ruta.diasRuta || "No especificado"}</p>
          </div>

          <div className="actions">
            <button onClick={trazarRuta} className="btn btn--dark">
              Trazar Ruta
            </button>
            <Link to="/home" className="btn btn--light">← Volver</Link>
          </div>
        </div>

        <div className="mapa-box">
          <MapContainer
            center={coordenadas.origen || [4.60971, -74.08175]}
            zoom={6}
            style={{ height: "400px", width: "100%", borderRadius: "12px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {camino && <Polyline positions={camino} color="#3f2b96" weight={4} />}
            {coordenadas.origen && <Marker position={coordenadas.origen} icon={iconOrigen}><Popup>Origen</Popup></Marker>}
            {coordenadas.destino && <Marker position={coordenadas.destino} icon={iconDestino}><Popup>Destino</Popup></Marker>}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
