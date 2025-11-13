const API_URL = "https://localhost:7086/api/Alojamiento";

// Obtener todos los alojamientos
export async function getAllAlojamientos() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Error al obtener alojamientos");
  return res.json();
}

// Crear alojamiento con coordenadas
export async function createAlojamiento(data) {
  const res = await fetch(`${API_URL}/con-coordenadas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al crear alojamiento");
  return res.json();
}

// Actualizar alojamiento
export async function updateAlojamiento(id, data) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Error al actualizar alojamiento");
  return res.json();
}

// Eliminar alojamiento
export async function deleteAlojamiento(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar alojamiento");
  return res.json();
}
