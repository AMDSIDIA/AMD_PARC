#!/usr/bin/env node

/**
 * Script de vérification des configurations pour le déploiement Render
 * Usage: node verify-deployment.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des configurations pour le déploiement Render');
console.log('=' .repeat(60));

// Configuration attendue
const expectedConfig = {
  backend: {
    port: 10000,
    databaseUrl: 'postgresql://parcdb_gkw5_user:pUPYo0OFAt57tmGdVpCLHw7j81iyzrL9@dpg-d2efvus9c44c738uqqag-a.oregon-postgres.render.com/parcdb_gkw5',
    ssl: { require: true, rejectUnauthorized: false }
  },
  frontend: {
    apiUrl: 'https://amd-parc-backend.onrender.com'
  }
};

let allChecksPassed = true;

// Vérification 1: Port du backend
console.log('\n1️⃣ Vérification du port backend...');
try {
  const serverContent = fs.readFileSync(path.join(__dirname, 'backend', 'server.js'), 'utf8');
  if (serverContent.includes('const PORT = process.env.PORT || 10000')) {
    console.log('✅ Port backend configuré correctement (10000)');
  } else {
    console.log('❌ Port backend incorrect - doit être 10000');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Impossible de lire server.js');
  allChecksPassed = false;
}

// Vérification 2: Configuration SSL de la base de données
console.log('\n2️⃣ Vérification de la configuration SSL...');
try {
  const dbContent = fs.readFileSync(path.join(__dirname, 'backend', 'config', 'database.js'), 'utf8');
  if (dbContent.includes('require: true, rejectUnauthorized: false')) {
    console.log('✅ Configuration SSL correcte pour Render');
  } else {
    console.log('❌ Configuration SSL incorrecte');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Impossible de lire database.js');
  allChecksPassed = false;
}

// Vérification 3: Variables d'environnement backend
console.log('\n3️⃣ Vérification des variables d\'environnement backend...');
try {
  const envExample = fs.readFileSync(path.join(__dirname, 'backend', 'env.example'), 'utf8');
  if (envExample.includes('PORT=10000') && 
      envExample.includes('parcdb_gkw5_user') &&
      envExample.includes('dpg-d2efvus9c44c738uqqag-a.oregon-postgres.render.com')) {
    console.log('✅ Variables d\'environnement backend correctes');
  } else {
    console.log('❌ Variables d\'environnement backend incorrectes');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Impossible de lire env.example');
  allChecksPassed = false;
}

// Vérification 4: URLs API dans le frontend
console.log('\n4️⃣ Vérification des URLs API frontend...');
const frontendFiles = [
  'app/signaler/page.tsx',
  'app/suivi-demandes/page.tsx',
  'app/gestion/page.tsx',
  'app/dashboard/page.tsx',
  'app/page.tsx',
  'app/suivi/page.tsx',
  'app/demande-materiel/page.tsx'
];

let frontendChecksPassed = true;
for (const file of frontendFiles) {
  try {
    const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
    if (content.includes('https://amd-parc-backend.onrender.com') || 
        content.includes('process.env.NEXT_PUBLIC_API_URL')) {
      console.log(`✅ ${file} - URL API correcte`);
    } else {
      console.log(`❌ ${file} - URL API incorrecte ou manquante`);
      frontendChecksPassed = false;
    }
  } catch (error) {
    console.log(`⚠️  ${file} - Impossible de lire le fichier`);
  }
}

if (!frontendChecksPassed) {
  allChecksPassed = false;
}

// Vérification 5: Configuration CORS
console.log('\n5️⃣ Vérification de la configuration CORS...');
try {
  const serverContent = fs.readFileSync(path.join(__dirname, 'backend', 'server.js'), 'utf8');
  if (serverContent.includes('https://amd-parc.onrender.com') &&
      serverContent.includes('https://amd-parc-frontend.onrender.com')) {
    console.log('✅ Configuration CORS correcte');
  } else {
    console.log('❌ Configuration CORS incorrecte');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Impossible de vérifier la configuration CORS');
  allChecksPassed = false;
}

// Vérification 6: Package.json du backend
console.log('\n6️⃣ Vérification du package.json backend...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'backend', 'package.json'), 'utf8'));
  if (packageJson.scripts.start === 'node server.js' &&
      packageJson.dependencies.pg &&
      packageJson.dependencies.express) {
    console.log('✅ Package.json backend correct');
  } else {
    console.log('❌ Package.json backend incorrect');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('❌ Impossible de lire package.json backend');
  allChecksPassed = false;
}

// Résumé
console.log('\n📊 Résumé de la vérification:');
console.log('=' .repeat(60));

if (allChecksPassed) {
  console.log('🎉 Toutes les vérifications sont passées avec succès !');
  console.log('✅ L\'application est prête pour le déploiement sur Render');
  console.log('\n📋 Prochaines étapes:');
  console.log('1. Suivez le guide GUIDE_DEPLOIEMENT_RENDER.md');
  console.log('2. Déployez le backend dans le dossier backend/');
  console.log('3. Déployez le frontend à la racine');
  console.log('4. Configurez la base de données PostgreSQL');
  console.log('5. Testez avec: node test-backend-render.js');
} else {
  console.log('❌ Certaines vérifications ont échoué');
  console.log('🔧 Corrigez les problèmes avant le déploiement');
  console.log('📖 Consultez le guide GUIDE_DEPLOIEMENT_RENDER.md');
}

console.log('\n🔗 URLs attendues:');
console.log('- Frontend: https://amd-parc-frontend.onrender.com');
console.log('- Backend: https://amd-parc-backend.onrender.com');
console.log('- Base de données: PostgreSQL sur Render');

console.log('\n📞 Support:');
console.log('- Email: pascalouoba5@gmail.com');
console.log('- Téléphone: +226 65494389 (incidents) / +226 65186681 (matériel)');
