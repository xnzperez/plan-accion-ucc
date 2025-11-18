/*
 * Archivo: frontend/src/components/AssignProcessModal.jsx
 * (Modal para asignar un proceso a un usuario)
 */
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

const styles = {
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
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  title: { margin: '0 0 10px 0', fontSize: '1.2rem', fontWeight: '600' },
  select: {
    padding: '10px',
    borderRadius: '5px',
    border: '1px solid #D1D5DB',
    fontSize: '1rem',
    width: '100%',
  },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  btn: {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: 'white',
  },
  btnCancel: { backgroundColor: '#E5E7EB', color: '#374151' },
  btnSave: { backgroundColor: '#057CD1' },
};

function AssignProcessModal({ user, onClose, onAssignmentComplete }) {
  const [processes, setProcesses] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');

  // Cargar procesos al abrir el modal
  useEffect(() => {
    const loadProcesses = async () => {
      try {
        const res = await apiClient.get('/processes');
        setProcesses(res.data);
        if (res.data.length > 0) setSelectedProcess(res.data[0].id);
      } catch (error) {
        console.error('Error cargando procesos:', error);
      }
    };
    loadProcesses();
  }, []);

  const handleAssign = async () => {
    try {
      await apiClient.post(`/users/${user.id}/assign`, { process_id: selectedProcess });
      alert(`Proceso asignado a ${user.name}`);
      onAssignmentComplete();
      onClose();
    } catch (error) {
      console.error('Error asignando proceso:', error);
      alert('Error al asignar el proceso.');
    }
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.title}>Asignar Proceso a: {user.name}</h3>
        <p style={{ fontSize: '0.9rem', color: '#666' }}>
          Selecciona el área que gestionará este usuario:
        </p>

        <select
          style={styles.select}
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
        >
          {processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div style={styles.buttonGroup}>
          <button onClick={onClose} style={{ ...styles.btn, ...styles.btnCancel }}>
            Cancelar
          </button>
          <button onClick={handleAssign} style={{ ...styles.btn, ...styles.btnSave }}>
            Guardar Asignación
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignProcessModal;
