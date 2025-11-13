import AlojamientoForm from "./AlojamientoForm";
import AlojamientoList from "./AlojamientoList";
import { useState } from "react";

export default function AlojamientoPage() {
  const [actualizar, setActualizar] = useState(false);

  return (
    <div className="p-6">
      <AlojamientoForm onCreated={() => setActualizar((prev) => !prev)} />
      <AlojamientoList key={actualizar} />
    </div>
  );
}
