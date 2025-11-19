/*
 * Archivo: frontend/src/components/FilePreview.jsx
 * (Muestra imágenes/PDFs o un botón de descarga genérico)
 */
import React, { useState } from 'react';

const styles = {
  container: {
    marginTop: '5px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    overflow: 'hidden',
    maxWidth: '100%',
  },
  previewBtn: {
    fontSize: '0.85rem',
    color: '#057CD1',
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
    marginBottom: '5px',
    display: 'inline-block',
  },
  mediaContainer: {
    backgroundColor: '#F9FAFB',
    padding: '10px',
    textAlign: 'center',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  pdfFrame: {
    width: '100%',
    height: '400px',
    border: 'none',
  },
  downloadLink: {
    display: 'inline-block',
    marginTop: '5px',
    fontSize: '0.8rem',
    color: '#6B7280',
    textDecoration: 'none',
  },
};

function FilePreview({ url, fileName }) {
  const [showPreview, setShowPreview] = useState(false);
  
  const extension = fileName?.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
  const isPdf = extension === 'pdf';
  
  // --- CORRECCIÓN: Usar el dominio de la aplicación desplegada ---
  // window.location.origin será "https://tu-app.run-on-seenode.com"
  const fullUrl = `${window.location.origin}/${url}`; 
  // ----------------------------------------------------------------

  if (!isImage && !isPdf) {
    // Si es Word, Excel, etc., solo mostramos el link de descarga
    return (
      <div style={{ marginBottom: '5px' }}>
        <a href={fullUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#057CD1', fontWeight: '500' }}>
          📄 {fileName}
        </a>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '10px' }}>
      {/* Botón para alternar vista */}
      <button onClick={() => setShowPreview(!showPreview)} style={styles.previewBtn}>
        {showPreview ? `Ocultar ${fileName}` : `👁️ Ver ${fileName}`}
      </button>

      {/* Área de visualización */}
      {showPreview && (
        <div style={styles.container}>
          <div style={styles.mediaContainer}>
            {isImage && <img src={fullUrl} alt="Evidencia" style={styles.img} />}
            {isPdf && <iframe src={fullUrl} style={styles.pdfFrame} title="PDF Preview" />}

            {/* Botón extra para abrir en nueva pestaña */}
            <div style={{ marginTop: '8px' }}>
              <a
                href={fullUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.downloadLink}
              >
                [Abrir original en nueva pestaña]
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilePreview;
