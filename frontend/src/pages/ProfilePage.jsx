/*
 * Archivo: frontend/src/pages/ProfilePage.jsx
 * (Versión Final - Con Alertas Toast)
 */
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast'; // <-- NUEVO
import apiClient from '../services/api';
import Header from '../components/Header';

const styles = {
  container: { maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' },
  grid: { display: 'grid', gap: '20px', marginTop: '20px' },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    marginTop: 0,
    marginBottom: '15px',
    fontSize: '1.2rem',
    color: '#1F2937',
    borderBottom: '1px solid #EEE',
    paddingBottom: '10px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  label: { fontWeight: '500', fontSize: '0.9rem', color: '#374151' },
  input: { padding: '10px', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '1rem' },
  btn: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: '#057CD1',
    color: 'white',
    width: 'fit-content',
  },

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

function ProfilePage() {
  const [user, setUser] = useState({ name: '', email: '' });
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [validations, setValidations] = useState({
    length: false,
    upper: false,
    number: false,
    special: false,
  });
  const [passwordScore, setPasswordScore] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({ name: decoded.user.name, email: 'Usuario Registrado' });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    const pwd = passData.newPassword;
    const checks = {
      length: pwd.length >= 8,
      upper: /[A-Z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
    setValidations(checks);
    setPasswordScore(Object.values(checks).filter(Boolean).length);
  }, [passData.newPassword]);

  const getBarColor = () => {
    if (passwordScore <= 1) return '#dc3545';
    if (passwordScore <= 3) return '#ffc107';
    return '#28a745';
  };

  const handleUpdateName = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Actualizando...');
    try {
      await apiClient.put('/auth/profile', { name: user.name });
      toast.success('Nombre actualizado. (Requiere reinicio para ver cambios)', {
        id: loadingToast,
      });
    } catch (error) {
      console.error(error);
      toast.error('Error al actualizar perfil.', { id: loadingToast });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordScore < 4) return toast.error('La contraseña nueva no es segura.');
    if (passData.newPassword !== passData.confirmPassword)
      return toast.error('Las nuevas contraseñas no coinciden.');

    const loadingToast = toast.loading('Cambiando contraseña...');
    try {
      await apiClient.put('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });
      toast.success('Contraseña cambiada exitosamente.', { id: loadingToast });
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar contraseña.', {
        id: loadingToast,
      });
    }
  };

  return (
    <div>
      <Header title="Mi Cuenta" />
      <div style={styles.container}>
        <div style={styles.grid}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Información Personal</h3>
            <form onSubmit={handleUpdateName} style={styles.form}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={styles.label}>Nombre Completo</label>
                <input
                  style={styles.input}
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={styles.label}>Correo Electrónico (No editable)</label>
                <input
                  style={{ ...styles.input, backgroundColor: '#F3F4F6', color: '#6B7280' }}
                  value={user.email}
                  disabled
                />
              </div>
              <button type="submit" style={styles.btn}>
                Guardar Nombre
              </button>
            </form>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Cambiar Contraseña</h3>
            <form onSubmit={handleChangePassword} style={styles.form}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={styles.label}>Contraseña Actual</label>
                <input
                  type="password"
                  style={styles.input}
                  required
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={styles.label}>Nueva Contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  required
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                />
                <div style={styles.strengthBarContainer}>
                  <div
                    style={{
                      ...styles.strengthBar,
                      width: `${(passwordScore / 4) * 100}%`,
                      backgroundColor: getBarColor(),
                    }}
                  />
                </div>
                <ul style={styles.reqList}>
                  <li
                    style={{ ...styles.reqItem, color: validations.length ? '#16a34a' : '#9CA3AF' }}
                  >
                    {validations.length ? '✓' : '○'} Mínimo 8 caracteres
                  </li>
                  <li
                    style={{ ...styles.reqItem, color: validations.upper ? '#16a34a' : '#9CA3AF' }}
                  >
                    {validations.upper ? '✓' : '○'} Al menos una mayúscula
                  </li>
                  <li
                    style={{ ...styles.reqItem, color: validations.number ? '#16a34a' : '#9CA3AF' }}
                  >
                    {validations.number ? '✓' : '○'} Al menos un número
                  </li>
                  <li
                    style={{
                      ...styles.reqItem,
                      color: validations.special ? '#16a34a' : '#9CA3AF',
                    }}
                  >
                    {validations.special ? '✓' : '○'} Un carácter especial
                  </li>
                </ul>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <label style={styles.label}>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  style={styles.input}
                  required
                  value={passData.confirmPassword}
                  onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                />
              </div>
              <button
                type="submit"
                style={{
                  ...styles.btn,
                  backgroundColor: passwordScore === 4 ? '#057CD1' : '#9CA3AF',
                  cursor: passwordScore === 4 ? 'pointer' : 'not-allowed',
                }}
                disabled={passwordScore < 4}
              >
                Actualizar Contraseña
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
