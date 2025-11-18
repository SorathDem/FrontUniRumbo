import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "../styles/Auth.css";
import { FiMail, FiLock, FiLogIn, FiUserPlus, FiKey } from "react-icons/fi";

function Login() {
  const [form, setForm] = useState({ Correo: "", Contrasena: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const resultado = await login(form);  // ← ahora devuelve { token, user }

    console.log("Usuario guardado en localStorage:", resultado.user);

    // Redirección según rol
    switch (resultado.user.idRol) {
      case 1:
        navigate("/home");
        break;
      case 2:
        navigate("/rutas");
        break;
      case 3:
        navigate("/alojamientos");
        break;
      case 4:
        navigate("/adm");
        break;
      default:
        navigate("/home");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    setError("Credenciales incorrectas o error en el servidor.");
  }
};
  const handleForgotPassword = () => {
    // 👇 Cambia esta ruta por la que uses para recuperar contraseña
    navigate("/recuperar-contrasena");
  };

  return (
    <div className="auth-container login-background">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">UniRumbo</h2>
        <p className="auth-subtitle">
          Inicia sesión con tu correo institucional
        </p>

        {error && <div className="auth-error">{error}</div>}

        <label>Correo Institucional</label>
        <div className="input-group">
          <span className="input-icon">
            <FiMail />
          </span>
          <input
            type="email"
            name="Correo"
            placeholder="tunombre@ucundinamarca.edu.co"
            onChange={handleChange}
            required
          />
        </div>

        <label>Contraseña</label>
        <div className="input-group">
          <span className="input-icon">
            <FiLock />
          </span>
          <input
            type="password"
            name="Contrasena"
            placeholder="Contraseña"
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="button"
          className="link-button"
          onClick={handleForgotPassword}
        >
          <FiKey className="btn-icon" />
          ¿Olvidaste tu contraseña?
        </button>

        <button type="submit" className="auth-button">
          <FiLogIn className="btn-icon" />
          Ingresar
        </button>

        <button
          type="button"
          className="auth-button secondary"
          onClick={() => navigate("/register")}
        >
          <FiUserPlus className="btn-icon" />
          Registrar
        </button>
      </form>
    </div>
  );
}

export default Login;
