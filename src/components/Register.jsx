import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import axios from "axios";
import "../styles/Auth.css";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiUsers,
  FiMapPin,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi";

function Register() {
  const [form, setForm] = useState({
    Nombre: "",
    Apellido: "",
    Numero: "",
    Correo: "",
    Contrasena: "",
    id_rol: "",
    id_sede: "",
  });

  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, sedesRes] = await Promise.all([
          axios.get("https://unirumbobakend.onrender.com/api/Rol"),
          axios.get("https://unirumbobakend.onrender.com/api/Sede"),
        ]);
        setRoles(rolesRes.data);
        setSedes(sedesRes.data);
      } catch (error) {
        console.error("Error al cargar roles o sedes:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const dataToSend = {
      ...form,
      id_rol: parseInt(form.id_rol),
      id_sede: parseInt(form.id_sede),
    };

    try {
      await register(dataToSend);
      alert("✅ Usuario registrado correctamente");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error al registrar:", error?.response?.data || error);
      setError("Error al registrar, revisa tu correo institucional o intenta más tarde.");
    }
  };

  return (
    <div className="auth-container register-background">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Crear cuenta</h2>
        <p className="auth-subtitle">
          Regístrate con tu correo institucional de UniRumbo
        </p>

        {error && <div className="auth-error">{error}</div>}

        <div className="form-grid">
          {/* Nombre */}
          <div className="input-group">
            <span className="input-icon">
              <FiUser />
            </span>
            <input
              name="Nombre"
              placeholder="Nombre"
              onChange={handleChange}
              required
            />
          </div>

          {/* Apellido */}
          <div className="input-group">
            <span className="input-icon">
              <FiUser />
            </span>
            <input
              name="Apellido"
              placeholder="Apellido"
              onChange={handleChange}
              required
            />
          </div>

          {/* Correo */}
          <div className="input-group">
            <span className="input-icon">
              <FiMail />
            </span>
            <input
              type="email"
              name="Correo"
              placeholder="Correo institucional"
              onChange={handleChange}
              required
            />
          </div>

          {/* Número de contacto */}
          <div className="input-group">
            <span className="input-icon">
              <FiPhone />
            </span>
            <input
              name="Numero"
              placeholder="Número de contacto"
              onChange={handleChange}
              required
            />
          </div>

          {/* Rol */}
          <div className="input-group">
            <span className="input-icon">
              <FiUsers />
            </span>
            <select
              name="id_rol"
              value={form.id_rol || ""}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona un rol</option>
              {roles
                .filter(
                  (rol) =>
                    rol.nombre !== "Administrador" ||
                    rol.id_rol === form.id_rol ||
                    rol.idRol === form.id_rol
                )
                .map((rol) => (
                  <option
                    key={rol.id_rol ?? rol.idRol}
                    value={rol.id_rol ?? rol.idRol}
                  >
                    {rol.nombre}
                  </option>
                ))}
            </select>
          </div>

          {/* Sede */}
          <div className="input-group">
            <span className="input-icon">
              <FiMapPin />
            </span>
            <select
              name="id_sede"
              value={form.id_sede || ""}
              onChange={handleChange}
              required
            >
              <option value="">Selecciona una sede</option>
              {sedes.map((sede) => (
                <option
                  key={sede.id_sede ?? sede.idSede}
                  value={sede.id_sede ?? sede.idSede}
                >
                  {sede.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contraseña */}
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

        <button type="submit" className="auth-button">
          <FiCheckCircle className="btn-icon" />
          Registrar
        </button>

        <button
          type="button"
          className="auth-button secondary"
          onClick={() => navigate("/login")}
        >
          <FiArrowLeft className="btn-icon" />
          Atrás
        </button>
      </form>
    </div>
  );
}

export default Register;
