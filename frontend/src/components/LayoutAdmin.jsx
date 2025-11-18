/*
 * Archivo: frontend/src/components/LayoutAdmin.jsx
 * (Actualizado con opacidad en scroll)
 */
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import '../Layout.css';

const adminLinks = [
  { text: 'Inicio (KPIs)', to: '/admin' },
  { text: 'Revisión Pendiente', to: '/admin/pending' },
  { text: 'Gestión de Planes', to: '/admin/manage' },
  { text: 'Gestión de Usuarios', to: '/admin/users' },
];

function LayoutAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false); // <-- Nuevo

  // --- Detectar Scroll ---
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) setIsScrolled(true);
      else setIsScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="layout-container">
      <button
        className={`mobile-menu-btn ${isScrolled ? 'scrolled' : ''}`}
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        ☰
      </button>

      <Sidebar links={adminLinks} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default LayoutAdmin;
