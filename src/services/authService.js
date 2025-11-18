// src/services/authService.js
import axios from "axios";

const API_URL = "https://unirumbobakend.onrender.com/api/Auth";

export const login = async (userData) => {
  console.log("Datos enviados al backend:", userData);
  const response = await axios.post(`${API_URL}/login`, userData);
  
  const { token, user } = response.data;  // ← DESGLOSAR CORRECTAMENTE
  console.log("Respuesta del backend:", response.data);

  // Guardar token
  localStorage.setItem("token", token);

  // Guardar solo el objeto user (el que tiene los datos reales)
  localStorage.setItem("user", JSON.stringify(user));

  // También guarda el usuario limpio para tu lógica
  const usuarioLimpio = {
    idUsuario: user.idUsuario,
    nombre: user.nombre,
    apellido: user.apellido,
    correo: user.correo,
    idRol: user.id_rol,
    idSede: user.idSede
  };
  localStorage.setItem("usuario", JSON.stringify(usuarioLimpio));

  return { token, user: usuarioLimpio };
};