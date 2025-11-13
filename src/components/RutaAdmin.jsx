// src/components/RutasAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "src/styles/Admin.css";
import HeaderAdmin from "./HeaderAdmin";

const API_URL = "https://localhost:7086/api/Rutas";

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

export default function RutasAdmin() {
  const [rutas, setRutas] = useState([]);
  const [coordenadas, setCoordenadas] = useState({});

  useEffect(() => {
    const obtenerRutas = async () => {
      try {
        const res = await axios.get(API_URL);
        setRutas(res.data);
        res.data.forEach((ruta) => trazarRuta(ruta));
      } catch (error) {
        console.error("Error al obtener rutas:", error);
      }
    };
    obtenerRutas();
  }, []);

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

  const trazarRuta = async (ruta) => {
    const origen = await geocodificar(ruta.puntoOrigen);
    const destino = await geocodificar(ruta.puntoDestino);
    if (origen && destino) {
      const camino = await obtenerRutaReal(origen, destino);
      setCoordenadas((prev) => ({
        ...prev,
        [ruta.idRuta]: { origen, destino, camino },
      }));
    }
  };

  return (
    <div className="page-admin">
        <HeaderAdmin />
      <h2 className="admin-title">📍 Listado de Rutas</h2>
      <div className="cards-2col">
        {rutas.map((r) => (
          <article key={r.idRuta} className="service-card">
            <div className="head">🚗 {r.puntoOrigen} → {r.puntoDestino}</div>
            <ul className="list">
              <li>🕒 <strong>Salida:</strong> {new Date(r.horaSalida).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</li>
              <li>🕒 <strong>Regreso:</strong> {r.horaRegreso ? new Date(r.horaRegreso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}</li>
              <li>👥 <strong>Cupos ida:</strong> {r.cuposIda}</li>
              <li>👥 <strong>Cupos vuelta:</strong> {r.cuposVuelta}</li>
              <li>📅 <strong>Días:</strong> {r.diasRuta || "No especificado"}</li>
            </ul>

            <div className="mapa-mini">
              <MapContainer
                center={coordenadas[r.idRuta]?.origen || [4.60971, -74.08175]}
                zoom={6}
                style={{ height: "300px", width: "100%", borderRadius: "12px" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {coordenadas[r.idRuta]?.camino && (
                  <Polyline positions={coordenadas[r.idRuta].camino} color="#3f2b96" weight={4} />
                )}
                {coordenadas[r.idRuta]?.origen && (
                  <Marker position={coordenadas[r.idRuta].origen} icon={iconOrigen}><Popup>Origen</Popup></Marker>
                )}
                {coordenadas[r.idRuta]?.destino && (
                  <Marker position={coordenadas[r.idRuta].destino} icon={iconDestino}><Popup>Destino</Popup></Marker>
                )}
              </MapContainer>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
