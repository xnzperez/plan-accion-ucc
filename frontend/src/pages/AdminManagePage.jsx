/*
 * Archivo: frontend/src/pages/AdminManagePage.jsx
 * (Versión Final - Con Eliminar Metas)
 */
import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import apiClient from '../services/api';
import Header from '../components/Header';
import GoalForm from '../components/GoalForm';
import AdminActionViewer from '../components/AdminActionViewer';

const styles = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    gap: '15px',
  },
  filterContainer: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  label: { fontWeight: '500', fontSize: '1rem' },
  select: {
    padding: '8px 12px',
    border: '1px solid #D1D5DB',
    borderRadius: '5px',
    fontSize: '1rem',
    minWidth: '250px',
  },
  buttonGroup: { display: 'flex', gap: '10px' },
  createButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#057CD1',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  createProcessButton: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#6B7280',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  downloadBtn: {
    padding: '10px 15px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#16a34a',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
  },

  // Botón de basura
  deleteGoalBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1.2rem',
    marginLeft: '10px',
    color: '#EF4444',
  },
};

function AdminManagePage() {
  const [processesList, setProcessesList] = useState([]);
  const [selectedProcessId, setSelectedProcessId] = useState('');
  const [goalsList, setGoalsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProcesses = async () => {
    try {
      const response = await apiClient.get('/processes');
      setProcessesList(response.data);
      if (response.data.length > 0 && !selectedProcessId) setSelectedProcessId(response.data[0].id);
    } catch (error) {
      console.error('Error al cargar procesos:', error);
    }
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  const fetchGoals = async () => {
    if (!selectedProcessId) {
      setGoalsList([]);
      return;
    }
    setIsLoading(true);
    try {
      const response = await apiClient.get(`/goals/by-process?processId=${selectedProcessId}`);
      setGoalsList(response.data);
    } catch (error) {
      console.error('Error al cargar metas:', error);
      setGoalsList([]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchGoals();
  }, [selectedProcessId]);

  const handleProcessChange = (e) => setSelectedProcessId(e.target.value);

  const handleCreateProcess = async () => {
    const { value: name } = await Swal.fire({
      title: 'Nuevo Proceso',
      input: 'text',
      inputLabel: 'Nombre del área',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      confirmButtonColor: '#057CD1',
    });
    if (name) {
      try {
        const response = await apiClient.post('/processes', { name });
        toast.success(`Proceso "${response.data.name}" creado.`);
        setProcessesList((prev) => [...prev, response.data]);
        setSelectedProcessId(response.data.id);
      } catch (error) {
        toast.error('Error al crear proceso.', error);
      }
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedProcessId) return toast('Selecciona un proceso.');
    const loadingToast = toast.loading('Generando Excel...');
    try {
      const response = await apiClient.get(`/reports/excel?processId=${selectedProcessId}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Proceso_${selectedProcessId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Reporte descargado.', { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error('Error al descargar.', { id: loadingToast });
    }
  };

  // --- NUEVO: Eliminar Meta ---
  const handleDeleteGoal = async (goalId) => {
    const result = await Swal.fire({
      title: '¿Eliminar Meta?',
      text: 'Se borrarán todas las acciones y evidencias asociadas. No se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/goals/${goalId}`);
        Swal.fire('Eliminado', 'La meta ha sido eliminada.', 'success');
        fetchGoals(); // Recargar
      } catch (error) {
        toast.error('Error al eliminar la meta.', error);
      }
    }
  };

  // --- NUEVO: Eliminar Acción (Pasa al hijo) ---
  const handleDeleteAction = async (actionId) => {
    const result = await Swal.fire({
      title: '¿Eliminar Acción?',
      text: 'Se borrarán las evidencias y el historial de esta acción.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/actions/${actionId}`);
        toast.success('Acción eliminada.');
        fetchGoals(); // Recargar todo
      } catch (error) {
        toast.error('Error al eliminar la acción.', error);
      }
    }
  };

  return (
    <div className="admin-manage-page">
      <Header title="Gestión de Planes de Acción" />
      <div style={styles.pageHeader}>
        <div style={styles.filterContainer}>
          <label htmlFor="process-select" style={styles.label}>
            Seleccionar Proceso:
          </label>
          <select
            id="process-select"
            style={styles.select}
            value={selectedProcessId}
            onChange={handleProcessChange}
          >
            <option value="">-- Seleccione un Proceso --</option>
            {processesList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.buttonGroup}>
          <button style={styles.downloadBtn} onClick={handleDownloadReport}>
            📥 Excel
          </button>
          <button style={styles.createProcessButton} onClick={handleCreateProcess}>
            + Proceso
          </button>
          <button style={styles.createButton} onClick={() => setIsModalOpen(true)}>
            + Meta
          </button>
        </div>
      </div>

      {isModalOpen && (
        <GoalForm
          processes={processesList}
          onClose={() => setIsModalOpen(false)}
          onGoalCreated={fetchGoals}
        />
      )}

      <div className="results-container" style={{ marginTop: '20px' }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: '#6B7280' }}>Cargando...</p>
        ) : (
          <div>
            {goalsList.length > 0
              ? goalsList.map((goal) => (
                  <div
                    key={goal.id}
                    className="card"
                    style={{
                      backgroundColor: '#fff',
                      padding: '20px',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                    }}
                  >
                    <div
                      style={{
                        borderBottom: '1px solid #eee',
                        paddingBottom: '15px',
                        marginBottom: '15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      <div>
                        <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: '#111827' }}>
                          {goal.goal_description}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            gap: '15px',
                            fontSize: '0.9rem',
                            color: '#6B7280',
                          }}
                        >
                          <span>
                            <strong>Eje:</strong> {goal.eje}
                          </span>
                          <span>
                            <strong>Indicador:</strong> {goal.indicator}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        style={styles.deleteGoalBtn}
                        title="Eliminar Meta"
                      >
                        🗑️
                      </button>
                    </div>
                    <div>
                      {goal.actions && goal.actions.length > 0 ? (
                        goal.actions.map((action) => (
                          <AdminActionViewer
                            key={action.id}
                            action={action}
                            onDelete={() => handleDeleteAction(action.id)}
                          />
                        ))
                      ) : (
                        <p style={{ fontStyle: 'italic', color: '#9CA3AF', fontSize: '0.9rem' }}>
                          No hay acciones registradas.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              : selectedProcessId && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '40px',
                      backgroundColor: '#fff',
                      borderRadius: '8px',
                    }}
                  >
                    <p style={{ color: '#6B7280' }}>No se encontraron metas.</p>
                  </div>
                )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminManagePage;
