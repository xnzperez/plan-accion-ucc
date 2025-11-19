/*
 * Archivo: backend/src/db/index.js
 * (Configuración robusta para Nube con SSL)
 */
const { Pool } = require('pg');

// Configuración dinámica (Local vs Producción)
const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  // Si existe DATABASE_URL, úsala. Si no, usa las variables sueltas.
  connectionString: process.env.DATABASE_URL,

  // Fallback para desarrollo local
  user: process.env.DB_USER || 'ucc_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ucc_db',
  password: process.env.DB_PASSWORD || 'secure',
  port: process.env.DB_PORT || 5432,

  // Configuración SSL (Requerida por Seenode)
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
