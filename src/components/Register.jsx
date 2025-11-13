import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import axios from "axios";
import "../styles/Auth.css"; // 👈 Reutiliza los mismos estilos

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
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, sedesRes] = await Promise.all([
          axios.get("https://localhost:7086/api/Rol"),
          axios.get("https://localhost:7086/api/Sede"),
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
  
  // Convertir ids a número
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
    console.error("❌ Error al registrar:", error.response?.data || error);
    alert("Error al registrar resvisa tu correo");
  }
};


  return (
    <div className="auth-container register-background">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">Información Personal</h2>

        <div className="form-grid">
          <input name="Nombre" placeholder="Nombre" onChange={handleChange} required />
          <input name="Apellido" placeholder="Apellido" onChange={handleChange} required />
          <input type="email" name="Correo" placeholder="Correo Institucional" onChange={handleChange} required />
          <input name="Numero" placeholder="Número de contacto" onChange={handleChange} required />

          <select
            name="id_rol"
            value={form.id_rol || ""}  // 🔹 Cambiado a form
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un rol</option>
            {roles
              .filter(
                (rol) =>
                  rol.nombre !== "Administrador" || rol.id_rol === form.id_rol || rol.idRol === form.id_rol
              )
              .map((rol) => (
                <option key={rol.id_rol ?? rol.idRol} value={rol.id_rol ?? rol.idRol}>
                  {rol.nombre}
                </option>
              ))}
          </select>

          <select name="id_sede" onChange={handleChange} required>
            <option value="">Selecciona una sede</option>
            {sedes.map((sede) => (
              <option key={sede.id_sede ?? sede.idSede} value={sede.id_sede ?? sede.idSede}>
                {sede.nombre}
              </option>
            ))}
          </select>
        </div>

        <input
          type="password"
          name="Contrasena"
          placeholder="Contraseña"
          onChange={handleChange}
          required
        />

        <button type="submit" className="auth-button">Registrar</button>
        
        <button
          type="button"
          className="auth-button secondary"
          onClick={() => navigate("/login")}
        >
          Atras
        </button>
      </form>
    </div>
  );
}

export default Register;
