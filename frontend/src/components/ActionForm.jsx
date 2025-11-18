import React, { useState } from 'react';

// Recibe las funciones 'onClose' y 'onActionSubmit'
function ActionForm({ onClose, onActionSubmit }) {
  // Estado para la descripción
  const [description, setDescription] = useState('');
  // Nuevo estado para el responsable
  const [responsible, setResponsible] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); // Evita que la página se recargue
    // Llama a la función del padre pasándole un objeto con todos los datos
    onActionSubmit({ description, responsible_charge: responsible });
  };

  return (
    // Fondo oscuro (overlay)
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      {/* Contenedor del formulario (modal) */}
      <div className="card" style={{ width: '500px' }}>
        <h2 className="section-title">Proponer Nueva Acción</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Campo de Descripción */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Descripción de la Acción
            </label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', border: '1px solid #ccc', borderRadius: '0.5rem', padding: '0.5rem', boxSizing: 'border-box' }}
              required
            />
          </div>

          {/* Nuevo Campo: Cargo Responsable */}
          <div style={{ marginBottom: '1rem' }}>
            <label htmlFor="responsible" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Cargo Responsable
            </label>
            <input
              type="text"
              id="responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              style={{ width: '100%', border: '1px solid #ccc', borderRadius: '0.5rem', padding: '0.5rem', boxSizing: 'border-box' }}
              placeholder="Ej: Decano de Fac."
            />
          </div>

          {/* Botones de Acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ padding: '0.5rem 1rem', border: '1px solid #ccc', borderRadius: '0.5rem', backgroundColor: '#e5e7eb', cursor: 'pointer' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              style={{ padding: '0.5rem 1rem', border: 'none', borderRadius: '0.5rem', backgroundColor: '#057CD1', color: 'white', cursor: 'pointer' }}
            >
              Guardar Acción
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ActionForm;