// src/components/PasswordRecovery.jsx
import React, { useState } from "react";
import axios from "axios";
import { FiMail, FiArrowLeft, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../styles/PasswordRecovery.css"; // ← opcional, te doy el CSS abajo

export default function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!email.trim()) {
    setError("Por favor ingresa tu correo");
    return;
  }

  setLoading(true);
  setMessage("");
  setError("");

  try {
    const response = await axios.post(
      "https://unirumbobakend.onrender.com/api/Auth/forgot-password",
      { email: email.trim() }, // ← FORZAMOS EL FORMATO EXACTO
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    console.log("Respuesta del backend:", response.data); // ← para ver qué responde

    setMessage("¡Listo! Revisa tu correo (incluida la carpeta de spam). Te enviamos el enlace.");
    setEmail("");
  } catch (err) {
    console.error("Error completo:", err.response || err);

    let msg = "Error desconocido";
    if (err.response) {
      if (err.response.status === 400) {
        msg = err.response.data?.message || "El correo no está registrado o no es válido.";
      } else if (err.response.status === 404) {
        msg = "Usuario no encontrado.";
      } else {
        msg = "Error del servidor. Inténtalo más tarde.";
      }
    } else if (err.request) {
      msg = "No se pudo conectar al servidor.";
    }

    setError(msg);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="recovery-container">
      <div className="recovery-card">
        <button className="recovery-back-btn" onClick={() => navigate(-1)}>
          <FiArrowLeft size={28} />
        </button>

        <div className="recovery-header">
          <FiMail className="recovery-icon" />
          <h2>Recuperar Contraseña</h2>
          <p>Te enviaremos un enlace al correo para restablecer tu contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="recovery-form">
          <div className="recovery-input-group">
            <FiMail className="recovery-input-icon" />
            <input
              type="email"
              placeholder="tucorreo@estudiantec.edu.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="recovery-input"
            />
          </div>

          {error && (
            <div className="recovery-alert error">
              <FiXCircle /> {error}
            </div>
          )}
          {message && (
            <div className="recovery-alert success">
              <FiCheckCircle /> {message}
            </div>
          )}

          <button type="submit" className="recovery-btn" disabled={loading}>
            {loading ? "Enviando enlace..." : "Enviar enlace de recuperación"}
          </button>
        </form>
      </div>
    </div>
  );
}