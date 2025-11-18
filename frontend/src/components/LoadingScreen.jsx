import React from 'react';

const LoadingScreen = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
        color: '#057CD1',
        fontWeight: 'bold',
        backgroundColor: '#F3F4F6',
        fontSize: '1.2rem',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #E5E7EB',
            borderTop: '4px solid #057CD1',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        ></div>
        <span>Cargando...</span>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoadingScreen;
