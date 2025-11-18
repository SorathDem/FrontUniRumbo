import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Rutas from "./components/Rutas";
import RutaDetalle from "./components/RutaDetalle";
import AlojamientoList from "./components/AlojamientoList";
import AlojamientoDetalle from "./components/AlojamientoDetalle";
import Usuario from "./components/Usuario";
import UsuarioConductor from "./components/UsuarioConductor";
import "./App.css";
import SolicitudesRuta from "./components/SolicitudesRuta";
import SolicitudesAlojamiento from "./components/SolicitudesAlojamiento";
import Solicitudes from "./components/Solicitudes";
import UsuarioArredatario from "./components/UsuarioArrendatario";
import Adm from "./components/adm";
import RutaAdmin from "./components/RutaAdmin";
import AlojamientoAdmin from "./components/AlojamientoAdmin";
import Servicios from "./components/Servicios";
import ServiciosRuta from "./components/ServiciosRuta";
import ResetPassword from "./components/ResetPassword";
import PasswordRecovery from "./components/PasswordRecovery";

function App() {
  return (
    <Router>
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/usuario" element={<Usuario />} />
          <Route path="/adm" element={<Adm />} />
          <Route path="/adm/rutas" element={<RutaAdmin />} />
          <Route path="/adm/alojamientos" element={<AlojamientoAdmin />} />
          <Route path="/usuarioConductor" element={<UsuarioConductor />} />
          <Route path="/usuarioArrendatario" element={<UsuarioArredatario />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/home" element={<Home />} />
          <Route path="/rutas" element={<Rutas />} />
          <Route path="/recuperar-contrasena" element={<PasswordRecovery />} />
          <Route path="/rutas/:idRuta" element={<RutaDetalle />} />
          <Route path="/servicios/:idUsuario" element={<Servicios />} />
          <Route path="/serviciosRuta/:idUsuario" element={<ServiciosRuta />} />
          <Route path="/alojamientos" element={<AlojamientoList />} />
          <Route path="/solicitudes/:idUsuario" element={<Solicitudes />} />
          <Route path="/solicitudes-ruta/:idUsuario" element={<SolicitudesRuta />} />
          <Route path="/solicitudes-alojamiento/:idUsuario" element={<SolicitudesAlojamiento />} />
          <Route path="/alojamientos/:idAlojamiento" element={<AlojamientoDetalle />}
          
          
          
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
