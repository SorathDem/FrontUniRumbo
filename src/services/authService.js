import axios from "axios";

const API_URL = "https://localhost:7086/api/Auth"; // o http://localhost:5163/api/Auth

export const login = async (userData) => {
  console.log("Datos enviados al backend:", userData); // 👀 Para verificar
  const response = await axios.post(`${API_URL}/login`, userData);
  const user = response.data;
  console.log("Datos enviados al backend:", userData);
  console.log("Respuesta del backend:", user);


  // Guardar usuario logueado en localStorage
  localStorage.setItem("user", JSON.stringify(user));

  return user;
};

export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};
