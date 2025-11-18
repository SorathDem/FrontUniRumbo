// src/components/RutasAdmin.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "../styles/admin.css";
import HeaderAdmin from "./HeaderAdmin";

// Íconos estilo header
import {
  FaRoute,
  FaClock,
  FaUsers,
  FaCalendarAlt,
  FaCarSide,
} from "react-icons/fa";

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

export default function RutasAdmin() {
  const [rutas, setRutas] = useState([]);
  const [coordenadas, setCoordenadas] = useState({});

  useEffect(() => {
    const source = axios.CancelToken.source();

    const obtenerRutas = async () => {
      try {
        const res = await axios.get(API_URL, {
          cancelToken: source.token,
        });
        const data = Array.isArray(res.data) ? res.data : [];
        setRutas(data);
        data.forEach((ruta) => trazarRuta(ruta));
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error al obtener rutas:", error);
        }
      }
    };

    obtenerRutas();

    return () => {
      source.cancel("Componente RutasAdmin desmontado, petición cancelada.");
    };
  }, []);

  const geocodificar = async (direccion) => {
    try {
      const res = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          direccion
        )}`
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
    <>
      {/* Fuente Poppins */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="page-admin">
        <HeaderAdmin />

        <h2 className="admin-title">
          <FaRoute className="admin-title-icon" />
          Listado de Rutas
        </h2>

        <div className="cards-2col">
          {rutas.map((r) => (
            <article
              key={r.idRuta}
              className="service-card service-card--blanca"
            >
              {/* Cabecera de la tarjeta */}
              <div className="head">
                <span className="head-icon">
                  <FaCarSide />
                </span>
                <span>
                  {r.puntoOrigen} → {r.puntoDestino}
                </span>
              </div>

              {/* Lista de datos */}
              <ul className="list">
                <li>
                  <span className="list-icon">
                    <FaClock />
                  </span>
                  <strong>Salida:</strong>&nbsp;
                  {new Date(r.horaSalida).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </li>

                <li>
                  <span className="list-icon">
                    <FaClock />
                  </span>
                  <strong>Regreso:</strong>&nbsp;
                  {r.horaRegreso
                    ? new Date(r.horaRegreso).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "N/A"}
                </li>

                <li>
                  <span className="list-icon">
                    <FaUsers />
                  </span>
                  <strong>Cupos ida:</strong>&nbsp;{r.cuposIda}
                </li>

                <li>
                  <span className="list-icon">
                    <FaUsers />
                  </span>
                  <strong>Cupos vuelta:</strong>&nbsp;{r.cuposVuelta}
                </li>

                <li>
                  <span className="list-icon">
                    <FaCalendarAlt />
                  </span>
                  <strong>Días:</strong>&nbsp;{r.diasRuta || "No especificado"}
                </li>
              </ul>

              {/* Mapa con borde de gradiente */}
              <div className="mapa-gradiente">
                <div className="mapa-inner">
                  <MapContainer
                    center={
                      coordenadas[r.idRuta]?.origen || [4.60971, -74.08175]
                    }
                    zoom={6}
                    className="mapa-leaflet"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {coordenadas[r.idRuta]?.camino && (
                      <Polyline
                        positions={coordenadas[r.idRuta].camino}
                        color="#3f2b96"
                        weight={4}
                      />
                    )}
                    {coordenadas[r.idRuta]?.origen && (
                      <Marker
                        position={coordenadas[r.idRuta].origen}
                        icon={iconOrigen}
                      >
                        <Popup>Origen</Popup>
                      </Marker>
                    )}
                    {coordenadas[r.idRuta]?.destino && (
                      <Marker
                        position={coordenadas[r.idRuta].destino}
                        icon={iconDestino}
                      >
                        <Popup>Destino</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}
