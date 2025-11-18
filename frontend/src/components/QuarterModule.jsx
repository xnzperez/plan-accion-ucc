/*
 * Archivo: frontend/src/components/QuarterModule.jsx
 * (Versión Final - Con Validación de Evidencia Obligatoria)
 */
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import apiClient from '../services/api';
import FilePreview from './FilePreview';

// Constantes y estilos (Mismo código anterior)
const STATUS_BORRADOR = 1;
const STATUS_ENVIADO = 2;
const STATUS_APROBADO = 3;
const STATUS_RECHAZADO = 4;
const STATUS_BLOQUEADO = 5;

const getStatusDetails = (statusId) => {
  switch (statusId) {
    case STATUS_BORRADOR:
      return { text: 'Borrador', color: '#6B7280' };
    case STATUS_ENVIADO:
      return { text: 'Enviado (Pendiente Aprob.)', color: '#EAB308' };
    case STATUS_APROBADO:
      return { text: 'Aprobado', color: '#28a745' };
    case STATUS_RECHAZADO:
      return { text: 'Rechazado', color: '#dc3545' };
    case STATUS_BLOQUEADO:
      return { text: 'Bloqueado', color: '#374151' };
    default:
      return { text: 'N/A', color: '#6B7280' };
  }
};

const styles = {
  module: {
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    marginBottom: '15px',
    backgroundColor: '#FFFFFF',
    opacity: 1,
    transition: 'opacity 0.3s',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
  },
  title: { fontSize: '1.1rem', fontWeight: '600', color: '#111827' },
  statusTag: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: 'white',
  },
  body: { padding: '15px', display: 'flex', flexDirection: 'column', gap: '15px' },
  section: { marginBottom: '10px' },
  sectionTitle: { fontWeight: '500', color: '#374151', marginBottom: '5px', fontSize: '0.9rem' },
  fileInput: { fontSize: '0.9rem' },
  evidenceList: { listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem' },
  evidenceItem: { marginBottom: '5px' },
  sendButton: {
    padding: '8px 15px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#057CD1',
    color: 'white',
    fontWeight: 'bold',
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  rejectionNote: { color: '#dc3545', fontStyle: 'italic', fontSize: '0.9rem' },
};

function QuarterModule({
  actionId,
  quarterNumber,
  statusId,
  evidences,
  rejectionReason,
  onActionUpdate,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const isLocked =
    statusId === STATUS_ENVIADO || statusId === STATUS_APROBADO || statusId === STATUS_BLOQUEADO;
  const canSend = statusId === STATUS_BORRADOR || statusId === STATUS_RECHAZADO;
  const status = getStatusDetails(statusId);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]);
  };

  const handleUploadEvidence = async () => {
    if (!selectedFile) return toast.error('Selecciona un archivo primero.');

    const loadingToast = toast.loading('Subiendo archivo...');
    const formData = new FormData();
    formData.append('evidenceFile', selectedFile);
    formData.append('description', selectedFile.name);
    formData.append('quarter', quarterNumber);
    formData.append('action_id', actionId);

    try {
      await apiClient.post('/evidences', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Evidencia subida', { id: loadingToast });
      setSelectedFile(null);
      onActionUpdate();
    } catch (error) {
      console.error(error);
      toast.error('Error al subir evidencia', { id: loadingToast });
    }
  };

  const handleSendQuarter = async () => {
    // --- NUEVA VALIDACIÓN: Evidencia Obligatoria ---
    if (evidences.length === 0) {
      return Swal.fire({
        title: 'Falta Evidencia',
        text: 'Es obligatorio subir al menos un archivo de evidencia para enviar el trimestre a revisión.',
        icon: 'warning',
        confirmButtonColor: '#057CD1',
        confirmButtonText: 'Entendido',
      });
    }
    // -----------------------------------------------

    const result = await Swal.fire({
      title: `¿Enviar Trimestre ${quarterNumber}?`,
      text: 'Una vez enviado, no podrás editarlo hasta que sea revisado.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#057CD1',
      confirmButtonText: 'Sí, enviar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await apiClient.post(`/actions/${actionId}/send`, { quarter: quarterNumber });

        Swal.fire({
          title: '¡Enviado!',
          text: `El Trimestre ${quarterNumber} ha sido enviado a revisión.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });

        onActionUpdate();
      } catch (error) {
        toast.error('Error al enviar el trimestre.', error);
      }
    }
  };

  return (
    <div style={{ ...styles.module, opacity: statusId === STATUS_BLOQUEADO ? 0.6 : 1 }}>
      <header style={styles.header}>
        <span style={styles.title}>Trimestre {quarterNumber}</span>
        <span style={{ ...styles.statusTag, backgroundColor: status.color }}>{status.text}</span>
      </header>

      {statusId !== STATUS_BLOQUEADO && (
        <div style={styles.body}>
          {statusId === STATUS_RECHAZADO && rejectionReason && (
            <div style={styles.rejectionNote}>
              <strong>Motivo de Rechazo:</strong> {rejectionReason}
            </div>
          )}

          <div style={styles.section}>
            <label style={styles.sectionTitle}>Evidencias (T{quarterNumber})</label>
            <ul style={styles.evidenceList}>
              {evidences.length === 0 ? (
                <li style={styles.evidenceItem}>Sin evidencias adjuntas.</li>
              ) : (
                evidences.map((ev) => (
                  <li key={ev.id} style={styles.evidenceItem}>
                    <FilePreview url={ev.file_url} fileName={ev.description || 'Archivo'} />
                  </li>
                ))
              )}
            </ul>
          </div>

          {!isLocked && (
            <div style={styles.section}>
              <label style={styles.sectionTitle}>Adjuntar Nueva Evidencia</label>
              <input type="file" onChange={handleFileChange} style={styles.fileInput} />
              {selectedFile && (
                <button
                  onClick={handleUploadEvidence}
                  style={{ ...styles.sendButton, marginTop: '10px', backgroundColor: '#16a34a' }}
                >
                  Subir "{selectedFile.name}"
                </button>
              )}
            </div>
          )}

          {canSend && (
            <button onClick={handleSendQuarter} style={styles.sendButton}>
              Enviar Trimestre {quarterNumber} a Revisión
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default QuarterModule;
