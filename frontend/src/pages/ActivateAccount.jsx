/*
 * Archivo: frontend/src/pages/ActivateAccount.jsx
 * (Versión Final - Con Validación de Contraseña y Alertas SweetAlert2)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2'; // 
import apiClient from '../services/api';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    fontFamily: 'Segoe UI, sans-serif',
    padding: '20px',
  },

  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '420px',
  },

  title: {
    textAlign: 'center',
    marginBottom: '10px',
    color: '#1F2937',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },

  subtitle: { textAlign: 'center', marginBottom: '20px', color: '#6B7280', fontSize: '0.9rem' },
  input: {
    width: '100%',
    padding: '12px',
    margin: '8px 0',
    borderRadius: '5px',
    border: '1px solid #D1D5DB',
    boxSizing: 'border-box',
    fontSize: '1rem',
  },

  button: {
    width: '100%',
    padding: '12px',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '15px',
    fontSize: '1rem',
    transition: 'background-color 0.2s',
  },

  link: {
    display: 'block',
    textAlign: 'center',
    marginTop: '20px',
    color: '#057CD1',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },

  // Estilos de Validación
  reqList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '5px',
    marginBottom: '10px',
    fontSize: '0.8rem',
  },

  reqItem: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' },
  strengthBarContainer: {
    height: '4px',
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: '2px',
    marginTop: '5px',
    marginBottom: '10px',
    overflow: 'hidden',
  },

  strengthBar: { height: '100%', transition: 'width 0.3s, background-color 0.3s' },
};

function ActivateAccount() {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    password: '',
    confirmPassword: '',
  });

  // Estados de Validación
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    number: false,
    special: false,
  });

  const [passwordScore, setPasswordScore] = useState(0); // 0 a 4
  const navigate = useNavigate();

  // Analizar contraseña en tiempo real

  useEffect(() => {
    const pwd = formData.password;
    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };

    setValidations(checks);
    const score = Object.values(checks).filter(Boolean).length;
    setPasswordScore(score);
  }, [formData.password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Validar Seguridad antes de enviar
    if (passwordScore < 4) {
      return Swal.fire({
        title: 'Contraseña Débil',
        text: 'La contraseña no cumple con los requisitos de seguridad.',
        icon: 'warning',
        confirmButtonColor: '#057CD1',
      });
    }

    if (formData.password !== formData.confirmPassword) {
      return Swal.fire({
        title: 'Error',
        text: 'Las contraseñas no coinciden.',
        icon: 'error',
        confirmButtonColor: '#057CD1',
      });
    }

    try {
      await apiClient.post('/auth/activate', {
        email: formData.email,
        code: formData.code,
        password: formData.password,
      });

      // --- ÉXITO ---
      await Swal.fire({
        title: '¡Cuenta Activada!',
        text: 'Tu contraseña ha sido configurada exitosamente. Ahora puedes iniciar sesión.',
        icon: 'success',
        confirmButtonText: 'Ir al Login',
        confirmButtonColor: '#057CD1',
      });

      navigate('/login');
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error de Activación',
        text: err.response?.data?.error || 'No se pudo activar la cuenta. Verifica el código.',
        icon: 'error',
        confirmButtonColor: '#dc3545',
      });
    }
  };

  // Helper para color de la barra
  const getBarColor = () => {
    if (passwordScore <= 1) return '#dc3545'; // Rojo
    if (passwordScore <= 3) return '#ffc107'; // Amarillo
    return '#28a745'; // Verde
  };

  return (
    <div style={styles.container}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Activar / Restablecer</h2>
        <p style={styles.subtitle}>
          Ingresa el código proporcionado por el administrador para configurar tu acceso.
        </p>
        <input
          placeholder="Correo Institucional"
          type="email"
          style={styles.input}
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          placeholder="Código de Activación (Ej. A1B2C3)"
          style={styles.input}
          required
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
        />

        {/* Input de Password con Validación Visual */}
        <input
          placeholder="Nueva Contraseña"
          type="password"
          style={styles.input}
          required
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />
        {/* Barra de Fuerza */}
        <div style={styles.strengthBarContainer}>
          <div
            style={{
              ...styles.strengthBar,
              width: `${(passwordScore / 4) * 100}%`,
              backgroundColor: getBarColor(),
            }}
          />
        </div>

        {/* Lista de Requisitos */}
        <ul style={styles.reqList}>
          <li style={{ ...styles.reqItem, color: validations.length ? '#16a34a' : '#9CA3AF' }}>
            {validations.length ? '✓' : '○'} Mínimo 8 caracteres
          </li>
          <li style={{ ...styles.reqItem, color: validations.upper ? '#16a34a' : '#9CA3AF' }}>
            {validations.upper ? '✓' : '○'} Al menos una mayúscula (A-Z)
          </li>
          <li style={{ ...styles.reqItem, color: validations.number ? '#16a34a' : '#9CA3AF' }}>
            {validations.number ? '✓' : '○'} Al menos un número (0-9)
          </li>
          <li style={{ ...styles.reqItem, color: validations.special ? '#16a34a' : '#9CA3AF' }}>
            {validations.special ? '✓' : '○'} Un carácter especial (!@#$...)
          </li>
        </ul>
        <input
          placeholder="Confirmar Contraseña"
          type="password"
          style={styles.input}
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
        />
        <button
          type="submit"
          style={{
            ...styles.button,
            backgroundColor: passwordScore === 4 ? '#057CD1' : '#9CA3AF',
            cursor: passwordScore === 4 ? 'pointer' : 'not-allowed',
          }}
          disabled={passwordScore < 4}
        >
          Activar y Definir Contraseña
        </button>
        <Link to="/login" style={styles.link}>
          Volver al Inicio de Sesión
        </Link>
      </form>
    </div>
  );
}

export default ActivateAccount;
