import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Usuario.css";
import HeaderConductor from "./HeaderConductor";

// Íconos bonitos
import {
  FaUserCircle,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaMapMarkerAlt,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";

// 🔹 Endpoints
const API_USUARIOS = "https://unirumbobakend.onrender.com/api/Usuarios";
const API_ROLES = "https://unirumbobakend.onrender.com/api/Rol";
const API_SEDES = "https://unirumbobakend.onrender.com/api/Sede";

export default function UsuarioConductor() {
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

  const [roles, setRoles] = useState([]); // por si luego los usas
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
        numero: data.numero || "",
        contrasena: "", // nunca mostramos la contraseña actual
        idRol: data.id_rol?.toString() || "",
        idSede: data.idSede?.toString() || "",
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
      setRoles(rolesRes.data || []);
      setSedes(sedesRes.data || []);
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

      console.log("📤 Enviando datos completos (conductor):", body);

      const response = await axios.put(
        `${API_USUARIOS}/EditarCompleto/${usuario.idUsuario}`,
        body
      );

      alert(response.data.mensaje || "✅ Datos actualizados correctamente");
      setEditando(false);

      // Limpiar contraseña
      setUsuario((prev) => ({ ...prev, contrasena: "" }));
    } catch (error) {
      console.error(
        "❌ Error al actualizar usuario completo:",
        error.response?.data || error
      );
      alert("Error al actualizar usuario");
    }
  };

  // 🔹 Loading
  if (cargando) {
    return (
      <>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <div className="usuario-page">
          <HeaderConductor />
          <div className="usuario-content">
            <div className="usuario-loading">
              Cargando información del usuario...
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Fuente Poppins asegurada */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="usuario-page">
        <HeaderConductor />

        <div className="usuario-content">
          <h2 className="usuario-bienvenida">
            <FaUserCircle className="usuario-bienvenida-icon" />
            Bienvenido, {usuario.nombre || "Conductor"}
          </h2>

          <div className="usuario-card">
            <div className="usuario-card-header">
              <h3>Información Personal</h3>

              {!editando && (
                <button
                  type="button"
                  className="btn-gradient"
                  onClick={() => setEditando(true)}
                >
                  <FaEdit />
                  Editar usuario
                </button>
              )}
            </div>

            <form className="usuario-form" onSubmit={guardarCambios}>
              {/* Datos personales */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaUserCircle className="label-icon" />
                    Nombre
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={usuario.nombre || ""}
                    onChange={handleChange}
                    disabled={!editando}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaUserCircle className="label-icon" />
                    Apellido
                  </label>
                  <input
                    type="text"
                    name="apellido"
                    value={usuario.apellido || ""}
                    onChange={handleChange}
                    disabled={!editando}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaEnvelope className="label-icon" />
                    Correo
                  </label>
                  <input
                    type="email"
                    name="correo"
                    value={usuario.correo || ""}
                    onChange={handleChange}
                    disabled={!editando}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaPhoneAlt className="label-icon" />
                    Número
                  </label>
                  <input
                    type="text"
                    name="numero"
                    value={usuario.numero || ""}
                    onChange={handleChange}
                    disabled={!editando}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaLock className="label-icon" />
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="contrasena"
                    value={usuario.contrasena || ""}
                    onChange={handleChange}
                    disabled={!editando}
                  />
                  <small className="field-helper">
                    Déjala en blanco si no deseas cambiarla.
                  </small>
                </div>
              </div>

              {/* Solo Sede visible para el conductor */}
              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt className="label-icon" />
                    Sede
                  </label>
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
              </div>

              {/* Botones de acción */}
              <div className="usuario-actions">
                {editando && (
                  <>
                    <button className="btn-gradient" type="submit">
                      <FaSave />
                      Guardar
                    </button>
                    <button
                      type="button"
                      className="btn-secondary-danger"
                      onClick={() => {
                        setEditando(false);
                        setUsuario((prev) => ({ ...prev, contrasena: "" }));
                      }}
                    >
                      <FaTimes />
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
