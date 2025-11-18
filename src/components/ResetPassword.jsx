// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await axios.post('https://unirumbobackend.onrender.com/api/auth/reset-password', {
        Email: email,
        Token: token,
        NuevaContrasena: password
      });

      setMessage('¡Contraseña cambiada con éxito! Redirigiendo al login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Token inválido o expirado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container login-background">
      <div className="auth-form">
        <h2>Restablecer Contraseña</h2>
        <p>Ingresa tu nueva contraseña para <strong>{email}</strong></p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="6"
          />
          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength="6"
          />

          {error && <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>}
          {message && <p style={{ color: 'green', margin: '10px 0' }}>{message}</p>}

          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Cambiando...' : 'Cambiar contraseña'}
          </button>
        </form>

        <button 
          type="button" 
          className="auth-button secondary" 
          onClick={() => navigate('/login')}
          style={{ marginTop: '10px' }}
        >
          Volver al login
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;