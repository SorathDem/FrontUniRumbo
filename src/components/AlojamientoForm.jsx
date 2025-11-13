import { useState } from "react";
import { createAlojamiento } from "../api/AlojamientoApi";
import Mapa from "./MapaAlojamiento";

export default function AlojamientoForm({ onCreated }) {
  const [descripcion, setDescripcion] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);

  const handleMapClick = (latitud, longitud) => {
    setLat(latitud);
    setLng(longitud);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lat || !lng) {
      alert("⚠️ Por favor selecciona una ubicación en el mapa.");
      return;
    }

    try {
      const nuevo = await createAlojamiento({
        descripcion,
        latitud: lat,
        longitud: lng,
      });

      alert("✅ Alojamiento creado correctamente");
      onCreated?.(nuevo);
      setDescripcion("");
      setLat(null);
      setLng(null);
    } catch (err) {
      alert("❌ Error: " + err.message);
    }
  };

  return (
    <div className="mb-6">
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-gray-100 rounded-xl shadow-md"
      >
        <h2 className="text-xl font-bold mb-3 text-blue-700">
          Agregar Nuevo Alojamiento
        </h2>

        <input
          type="text"
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
          required
        />

        <p className="text-gray-600 mb-2 text-sm">
          Haz clic en el mapa para seleccionar la ubicación del alojamiento.
        </p>

        <div className="mb-4 rounded overflow-hidden shadow-md">
          <Mapa
            lat={lat}
            lng={lng}
            descripcion={descripcion}
            onClickMapa={handleMapClick}
          />
        </div>

        {lat && lng && (
          <div className="text-sm text-gray-600 mb-2">
            📍 Coordenadas: <b>{lat.toFixed(6)}</b>, <b>{lng.toFixed(6)}</b>
          </div>
        )}

        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded w-full hover:bg-blue-700"
        >
          Guardar Alojamiento
        </button>
      </form>
    </div>
  );
}
