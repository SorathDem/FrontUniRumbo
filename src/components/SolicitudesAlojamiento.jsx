// src/components/SolicitudesAlojamiento.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/Solicitudes.css";
import HeaderArrendatario from "./HeaderArrendatario";

export default function SolicitudesAlojamiento() {
  const { idUsuario } = useParams();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧩 Cargar solicitudes de alojamiento desde el backend
  useEffect(() => {
  if (!idUsuario) return;
  const cargar = async () => {
    setLoading(true);
    try {
      const url = `https://localhost:7086/api/Solicitudes/alojamientos/${idUsuario}`;
      console.log("🧩 Cargando solicitudes de alojamiento para:", idUsuario);

      const { data } = await axios.get(url);
      console.log("✅ Datos recibidos del backend:", data);

      // 🔧 Aquí va la normalización de claves
      const normalizadas = (Array.isArray(data) ? data : []).map((s) => ({
        idSolicitudAlojamiento:
          s.idSoliAlojamiento ?? // 👈 nombre que viene desde tu backend
          s.IdSoliAlojamiento ??
          s.idSolicitudAlojamiento ??
          s.IdSolicitudAlojamiento ??
          s.id, // fallback

        estado: s.estado ?? s.Estado ?? "Pendiente",
        alojamiento: s.alojamiento ?? s.Alojamiento ?? {},
        usuarioSolicitante: s.usuarioSolicitante ?? s.UsuarioSolicitante ?? {},
      }));

      setSolicitudes(normalizadas);
    } catch (e) {
      console.error("❌ Error al cargar solicitudes de alojamiento:", e);
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };
  cargar();
}, [idUsuario]);


  // 🧩 Cambiar estado (2 = aceptada, 3 = rechazada)
  const cambiarEstado = async (idSolicitudAlojamiento, nuevoEstado) => {
    try {
      if (!idSolicitudAlojamiento) {
        console.error("⚠️ idSolicitudAlojamiento no definido:", idSolicitudAlojamiento);
        alert("No se pudo cambiar el estado: idSolicitudAlojamiento no definido.");
        return;
      }

      const url = `https://localhost:7086/api/Solicitudes/alojamiento/${idSolicitudAlojamiento}/estado/${nuevoEstado}`;
      console.log("🧩 Cambiando estado:", { idSolicitudAlojamiento, nuevoEstado });

      const response = await axios.put(url);
      console.log("📤 Respuesta del backend:", response.data);

      alert(
        nuevoEstado === 2
          ? "✅ Solicitud aceptada correctamente."
          : "❌ Solicitud rechazada correctamente."
      );

      // 🔁 Actualizamos el estado local sin recargar la página
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.idSolicitudAlojamiento === idSolicitudAlojamiento
            ? {
                ...s,
                estado: nuevoEstado === 2 ? "Aceptada" : "Rechazada",
              }
            : s
        )
      );
    } catch (error) {
      console.error("⚠️ Error al actualizar estado:", error);
      alert("Error al actualizar el estado de la solicitud.");
    }
  };

  return (
    <div className="page-solicitudes">
      <HeaderArrendatario />
      <main className="solicitudes-wrap">
        <h2 className="title">Mis Solicitudes de Alojamiento</h2>

        {loading ? (
          <p className="loading">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="empty">No tienes solicitudes de alojamiento.</p>
        ) : (
          <div className="cards-2col">
            {solicitudes.map((s) => (
              <article key={s.idSolicitudAlojamiento} className="solicitud-card">
                <div className="head">
                  🏡 Alojamiento:{" "}
                  <strong>{s.alojamiento?.descripcion || "Sin descripción"}</strong>
                </div>

                <ul className="list">
                  <li>
                    <strong>Ubicación:</strong>{" "}
                    {s.alojamiento?.ubicacion || "No especificada"}
                  </li>
                  <li>
                    <strong>Solicitante:</strong>{" "}
                    {s.usuarioSolicitante?.nombre || "Desconocido"}
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

                {/* Solo mostrar botones si el estado está pendiente */}
                {(s.estado === "Pendiente" || !s.estado) && (
                  <div className="acciones">
                    <button
                      className="btn-aceptar"
                      onClick={() => cambiarEstado(s.idSolicitudAlojamiento, 2)}
                    >
                      Aceptar
                    </button>

                    <button
                      className="btn-rechazar"
                      onClick={() => cambiarEstado(s.idSolicitudAlojamiento, 3)}
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
