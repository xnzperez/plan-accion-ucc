/*
 * Archivo: frontend/src/components/AdminActionCard.jsx
 * (La "tarjeta" que el Admin usa para revisar)
 */
import React from 'react';
import AdminReviewModule from './AdminReviewModule'; // <-- NUEVO

// --- Constantes de Estado ---
const STATUS_ENVIADO = 2;

const styles = {
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    overflow: 'hidden', // Para que el header redondeado funcione
  },
  header: {
    backgroundColor: '#F9FAFB',
    padding: '15px 20px',
    borderBottom: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '600',
    marginBottom: '5px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#6B7280',
    margin: 0,
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px 20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #E5E7EB',
  },
  infoItem: {
    fontSize: '0.9rem',
  },
  infoLabel: {
    fontWeight: '500',
    color: '#374151',
    display: 'block',
  },
  infoValue: {
    color: '#1F2937',
    whiteSpace: 'pre-wrap', // Muestra saltos de línea en actividades/obs
  },
  reviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
};

function AdminActionCard({ action, onActionReviewed }) {
  // Función para filtrar evidencias por trimestre
  const getEvidencesForQuarter = (q) => {
    return action.evidences.filter((ev) => ev.quarter === q);
  };

  return (
    <div style={styles.card}>
      <header style={styles.header}>
        <h3 style={styles.title}>{action.description}</h3>
        <p style={styles.subtitle}>
          <strong>Proceso:</strong> {action.process_name} | <strong>Enviada por:</strong>{' '}
          {action.created_by_name}
        </p>
      </header>
      <section style={styles.body}>
        {/* --- 1. Información General (Solo Lectura) --- */}
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Responsable</span>
            <span style={styles.infoValue}>{action.responsible_charge || 'N/A'}</span>
          </div>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>Presupuesto</span>
            <span style={styles.infoValue}>
              {new Intl.NumberFormat('es-CO', {
                style: 'currency',
                currency: 'COP',
                maximumFractionDigits: 0,
              }).format(action.budget || 0)}
            </span>
          </div>
          <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
            <span style={styles.infoLabel}>Actividades</span>
            <span style={styles.infoValue}>{action.activities || 'N/A'}</span>
          </div>
          <div style={{ ...styles.infoItem, gridColumn: '1 / -1' }}>
            <span style={styles.infoLabel}>Observaciones del Jefe</span>
            <span style={styles.infoValue}>{action.observations_jefe || 'N/A'}</span>
          </div>
        </div>

        {/* --- 2. Módulos de Revisión --- */}
        <div style={styles.reviewContainer}>
          {action.t1_status_id === STATUS_ENVIADO && (
            <AdminReviewModule
              actionId={action.action_id}
              quarter={1}
              evidences={getEvidencesForQuarter(1)}
              onActionReviewed={onActionReviewed}
            />
          )}
          {action.t2_status_id === STATUS_ENVIADO && (
            <AdminReviewModule
              actionId={action.action_id}
              quarter={2}
              evidences={getEvidencesForQuarter(2)}
              onActionReviewed={onActionReviewed}
            />
          )}
          {action.t3_status_id === STATUS_ENVIADO && (
            <AdminReviewModule
              actionId={action.action_id}
              quarter={3}
              evidences={getEvidencesForQuarter(3)}
              onActionReviewed={onActionReviewed}
            />
          )}
          {action.t4_status_id === STATUS_ENVIADO && (
            <AdminReviewModule
              actionId={action.action_id}
              quarter={4}
              evidences={getEvidencesForQuarter(4)}
              onActionReviewed={onActionReviewed}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminActionCard;
