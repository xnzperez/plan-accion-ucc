/*
 * Archivo: frontend/src/components/Header.jsx
 * (Versión Corregida - Enlace dinámico al perfil)
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2';

const styles = {
  headerContainer: {
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  profileLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    cursor: 'pointer',
  },
  userName: {
    fontWeight: '600',
    color: '#374151',
    fontSize: '0.95rem',
    display: 'block',
  },
  avatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    backgroundColor: '#057CD1',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    userSelect: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  logoutBtn: {
    padding: '8px 15px',
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    border: '1px solid #FECACA',
    borderRadius: '6px',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  }
};

function Header({ title }) {
  const [userName, setUserName] = useState('');
  const [profilePath, setProfilePath] = useState('/dashboard/profile'); // Ruta por defecto
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserName(decoded.user.name || 'Usuario');
        
        // --- LÓGICA NUEVA: Definir la ruta según el rol ---
        if (decoded.user.role === 1) {
          setProfilePath('/admin/profile');
        } else {
          setProfilePath('/dashboard/profile');
        }
        // --------------------------------------------------
        
      } catch (e) {
        console.error("Error token header", e);
      }
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };


  const handleLogout = async () => {
    const result = await Swal.fire({
      title: '¿Cerrar Sesión?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, salir'
    });

    if (result.isConfirmed) {
      localStorage.removeItem('authToken');
      navigate('/login');
    }
  };

  return (
    <div style={styles.headerContainer}>
      <h1 style={styles.title}>{title}</h1>

      <div style={styles.rightSection}>
        
        {/* Usamos la ruta dinámica profilePath */}
        <Link to={profilePath} style={styles.profileLink} title="Ir a mi perfil">
          <span style={styles.userName}>{userName}</span>
          <div style={styles.avatar}>
            {getInitials(userName)}
          </div>
        </Link>

        <button 
          onClick={handleLogout} 
          style={styles.logoutBtn}
          onMouseOver={(e) => {e.currentTarget.style.backgroundColor = '#DC2626'; e.currentTarget.style.color = 'white'}}
          onMouseOut={(e) => {e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.color = '#DC2626'}}
        >
          Salir
        </button>

      </div>
    </div>
  );
}

export default Header;