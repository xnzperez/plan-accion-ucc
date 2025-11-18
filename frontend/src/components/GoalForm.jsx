/*
 * Archivo: frontend/src/components/GoalForm.jsx
 * (Versión Final - Con Validaciones Estrictas de Fechas)
 */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import apiClient from '../services/api';

const styles = {
  modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '600px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', gap: '15px' },
  header: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '10px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontWeight: '500', color: '#374151', fontSize: '0.9rem' },
  input: { padding: '10px 12px', border: '1px solid #D1D5DB', borderRadius: '5px', fontSize: '1rem' },
  buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' },
  button: { padding: '10px 15px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' },
  submitButton: { backgroundColor: '#057CD1', color: 'white' },
  cancelButton: { backgroundColor: '#E5E7EB', color: '#374151' }
};

function GoalForm({ processes = [], onClose, onGoalCreated }) {
  const [formData, setFormData] = useState({
    eje: '', sub_eje: '', goal_description: '', indicator: '',
    process_id: processes[0]?.id || '', start_date: '', end_date: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados calculados para fechas
  const [minStartDate, setMinStartDate] = useState('');
  const [maxEndDate, setMaxEndDate] = useState('');

  // Al montar, definimos que la fecha mínima es HOY
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMinStartDate(today);
  }, []);

  // Cada vez que cambia la fecha de inicio, calculamos el límite de la fecha de cierre
  useEffect(() => {
    if (formData.start_date) {
      const startDate = new Date(formData.start_date);
      // Sumar 3 meses exactos
      startDate.setMonth(startDate.getMonth() + 3);
      const maxDate = startDate.toISOString().split('T')[0];
      setMaxEndDate(maxDate);
      
      // Si la fecha de cierre actual se pasa del nuevo máximo, la limpiamos
      if (formData.end_date && formData.end_date > maxDate) {
         setFormData(prev => ({ ...prev, end_date: '' }));
         toast('La fecha de cierre se ajustó por el límite trimestral.', { icon: '📅' });
      }
    } else {
      setMaxEndDate('');
    }
  }, [formData.start_date]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.goal_description || !formData.process_id) {
      return toast.error('Descripción y Proceso son obligatorios.');
    }

    // Validación final de fechas
    if (formData.start_date && formData.end_date) {
      if (formData.start_date > formData.end_date) {
        return toast.error('La fecha de inicio no puede ser mayor a la de cierre.');
      }
    }
    
    setIsSubmitting(true);
    const loadingToast = toast.loading('Creando meta...');

    try {
      await apiClient.post('/goals', {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
      });
      toast.success('¡Meta creada exitosamente!', { id: loadingToast });
      onGoalCreated(); 
      onClose(); 
    } catch (err) {
      console.error('Error al crear la meta:', err);
      toast.error(err.response?.data?.error || 'Error desconocido.', { id: loadingToast });
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.modalBackdrop} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3 style={styles.header}>Crear Nueva Meta</h3>
        <form onSubmit={handleSubmit}>
          <div style={{...styles.field, display: 'flex', flexDirection: 'row', gap: '15px'}}>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Eje</label>
              <input type="text" name="eje" value={formData.eje} onChange={handleChange} style={styles.input} />
            </div>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Sub-Eje</label>
              <input type="text" name="sub_eje" value={formData.sub_eje} onChange={handleChange} style={styles.input} />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Descripción de la Meta (Obligatorio)</label>
            <textarea name="goal_description" value={formData.goal_description} onChange={handleChange} style={{...styles.input, minHeight: '80px'}} />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Indicador</label>
            <textarea name="indicator" value={formData.indicator} onChange={handleChange} style={{...styles.input, minHeight: '60px'}} />
          </div>
          <div style={{...styles.field, display: 'flex', flexDirection: 'row', gap: '15px', alignItems: 'flex-end'}}>
            <div style={{...styles.field, flex: 2}}>
              <label style={styles.label}>Asignar a Proceso (Obligatorio)</label>
              <select name="process_id" value={formData.process_id} onChange={handleChange} style={styles.input}>
                {processes.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            
            {/* --- FECHAS CON VALIDACIÓN --- */}
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Fecha Inicio</label>
              <input 
                type="date" 
                name="start_date" 
                value={formData.start_date} 
                onChange={handleChange} 
                style={styles.input} 
                min={minStartDate} // No pasado
              />
            </div>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Fecha Cierre</label>
              <input 
                type="date" 
                name="end_date" 
                value={formData.end_date} 
                onChange={handleChange} 
                style={{...styles.input, backgroundColor: !formData.start_date ? '#F3F4F6' : 'white'}} 
                min={formData.start_date} // Mayor a inicio
                max={maxEndDate}          // Máximo 3 meses
                disabled={!formData.start_date} // Bloqueado si no hay inicio
                title={!formData.start_date ? "Selecciona primero la fecha de inicio" : ""}
              />
            </div>
            {/* ----------------------------- */}

          </div>

          <div style={styles.buttonGroup}>
            <button type="button" onClick={onClose} style={{...styles.button, ...styles.cancelButton}} disabled={isSubmitting}>Cancelar</button>
            <button type="submit" style={{...styles.button, ...styles.submitButton}} disabled={isSubmitting}>
              {isSubmitting ? 'Creando...' : 'Crear Meta'}
            </button>
          </div>
        </form>
      </div>
      {formData.start_date && (
        <div style={{position:'fixed', bottom: '20px', left: '50%', transform:'translateX(-50%)', backgroundColor:'#333', color:'white', padding:'10px', borderRadius:'5px', fontSize:'0.8rem', zIndex:1001}}>
          Nota: El cierre debe ser máx. 3 meses después del inicio.
        </div>
      )}
    </div>
  );
}

export default GoalForm;