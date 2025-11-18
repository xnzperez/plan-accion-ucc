import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';

function GoalCard({ goal, onAddActionClick, justUpdated }) {
  const [actions, setActions] = useState([]);
  const [showActions, setShowActions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/goals/${goal.id}/actions`);
      setActions(response.data);
    } catch (error) {
      console.error(`Error al obtener las acciones para la meta ${goal.id}:`, error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (justUpdated) {
      fetchActions();
      if (!showActions) setShowActions(true);
    }
  }, [justUpdated]);

  const handleToggleActions = () => {
    const newShowState = !showActions;
    setShowActions(newShowState);
    if (newShowState && actions.length === 0) {
      fetchActions();
    }
  };

  // --- NUEVA FUNCIÓN ---
  // Se ejecuta al hacer clic en el botón "Enviar para Aprobación"
  const handleSendForApproval = async (actionId) => {
    try {
      // Llamamos al endpoint PUT que probamos en Thunder Client
      // Le decimos que queremos cambiar el estado a "Enviado" (status_id = 2)
      await apiClient.put(`/goals/${goal.id}/actions/${actionId}`, {
        status_id: 2,
      });

      // Después de actualizar, volvemos a pedir los datos para refrescar la lista
      fetchActions();
    } catch (error) {
      console.error('Error al actualizar el estado de la acción:', error);
      alert('Hubo un error al enviar la acción.');
    }
  };

  return (
    <div className="card">
      {/* ... (La parte de arriba del card no cambia) ... */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontWeight: '600', color: '#6b7280', fontSize: '0.875rem' }}>{goal.eje}</p>
          <p
            style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              color: '#1f2937',
              marginTop: '0.25rem',
            }}
          >
            {goal.goal_description}
          </p>
        </div>
        <button
          onClick={() => onAddActionClick(goal.id)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.25rem',
            border: 'none',
            cursor: 'pointer',
            marginLeft: '1rem',
            whiteSpace: 'nowrap',
          }}
        >
          + Añadir Acción
        </button>
      </div>
      <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.5rem' }}>
        <strong>Indicador:</strong> {goal.indicator}
      </p>
      <button
        onClick={handleToggleActions}
        style={{
          marginTop: '1rem',
          padding: '0.25rem 0.5rem',
          fontSize: '0.8rem',
          cursor: 'pointer',
          border: '1px solid #ccc',
          borderRadius: '0.25rem',
        }}
      >
        {showActions ? 'Ocultar Acciones' : 'Ver Acciones'}
      </button>

      {showActions && (
        <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
          <h4 style={{ marginTop: 0, fontWeight: 'bold' }}>Acciones Propuestas:</h4>
          {isLoading ? (
            <p>Cargando...</p>
          ) : actions.length > 0 ? (
            <ul style={{ paddingLeft: '20px', margin: 0, listStyle: 'none' }}>
              {actions.map((action) => (
                // --- MODIFICACIÓN EN LA LISTA DE ACCIONES ---
                <li
                  key={action.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span>
                    {action.description} - <strong>({action.status})</strong>
                  </span>

                  {/* El botón solo aparece si la acción está en estado 'Borrador' */}
                  {action.status === 'Borrador' && (
                    <button
                      onClick={() => handleSendForApproval(action.id)}
                      style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.4rem',
                        cursor: 'pointer',
                        marginLeft: '1rem',
                      }}
                    >
                      Enviar para Aprobación
                    </button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay acciones propuestas para esta meta.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default GoalCard;
