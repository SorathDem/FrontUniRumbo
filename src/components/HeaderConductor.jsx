import React from "react";
import { Link } from "react-router-dom";
import {
  FaUserCircle,
  FaMapMarkedAlt,
  FaClipboardList,
  FaRoad,
  FaSignOutAlt
} from "react-icons/fa";
import "../styles/Header.css";
import logoUdec from "../img/logo.jpg"; // Ajusta la ruta si es necesario

const HeaderConductor = () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");
  const nombre = user ? user.nombre : "Conductor";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* 👉 Fuente Poppins directamente en el JSX */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <header className="main-header">
        {/* IZQUIERDA: Logo + Título */}
        <div className="header-left">
          <img src={logoUdec} alt="Logo UniRumbo" className="header-logo" />
          <h1 className="header-title">UniRumbo - Conductor</h1>
        </div>

        {/* CENTRO: Navegación con íconos */}
        <nav className="header-center">
          <Link to="/usuarioConductor" className="nav-item">
            <FaUserCircle className="nav-icon" />
            <span>Usuario</span>
          </Link>

          <Link to="/rutas" className="nav-item">
            <FaRoad className="nav-icon" />
            <span>Mis Rutas</span>
          </Link>

          <Link to={`/serviciosRuta/${idUsuario}`} className="nav-item">
            <FaMapMarkedAlt className="nav-icon" />
            <span>Servicios</span>
          </Link>

          <Link to={`/solicitudes-ruta/${idUsuario}`} className="nav-item">
            <FaClipboardList className="nav-icon" />
            <span>Solicitudes</span>
          </Link>
        </nav>

        {/* DERECHA: Nombre + Logout */}
        <div className="header-right">
          <span className="user-name">{nombre}</span>

          <button className="logout-button" onClick={handleLogout}>
            <FaSignOutAlt className="logout-icon" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default HeaderConductor;