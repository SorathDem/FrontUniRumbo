// src/components/Servicios.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderArrendatario from "./HeaderArrendatario";
import "../styles/solicitudes.css";

export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Obtener el usuario logueado desde localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.idUsuario;

  useEffect(() => {
    if (!idUsuario) {
      console.warn("⚠️ No se encontró un usuario logueado en localStorage");
      return;
    }

    const cargarServicios = async () => {
      setLoading(true);
      try {
        const urlAloj = `https://unirumbobakend.onrender.com/api/Solicitudes/alojamientos/usuario/${idUsuario}`;
        const urlRuta = `https://unirumbobakend.onrender.com/api/Solicitudes/rutas/usuario/${idUsuario}`;

        console.log("🧩 Cargando servicios (aceptados) del usuario:", idUsuario);

        const [resAloj, resRuta] = await Promise.all([
          axios.get(urlAloj),
          axios.get(urlRuta),
        ]);

        // 🏠 ALOJAMIENTOS
        const alojamientos = (Array.isArray(resAloj.data) ? resAloj.data : [])
          .filter(
            (s) =>
              (s.estado ?? s.Estado ?? "").toLowerCase() === "aceptada" ||
              (s.estado ?? s.Estado ?? "").toLowerCase() === "aceptado"
          )
          .map((s) => ({
            id:
              s.idSoliAlojamiento ??
              s.IdSoliAlojamiento ??
              s.idSolicitudAlojamiento ??
              s.IdSolicitudAlojamiento ??
              s.id,
            tipo: "Alojamiento",
            estado: s.estado ?? s.Estado ?? "Aceptada",
            descripcion:
              s.alojamiento?.descripcion ??
              s.Alojamiento?.Descripcion ??
              "Sin descripción",
            ubicacion:
              s.alojamiento?.ubicacion ??
              s.Alojamiento?.Ubicacion ??
              "Ubicación no especificada",
          }));

        // 🛣️ RUTAS
        const rutas = (Array.isArray(resRuta.data) ? resRuta.data : [])
          .filter(
            (s) =>
              (s.estado ?? s.Estado ?? "").toLowerCase() === "aceptada" ||
              (s.estado ?? s.Estado ?? "").toLowerCase() === "aceptado"
          )
          .map((s) => ({
            id:
              s.idSoliRuta ??
              s.IdSoliRuta ??
              s.idSolicitudRuta ??
              s.IdSolicitudRuta ??
              s.id,
            tipo: "Ruta",
            estado: s.estado ?? s.Estado ?? "Aceptada",
            descripcion: "Servicio de ruta",
            ubicacion:
              (s.ruta?.puntoOrigen && s.ruta?.puntoDestino)
                ? `${s.ruta.puntoOrigen} → ${s.ruta.puntoDestino}`
                : (s.Ruta?.PuntoOrigen && s.Ruta?.PuntoDestino)
                ? `${s.Ruta.PuntoOrigen} → ${s.Ruta.PuntoDestino}`
                : "Origen/Destino no especificado",
          }));

        const todos = [...alojamientos, ...rutas];
        console.log("📦 Servicios aceptados:", todos);
        setServicios(todos);
      } catch (error) {
        console.error("❌ Error al cargar servicios:", error);
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };

    cargarServicios();
  }, [idUsuario]);

  return (
    <div className="page-solicitudes">
      <HeaderArrendatario />
      <main className="solicitudes-wrap">
        <h2 className="title">Servicios Aceptados</h2>

        {loading ? (
          <p className="loading">Cargando servicios...</p>
        ) : servicios.length === 0 ? (
          <p className="empty">No tienes servicios aceptados.</p>
        ) : (
          <div className="cards-2col">
            {servicios.map((s) => (
              <article key={`${s.tipo}-${s.id}`} className="solicitud-card">
                <div className="head">
                  {s.tipo === "Alojamiento" ? "🏠 Alojamiento" : "🚌 Ruta"}:{" "}
                  <strong>{s.descripcion}</strong>
                </div>

                <ul className="list">
                  <li>
                    <strong>Ubicación:</strong> {s.ubicacion}
                  </li>
                  <li>
                    <strong>Tipo:</strong> {s.tipo}
                  </li>
                  <li>
                    <strong>Estado:</strong>{" "}
                    <span className="estado aceptada">{s.estado}</span>
                  </li>
                </ul>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
