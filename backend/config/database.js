const { Pool } = require('pg');
require('dotenv').config();

// Configuration de la base de données
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test de connexion
pool.on('connect', () => {
  console.log('✅ Connexion à PostgreSQL établie');
});

pool.on('error', (err) => {
  console.error('❌ Erreur de connexion PostgreSQL:', err);
});

module.exports = pool;
