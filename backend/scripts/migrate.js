const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Création des tables...');

    // Table des utilisateurs (admins et techniciens)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'technicien',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table des incidents
    await pool.query(`
      CREATE TABLE IF NOT EXISTS incidents (
        id SERIAL PRIMARY KEY,
        ticket_id INTEGER UNIQUE NOT NULL,
        nom VARCHAR(100) NOT NULL,
        prenom VARCHAR(100) NOT NULL,
        departement VARCHAR(100) NOT NULL,
        poste VARCHAR(100) NOT NULL,
        description_souci TEXT NOT NULL,
        categorie VARCHAR(50) DEFAULT 'Incident technique',
        priorite VARCHAR(20) DEFAULT 'Moyenne',
        etat VARCHAR(20) DEFAULT 'En attente',
        assigned_to VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Table de l'inventaire
    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id SERIAL PRIMARY KEY,
        item_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'Disponible',
        condition VARCHAR(20) DEFAULT 'Bon',
        assigned_to VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tables créées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de la création des tables:', error);
    throw error;
  }
};

const runMigrations = async () => {
  try {
    await createTables();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration échouée:', error);
    process.exit(1);
  }
};

runMigrations();
