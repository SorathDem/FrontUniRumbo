import React from "react";
import { Link } from "react-router-dom";
import "src/styles/Header.css";

const HeaderArrendatario = () => {
  const user = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");
  const nombre = user ? user.nombre : "Arrendatario";

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="header-title">UniRumbo - Arriendos</h1>
      </div>

      <nav className="header-center">
        <Link to="/usuarioArrendatario" className="nav-item">Usuario</Link>
        <Link to="/Alojamientos" className="nav-item">Mis Alojamientos</Link>
        <Link to={`/servicios/${idUsuario}`} className="nav-item">servicios</Link>
        <Link to={`/solicitudes-alojamiento/${idUsuario}`} className="nav-item">Solicitudes</Link>
      </nav>

      <div className="header-right">
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderArrendatario;
