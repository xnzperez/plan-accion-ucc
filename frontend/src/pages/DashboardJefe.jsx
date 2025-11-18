/*
 * Archivo: frontend/src/pages/DashboardJefe.jsx
 * (Versión Final - Validaciones de Fechas en Edición)
 */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../services/api';
import Header from '../components/Header';
import ActionForm from '../components/ActionForm';
import ActionItem from '../components/ActionItem';
import ActionDetail from '../components/ActionDetail';

const styles = {
  goalCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: '2rem',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  goalHeader: { borderBottom: '1px solid #EEE', paddingBottom: '15px', marginBottom: '15px' },
  actionTitle: { fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' },
  actionList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  noActions: { padding: '1rem', textAlign: 'center', color: '#6b7280' },
  addButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.5rem',
    backgroundColor: '#057CD1',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  dateRow: { display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.9rem' },
  dateItem: { display: 'flex', alignItems: 'center', gap: '5px' },
  dateLabel: { fontWeight: '600', color: '#374151' },
  dateValue: { borderBottom: '1px dashed #057CD1', color: '#057CD1', cursor: 'pointer' },
  dateInput: { padding: '5px', border: '1px solid #057CD1', borderRadius: '4px' },
};

function DashboardJefe() {
  const [goals, setGoals] = useState([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState(null);
  const [openActionId, setOpenActionId] = useState(null);

  const [editingGoalDate, setEditingGoalDate] = useState(null);
  const [dateType, setDateType] = useState(null);
  const [tempDate, setTempDate] = useState('');

  // --- HELPER PARA CALCULAR FECHAS ---
  const getToday = () => new Date().toISOString().split('T')[0];

  const getMaxEndDate = (startDateStr) => {
    if (!startDateStr) return '';
    const d = new Date(startDateStr);
    d.setMonth(d.getMonth() + 3); // +3 Meses
    return d.toISOString().split('T')[0];
  };
  // -----------------------------------

  const fetchGoals = async () => {
    try {
      const response = await apiClient.get('/goals');
      const goalsWithActions = await Promise.all(
        response.data.map(async (goal) => {
          const actionsRes = await apiClient.get(`/goals/${goal.id}/actions`);
          return { ...goal, actions: actionsRes.data || [] };
        })
      );
      setGoals(goalsWithActions);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      toast.error('Error al cargar el plan de acción.');
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleActionUpdate = () => {
    fetchGoals();
  };

  // --- VALIDACIÓN AL INICIAR EDICIÓN ---
  const startEditingDate = (goalId, currentVal, type, currentStartDate) => {
    if (type === 'end' && !currentStartDate) {
      return toast.error('Debes definir primero la Fecha de Inicio.');
    }
    setEditingGoalDate(goalId);
    setDateType(type);
    setTempDate(currentVal ? currentVal.substring(0, 10) : '');
  };

  const saveDate = async (goalId, currentStartDate) => {
    if (!tempDate) {
      setEditingGoalDate(null);
      return;
    }

    // --- VALIDACIÓN AL GUARDAR ---
    if (dateType === 'start') {
      if (tempDate < getToday()) {
        toast.error('La fecha de inicio no puede ser pasada.');
        // No bloqueamos, pero avisamos (o podrías hacer return para bloquear)
      }
    }

    if (dateType === 'end') {
      if (tempDate < currentStartDate) {
        setEditingGoalDate(null);
        return toast.error('La fecha de cierre no puede ser antes que la de inicio.');
      }
      const maxDate = getMaxEndDate(currentStartDate);
      if (tempDate > maxDate) {
        setEditingGoalDate(null);
        return toast.error('La fecha excede el límite de 1 trimestre (3 meses).');
      }
    }
    // -----------------------------

    try {
      const payload = {};
      if (dateType === 'start') payload.start_date = tempDate;
      else payload.end_date = tempDate;

      await apiClient.put(`/goals/${goalId}`, payload);

      setGoals((prev) =>
        prev.map((g) => {
          if (g.id === goalId) {
            return { ...g, [dateType === 'start' ? 'start_date' : 'end_date']: tempDate };
          }
          return g;
        })
      );

      toast.success('Fecha actualizada');
      setEditingGoalDate(null);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar fecha.');
    }
  };

  const handleOpenForm = (goalId) => {
    setSelectedGoalId(goalId);
    setIsFormVisible(true);
  };

  const handleToggleAction = (actionId) => {
    setOpenActionId((prevId) => (prevId === actionId ? null : actionId));
  };

  const handleActionSubmit = async (formData) => {
    if (!formData.description || !selectedGoalId) return toast.error('Datos incompletos.');

    try {
      await apiClient.post(`/goals/${selectedGoalId}/actions`, {
        description: formData.description,
        responsible_charge: formData.responsible_charge,
      });
      handleActionUpdate();
      setIsFormVisible(false);
      setSelectedGoalId(null);
      toast.success('Acción creada.');
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la acción.');
    }
  };

  return (
    <div className="dashboard-jefe">
      <Header title="Mi Plan de Acción" />
      <main>
        <section>
          {goals.map((goal) => {
            // Cálculos para validación en renderizado
            const minStart = getToday();
            const minEnd = goal.start_date ? goal.start_date.substring(0, 10) : '';
            const maxEnd = goal.start_date ? getMaxEndDate(goal.start_date) : '';

            return (
              <div key={goal.id} className="card" style={styles.goalCard}>
                <div style={styles.goalHeader}>
                  <p>
                    <strong>Meta:</strong> {goal.goal_description}
                  </p>
                  {goal.indicator && (
                    <p>
                      <strong>Indicador:</strong> {goal.indicator}
                    </p>
                  )}

                  <div style={styles.dateRow}>
                    {/* Fecha Inicio */}
                    <div style={styles.dateItem}>
                      <span style={styles.dateLabel}>Inicio:</span>
                      {editingGoalDate === goal.id && dateType === 'start' ? (
                        <input
                          type="date"
                          style={styles.dateInput}
                          value={tempDate}
                          min={minStart} // Bloqueo HTML
                          onChange={(e) => setTempDate(e.target.value)}
                          onBlur={() => saveDate(goal.id)}
                          autoFocus
                        />
                      ) : (
                        <span
                          style={styles.dateValue}
                          onClick={() => startEditingDate(goal.id, goal.start_date, 'start')}
                        >
                          {goal.start_date ? goal.start_date.substring(0, 10) : 'Definir'}
                        </span>
                      )}
                    </div>

                    {/* Fecha Cierre */}
                    <div style={styles.dateItem}>
                      <span style={styles.dateLabel}>Cierre:</span>
                      {editingGoalDate === goal.id && dateType === 'end' ? (
                        <input
                          type="date"
                          style={styles.dateInput}
                          value={tempDate}
                          min={minEnd} // Bloqueo HTML
                          max={maxEnd} // Bloqueo HTML (Trimestral)
                          onChange={(e) => setTempDate(e.target.value)}
                          onBlur={() => saveDate(goal.id, goal.start_date)} // Pasamos start_date para validar
                          autoFocus
                        />
                      ) : (
                        <span
                          style={{
                            ...styles.dateValue,
                            opacity: !goal.start_date ? 0.5 : 1,
                            cursor: !goal.start_date ? 'not-allowed' : 'pointer',
                          }}
                          onClick={() =>
                            startEditingDate(goal.id, goal.end_date, 'end', goal.start_date)
                          }
                          title={!goal.start_date ? 'Define primero la fecha de inicio' : ''}
                        >
                          {goal.end_date ? goal.end_date.substring(0, 10) : 'Definir'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <h3 style={styles.actionTitle}>Acciones Propuestas</h3>
                <div style={styles.actionList}>
                  {goal.actions && goal.actions.length > 0 ? (
                    goal.actions.map((action) => (
                      <div key={action.id} style={{ borderBottom: '1px solid #EEE' }}>
                        <ActionItem
                          action={action}
                          onClick={() => handleToggleAction(action.id)}
                          isOpen={openActionId === action.id}
                        />
                        {openActionId === action.id && (
                          <ActionDetail action={action} onActionUpdate={handleActionUpdate} />
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={styles.noActions}>No hay acciones propuestas para esta meta.</p>
                  )}
                </div>

                <button onClick={() => handleOpenForm(goal.id)} style={styles.addButton}>
                  + Añadir Nueva Acción
                </button>
              </div>
            );
          })}
        </section>
      </main>

      {isFormVisible && (
        <ActionForm onClose={() => setIsFormVisible(false)} onActionSubmit={handleActionSubmit} />
      )}
    </div>
  );
}

export default DashboardJefe;
