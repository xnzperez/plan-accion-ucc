/*
 * Archivo: frontend/src/components/AdminActionViewer.jsx
 * (Versión Final - Con Botón de Eliminar Acción)
 */
import React, { useState } from 'react';
import FilePreview from './FilePreview';

// ... (Helpers y estilos iguales a los anteriores)
const getStatusColor = (statusId) => {
  switch (statusId) {
    case 1:
      return '#6B7280';
    case 2:
      return '#EAB308';
    case 3:
      return '#28a745';
    case 4:
      return '#dc3545';
    default:
      return '#374151';
  }
};
const getStatusText = (statusId) => {
  switch (statusId) {
    case 1:
      return 'Borrador';
    case 2:
      return 'En Revisión';
    case 3:
      return 'Aprobado';
    case 4:
      return 'Rechazado';
    default:
      return 'Bloqueado';
  }
};

const styles = {
  container: {
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    marginBottom: '10px',
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  header: {
    padding: '12px 15px',
    backgroundColor: '#F9FAFB',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: { display: 'flex', alignItems: 'center', gap: '10px' },
  title: { fontWeight: '600', color: '#1F2937', fontSize: '0.95rem' },
  metaBadges: { display: 'flex', gap: '10px', fontSize: '0.8rem', alignItems: 'center' },
  badge: {
    padding: '2px 8px',
    borderRadius: '10px',
    backgroundColor: '#E5E7EB',
    color: '#374151',
    fontWeight: 'bold',
  },
  body: { padding: '15px', borderTop: '1px solid #E5E7EB' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  infoItem: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.75rem', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold' },
  value: { fontSize: '0.9rem', color: '#111827' },
  quartersContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
    marginTop: '10px',
  },
  quarterBox: {
    border: '1px solid #EEE',
    borderRadius: '6px',
    padding: '10px',
    textAlign: 'center',
  },
  qTitle: { fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '5px', display: 'block' },
  qPercent: { fontSize: '1.2rem', fontWeight: 'bold', color: '#057CD1' },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#EF4444',
    fontSize: '1rem',
  },
};

function AdminActionViewer({ action, onDelete }) {
  // <-- Recibe onDelete
  const [isOpen, setIsOpen] = useState(false);
  const getEvidences = (q) => action.evidences.filter((ev) => ev.quarter === q);

  const renderQuarter = (qNum) => {
    const statusId = action[`t${qNum}_status_id`];
    const percent = action[`t${qNum}_execution_percent`] || 0;
    const color = getStatusColor(statusId);
    const evidences = getEvidences(qNum);
    return (
      <div style={{ ...styles.quarterBox, borderTop: `3px solid ${color}` }}>
        <span style={styles.qTitle}>Trimestre {qNum}</span>
        <div style={{ color: color, fontSize: '0.8rem', marginBottom: '5px' }}>
          {getStatusText(statusId)}
        </div>
        <div style={styles.qPercent}>{parseFloat(percent).toFixed(0)}%</div>
        <div style={{ marginTop: '10px', textAlign: 'left' }}>
          {evidences.length > 0 ? (
            evidences.map((ev) => (
              <FilePreview key={ev.id} url={ev.file_url} fileName={ev.description || 'Archivo'} />
            ))
          ) : (
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', textAlign: 'center' }}>
              Sin evidencias
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.header} onClick={() => setIsOpen(!isOpen)}>
        <div style={styles.titleContainer}>
          {/* Botón de Borrar (Detiene la propagación para no abrir el acordeón) */}
          <button
            style={styles.deleteBtn}
            title="Eliminar Acción"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            🗑️
          </button>
          <span style={styles.title}>{action.description}</span>
        </div>

        <div style={styles.metaBadges}>
          <span style={styles.badge}>
            Avance: {parseFloat(action.goal_progress_percent || 0).toFixed(0)}%
          </span>
          <span style={{ color: '#6B7280' }}>{isOpen ? '▲' : '▼'}</span>
        </div>
      </div>

      {isOpen && (
        <div style={styles.body}>
          <div style={styles.grid}>
            <div style={styles.infoItem}>
              <span style={styles.label}>Responsable</span>
              <span style={styles.value}>{action.responsible_charge || 'N/A'}</span>
            </div>
            <div style={styles.infoItem}>
              <span style={styles.label}>Presupuesto</span>
              <span style={styles.value}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                  maximumFractionDigits: 0,
                }).format(action.budget || 0)}
              </span>
            </div>
            <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
              <span style={styles.label}>Actividades</span>
              <span style={styles.value}>{action.activities || 'Sin actividades'}</span>
            </div>
          </div>
          <h4 style={{ fontSize: '0.9rem', color: '#374151', marginBottom: '10px' }}>
            Estado Trimestral
          </h4>
          <div style={styles.quartersContainer}>
            {renderQuarter(1)}
            {renderQuarter(2)}
            {renderQuarter(3)}
            {renderQuarter(4)}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminActionViewer;
