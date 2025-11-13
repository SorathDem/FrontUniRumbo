// src/components/Solicitudes.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HeaderUsuario from "./HeaderUsuario";
import "../styles/solicitudes.css";

export default function Solicitudes() {
  const { idUsuario } = useParams();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idUsuario) return;

const cargarSolicitudes = async () => {
  setLoading(true);
  try {
    // 🧭 Endpoints correctos para solicitudes HECHAS por el usuario
    const urlAloj = `https://unirumbobakend.onrender.com/api/Solicitudes/alojamientos/usuario/${idUsuario}`;
    const urlRuta = `https://unirumbobakend.onrender.com/api/Solicitudes/rutas/usuario/${idUsuario}`;

    console.log("🧩 Cargando solicitudes hechas por el usuario:", idUsuario);

    // 🚀 Llamadas simultáneas a los dos endpoints
    const [resAloj, resRuta] = await Promise.all([
      axios.get(urlAloj),
      axios.get(urlRuta),
    ]);

    // 🧱 Normalizar datos de ALOJAMIENTO
    const solicitudesAloj = (Array.isArray(resAloj.data) ? resAloj.data : []).map((s) => ({
      id:
        s.idSoliAlojamiento ??
        s.IdSoliAlojamiento ??
        s.idSolicitudAlojamiento ??
        s.IdSolicitudAlojamiento ??
        s.id,
      tipo: "Alojamiento",
      estado: s.estado ?? s.Estado ?? "Pendiente",
      descripcion:
        s.alojamiento?.descripcion ??
        s.Alojamiento?.Descripcion ??
        "Sin descripción",
      ubicacion:
        s.alojamiento?.ubicacion ??
        s.Alojamiento?.Ubicacion ??
        "Ubicación no especificada",
    }));

    // 🛣️ Normalizar datos de RUTA
    const solicitudesRuta = (Array.isArray(resRuta.data) ? resRuta.data : []).map((s) => ({
      id:
        s.idSoliRuta ??
        s.IdSoliRuta ??
        s.idSolicitudRuta ??
        s.IdSolicitudRuta ??
        s.id,
      tipo: "Ruta",
      estado: s.estado ?? s.Estado ?? "Pendiente",
      descripcion: "Solicitud de ruta", // texto fijo o puedes usar otro campo si lo tienes
      ubicacion:
        (s.ruta?.puntoOrigen && s.ruta?.puntoDestino)
          ? `${s.ruta.puntoOrigen} → ${s.ruta.puntoDestino}`
          : (s.Ruta?.PuntoOrigen && s.Ruta?.PuntoDestino)
          ? `${s.Ruta.PuntoOrigen} → ${s.Ruta.PuntoDestino}`
          : "Origen/Destino no especificado",
    }));

    // 🔗 Combinar todas las solicitudes
    const todas = [...solicitudesAloj, ...solicitudesRuta];
    console.log("📦 Solicitudes combinadas:", todas);

    setSolicitudes(todas);
  } catch (error) {
    console.error("❌ Error al cargar solicitudes:", error);
    setSolicitudes([]);
  } finally {
    setLoading(false);
  }
};


    cargarSolicitudes();
  }, [idUsuario]);

  // 🧨 Función para cancelar (eliminar) solicitud
  const cancelarSolicitud = async (tipo, idSolicitud) => {
    const confirmar = window.confirm("¿Seguro que deseas cancelar esta solicitud?");
    if (!confirmar) return;

    try {
      let url = "";

      if (tipo === "Alojamiento") {
        url = `https://unirumbobakend.onrender.com/api/Solicitudes/alojamiento/${idSolicitud}`;
      } else if (tipo === "Ruta") {
        url = `https://unirumbobakend.onrender.com/api/Solicitudes/ruta/${idSolicitud}`;
      }
      console.log("🧨 Eliminando solicitud:", { tipo, idSolicitud, url });

      await axios.delete(url);

      alert("Solicitud cancelada correctamente ✅");

      // 🔄 Actualizamos el estado local
      setSolicitudes((prev) => prev.filter((s) => !(s.id === idSolicitud && s.tipo === tipo)));
    } catch (error) {
      console.error("⚠️ Error al eliminar solicitud:", error);
      alert("No se pudo cancelar la solicitud.");
    }
  };

  return (
    <div className="page-solicitudes">
      <HeaderUsuario />
      <main className="solicitudes-wrap">
        <h2 className="title">Mis Solicitudes</h2>

        {loading ? (
          <p className="loading">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="empty">No tienes solicitudes de alojamiento ni de rutas.</p>
        ) : (
          <div className="cards-2col">
            {solicitudes.map((s) => (
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
                    <span
                      className={`estado ${
                        s.estado === "Aceptada"
                          ? "aceptada"
                          : s.estado === "Rechazada"
                          ? "rechazada"
                          : "pendiente"
                      }`}
                    >
                      {s.estado}
                    </span>
                  </li>
                </ul>

                {/* Botón de cancelar */}
                <button
                  className="btn-cancelar"
                  onClick={() => cancelarSolicitud(s.tipo, s.id)}
                >
                  Cancelar solicitud
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
