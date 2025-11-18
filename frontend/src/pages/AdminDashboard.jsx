/*
 * Archivo: frontend/src/pages/AdminDashboard.jsx
 * (Refactorizado - Página de "Revisión Pendiente")
 */
import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import Header from '../components/Header';
import AdminActionCard from '../components/AdminActionCard'; // <-- NUEVO

const styles = {
  actionList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  noActions: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6b7280',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
};

function AdminDashboard() {
  const [pendingActions, setPendingActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPendingActions = async () => {
    setIsLoading(true);
    try {
      // Esta ruta del backend ya está refactorizada
      const response = await apiClient.get('/actions/pending');
      setPendingActions(response.data);
    } catch (error) {
      console.error('Error al obtener acciones pendientes:', error);
      setPendingActions([]); // Limpiar en caso de error
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPendingActions();
  }, []);

  // Esta función será llamada por el hijo (AdminActionCard) cuando
  // una acción sea aprobada/rechazada, para que desaparezca de la lista.
  const handleActionReviewed = () => {
    fetchPendingActions();
  };

  if (isLoading) {
    return <Header title="Acciones Pendientes de Revisión" />;
  }

  return (
    <div className="admin-dashboard">
      <Header title="Acciones Pendientes de Revisión" />
      <main>
        <div style={styles.actionList}>
          {pendingActions.length > 0 ? (
            pendingActions.map((action) => (
              <AdminActionCard
                key={action.action_id}
                action={action}
                onActionReviewed={handleActionReviewed}
              />
            ))
          ) : (
            <div style={styles.noActions}>
              <p>No hay acciones pendientes de revisión. ¡Buen trabajo!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
