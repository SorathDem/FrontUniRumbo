// src/components/Servicios.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import HeaderArrendatario from "./HeaderArrendatario";
import "../styles/solicitudes.css";

import {
  FaHome,
  FaRoute,
  FaMapMarkerAlt,
  FaCheckCircle,
} from "react-icons/fa";

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

        const [resAloj, resRuta] = await Promise.all([
          axios.get(urlAloj),
          axios.get(urlRuta),
        ]);

        // 🏠 ALOJAMIENTOS
        const alojamientos = (Array.isArray(resAloj.data) ? resAloj.data : [])
          .filter((s) => {
            const estado = (s.estado ?? s.Estado ?? "").toLowerCase();
            return estado === "aceptada" || estado === "aceptado";
          })
          .map((s) => {
            const rawUbic =
              s.alojamiento?.ubicacion ??
              s.Alojamiento?.Ubicacion ??
              "Ubicación no especificada";

            // 👉 Si la ubicación viene con "lat: ... lon: ...", cortamos antes de "lat"
            let direccion = rawUbic;
            if (rawUbic && rawUbic.toLowerCase().includes("lat:")) {
              direccion = rawUbic.split(/lat:/i)[0].trim().replace(/[;,.-]+$/, "");
              if (!direccion) direccion = "Ubicación no especificada";
            }

            return {
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
              ubicacion: direccion,
            };
          });

        // 🛣️ RUTAS
        const rutas = (Array.isArray(resRuta.data) ? resRuta.data : [])
          .filter((s) => {
            const estado = (s.estado ?? s.Estado ?? "").toLowerCase();
            return estado === "aceptada" || estado === "aceptado";
          })
          .map((s) => {
            let ubicacion = "Origen/Destino no especificado";

            if (s.ruta?.puntoOrigen && s.ruta?.puntoDestino) {
              ubicacion = `${s.ruta.puntoOrigen} → ${s.ruta.puntoDestino}`;
            } else if (s.Ruta?.PuntoOrigen && s.Ruta?.PuntoDestino) {
              ubicacion = `${s.Ruta.PuntoOrigen} → ${s.Ruta.PuntoDestino}`;
            }

            return {
              id:
                s.idSoliRuta ??
                s.IdSoliRuta ??
                s.idSolicitudRuta ??
                s.IdSolicitudRuta ??
                s.id,
              tipo: "Ruta",
              estado: s.estado ?? s.Estado ?? "Aceptada",
              descripcion: "Servicio de ruta",
              ubicacion,
            };
          });

        const todos = [...alojamientos, ...rutas];
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
    <>
      {/* Fuente Poppins */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="page-solicitudes">
        <HeaderArrendatario />

        <main className="solicitudes-wrap">
          <h2 className="solicitudes-title">
            <FaCheckCircle className="solicitudes-title-icon" />
            Servicios Aceptados
          </h2>

          {loading ? (
            <p className="solicitudes-loading">Cargando servicios...</p>
          ) : servicios.length === 0 ? (
            <p className="solicitudes-empty">
              Aún no tienes servicios aceptados.
            </p>
          ) : (
            <div className="cards-2col">
              {servicios.map((s) => (
                <article
                  key={`${s.tipo}-${s.id}`}
                  className="solicitud-card servicio-card"
                >
                  <div className="servicio-head">
                    <span className="servicio-icon">
                      {s.tipo === "Alojamiento" ? <FaHome /> : <FaRoute />}
                    </span>
                    <div className="servicio-head-text">
                      <span className="servicio-tipo">{s.tipo}</span>
                      <h3 className="servicio-descripcion">
                        {s.descripcion}
                      </h3>
                    </div>
                  </div>

                  <ul className="servicio-list">
                    <li>
                      <FaMapMarkerAlt className="servicio-list-icon" />
                      <span>
                        <strong>Ubicación:</strong> {s.ubicacion}
                      </span>
                    </li>
                    <li>
                      <strong>Estado:</strong>{" "}
                      <span className="estado-pill estado-aceptada">
                        {s.estado}
                      </span>
                    </li>
                  </ul>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
