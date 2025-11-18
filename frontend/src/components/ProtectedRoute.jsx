import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Necesitarás instalar esto

/*
 * NOTA: Necesitas instalar jwt-decode para leer el token.
 * Ejecuta en tu terminal de frontend:
 * npm install jwt-decode
 */

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    // 1. No hay token, redirigir a login
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userRole = decodedToken.user.role;

    // 2. Hay token, pero el rol no está permitido
    if (!allowedRoles.includes(userRole)) {
      // Si es rol 1, va a /admin, si es 2, va a /dashboard
      const homePath = userRole === 1 ? '/admin' : '/dashboard';
      return <Navigate to={homePath} replace />;
    }

    // 3. Hay token y el rol es correcto
    return <Outlet />; // Muestra el Layout (Jefe o Admin)
  } catch (error) {
    // 4. El token es inválido o está corrupto
    console.error('Error al decodificar el token:', error);
    localStorage.removeItem('authToken');
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRoute;
