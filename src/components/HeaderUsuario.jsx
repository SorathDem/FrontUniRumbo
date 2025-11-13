import React from "react";
import { Link } from "react-router-dom";
import "src/styles/Header.css";

const HeaderUsuario = () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="header-title">UniRumbo</h1>
      </div>

      <nav className="header-center">
        <Link to="/usuario" className="nav-item">Usuario</Link>
        <Link to="/Home" className="nav-item">Inicio</Link>

        {/* ✅ Usa la ID aquí */}
        {idUsuario ? (
          <Link to={`/solicitudes/${idUsuario}`} className="nav-item">
            Mis Solicitudes
          </Link>
        ) : (
          <span className="nav-item disabled">Mis Solicitudes</span>
        )}
      </nav>

      <div className="header-right">
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderUsuario;
