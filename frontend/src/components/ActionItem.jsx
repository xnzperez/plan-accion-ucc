/*
 * Archivo: frontend/src/components/ActionItem.jsx
 * (La fila clickeable del acordeón)
 */
import React from 'react';

// --- Funciones Helper para calcular el estado ---
const getStatusDetails = (statusId) => {
  switch (statusId) {
    case 1:
      return { text: 'Borrador', color: '#6B7280' };
    case 2:
      return { text: 'Enviado', color: '#EAB308' };
    case 3:
      return { text: 'Aprobado', color: '#28a745' };
    case 4:
      return { text: 'Rechazado', color: '#dc3545' };
    case 5:
      return { text: 'Bloqueado', color: '#374151' };
    default:
      return { text: 'N/A', color: '#6B7280' };
  }
};

// Esta lógica encuentra el trimestre "activo" más avanzado
const getOverallStatus = (action) => {
  if (action.t4_status_id !== 5) {
    return { ...getStatusDetails(action.t4_status_id), quarter: 4 };
  }
  if (action.t3_status_id !== 5) {
    return { ...getStatusDetails(action.t3_status_id), quarter: 3 };
  }
  if (action.t2_status_id !== 5) {
    return { ...getStatusDetails(action.t2_status_id), quarter: 2 };
  }
  return { ...getStatusDetails(action.t1_status_id), quarter: 1 };
};
// ------------------------------------------------

const styles = {
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 10px',
    cursor: 'pointer',
    backgroundColor: '#F9FAFB',
    transition: 'background-color 0.2s',
  },
  description: {
    fontWeight: 500,
    color: '#1F2937',
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  statusTag: {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: 'white',
  },
  arrow: {
    fontSize: '1.2rem',
    color: '#6B7280',
  },
};

function ActionItem({ action, onClick, isOpen }) {
  const status = getOverallStatus(action);

  return (
    <div
      style={styles.item}
      onClick={onClick}
      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#F3F4F6')}
      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
    >
      <span style={styles.description}>{action.description}</span>
      <div style={styles.statusContainer}>
        <span style={{ ...styles.statusTag, backgroundColor: status.color }}>
          T{status.quarter}: {status.text}
        </span>
        <span style={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </div>
    </div>
  );
}

export default ActionItem;
