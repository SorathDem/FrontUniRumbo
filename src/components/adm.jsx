// src/components/Adm.jsx
import React, { useEffect, useState } from "react";
import HeaderAdmin from "./HeaderAdmin";
import "../styles/AdminUsuarios.css";

const API_URL = "https://unirumbobakend.onrender.com/api/Usuarios";
const API_ROLES = "https://unirumbobakend.onrender.com/api/Rol";
const API_SEDES = "https://unirumbobakend.onrender.com/api/Sede";

const Adm = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    apellido: "",
    numero: "",
    correo: "",
    contrasena: "",
    idRol: "",
    idSede: "",
  });
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Obtener datos iniciales
  const obtenerUsuarios = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Error al cargar usuarios");
      const data = await res.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
      alert("No se pudieron cargar los usuarios.");
    }
  };

  const obtenerRolesYSedes = async () => {
    try {
      const [resRoles, resSedes] = await Promise.all([
        fetch(API_ROLES),
        fetch(API_SEDES),
      ]);

      if (!resRoles.ok || !resSedes.ok) {
        throw new Error("Error al cargar roles o sedes");
      }

      const rolesData = await resRoles.json();
      const sedesData = await resSedes.json();

      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setSedes(Array.isArray(sedesData) ? sedesData : []);
    } catch (error) {
      console.error("Error al cargar roles o sedes", error);
      alert("No se pudieron cargar roles o sedes.");
    }
  };

  useEffect(() => {
    obtenerUsuarios();
    obtenerRolesYSedes();
  }, []);

  // Crear usuario
  const crearUsuario = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...nuevoUsuario,
          idRol: parseInt(nuevoUsuario.idRol),
          idSede: parseInt(nuevoUsuario.idSede),
        }),
      });

      if (!res.ok) throw new Error("Error al crear usuario");

      setNuevoUsuario({
        nombre: "",
        apellido: "",
        numero: "",
        correo: "",
        contrasena: "",
        idRol: "",
        idSede: "",
      });
      setMostrarFormulario(false);
      obtenerUsuarios();
    } catch (error) {
      console.error(error);
      alert("Error al crear usuario");
    }
  };

  // Editar usuario (solo rol y sede)
  const editarUsuario = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/${usuarioEditando.idUsuario}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          IdRol: parseInt(usuarioEditando.idRol),
          IdSede: parseInt(usuarioEditando.idSede),
        }),
      });

      if (!res.ok) throw new Error("Error al actualizar usuario");

      setUsuarioEditando(null);
      obtenerUsuarios();
    } catch (error) {
      console.error(error);
      alert("Error al actualizar usuario");
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar usuario");
      obtenerUsuarios();
    } catch (error) {
      console.error(error);
      alert("Error al eliminar usuario");
    }
  };

  return (
    <>
      {/* Fuente Poppins */}
      <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="admin-usuarios-page">
        <HeaderAdmin />

        <div className="admin-usuarios-content">
          <div className="admin-usuarios-header">
            <h2 className="admin-usuarios-title">Administración de Usuarios</h2>

            <button
              className="btn-gradient"
              onClick={() => {
                setMostrarFormulario(!mostrarFormulario);
                setUsuarioEditando(null);
              }}
            >
              {mostrarFormulario ? "Cancelar" : "Crear Nuevo Usuario"}
            </button>
          </div>

          {/* Formulario crear usuario */}
          {mostrarFormulario && !usuarioEditando && (
            <form className="admin-form" onSubmit={crearUsuario}>
              <div className="form-row">
                <input
                  placeholder="Nombre"
                  value={nuevoUsuario.nombre}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      nombre: e.target.value,
                    })
                  }
                  required
                />
                <input
                  placeholder="Apellido"
                  value={nuevoUsuario.apellido}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      apellido: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <input
                  placeholder="Número"
                  value={nuevoUsuario.numero}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      numero: e.target.value,
                    })
                  }
                  required
                />
                <input
                  placeholder="Correo"
                  type="email"
                  value={nuevoUsuario.correo}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      correo: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <input
                  placeholder="Contraseña"
                  type="password"
                  value={nuevoUsuario.contrasena}
                  onChange={(e) =>
                    setNuevoUsuario({
                      ...nuevoUsuario,
                      contrasena: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    value={nuevoUsuario.idRol}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        idRol: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    {roles.map((r) => (
                      <option key={r.idRol} value={r.idRol}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sede</label>
                  <select
                    value={nuevoUsuario.idSede}
                    onChange={(e) =>
                      setNuevoUsuario({
                        ...nuevoUsuario,
                        idSede: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    {sedes.map((s) => (
                      <option key={s.idSede} value={s.idSede}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-gradient">
                  Crear Usuario
                </button>
              </div>
            </form>
          )}

          {/* Formulario editar usuario */}
          {usuarioEditando && (
            <form className="admin-form" onSubmit={editarUsuario}>
              <h4 className="form-title">
                Editando Usuario: {usuarioEditando.nombre}
              </h4>

              <div className="form-row">
                <div className="form-group">
                  <label>Rol</label>
                  <select
                    value={usuarioEditando?.idRol ?? ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        idRol: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    {roles.map((r) => (
                      <option key={r.idRol} value={r.idRol}>
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Sede</label>
                  <select
                    value={usuarioEditando?.idSede ?? ""}
                    onChange={(e) =>
                      setUsuarioEditando({
                        ...usuarioEditando,
                        idSede: e.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Seleccione...</option>
                    {sedes.map((s) => (
                      <option key={s.idSede} value={s.idSede}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-gradient">
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setUsuarioEditando(null)}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {/* Tabla de usuarios */}
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Sede</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.idUsuario}>
                    <td>{u.idUsuario}</td>
                    <td>{u.nombre}</td>
                    <td>{u.apellido}</td>
                    <td>{u.correo}</td>
                    <td>{u.id_rol}</td>
                    <td>{u.idSede ?? "-"}</td>
                    <td className="table-actions">
                      <button
                        type="button"
                        className="btn-ghost btn-sm"
                        onClick={() =>
                          setUsuarioEditando({
                            ...u,
                            idRol: u.id_rol,
                            idSede: u.idSede,
                          })
                        }
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => eliminarUsuario(u.idUsuario)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Adm;
