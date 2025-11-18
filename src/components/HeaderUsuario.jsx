
// src/components/HeaderUsuario.jsx
import React from "react";
import { Link } from "react-router-dom";
import { FaUserCircle, FaHome, FaClipboardList, FaSignOutAlt } from "react-icons/fa";
import "../styles/Header.css";
import logoUdec from "../img/logo.jpg"; // 👉 ajusta la ruta a tu logo
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet"></link>

const HeaderUsuario = () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="main-header">
      {/* IZQUIERDA: logo + título */}
      <div className="header-left">
        <img
          src={logoUdec}
          alt="Logo UniRumbo"
          className="header-logo"
        />
        <h1 className="header-title">UniRumbo</h1>
      </div>

      {/* CENTRO: navegación con íconos */}
      <nav className="header-center">
        <Link to="/usuario" className="nav-item">
          <FaUserCircle className="nav-icon" />
          <span>Usuario</span>
        </Link>

        <Link to="/Home" className="nav-item">
          <FaHome className="nav-icon" />
          <span>Inicio</span>
        </Link>

        {idUsuario ? (
          <Link to={`/solicitudes/${idUsuario}`} className="nav-item">
            <FaClipboardList className="nav-icon" />
            <span>Mis Solicitudes</span>
          </Link>
        ) : (
          <span className="nav-item disabled">
            <FaClipboardList className="nav-icon" />
            <span>Mis Solicitudes</span>
          </span>
        )}
      </nav>

      {/* DERECHA: botón cerrar sesión con gradiente */}
      <div className="header-right">
        <button className="logout-button" onClick={handleLogout}>
          <FaSignOutAlt className="logout-icon" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
};

export default HeaderUsuario;