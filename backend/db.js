const { Pool } = require('pg'); // Importación el Pool de pg

// Conexión a la base de datos PostgreSQL
const pool = new Pool({
    user: 'ucc_user',
    host: 'localhost',
    database: 'ucc_db',
    password: 'secure',
    port: 5432,
});

// Exportación de una función para hacer consultas
module.exports = {
    query: (text, params) => pool.query(text, params),
};