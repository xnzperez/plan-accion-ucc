/*
 * Archivo: frontend/src/components/LayoutJefe.jsx
 * (Con efecto de opacidad en scroll)
 */
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../Layout.css';

const jefeLinks = [
  { text: 'Mi Plan de Acción', to: '/dashboard' },
];

function LayoutJefe() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // <-- Nuevo Estado

  // --- Detectar Scroll ---
  useEffect(() => {
    const handleScroll = () => {
      // Si baja más de 50px, activamos el efecto
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Limpieza al desmontar
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="layout-container">
      {/* Botón Hamburguesa con clase condicional */}
      <button 
        className={`mobile-menu-btn ${isScrolled ? 'scrolled' : ''}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <Sidebar 
        links={jefeLinks} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutJefe;