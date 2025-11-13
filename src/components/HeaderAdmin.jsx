import React from "react";
import { Link } from "react-router-dom";
import "../styles/Header.css";

const HeaderAdmin = () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const nombre = user ? user.nombre : "Administrador";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="header-title">UniRumbo - Admin</h1>
      </div>

      <nav className="header-center">
        <Link to="/adm" className="nav-item">Usuarios</Link>
        <Link to="/adm/rutas" className="nav-item">Rutas</Link>
        <Link to="/adm/alojamientos" className="nav-item">Alojamientos</Link>
      </nav>

      <div className="header-right">
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderAdmin;
