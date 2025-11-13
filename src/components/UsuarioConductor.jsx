import React, { useEffect, useState } from "react";
import axios from "axios";
import "src/styles/Usuario.css";
import HeaderConductor from "./HeaderConductor";

// 🔹 Endpoints
const API_USUARIOS = "https://localhost:7086/api/Usuarios";
const API_ROLES = "https://localhost:7086/api/Rol";
const API_SEDES = "https://localhost:7086/api/Sede";

export default function Usuario() {
  const [usuario, setUsuario] = useState({
    idUsuario: "",
    nombre: "",
    apellido: "",
    correo: "",
    numero: "",
    contrasena: "",
    idRol: "",
    idSede: "",
  });

  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [editando, setEditando] = useState(false);
  const [cargando, setCargando] = useState(true);

  // 🔹 Cargar usuario logueado, roles y sedes
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.idUsuario) {
      obtenerUsuario(userData.idUsuario);
    } else {
      console.warn("⚠️ No se encontró usuario logueado en localStorage");
      setCargando(false);
    }
    obtenerRolesYSedes();
  }, []);

  // 🔹 Obtener info del usuario y precargar todos los campos
  const obtenerUsuario = async (id) => {
    try {
      const res = await axios.get(`${API_USUARIOS}/${id}`);
      const data = res.data;

      setUsuario({
        idUsuario: data.idUsuario || "",
        nombre: data.nombre || "",
        apellido: data.apellido || "",
        correo: data.correo || "",
        numero: data.numero || "",               // 🔹 precargado
        contrasena: "",                           // 🔹 no mostrar contraseña
        idRol: data.id_rol?.toString() || "",    // 🔹 precargado
        idSede: data.idSede?.toString() || "",   // 🔹 precargado
      });
    } catch (error) {
      console.error("❌ Error al obtener usuario:", error);
    } finally {
      setCargando(false);
    }
  };

  // 🔹 Obtener roles y sedes
  const obtenerRolesYSedes = async () => {
    try {
      const [rolesRes, sedesRes] = await Promise.all([
        axios.get(API_ROLES),
        axios.get(API_SEDES),
      ]);
      setRoles(rolesRes.data);
      setSedes(sedesRes.data);
    } catch (error) {
      console.error("❌ Error al cargar roles o sedes:", error);
    }
  };

  // 🔹 Controlar inputs
  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  // 🔹 Guardar todos los cambios
  const guardarCambios = async (e) => {
    e.preventDefault();

    // Validar campos obligatorios
    if (
      !usuario.nombre ||
      !usuario.apellido ||
      !usuario.correo ||
      !usuario.numero ||
      !usuario.idRol ||
      !usuario.idSede
    ) {
      alert("Debes completar todos los campos obligatorios");
      return;
    }

    try {
      const body = {
        idUsuario: usuario.idUsuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        numero: usuario.numero || "",
        correo: usuario.correo,
        contrasena: usuario.contrasena ? usuario.contrasena : null,
        idRol: parseInt(usuario.idRol, 10),
        idSede: parseInt(usuario.idSede, 10),
      };

      console.log("📤 Enviando datos completos:", body);

      const response = await axios.put(
        `${API_USUARIOS}/EditarCompleto/${usuario.idUsuario}`,
        body
      );

      alert(response.data.mensaje || "✅ Datos actualizados correctamente");
      setEditando(false);

      // Limpiar contraseña para que no se muestre más
      setUsuario((prev) => ({ ...prev, contrasena: "" }));
    } catch (error) {
      console.error(
        "❌ Error al actualizar usuario completo:",
        error.response?.data || error
      );
      alert("Error al actualizar usuario");
    }
  };

  // 🔹 Mostrar loading
  if (cargando) {
    return (
      <div className="usuario-page">
        <HeaderConductor />
        <h2>Cargando información del usuario...</h2>
      </div>
    );
  }

  return (
    <div className="usuario-page">
      <HeaderConductor />
      <h2 className="usuario-bienvenida">
        Bienvenido, {usuario.nombre || "Usuario"}
      </h2>

      <div className="usuario-card">
        <h3>Información Personal</h3>

        <form className="usuario-form" onSubmit={guardarCambios}>
          {/* Datos personales */}
          <div className="form-row">
            <label>Nombre</label>
            <input
              type="text"
              name="nombre"
              value={usuario.nombre || ""}
              onChange={handleChange}   
              disabled={!editando}
              required
            />

            <label>Apellido</label>
            <input
              type="text"
              name="apellido"
              value={usuario.apellido || ""}
              onChange={handleChange}
              disabled={!editando}
              required
            />
          </div>

          <div className="form-row">
            <label>Correo</label>
            <input
              type="email"
              name="correo"
              value={usuario.correo || ""}
              onChange={handleChange}
              disabled={!editando}
              required
            />

            <label>Número</label>
            <input
              type="text"
              name="numero"
              value={usuario.numero || ""}
              onChange={handleChange}
              disabled={!editando}
              required
            />
          </div>

          <div className="form-row">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={usuario.contrasena || ""}
              onChange={handleChange}
              disabled={!editando}
            />
          </div>

          {/* Rol y sede */}
          <div className="form-row">

            <label>Sede</label>
            <select
              name="idSede"
              value={usuario.idSede || ""}
              onChange={handleChange}
              disabled={!editando}
              required
            >
              <option value="">Seleccione una sede</option>
              {sedes.map((s) => (
                <option key={s.idSede} value={s.idSede.toString()}>
                  {s.nombreSede || s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="usuario-actions">
            {editando ? (
              <>
                <button className="btn-guardar" type="submit">
                  💾 Guardar
                </button>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setEditando(false)}
                >
                  ❌ Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn-editar"
                onClick={() => setEditando(true)}
              >
                ✏️ Editar Usuario
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
