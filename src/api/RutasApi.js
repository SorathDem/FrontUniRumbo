// rutasApi.js
const API_URL = "https://localhost:7086/api/Rutas";

// Obtener todas las rutas
export async function getAllRutas() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener rutas");
  return res.json();
}

// Crear una nueva ruta
export async function createRuta(data) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear ruta");
  return res.json();
}

// Editar una ruta existente
export async function updateRuta(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar ruta");
  return res.json();
}

// Eliminar una ruta
export async function deleteRuta(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar ruta");
}
