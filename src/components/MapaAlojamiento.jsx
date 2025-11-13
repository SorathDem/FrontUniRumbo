import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Icono personalizado
const markerIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [35, 35],
  iconAnchor: [17, 34],
});

function Mapa({ lat, lng, descripcion, onClickMapa }) {
  // Detectar clics en el mapa
  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        if (onClickMapa) {
          onClickMapa(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[lat || 4.65, lng || -74.1]} // Bogotá como valor por defecto
      zoom={13}
      style={{ height: "250px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> colaboradores'
      />
      {lat && lng && <Marker position={[lat, lng]} icon={markerIcon}></Marker>}
      <MapClickHandler />
    </MapContainer>
  );
}

export default Mapa;
