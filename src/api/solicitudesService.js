import axios from "axios";

const API_SOLICITUDES = "https://localhost:7086/api/Solicitudes";

export const crearSolicitudRuta = async (idRuta) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.idUsuario;  // ✅ ahora toma el id correctamente

  console.log("🧩 ID de usuario que se enviará:", idUsuario);

  if (!idUsuario) {
    console.error("❌ No hay idUsuario en localStorage");
    return;
  }

  try {
    const response = await axios.post(`${API_SOLICITUDES}/ruta`, {
      IdRuta: idRuta,
      IdUsuario: parseInt(idUsuario),
      IdEstado: 1 
    });

    console.log("✅ Solicitud enviada correctamente:", response.data);
  } catch (error) {
    console.error("❌ Error al crear la solicitud:", error.response?.data || error.message);
  }
};

export const crearSolicitudAlojamiento = async (idAlojamiento) => {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const idUsuario = usuario?.idUsuario;

  console.log("🧩 ID de usuario que se enviará:", idUsuario);

  if (!idUsuario) {
    console.error("❌ No hay idUsuario en localStorage");
    return;
  }

  try {
    const response = await axios.post(`${API_SOLICITUDES}/alojamiento`, {
      IdAlojamiento: idAlojamiento,
      IdUsuario: parseInt(idUsuario),
      IdEstado: 1
    });

    console.log("✅ Solicitud de alojamiento enviada correctamente:", response.data);
  } catch (error) {
    console.error("❌ Error al crear la solicitud de alojamiento:", error.response?.data || error.message);
  }
};
