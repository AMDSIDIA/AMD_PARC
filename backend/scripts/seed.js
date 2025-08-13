const pool = require('../config/database');

const seedData = async () => {
  try {
    console.log('🔄 Insertion des données initiales...');

    // Insérer les techniciens
    await pool.query(`
      INSERT INTO users (user_id, name, email, role) VALUES
      ('tech1', 'Pascal OUOBA', 'pascal.ouoba@amd.com', 'technicien'),
      ('tech2', 'Mohamed DENE', 'mohamed.dene@amd.com', 'technicien'),
      ('tech3', 'Dalila GOUBA', 'dalila.gouba@amd.com', 'technicien')
      ON CONFLICT (user_id) DO NOTHING
    `);

    // Insérer les administrateurs
    await pool.query(`
      INSERT INTO users (user_id, name, email, password, role) VALUES
      ('admin1', 'Pascal OUOBA', 'pascalouoba5@gmail.com', 'admin1234', 'administrateur')
      ON CONFLICT (user_id) DO NOTHING
    `);

    // Insérer l'inventaire initial
    await pool.query(`
      INSERT INTO inventory (item_id, name, type, status, condition) VALUES
      ('inv001', 'Dell XPS 15', 'Ordinateur Portable', 'Disponible', 'Nouveau'),
      ('inv002', 'HP EliteBook', 'Ordinateur Portable', 'Disponible', 'Ancien'),
      ('inv003', 'MacBook Pro', 'Ordinateur Portable', 'Disponible', 'Bon'),
      ('inv004', 'Écran Dell 24"', 'Écran', 'Disponible', 'Bon'),
      ('inv005', 'Imprimante HP LaserJet', 'Imprimante', 'Disponible', 'Bon')
      ON CONFLICT (item_id) DO NOTHING
    `);

    console.log('✅ Données initiales insérées avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors de l\'insertion des données:', error);
    throw error;
  }
};

const runSeed = async () => {
  try {
    await seedData();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding échoué:', error);
    process.exit(1);
  }
};

runSeed();
