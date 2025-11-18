/*
 * Archivo: frontend/src/components/UserForm.jsx
 * (Muestra el código de activación al finalizar)
 */
import React, { useState } from 'react';
import apiClient from '../services/api';

const styles = {
  // ... (mismos estilos de antes)
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '500px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  title: { margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '600' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '0.9rem', fontWeight: '500', color: '#374151' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #D1D5DB', fontSize: '1rem' },
  select: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #D1D5DB',
    fontSize: '1rem',
    backgroundColor: 'white',
  },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  btn: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: 'white',
  },
  btnCancel: { backgroundColor: '#E5E7EB', color: '#374151' },
  btnSave: { backgroundColor: '#057CD1' },

  // Estilos para el código
  successBox: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#F0FDF4',
    borderRadius: '8px',
    border: '1px solid #BBF7D0',
  },
  codeDisplay: {
    fontSize: '2rem',
    fontWeight: 'bold',
    letterSpacing: '5px',
    color: '#15803D',
    margin: '15px 0',
    fontFamily: 'monospace',
  },
  instruction: { fontSize: '0.9rem', color: '#374151' },
};

function UserForm({ onClose, onUserCreated }) {
  const [formData, setFormData] = useState({ name: '', email: '', role_id: 2 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCode, setCreatedCode] = useState(null); // Si existe, mostramos pantalla de éxito

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/users', formData); // Ya no envía password
      setCreatedCode(response.data.activationCode); // Guardamos el código que devolvió el backend
      onUserCreated(); // Actualizamos la tabla de fondo
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || 'Error al crear usuario');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {createdCode ? (
          /* --- PANTALLA DE ÉXITO (MOSTRAR CÓDIGO) --- */
          <div style={styles.successBox}>
            <h3 style={{ color: '#15803D', marginTop: 0 }}>¡Usuario Creado!</h3>
            <p style={styles.instruction}>
              Comparte este código con el usuario para que active su cuenta:
            </p>
            <div style={styles.codeDisplay}>{createdCode}</div>
            <p style={{ fontSize: '0.8rem', color: '#666' }}>
              El usuario debe ir a "Activar Cuenta" en el login.
            </p>
            <button
              onClick={onClose}
              style={{ ...styles.btn, ...styles.btnSave, marginTop: '10px' }}
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* --- FORMULARIO DE CREACIÓN --- */
          <>
            <h3 style={styles.title}>Registrar Nuevo Usuario</h3>
            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}
            >
              <div style={styles.field}>
                <label style={styles.label}>Nombre Completo</label>
                <input
                  name="name"
                  style={styles.input}
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  style={styles.input}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Rol</label>
                <select
                  name="role_id"
                  style={styles.select}
                  value={formData.role_id}
                  onChange={handleChange}
                >
                  <option value={2}>Jefe de Proceso</option>
                  <option value={1}>Administrador</option>
                </select>
              </div>
              {/* YA NO HAY CAMPO PASSWORD */}

              <div style={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ ...styles.btn, ...styles.btnCancel }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ ...styles.btn, ...styles.btnSave }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Generando...' : 'Generar Código'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default UserForm;
