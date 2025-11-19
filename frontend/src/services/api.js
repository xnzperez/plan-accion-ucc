/*
 * Archivo: frontend/src/services/api.js
 * (Configuración de Axios - Lógica Pura)
 */
import axios from 'axios';

// Crear la instancia de Axios
const apiClient = axios.create({
  // En producción (mismo dominio), la URL base es relativa. En desarrollo es localhost.
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:3000/api',
});

// 1. Interceptor de SOLICITUD
// Adjunta el token a cada petición saliente automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Interceptor de RESPUESTA
// Maneja errores de sesión (Token vencido o inválido)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (No autorizado) o 403 (Prohibido)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Evitar bucle infinito si ya estamos en la página de login
      if (!window.location.pathname.includes('/login')) {
        // Opcional: Limpiar el token inválido
        // localStorage.removeItem('authToken');

        // Redirigir forzosamente al login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
