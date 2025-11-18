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
    setError("Ingresa tu correo");
    return;
  }

  setLoading(true);
  setError("");
  setMessage("");

  try {
    // PRUEBA CON "correo" EN MINÚSCULA (esto es lo que usa el 90% de los backends en español)
    const response = await axios.post(
      "https://unirumbobakend.onrender.com/api/Auth/forgot-password",
      { correo: email.trim() }  // CAMBIA "email" POR "correo"
    );

    setMessage("¡Enlace enviado! Revisa tu correo.");
    setEmail("");
  } catch (err) {
    console.log("Error completo:", err.response);

    // Si falla con "correo", prueba con "Email" (mayúscula)
    try {
      const response2 = await axios.post(
        "https://unirumbobakend.onrender.com/api/Auth/forgot-password",
        { Email: email.trim() }
      );
      setMessage("¡Enlace enviado! Revisa tu correo.");
      setEmail("");
    } catch (err2) {
      setError("Correo no encontrado o error del servidor.");
    }
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