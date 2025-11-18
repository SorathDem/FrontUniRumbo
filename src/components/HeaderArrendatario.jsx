// src/components/HeaderArrendatario.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";
import {
  FaUser,
  FaHome,
  FaBed,
  FaHandshake,
  FaSignOutAlt,
} from "react-icons/fa";

// Ajusta la ruta a tu logo real
import logoUdec from "../assets/logo-udec.png";

const HeaderArrendatario = () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");
  const nombre = user ? user.nombre : "Arrendador";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* Fuente Poppins para asegurar consistencia */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <header className="main-header">
        {/* Contenedor interno centrado */}
        <div className="main-header-inner">
          {/* IZQUIERDA: logo + título */}
          <div className="header-left">
            <div className="logo-block">
              <img src={logoUdec} alt="Logo UDec" className="logo-udec" />
              <h1 className="header-title">UniRumbo - Arrendador</h1>
            </div>
          </div>

          {/* CENTRO: navegación */}
          <nav className="header-center">
            <Link to="/usuarioArrendatario" className="nav-item">
              <FaUser className="nav-icon" />
              <span>Usuario</span>
            </Link>

            <Link to="/Alojamientos" className="nav-item">
              <FaBed className="nav-icon" />
              <span>Mis Alojamientos</span>
            </Link>

            {idUsuario && (
              <>
                <Link to={`/servicios/${idUsuario}`} className="nav-item">
                  <FaHandshake className="nav-icon" />
                  <span>Servicios</span>
                </Link>

                <Link
                  to={`/solicitudes-alojamiento/${idUsuario}`}
                  className="nav-item"
                >
                  <FaHome className="nav-icon" />
                  <span>Solicitudes</span>
                </Link>
              </>
            )}
          </nav>

          {/* DERECHA: nombre + botón */}
          <div className="header-right">
            <span className="user-name">{nombre}</span>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt className="logout-icon" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default HeaderArrendatario;
