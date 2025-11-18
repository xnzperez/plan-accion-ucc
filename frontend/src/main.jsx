/*
 * Archivo: frontend/src/main.jsx
 * (Versión Optimizada - Lazy Loading)
 */
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import './index.css';

import LayoutJefe from './components/LayoutJefe.jsx';
import LayoutAdmin from './components/LayoutAdmin.jsx';

// Páginas Públicas (Estáticas para carga rápida inicial)
import LoginPage from './pages/LoginPage.jsx';
import ActivateAccount from './pages/ActivateAccount.jsx';

// Páginas Privadas (Lazy Loading)
const DashboardJefe = React.lazy(() => import('./pages/DashboardJefe.jsx'));
const AdminHomePage = React.lazy(() => import('./pages/AdminHomePage.jsx'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard.jsx'));
const AdminManagePage = React.lazy(() => import('./pages/AdminManagePage.jsx'));
const AdminUsersPage = React.lazy(() => import('./pages/AdminUsersPage.jsx'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage.jsx'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'activate', element: <ActivateAccount /> },
      { index: true, element: <Navigate to="/login" replace /> },

      // JEFE
      {
        path: 'dashboard',
        element: <ProtectedRoute allowedRoles={[2]} />,
        children: [
          {
            element: <LayoutJefe />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <DashboardJefe />
                  </Suspense>
                ),
              },
              {
                path: 'profile',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProfilePage />
                  </Suspense>
                ),
              },
            ],
          },
        ],
      },

      // ADMIN
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={[1]} />,
        children: [
          {
            element: <LayoutAdmin />,
            children: [
              {
                index: true,
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminHomePage />
                  </Suspense>
                ),
              },
              {
                path: 'pending',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminDashboard />
                  </Suspense>
                ),
              },
              {
                path: 'manage',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminManagePage />
                  </Suspense>
                ),
              },
              {
                path: 'users',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <AdminUsersPage />
                  </Suspense>
                ),
              },
              {
                path: 'profile',
                element: (
                  <Suspense fallback={<LoadingScreen />}>
                    <ProfilePage />
                  </Suspense>
                ),
              },
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
