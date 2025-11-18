// src/components/SolicitudesRuta.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/solicitudes.css";
import HeaderConductor from "./HeaderConductor";
import { FiMapPin, FiUser, FiFlag, FiCheck, FiX } from "react-icons/fi";

export default function SolicitudesRuta() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Obtener usuario logueado desde localStorage
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.idUsuario;

  useEffect(() => {
    if (!idUsuario) {
      console.warn("⚠️ No hay usuario logueado en localStorage");
      return;
    }

    const cargarSolicitudes = async () => {
      setLoading(true);
      try {
        const url = `https://unirumbobakend.onrender.com/api/Solicitudes/rutas/${idUsuario}`;
        console.log("🧩 Cargando solicitudes de ruta para usuario:", idUsuario);

        const { data } = await axios.get(url);
        console.log("📦 Datos recibidos del backend:", data);

        // 🔧 Normalizar claves para que React pueda usarlas
        const normalizadas = (Array.isArray(data) ? data : []).map((s) => ({
          idSoliRuta:
            s.idSoliRuta ??
            s.IdSoliRuta ??
            s.idSolicitudRuta ??
            s.IdSolicitudRuta ??
            s.id,
          estado: s.estado ?? s.Estado ?? "Pendiente",
          ruta: s.ruta ?? s.Ruta ?? {},
          usuarioSolicitante:
            s.usuarioSolicitante ?? s.UsuarioSolicitante ?? {},
        }));

        setSolicitudes(normalizadas);
      } catch (error) {
        console.error("❌ Error al cargar solicitudes de ruta:", error);
        setSolicitudes([]);
      } finally {
        setLoading(false);
      }
    };

    cargarSolicitudes();
  }, [idUsuario]);

  // 🔹 Cambiar estado de la solicitud (2 = Aceptada, 3 = Rechazada)
  const cambiarEstado = async (idSolicitud, nuevoEstado) => {
    if (!idSolicitud) return;
    try {
      const url = `https://unirumbobakend.onrender.com/api/Solicitudes/ruta/${idSolicitud}/estado/${nuevoEstado}`;
      console.log("🧩 Cambiando estado:", { idSolicitud, nuevoEstado });
      const response = await axios.put(url);
      console.log("📤 Respuesta backend:", response.data);

      alert(
        nuevoEstado === 2
          ? "✅ Solicitud aceptada correctamente."
          : "❌ Solicitud rechazada correctamente."
      );

      // 🔁 Actualizar estado local sin recargar la página
      setSolicitudes((prev) =>
        prev.map((s) =>
          s.idSoliRuta === idSolicitud
            ? { ...s, estado: nuevoEstado === 2 ? "Aceptada" : "Rechazada" }
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
      <HeaderConductor />
      <main className="solicitudes-wrap">
        <h2 className="title">
          <FiMapPin style={{ marginRight: "0.5rem" }} />
          Mis Solicitudes de Ruta
        </h2>

        {loading ? (
          <p className="loading">Cargando solicitudes...</p>
        ) : solicitudes.length === 0 ? (
          <p className="empty">
            No tienes solicitudes de ruta por el momento. Cuando alguien pida
            un cupo en alguna de tus rutas, aparecerá aquí. 🚗
          </p>
        ) : (
          <div className="cards-2col">
            {solicitudes.map((s) => (
              <article key={s.idSoliRuta} className="solicitud-card">
                <div className="head">
                  <FiMapPin style={{ marginRight: "0.4rem" }} />
                  Ruta hacia{" "}
                  <strong>{s.ruta?.puntoDestino || "Sin destino"}</strong>
                </div>

                <ul className="list">
                  <li>
                    <strong>
                      <FiFlag style={{ marginRight: "0.25rem" }} />
                      Origen:
                    </strong>{" "}
                    {s.ruta?.puntoOrigen || "Sin origen"}
                  </li>
                  <li>
                    <strong>
                      <FiMapPin style={{ marginRight: "0.25rem" }} />
                      Destino:
                    </strong>{" "}
                    {s.ruta?.puntoDestino || "Sin destino"}
                  </li>
                  <li>
                    <strong>
                      <FiUser style={{ marginRight: "0.25rem" }} />
                      Solicitante:
                    </strong>{" "}
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

                {(s.estado === "Pendiente" || !s.estado) && (
                  <div className="acciones">
                    <button
                      className="btn-aceptar"
                      onClick={() => cambiarEstado(s.idSoliRuta, 2)}
                    >
                      <FiCheck style={{ marginRight: "0.25rem" }} />
                      Aceptar
                    </button>
                    <button
                      className="btn-rechazar"
                      onClick={() => cambiarEstado(s.idSoliRuta, 3)}
                    >
                      <FiX style={{ marginRight: "0.25rem" }} />
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
