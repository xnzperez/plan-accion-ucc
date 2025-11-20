/*
 * Archivo: backend/app.js
 * (Versión Final)
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
// Usar puerto del entorno (para la nube) o 3000 por defecto
const port = process.env.PORT || 3000;

// --- CONFIGURACIÓN GLOBAL ---
app.use(cors());
app.use(compression()); // Optimización Gzip
app.use(express.json());

// Servir archivos estáticos (cargas de evidencias)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- DEFINICIÓN DE API ---

// 1. Rutas Públicas
app.use('/api/auth', authRoutes);

// 2. Rutas Protegidas (Middleware Global para las siguientes rutas)
// Nota: authRoutes ya maneja su propia lógica, por eso va antes.
app.use('/api/goals', authMiddleware, goalRoutes);
app.use('/api/actions', authMiddleware, actionRoutes);
app.use('/api/evidences', authMiddleware, evidenceRoutes);
app.use('/api/processes', authMiddleware, processRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/stats', authMiddleware, statsRoutes);
app.use('/api/reports', authMiddleware, reportRoutes);

// --- SERVIR FRONTEND EN PRODUCCIÓN ---
// Esto permite que Node.js sirva la React App construida cuando está en la nube
const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'dist');

// Servir los archivos estáticos (JS, CSS, Imágenes del build)
app.use(express.static(frontendBuildPath));

// Manejo del "Catch-All" para SPA (Single Page Application)
// Usamos una expresión regular para que coincida con cualquier ruta que no sea API
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(frontendBuildPath, 'index.html'));
});

// --- INICIAR SERVIDOR ---
// Escuchar en 0.0.0.0 es vital para despliegues en la nube/Docker
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});
