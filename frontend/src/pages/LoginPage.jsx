/*

 * Archivo: frontend/src/pages/LoginPage.jsx

 * (Versión Definitiva - Enlaces Unificados + Alertas Toast)

 */

import React, { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import toast from 'react-hot-toast'; // <-- AÑADIDO

import apiClient from '../services/api';

// --- RECURSOS ---

const LOGO_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/U._Cooperativa_de_Colombia_logo.svg/2276px-U._Cooperativa_de_Colombia_logo.svg.png';

const CAMPUS_BG =
  'https://www.chicanoticias.com/wp-content/uploads/2025/06/Imagen-de-referencia-2025-06-13T133654.510.png';

// --- ESTILOS ---

const styles = {
  container: {
    display: 'flex',

    height: '100vh',

    width: '100vw',

    overflow: 'hidden',

    fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  },

  leftPanel: {
    flex: '1',

    display: 'flex',

    flexDirection: 'column',

    justifyContent: 'center',

    alignItems: 'center',

    backgroundColor: '#FFFFFF',

    padding: '40px',

    position: 'relative',

    zIndex: 2,
  },

  formContainer: {
    width: '100%',

    maxWidth: '400px',

    display: 'flex',

    flexDirection: 'column',

    gap: '20px',
  },

  logo: { width: '280px', marginBottom: '20px', alignSelf: 'center' },

  welcomeText: { textAlign: 'center', marginBottom: '10px' },

  title: { fontSize: '1.8rem', fontWeight: '700', color: '#1F2937', margin: '0 0 5px 0' },

  subtitle: { fontSize: '1rem', color: '#6B7280', margin: 0 },

  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },

  label: { fontSize: '0.9rem', fontWeight: '600', color: '#374151' },

  input: {
    padding: '12px 15px',

    borderRadius: '8px',

    border: '1px solid #D1D5DB',

    fontSize: '1rem',

    outline: 'none',

    transition: 'border-color 0.2s',
  },

  button: {
    marginTop: '10px',

    padding: '14px',

    backgroundColor: '#057CD1',

    color: 'white',

    border: 'none',

    borderRadius: '8px',

    fontSize: '1rem',

    fontWeight: '600',

    cursor: 'pointer',

    transition: 'background-color 0.2s',
  },

  errorMessage: {
    backgroundColor: '#FEE2E2',

    color: '#991B1B',

    padding: '10px',

    borderRadius: '6px',

    fontSize: '0.9rem',

    textAlign: 'center',
  },

  // Estilos para la sección unificada de ayuda

  helpSection: {
    textAlign: 'center',

    marginTop: '20px',

    paddingTop: '20px',

    borderTop: '1px solid #EEE',
  },

  helpText: { fontSize: '0.9rem', color: '#6B7280', marginBottom: '5px', display: 'block' },

  activationLink: {
    color: '#057CD1',

    textDecoration: 'none',

    fontWeight: '700',

    fontSize: '0.95rem',

    cursor: 'pointer',
  },

  footer: { marginTop: '40px', textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF' },

  rightPanel: {
    flex: '1.5',

    backgroundImage: `url(${CAMPUS_BG})`,

    backgroundSize: 'cover',

    backgroundPosition: 'center',

    position: 'relative',

    display: 'flex',

    justifyContent: 'center',

    alignItems: 'center',
  },

  overlay: {
    position: 'absolute',

    top: 0,

    left: 0,

    width: '100%',

    height: '100%',

    background: 'linear-gradient(135deg, rgba(5, 124, 209, 0.8) 0%, rgba(3, 52, 111, 0.9) 100%)',
  },

  heroContent: {
    position: 'relative',

    zIndex: 1,

    color: 'white',

    textAlign: 'center',

    padding: '40px',
  },

  heroTitle: {
    fontSize: '2.5rem',

    fontWeight: 'bold',

    marginBottom: '15px',

    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },

  heroText: { fontSize: '1.2rem', opacity: 0.9 },
};

function LoginPage() {
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError('');

    setIsLoading(true);

    // --- TOAST: Feedback inmediato ---

    const loadingToast = toast.loading('Verificando credenciales...');

    try {
      const response = await apiClient.post('/auth/login', { email, password });

      const { token, role } = response.data;

      localStorage.setItem('authToken', token);

      // --- TOAST: Éxito ---

      toast.success(`¡Bienvenido de nuevo!`, { id: loadingToast });

      if (role === 1) navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Error de login:', err);

      const msg = err.response?.data?.error || 'No se pudo conectar con el servidor.';

      // --- TOAST: Error ---

      toast.error(msg, { id: loadingToast });

      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftPanel}>
        <div style={styles.formContainer}>
          <img src={LOGO_URL} alt="Logo UCC" style={styles.logo} />

          <div style={styles.welcomeText}>
            <h1 style={styles.title}>Bienvenido</h1>

            <p style={styles.subtitle}>Sistema de Gestión de Planes de Acción</p>
          </div>

          {error && <div style={styles.errorMessage}>{error}</div>}

          <form
            onSubmit={handleLogin}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            <div style={styles.inputGroup}>
              <label style={styles.label}>Correo Institucional</label>

              <input
                type="email"
                placeholder="nombre.apellido@campusucc.edu.co"
                style={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>

              <input
                type="password"
                placeholder="••••••••"
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              style={{ ...styles.button, opacity: isLoading ? 0.7 : 1 }}
              disabled={isLoading}
            >
              {isLoading ? 'Ingresando...' : 'Iniciar Sesión'}
            </button>
          </form>

          {/* --- SECCIÓN UNIFICADA --- */}

          <div style={styles.helpSection}>
            <span style={styles.helpText}>¿Tienes un código de activación?</span>

            <Link to="/activate" style={styles.activationLink}>
              Activar Cuenta / Restablecer Clave
            </Link>
          </div>

          {/* ------------------------- */}

          <div style={styles.footer}>
            © 2025 Universidad Cooperativa de Colombia - Sede Montería
          </div>
        </div>
      </div>

      <div style={styles.rightPanel} className="hidden-on-mobile">
        <div style={styles.overlay}></div>

        <div style={styles.heroContent}>
          <h2 style={styles.heroTitle}>Excelencia y Calidad</h2>

          <p style={styles.heroText}>Gestiona, monitorea y cumple tus metas estratégicas.</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
