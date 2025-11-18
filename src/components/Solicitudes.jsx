import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import HeaderUsuario from "./HeaderUsuario";
import "../styles/solicitudes.css";

import {
  FaClipboardList,
  FaHome,
  FaBusAlt,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function Solicitudes() {
  const { idUsuario } = useParams();
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idUsuario) return;

    const cargarSolicitudes = async () => {
      setLoading(true);
      try {
        const urlAloj = `https://unirumbobakend.onrender.com/api/Solicitudes/alojamientos/usuario/${idUsuario}`;
        const urlRuta = `https://unirumbobakend.onrender.com/api/Solicitudes/rutas/usuario/${idUsuario}`;

        console.log("🧩 Cargando solicitudes hechas por el usuario:", idUsuario);

        const [resAloj, resRuta] = await Promise.all([
          axios.get(urlAloj),
          axios.get(urlRuta),
        ]);

        // Alojamiento
        const solicitudesAloj = (Array.isArray(resAloj.data)
          ? resAloj.data
          : []
        ).map((s) => ({
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

        // Ruta
        const solicitudesRuta = (Array.isArray(resRuta.data)
          ? resRuta.data
          : []
        ).map((s) => ({
          id:
            s.idSoliRuta ??
            s.IdSoliRuta ??
            s.idSolicitudRuta ??
            s.IdSolicitudRuta ??
            s.id,
          tipo: "Ruta",
          estado: s.estado ?? s.Estado ?? "Pendiente",
          descripcion: "Solicitud de ruta",
          ubicacion:
            s.ruta?.puntoOrigen && s.ruta?.puntoDestino
              ? `${s.ruta.puntoOrigen} → ${s.ruta.puntoDestino}`
              : s.Ruta?.PuntoOrigen && s.Ruta?.PuntoDestino
              ? `${s.Ruta.PuntoOrigen} → ${s.Ruta.PuntoDestino}`
              : "Origen/Destino no especificado",
        }));

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

  // 🧨 Cancelar (eliminar) solicitud
  const cancelarSolicitud = async (tipo, idSolicitud) => {
    const confirmar = window.confirm(
      "¿Seguro que deseas cancelar esta solicitud?"
    );
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

      setSolicitudes((prev) =>
        prev.filter((s) => !(s.id === idSolicitud && s.tipo === tipo))
      );
    } catch (error) {
      console.error("⚠️ Error al eliminar solicitud:", error);
      alert("No se pudo cancelar la solicitud.");
    }
  };

  return (
    <>
      {/* Poppins por si acaso */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="page-solicitudes">
        <HeaderUsuario />
        <main className="solicitudes-wrap">
          <h2 className="solicitudes-title">
            <FaClipboardList className="solicitudes-title-icon" />
            Mis Solicitudes
          </h2>

          {loading ? (
            <p className="solicitudes-loading">Cargando solicitudes...</p>
          ) : solicitudes.length === 0 ? (
            <p className="solicitudes-empty">
              No tienes solicitudes de alojamiento ni de rutas.
            </p>
          ) : (
            <div className="cards-2col">
              {solicitudes.map((s) => {
                const estadoClass =
                  s.estado === "Aceptada"
                    ? "estado-aceptada"
                    : s.estado === "Rechazada"
                    ? "estado-rechazada"
                    : "estado-pendiente";

                return (
                  <article
                    key={`${s.tipo}-${s.id}`}
                    className="servicio-card solicitud-card"
                  >
                    {/* Cabecera bonita */}
                    <div className="servicio-head">
                      <div className="servicio-icon">
                        {s.tipo === "Alojamiento" ? <FaHome /> : <FaBusAlt />}
                      </div>
                      <div className="servicio-head-text">
                        <span className="servicio-tipo">{s.tipo}</span>
                        <span className="servicio-descripcion">
                          {s.descripcion}
                        </span>
                      </div>
                    </div>

                    {/* Lista de detalles */}
                    <ul className="servicio-list">
                      <li>
                        <FaMapMarkerAlt className="servicio-list-icon" />
                        <span>
                          <strong>Ubicación:</strong> {s.ubicacion}
                        </span>
                      </li>
                      <li>
                        <FaInfoCircle className="servicio-list-icon" />
                        <span>
                          <strong>Estado:</strong>{" "}
                          <span
                            className={`estado-pill ${estadoClass}`}
                          >
                            {s.estado}
                          </span>
                        </span>
                      </li>
                    </ul>

                    {/* Botón cancelar */}
                    <div className="acciones acciones-solicitud">
                      <button
                        className="btn-rechazar btn-cancelar-soli"
                        onClick={() => cancelarSolicitud(s.tipo, s.id)}
                      >
                        <FaTimesCircle />
                        Cancelar solicitud
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
