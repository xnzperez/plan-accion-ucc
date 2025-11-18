/*
 * Archivo: frontend/src/components/AdminReviewModule.jsx
 * (Versión Final - Con Validación de Porcentaje 0-100)
 */
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import apiClient from '../services/api';
import FilePreview from './FilePreview';

const styles = {
  module: { border: '1px solid #057CD1', borderRadius: '8px', backgroundColor: '#F0F9FF' },
  header: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#0369A1',
    padding: '10px 15px',
    borderBottom: '1px solid #BEE1F9',
  },
  body: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' },
  sectionTitle: { fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '0.9rem' },
  evidenceList: { listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem' },
  evidenceItem: { marginBottom: '5px' },
  inputGrid: { display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: '1', minWidth: '150px' },
  label: { fontWeight: '500', color: '#374151', fontSize: '0.9rem' },
  input: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '5px',
    fontSize: '1rem',
  },
  buttonGroup: { display: 'flex', gap: '10px' },
  button: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '5px',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};

function AdminReviewModule({ actionId, quarter, evidences, onActionReviewed }) {
  const [percentage, setPercentage] = useState(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- NUEVA FUNCIÓN: CONTROL DE INPUT DE PORCENTAJE ---
  const handlePercentageChange = (e) => {
    let val = parseFloat(e.target.value);

    if (isNaN(val)) val = 0;
    if (val < 0) val = 0;
    if (val > 100) val = 100; // Tope máximo automático

    setPercentage(val);
  };
  // ---------------------------------------------------

  const handleSubmit = async (isApproved) => {
    if (!isApproved && (!reason || reason.trim() === '')) {
      return Swal.fire(
        'Motivo requerido',
        'Debes escribir una razón para rechazar el trimestre.',
        'warning'
      );
    }
    // Doble validación de seguridad
    if (isApproved && (percentage < 0 || percentage > 100)) {
      return Swal.fire('Porcentaje inválido', 'El valor debe estar entre 0 y 100.', 'error');
    }

    const actionText = isApproved ? 'Aprobar' : 'Rechazar';
    const confirmColor = isApproved ? '#28a745' : '#dc3545';

    const result = await Swal.fire({
      title: `¿${actionText} Trimestre ${quarter}?`,
      text: isApproved
        ? `Se asignará un cumplimiento del ${percentage}%.`
        : 'La acción será devuelta al Jefe de Proceso para correcciones.',
      icon: isApproved ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6B7280',
      confirmButtonText: `Sí, ${actionText}`,
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/actions/${actionId}/review`, {
        quarter: quarter,
        isApproved: isApproved,
        percentage: parseFloat(percentage),
        reason: reason,
      });

      await Swal.fire({
        title: isApproved ? '¡Aprobado!' : '¡Rechazado!',
        text: `El Trimestre ${quarter} ha sido procesado correctamente.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
      });

      onActionReviewed();
    } catch (error) {
      console.error('Error al revisar el trimestre:', error);
      Swal.fire('Error', 'Hubo un problema al guardar la revisión.', 'error');
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.module}>
      <header style={styles.header}>Revisión Pendiente (Trimestre {quarter})</header>
      <div style={styles.body}>
        <div style={styles.section}>
          <label style={styles.sectionTitle}>Evidencias Enviadas (Trimestre {quarter})</label>
          <ul style={styles.evidenceList}>
            {evidences.length === 0 ? (
              <li style={styles.evidenceItem}>
                <strong>¡Alerta!</strong> El Jefe no adjuntó evidencias.
              </li>
            ) : (
              evidences.map((ev) => (
                <li key={ev.id} style={styles.evidenceItem}>
                  <FilePreview url={ev.file_url} fileName={ev.description || 'Archivo'} />
                </li>
              ))
            )}
          </ul>
        </div>

        <div style={styles.inputGrid}>
          <div style={styles.field}>
            <label style={styles.label}>% Ejecución (T{quarter})</label>
            <input
              type="number"
              style={styles.input}
              value={percentage}
              min="0"
              max="100"
              onChange={handlePercentageChange} // Usamos la nueva función
            />
          </div>
          <div style={{ ...styles.field, flex: 2 }}>
            <label style={styles.label}>Motivo de Rechazo (si aplica)</label>
            <input
              type="text"
              style={styles.input}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Describe qué debe corregir el Jefe..."
            />
          </div>
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            style={{ ...styles.button, backgroundColor: '#28a745', color: 'white' }}
          >
            {isSubmitting ? 'Guardando...' : `Aprobar Trimestre ${quarter}`}
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            style={{ ...styles.button, backgroundColor: '#dc3545', color: 'white' }}
          >
            {isSubmitting ? 'Guardando...' : `Rechazar Trimestre ${quarter}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminReviewModule;
