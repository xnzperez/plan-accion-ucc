/*
 * Archivo: frontend/src/main.jsx
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import './index.css';

import LayoutJefe from './components/LayoutJefe.jsx';
import LayoutAdmin from './components/LayoutAdmin.jsx';

import LoginPage from './pages/LoginPage.jsx';
import ActivateAccount from './pages/ActivateAccount.jsx'; // <-- IMPORTAR

import DashboardJefe from './pages/DashboardJefe.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminManagePage from './pages/AdminManagePage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminHomePage from './pages/AdminHomePage.jsx';

import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'activate', // <-- RUTA PÚBLICA
        element: <ActivateAccount />,
      },
      {
        index: true,
        element: <Navigate to="/login" replace />,
      },

      // ... (El resto de tus rutas protegidas siguen igual)
      // ... Rutas de Jefe
      {
        path: 'dashboard',
        element: <ProtectedRoute allowedRoles={[2]} />,
        children: [
          {
            element: <LayoutJefe />,
            children: [
              { index: true, element: <DashboardJefe /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
        ],
      },

      // ... Rutas de Admin
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={[1]} />,
        children: [
          {
            element: <LayoutAdmin />,
            children: [
              { index: true, element: <AdminHomePage /> },
              { path: 'pending', element: <AdminDashboard /> },
              { path: 'manage', element: <AdminManagePage /> },
              { path: 'users', element: <AdminUsersPage /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Toaster position="top-right" reverseOrder={false} />

    <RouterProvider router={router} />
  </React.StrictMode>
);
