const { Pool } = require('pg');

const pool = new Pool({
    user: 'ucc_user',
    host: 'localhost',
    database: 'ucc_db',
    password: 'secure',
    port: 5432,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};