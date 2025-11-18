/*
 * Archivo: frontend/src/components/Sidebar.jsx
 * (Versión Final - Limpia, sin botón de logout)
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../Layout.css'; // Asegúrate de que este archivo exista (lo creamos antes)

const styles = {
  navTop: { padding: '20px' },
  navBottom: { padding: '20px', borderTop: '1px solid #374151' },
  logo: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '30px', textAlign: 'center' },
  nav: { display: 'flex', flexDirection: 'column', gap: '10px' },
  navLink: {
    color: '#D1D5DB',
    textDecoration: 'none',
    padding: '12px 15px',
    borderRadius: '5px',
    transition: '0.2s',
    display: 'block',
  },
  activeStyle: { backgroundColor: '#057CD1', color: 'white' },
  versionText: { fontSize: '0.75rem', color: '#6B7280', textAlign: 'center' },
};

function Sidebar({ links, isOpen, onClose }) {
  return (
    <>
      <div className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} onClick={onClose}></div>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={styles.navTop}>
          <div style={styles.logo}>UCC Plan</div>
          <nav style={styles.nav}>
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                style={({ isActive }) =>
                  isActive ? { ...styles.navLink, ...styles.activeStyle } : styles.navLink
                }
                onClick={onClose}
              >
                {link.text}
              </NavLink>
            ))}
          </nav>
        </div>

        <div style={styles.navBottom}>
          <div style={styles.versionText}>
            Sistema de Gestión
            <br />
            Versión 1.0
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
