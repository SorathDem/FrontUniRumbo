// src/components/SolicitudesAlojamiento.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/solicitudes.css";
import HeaderArrendatario from "./HeaderArrendatario";

// Iconos bonitos
import {
  FaHome,
  FaUser,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function SolicitudesAlojamiento() {
  const { idUsuario } = useParams();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🧩 Cargar solicitudes de alojamiento
  useEffect(() => {
    if (!idUsuario) return;

    const cargar = async () => {
      setLoading(true);
      try {
        const url = `https://unirumbobakend.onrender.com/api/Solicitudes/alojamientos/${idUsuario}`;
        const { data } = await axios.get(url);

        const normalizadas = (Array.isArray(data) ? data : []).map((s) => ({
          idSolicitudAlojamiento:
            s.idSoliAlojamiento ??
            s.IdSoliAlojamiento ??
            s.idSolicitudAlojamiento ??
            s.IdSolicitudAlojamiento ??
            s.id,

          estado: s.estado ?? s.Estado ?? "Pendiente",
          alojamiento: s.alojamiento ?? s.Alojamiento ?? {},
          usuarioSolicitante: s.usuarioSolicitante ?? s.UsuarioSolicitante ?? {},
        }));

        setSolicitudes(normalizadas);
      } catch (e) {
        console.error("❌ Error al cargar solicitudes:", e);
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [idUsuario]);

  // 🧩 Cambiar estado
  const cambiarEstado = async (idSolicitudAlojamiento, nuevoEstado) => {
    try {
      const url = `https://unirumbobakend.onrender.com/api/Solicitudes/alojamiento/${idSolicitudAlojamiento}/estado/${nuevoEstado}`;

      await axios.put(url);

      alert(
        nuevoEstado === 2
          ? "✅ Solicitud aceptada."
          : "❌ Solicitud rechazada."
      );

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
      alert("Error al cambiar estado.");
    }
  };

  return (
    <div className="page-solicitudes">
      <HeaderArrendatario />

      <main className="solicitudes-wrap">
        <h2 className="solicitudes-title">
          <FaHome className="solicitudes-title-icon" /> Mis Solicitudes de
          Alojamiento
        </h2>

        {loading ? (
          <p className="solicitudes-loading">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="solicitudes-empty">
            No tienes solicitudes de alojamiento.
          </p>
        ) : (
          <div className="cards-2col">
            {solicitudes.map((s) => (
              <article key={s.idSolicitudAlojamiento} className="solicitud-card servicio-card">
                {/* Encabezado */}
                <div className="servicio-head">
                  <div className="servicio-icon">
                    <FaHome />
                  </div>

                  <div className="servicio-head-text">
                    <span className="servicio-tipo">Alojamiento</span>
                    <span className="servicio-descripcion">
                      {s.alojamiento?.descripcion || "Sin descripción"}
                    </span>
                  </div>
                </div>

                <ul className="servicio-list">
                  <li>
                    <FaMapMarkerAlt className="servicio-list-icon" />
                    <strong>Ubicación:</strong>{" "}
                    {s.alojamiento?.ubicacion || "No especificada"}
                  </li>

                  <li>
                    <FaUser className="servicio-list-icon" />
                    <strong>Solicitante:</strong>{" "}
                    {s.usuarioSolicitante?.nombre || "Desconocido"}
                  </li>

                  <li>
                    <FaCheckCircle className="servicio-list-icon" />
                    <strong>Estado:</strong>{" "}
                    <span
                      className={`estado-pill ${
                        s.estado === "Aceptada"
                          ? "estado-aceptada"
                          : s.estado === "Rechazada"
                          ? "estado-rechazada"
                          : "estado-pendiente"
                      }`}
                    >
                      {s.estado}
                    </span>
                  </li>
                </ul>

                {/* Botones */}
                {(s.estado === "Pendiente" || !s.estado) && (
                  <div className="acciones">
                    <button
                      className="btn-aceptar"
                      onClick={() => cambiarEstado(s.idSolicitudAlojamiento, 2)}
                    >
                      <FaCheckCircle />
                      Aceptar
                    </button>

                    <button
                      className="btn-rechazar"
                      onClick={() => cambiarEstado(s.idSolicitudAlojamiento, 3)}
                    >
                      <FaTimesCircle />
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
