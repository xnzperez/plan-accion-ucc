/*
 * Archivo: backend/app.js
 * (Versión Final - Compatible con Express 5 y Producción)
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression');

// --- MIDDLEWARE ---
const { authMiddleware } = require('./src/middleware/authMiddleware');

// --- IMPORTACIÓN DE RUTAS ---
const authRoutes = require('./src/routes/authRoutes');
const goalRoutes = require('./src/routes/goalRoutes');
const actionRoutes = require('./src/routes/actionRoutes');
const evidenceRoutes = require('./src/routes/evidenceRoutes');
const processRoutes = require('./src/routes/processRoutes');
const userRoutes = require('./src/routes/userRoutes');
const statsRoutes = require('./src/routes/statsRoutes');
const reportRoutes = require('./src/routes/reportRoutes');

const app = express();
// Usar puerto del entorno (para Seenode) o 3000 por defecto
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN GLOBAL ---
app.use(cors());
app.use(compression()); // Optimización
app.use(express.json());

// Servir archivos estáticos (cargas de evidencias)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DEFINICIÓN DE API ---

// 1. Rutas Públicas
app.use('/api/auth', authRoutes);

// 2. Rutas Protegidas (Middleware Global para /api/)
// Nota: Esto protege todo lo que sigue bajo /api/
app.use('/api/goals', authMiddleware, goalRoutes);
app.use('/api/actions', authMiddleware, actionRoutes);
app.use('/api/evidences', authMiddleware, evidenceRoutes);
app.use('/api/processes', authMiddleware, processRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

// --- SERVIR FRONTEND EN PRODUCCIÓN ---
// Esto permite que Node.js sirva la React App construida
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');

// Servir los archivos estáticos (JS, CSS, Imágenes del build)
app.use(express.static(frontendBuildPath));

// Manejo del "Catch-All" para SPA (Single Page Application)
// CAMBIO IMPORTANTE: Usamos una Expresión Regular /.*/ en lugar de '*' 
// para compatibilidad con Express 5.
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// --- INICIAR SERVIDOR ---
// Escuchar en todas las interfaces de red (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});