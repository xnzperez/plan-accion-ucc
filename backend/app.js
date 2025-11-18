/*
 * Archivo: backend/app.js
 * (Versión Completa - Refactorizada)
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./src/routes/userRoutes');

// --- MIDDLEWARE ---
const { authMiddleware } = require('./src/middleware/authMiddleware');

// --- RUTAS ---
const authRoutes = require('./src/routes/authRoutes');
const goalRoutes = require('./src/routes/goalRoutes'); // <-- Importante
const actionRoutes = require('./src/routes/actionRoutes');
const evidenceRoutes = require('./src/routes/evidenceRoutes');
const processRoutes = require('./src/routes/processRoutes');
const statsRoutes = require('./src/routes/statsRoutes'); // <-- NUEVO
const reportRoutes = require('./src/routes/reportRoutes'); // <-- IMPORTAR
const compression = require('compression');

const app = express();
const port = 3000;

// --- Configuración Global ---
app.use(cors());
app.use(compression());
app.use(express.json());

// Servir archivos estáticos (para las evidencias)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Definición de Rutas ---

// Rutas Públicas
app.use('/api/auth', authRoutes);

// --- Rutas Protegidas ---
// Todas las rutas de abajo requieren token
app.use(authMiddleware);

app.use('/api/goals', goalRoutes); // <-- ¡Esta línea habilita /api/goals!
app.use('/api/actions', actionRoutes);
app.use('/api/evidences', evidenceRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/users', userRoutes); // Gestión de usuarios (solo Admin)
app.use('/api/stats', statsRoutes); // <-- NUEVO
app.use('/api/reports', reportRoutes); // <-- USAR

// --- Iniciar Servidor ---
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
