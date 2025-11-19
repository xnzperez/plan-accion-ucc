/*
 * Archivo: frontend/src/pages/AdminUsersPage.jsx
 * (Versión UI Pro - Con SweetAlert2 y Toast)
 */
import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Swal from 'sweetalert2'; // <-- NUEVO
import toast from 'react-hot-toast'; // <-- NUEVO
import apiClient from '../services/api';
import Header from '../components/Header';
import UserForm from '../components/UserForm';
import AssignProcessModal from '../components/AssignProcessModal';

const styles = {
  container: { padding: '20px' },
  headerRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  createBtn: {
    backgroundColor: '#057CD1',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  th: {
    backgroundColor: '#F9FAFB',
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #E5E7EB',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #E5E7EB',
    color: '#1F2937',
    verticalAlign: 'top',
  },
  badge: { padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  badgeActive: { backgroundColor: '#DEF7EC', color: '#03543F' },
  badgeInactive: { backgroundColor: '#FDE8E8', color: '#9B1C1C' },
  toggleBtn: {
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#dc3545',
    background: 'none',
    border: 'none',
    marginRight: '10px',
  },
  assignBtn: {
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#057CD1',
    background: 'none',
    border: 'none',
    marginRight: '10px',
  },
  resetBtn: {
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    color: '#F59E0B',
    background: 'none',
    border: 'none',
  },
  processList: { display: 'flex', flexWrap: 'wrap', gap: '5px' },
  processChip: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
    padding: '2px 8px',
    borderRadius: '15px',
    fontSize: '0.85rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  removeProcessBtn: {
    border: 'none',
    background: 'none',
    color: '#0284C7',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: '0',
    fontSize: '0.9rem',
    lineHeight: 1,
  },
};

function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedUserForAssign, setSelectedUserForAssign] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.user.id);
      } catch (e) {
        console.error(e);
      }
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      toast.error('Error al cargar la lista de usuarios.');
    }
  };

  const openAssignModal = (user) => {
    setSelectedUserForAssign(user);
    setIsAssignModalOpen(true);
  };

  // --- SweetAlert para Bloquear/Activar ---
  const handleToggleStatus = async (userId, currentStatus) => {
    if (userId === currentUserId) return toast.error('No puedes bloquear tu propia cuenta.');

    const actionText = currentStatus ? 'Bloquear acceso' : 'Reactivar acceso';

    const result = await Swal.fire({
      title: `¿${actionText}?`,
      text: currentStatus
        ? 'El usuario no podrá iniciar sesión.'
        : 'El usuario podrá volver a entrar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: currentStatus ? '#dc3545' : '#16a34a',
      confirmButtonText: `Sí, ${actionText.toLowerCase()}`,
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await apiClient.patch(`/users/${userId}/status`, { is_active: !currentStatus });
        fetchUsers();
        toast.success(`Usuario ${currentStatus ? 'bloqueado' : 'activado'} correctamente.`);
      } catch (error) {
        toast.error(error.response?.data?.error || 'Error al actualizar.');
      }
    }
  };

  // --- SweetAlert para Desasignar ---
  const handleUnassignProcess = async (userId, processId, processName) => {
    const result = await Swal.fire({
      title: '¿Quitar proceso?',
      text: `Se desvinculará el proceso "${processName}" de este usuario.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#057CD1',
      confirmButtonText: 'Sí, quitar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/users/${userId}/processes/${processId}`);
        fetchUsers();
        toast.success('Proceso desasignado.');
      } catch (error) {
        toast.error('Error al quitar el proceso.', error);
      }
    }
  };

  // --- SweetAlert para Reset ---
  const handleResetAccess = async (userId, userName) => {
    if (userId === currentUserId) return toast.error('No puedes resetearte a ti mismo.');

    const result = await Swal.fire({
      title: '¿Restablecer Acceso?',
      text: `Se generará un nuevo código de activación para ${userName}. La cuenta quedará inactiva hasta que se use el código.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#F59E0B',
      confirmButtonText: 'Generar Código',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        const response = await apiClient.post(`/users/${userId}/reset`);
        const code = response.data.activationCode;

        // Mostrar código en un Modal de Éxito 
        Swal.fire({
          title: '¡Código Generado!',
          html: `
            <p>Entrega este código al usuario:</p>
            <h1 style="color:#16a34a; letter-spacing: 4px; font-family:monospace">${code}</h1>
            <p style="font-size:0.9rem; color:#666">El usuario debe ir a "Activar Cuenta" en el login.</p>
          `,
          icon: 'success',
          confirmButtonText: 'Entendido',
        });

        fetchUsers();
      } catch (error) {
        toast.error('Error al generar el código.', error);
      }
    }
  };

  return (
    <div>
      <Header title="Gestión de Usuarios" />
      <div style={styles.headerRow}>
        <p>Administra el acceso y asigna procesos a los Jefes.</p>
        <button style={styles.createBtn} onClick={() => setIsUserModalOpen(true)}>
          + Nuevo Usuario
        </button>
      </div>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Nombre</th>
            <th style={styles.th}>Rol</th>
            <th style={{ ...styles.th, width: '30%' }}>Procesos Asignados</th>
            <th style={styles.th}>Estado</th>
            <th style={styles.th}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isMe = user.id === currentUserId;
            return (
              <tr key={user.id}>
                <td style={styles.td}>
                  <div style={{ fontWeight: '500' }}>
                    {user.name}{' '}
                    {isMe && <span style={{ fontSize: '0.7rem', color: '#057CD1' }}>(Tú)</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>{user.email}</div>
                </td>
                <td style={styles.td}>
                  {user.role_name || (user.role_id === 1 ? 'Admin' : 'Jefe')}
                </td>
                <td style={styles.td}>
                  <div style={styles.processList}>
                    {user.assigned_processes && user.assigned_processes.length > 0 ? (
                      user.assigned_processes.map((proc) => (
                        <div key={proc.id} style={styles.processChip}>
                          {proc.name}
                          <button
                            style={styles.removeProcessBtn}
                            onClick={() => handleUnassignProcess(user.id, proc.id, proc.name)}
                          >
                            ×
                          </button>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Sin asignar</span>
                    )}
                  </div>
                </td>
                <td style={styles.td}>
                  <span
                    style={
                      user.is_active
                        ? { ...styles.badge, ...styles.badgeActive }
                        : { ...styles.badge, ...styles.badgeInactive }
                    }
                  >
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    style={{
                      ...styles.toggleBtn,
                      opacity: isMe ? 0.5 : 1,
                      cursor: isMe ? 'not-allowed' : 'pointer',
                    }}
                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                    disabled={isMe}
                  >
                    {user.is_active ? 'Bloquear' : 'Activar'}
                  </button>
                  {user.role_id === 2 && user.is_active && (
                    <button style={styles.assignBtn} onClick={() => openAssignModal(user)}>
                      Asignar
                    </button>
                  )}
                  {!isMe && (
                    <button
                      style={styles.resetBtn}
                      onClick={() => handleResetAccess(user.id, user.name)}
                      title="Generar nuevo código"
                    >
                      🔑 Reset
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isUserModalOpen && (
        <UserForm onClose={() => setIsUserModalOpen(false)} onUserCreated={fetchUsers} />
      )}
      {isAssignModalOpen && selectedUserForAssign && (
        <AssignProcessModal
          user={selectedUserForAssign}
          onClose={() => setIsAssignModalOpen(false)}
          onAssignmentComplete={fetchUsers}
        />
      )}
    </div>
  );
}

export default AdminUsersPage;
