/*
 * Archivo: frontend/src/components/ActionDetail.jsx
 * (UX Mejorada: Botón arriba y Alertas Toast)
 */
import React, { useState } from 'react';
import toast from 'react-hot-toast'; // <-- NUEVO
import apiClient from '../services/api';
import QuarterModule from './QuarterModule';

const styles = {
  detailView: {
    padding: '20px',
    backgroundColor: '#FFFFFF',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.9rem',
  },
  input: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '5px',
    fontSize: '1rem',
  },
  textarea: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '5px',
    fontSize: '1rem',
    minHeight: '80px',
    fontFamily: 'inherit',
  },
  saveButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#16a34a',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '0.95rem',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #E5E7EB',
    margin: '10px 0',
  },
  quarterTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '10px',
  },
};

function ActionDetail({ action, onActionUpdate }) {
  const [responsible, setResponsible] = useState(action.responsible_charge || '');
  const [budget, setBudget] = useState(action.budget || '');
  const [activities, setActivities] = useState(action.activities || '');
  const [observations, setObservations] = useState(action.observations_jefe || '');

  // Estados de checkboxes (se mantienen para enviarlos, aunque no se pinten aquí)
  const [t1_completed] = useState(action.t1_completed);
  const [t2_completed] = useState(action.t2_completed);
  const [t3_completed] = useState(action.t3_completed);
  const [t4_completed] = useState(action.t4_completed);

  const handleSaveFields = async () => {
    const loadingToast = toast.loading('Guardando cambios...');
    try {
      await apiClient.put(`/actions/${action.id}`, {
        responsible_charge: responsible,
        budget: parseFloat(budget) || 0,
        activities: activities,
        observations_jefe: observations,
        t1_completed,
        t2_completed,
        t3_completed,
        t4_completed,
      });

      toast.success('Información general actualizada', { id: loadingToast });
      onActionUpdate();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar cambios', { id: loadingToast });
    }
  };

  const getEvidencesForQuarter = (q) => action.evidences.filter((ev) => ev.quarter === q);

  return (
    <div style={styles.detailView}>
      {/* --- SECCIÓN DE CAMPOS GENERALES --- */}
      <h4 style={{ margin: 0, color: '#057CD1' }}>Información General</h4>

      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Cargo Responsable</label>
          <input
            type="text"
            style={styles.input}
            value={responsible}
            onChange={(e) => setResponsible(e.target.value)}
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Presupuesto ($)</label>
          <input
            type="number"
            style={styles.input}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </div>
        <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
          <label style={styles.label}>Actividades</label>
          <textarea
            style={styles.textarea}
            value={activities}
            onChange={(e) => setActivities(e.target.value)}
          />
        </div>
        <div style={{ ...styles.field, gridColumn: '1 / -1' }}>
          <label style={styles.label}>Observaciones (Jefe)</label>
          <textarea
            style={styles.textarea}
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
          />
        </div>
      </div>

      <button onClick={handleSaveFields} style={styles.saveButton}>
        💾 Guardar Cambios Generales
      </button>

      <hr style={styles.divider} />

      {/* --- SECCIÓN DE TRIMESTRES --- */}
      <div>
        <h4 style={styles.quarterTitle}>Gestión de Trimestres</h4>
        <div style={styles.grid}>
          {[1, 2, 3, 4].map((q) => (
            <QuarterModule
              key={q}
              actionId={action.id}
              quarterNumber={q}
              statusId={action[`t${q}_status_id`]}
              completed={action[`t${q}_completed`]} // Checkbox visual dentro del módulo si quisieras
              evidences={getEvidencesForQuarter(q)}
              rejectionReason={action.rejection_reason}
              onActionUpdate={onActionUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActionDetail;
