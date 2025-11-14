import React from "react";
import { Link } from "react-router-dom";
import {
  FaUsersCog,
  FaRoad,
  FaHome,
  FaSignOutAlt
} from "react-icons/fa";
import "../styles/Header.css";
import logoUdec from "../img/logo.jpg"; // Ajusta la ruta si es necesario

const HeaderAdmin = () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const nombre = user ? user.nombre : "Administrador";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <>
      {/* 👉 Fuente Poppins integrada directamente */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <header className="main-header">
        {/* IZQUIERDA: Logo + Título */}
        <div className="header-left">
          <img src={logoUdec} alt="Logo UniRumbo" className="header-logo" />
          <h1 className="header-title">UniRumbo - Admin</h1>
        </div>

        {/* CENTRO: Menú de administración */}
        <nav className="header-center">
          <Link to="/adm" className="nav-item">
            <FaUsersCog className="nav-icon" />
            <span>Usuarios</span>
          </Link>

          <Link to="/adm/rutas" className="nav-item">
            <FaRoad className="nav-icon" />
            <span>Rutas</span>
          </Link>

          <Link to="/adm/alojamientos" className="nav-item">
            <FaHome className="nav-icon" />
            <span>Alojamientos</span>
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

export default HeaderAdmin;