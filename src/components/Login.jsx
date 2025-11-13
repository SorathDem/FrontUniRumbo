import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import "../styles/Auth.css";

function Login() {
  const [form, setForm] = useState({ Correo: "", Contrasena: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form);

      // ✅ Guardamos todo el usuario como objeto en localStorage
      const usuarioData = {
        idUsuario: user.idUsuario ?? user.IdUsuario,
        nombre: user.nombre ?? user.Nombre,
        apellido: user.apellido ?? user.Apellido,
        correo: user.correo ?? user.Correo,
        idRol: user.id_rol ?? user.idRol ?? user.IdRol,
      };

      localStorage.setItem("usuario", JSON.stringify(usuarioData));

      console.log("✅ Usuario guardado en localStorage:", usuarioData);
      alert(`Bienvenido ${usuarioData.nombre} ${usuarioData.apellido}`);

      // 🧭 Redirección según el rol
      switch (usuarioData.idRol) {
        case 1: // Estudiante
          navigate("/home");
          break;
        case 2: // Conductor
          navigate("/rutas");
          break;
        case 3: // Arrendatario
          navigate("/alojamientos");
          break;
        case 4: // Administrador
          navigate("/adm");
          break;
        default:
          navigate("/home");
      }

    } catch (error) {
      console.error("❌ Error al iniciar sesión:", error);
      alert("Credenciales incorrectas o error en el servidor");
    }
  };

  return (
    <div className="auth-container login-background">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">UniRumbo</h2>

        <label>Correo Institucional</label>
        <input
          type="email"
          name="Correo"
          placeholder="Correo"
          onChange={handleChange}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          name="Contrasena"
          placeholder="Contraseña"
          onChange={handleChange}
          required
        />

        <button type="submit" className="auth-button">Ingresar</button>

        <button
          type="button"
          className="auth-button secondary"
          onClick={() => navigate("/register")}
        >
          Registrar
        </button>
      </form>
    </div>
  );
}

export default Login;
