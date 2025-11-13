import React from "react";
import { Link } from "react-router-dom";
import "src/styles/Header.css";

const HeaderConductor = () => {
  // Obtenemos los datos del usuario logueado
  const user = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = user?.idUsuario || localStorage.getItem("idUsuario");
  const nombre = user ? user.nombre : "Conductor";

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <header className="main-header">
      <div className="header-left">
        <h1 className="header-title">UniRumbo - Conductor</h1>
      </div>

      <nav className="header-center">
        <Link to="/usuarioConductor" className="nav-item">Usuario</Link>
        <Link to="/rutas" className="nav-item">Mis Rutas</Link>
         <Link to={`/serviciosRuta/${idUsuario}`} className="nav-item">servicios</Link>
        {/* 👇 Este link ahora usa la ID real del usuario logueado */}
        <Link to={`/solicitudes-ruta/${idUsuario}`} className="nav-item">
          Solicitudes
        </Link>
      </nav>

      <div className="header-right">
        <span className="user-name">{nombre}</span>
        <button className="logout-button" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default HeaderConductor;
