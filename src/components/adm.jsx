import React, { useEffect, useState } from "react";
import HeaderAdmin from "./HeaderAdmin";

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
    idSede: ""
  });
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Obtener datos iniciales
  const obtenerUsuarios = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error("Error al cargar usuarios", error);
    }
  };

  const obtenerRolesYSedes = async () => {
    try {
      const resRoles = await fetch(API_ROLES);
      const resSedes = await fetch(API_SEDES);
      const rolesData = await resRoles.json();
      const sedesData = await resSedes.json();
      setRoles(rolesData);
      setSedes(sedesData);
    } catch (error) {
      console.error("Error al cargar roles o sedes", error);
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
          idSede: parseInt(nuevoUsuario.idSede)
        })
      });

      if (!res.ok) throw new Error("Error al crear usuario");

      setNuevoUsuario({
        nombre: "",
        apellido: "",
        numero: "",
        correo: "",
        contrasena: "",
        idRol: "",
        idSede: ""
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
          IdSede: parseInt(usuarioEditando.idSede)
        })
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
    <div className="admin-page">
      <HeaderAdmin />
      <h2>Administración de Usuarios</h2>

      <button
        onClick={() => {
          setMostrarFormulario(!mostrarFormulario);
          setUsuarioEditando(null);
        }}
      >
        {mostrarFormulario ? "Cancelar" : "Crear Nuevo Usuario"}
      </button>

      {/* Formulario crear usuario */}
      {mostrarFormulario && !usuarioEditando && (
        <form onSubmit={crearUsuario}>
          <input
            placeholder="Nombre"
            value={nuevoUsuario.nombre}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
            required
          />
          <input
            placeholder="Apellido"
            value={nuevoUsuario.apellido}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, apellido: e.target.value })}
            required
          />
          <input
            placeholder="Número"
            value={nuevoUsuario.numero}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, numero: e.target.value })}
            required
          />
          <input
            placeholder="Correo"
            type="email"
            value={nuevoUsuario.correo}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, correo: e.target.value })}
            required
          />
          <input
            placeholder="Contraseña"
            type="password"
            value={nuevoUsuario.contrasena}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, contrasena: e.target.value })}
            required
          />

          <label>Rol</label>
          <select
            value={nuevoUsuario.idRol}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, idRol: e.target.value })}
            required
          >
            <option value="">Seleccione...</option>
            {roles.map((r) => (
              <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
            ))}
          </select>

          <label>Sede</label>
          <select
            value={nuevoUsuario.idSede}
            onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, idSede: e.target.value })}
            required
          >
            <option value="">Seleccione...</option>
            {sedes.map((s) => (
              <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
            ))}
          </select>

          <button type="submit">Crear Usuario</button>
        </form>
      )}

      {/* Formulario editar usuario */}
      {usuarioEditando && (
        <form onSubmit={editarUsuario}>
          <h4>Editando Usuario: {usuarioEditando.nombre}</h4>

          <label>Rol</label>
          <select
            value={usuarioEditando?.idRol ?? ""}
            onChange={(e) => setUsuarioEditando({ ...usuarioEditando, idRol: e.target.value })}
            required
          >
            <option value="">Seleccione...</option>
            {roles.map((r) => (
              <option key={r.idRol} value={r.idRol}>{r.nombre}</option>
            ))}
          </select>

          <label>Sede</label>
          <select
            value={usuarioEditando?.idSede ?? ""}
            onChange={(e) => setUsuarioEditando({ ...usuarioEditando, idSede: e.target.value })}
            required
          >
            <option value="">Seleccione...</option>
            {sedes.map((s) => (
              <option key={s.idSede} value={s.idSede}>{s.nombre}</option>
            ))}
          </select>

          <div style={{ marginTop: 10 }}>
            <button type="submit">Guardar Cambios</button>
            <button type="button" onClick={() => setUsuarioEditando(null)} style={{ marginLeft: 5 }}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Tabla de usuarios */}
      <table>
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
              <td>
                <button
                  onClick={() =>
                    setUsuarioEditando({
                      ...u,
                      idRol: u.id_rol,
                      idSede: u.idSede
                    })
                  }
                >
                  Editar
                </button>
                <button onClick={() => eliminarUsuario(u.idUsuario)} style={{ marginLeft: 5 }}>
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Estilos integrados */}
      <style>{`
        .admin-page {
          background: #FFF;
          min-height: 100vh;
          padding: 30px;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .admin-page h2 {
          color: #145a32;
          text-align: center;
          margin-bottom: 20px;
        }

        button {
          background-color: #27ae60;
          color: #fff;
          padding: 8px 16px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        button:hover {
          background-color: #1e8449;
          box-shadow: 0 4px 10px rgba(39, 174, 96, 0.3);
        }

        button[type="button"] {
          background-color: #95a5a6;
        }

        button[type="button"]:hover {
          background-color: #7f8c8d;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        form {
          background: #ffffffcc;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #27ae60;
          max-width: 600px;
          margin-bottom: 20px;
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        form h4 {
          color: #27ae60;
          margin-bottom: 10px;
          text-align: center;
        }

        form input,
        form select {
          padding: 10px;
          border-radius: 8px;
          border: 1px solid #ccc;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        form input:focus,
        form select:focus {
          outline: none;
          border-color: #27ae60;
          box-shadow: 0 0 5px rgba(39, 174, 96, 0.5);
        }

        form label {
          font-weight: 500;
          color: #145a32;
          margin-top: 5px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          background: #ffffffcc;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(39, 174, 96, 0.2);
        }

        table th,
        table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #27ae60;
        }

        table th {
          background-color: #27ae60;
          color: #fff;
          font-weight: 600;
        }

        table tr:nth-child(even) {
          background-color: #eafaf1;
        }

        table tr:hover {
          background-color: #d4f5e9;
        }

        table td button {
          padding: 6px 10px;
          font-size: 0.9rem;
        }

        table td button + button {
          margin-left: 5px;
        }
      `}</style>
    </div>
  );
};

export default Adm;
