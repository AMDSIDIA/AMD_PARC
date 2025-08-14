#!/usr/bin/env node

/**
 * Script de test pour vérifier le déploiement Blueprint
 * Usage: node test-blueprint-deployment.js
 */

const https = require('https');

// Configuration Blueprint
const BLUEPRINT_CONFIG = {
  frontend: 'https://amd-parc.blueprint.com',
  backend: 'https://api.amd-parc.blueprint.com',
  health: '/api/health',
  endpoints: [
    '/api/tickets',
    '/api/technicians',
    '/api/inventory'
  ]
};

// Fonction pour tester un endpoint
function testEndpoint(baseUrl, endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${baseUrl}${endpoint}`;
    
    console.log(`🔍 Test de ${url}...`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ ${endpoint} - Status: ${res.statusCode}`);
          console.log(`   Réponse:`, jsonData);
          resolve({ status: res.statusCode, data: jsonData, success: true });
        } catch (error) {
          console.log(`⚠️  ${endpoint} - Status: ${res.statusCode} (Réponse non-JSON)`);
          console.log(`   Réponse: ${data}`);
          resolve({ status: res.statusCode, data: data, success: true });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint} - Erreur: ${error.message}`);
      reject({ endpoint, error: error.message, success: false });
    });
    
    req.setTimeout(15000, () => {
      req.destroy();
      console.log(`⏰ ${endpoint} - Timeout après 15 secondes`);
      reject({ endpoint, error: 'Timeout', success: false });
    });
  });
}

// Fonction pour tester le frontend
async function testFrontend() {
  console.log('\n🌐 Test du Frontend Blueprint');
  console.log('=' .repeat(50));
  
  try {
    const result = await testEndpoint(BLUEPRINT_CONFIG.frontend, '');
    return { service: 'frontend', ...result };
  } catch (error) {
    return { service: 'frontend', ...error };
  }
}

// Fonction pour tester le backend
async function testBackend() {
  console.log('\n📡 Test du Backend Blueprint');
  console.log('=' .repeat(50));
  
  const results = [];
  
  // Test de santé
  try {
    const healthResult = await testEndpoint(BLUEPRINT_CONFIG.backend, BLUEPRINT_CONFIG.health);
    results.push({ endpoint: 'health', ...healthResult });
  } catch (error) {
    results.push({ endpoint: 'health', ...error });
  }
  
  // Test des autres endpoints
  for (const endpoint of BLUEPRINT_CONFIG.endpoints) {
    try {
      const result = await testEndpoint(BLUEPRINT_CONFIG.backend, endpoint);
      results.push({ endpoint, ...result });
    } catch (error) {
      results.push({ endpoint, ...error });
    }
    console.log('');
  }
  
  return { service: 'backend', results };
}

// Fonction pour tester la connectivité réseau
function testNetworkConnectivity() {
  console.log('\n🌍 Test de Connectivité Réseau');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Frontend DNS', host: 'amd-parc.blueprint.com' },
    { name: 'Backend DNS', host: 'api.amd-parc.blueprint.com' }
  ];
  
  return Promise.all(tests.map(test => {
    return new Promise((resolve) => {
      const dns = require('dns');
      
      dns.lookup(test.host, (err, address, family) => {
        if (err) {
          console.log(`❌ ${test.name} - Erreur DNS: ${err.message}`);
          resolve({ ...test, success: false, error: err.message });
        } else {
          console.log(`✅ ${test.name} - Résolu vers ${address} (IPv${family})`);
          resolve({ ...test, success: true, address, family });
        }
      });
    });
  }));
}

// Fonction pour tester SSL
function testSSL() {
  console.log('\n🔒 Test des Certificats SSL');
  console.log('=' .repeat(50));
  
  const tests = [
    { name: 'Frontend SSL', host: 'amd-parc.blueprint.com', port: 443 },
    { name: 'Backend SSL', host: 'api.amd-parc.blueprint.com', port: 443 }
  ];
  
  return Promise.all(tests.map(test => {
    return new Promise((resolve) => {
      const tls = require('tls');
      
      const socket = tls.connect({
        host: test.host,
        port: test.port,
        servername: test.host,
        rejectUnauthorized: false
      }, () => {
        const cert = socket.getPeerCertificate();
        console.log(`✅ ${test.name} - Certificat valide`);
        console.log(`   Émis par: ${cert.issuer.CN}`);
        console.log(`   Valide jusqu'au: ${cert.valid_to}`);
        socket.end();
        resolve({ ...test, success: true, cert });
      });
      
      socket.on('error', (err) => {
        console.log(`❌ ${test.name} - Erreur SSL: ${err.message}`);
        resolve({ ...test, success: false, error: err.message });
      });
      
      socket.setTimeout(10000, () => {
        socket.destroy();
        console.log(`⏰ ${test.name} - Timeout SSL`);
        resolve({ ...test, success: false, error: 'Timeout' });
      });
    });
  }));
}

// Fonction principale
async function runBlueprintTests() {
  console.log('🚀 Test de Déploiement Blueprint - AMD Parc Informatique');
  console.log('=' .repeat(70));
  console.log(`📍 URLs de test:`);
  console.log(`   Frontend: ${BLUEPRINT_CONFIG.frontend}`);
  console.log(`   Backend: ${BLUEPRINT_CONFIG.backend}`);
  console.log('');
  
  const results = {
    network: [],
    ssl: [],
    frontend: null,
    backend: null
  };
  
  // Test de connectivité réseau
  results.network = await testNetworkConnectivity();
  
  // Test SSL
  results.ssl = await testSSL();
  
  // Test du frontend
  results.frontend = await testFrontend();
  
  // Test du backend
  results.backend = await testBackend();
  
  // Résumé
  console.log('\n📊 Résumé des Tests Blueprint');
  console.log('=' .repeat(70));
  
  // Résumé réseau
  const networkSuccess = results.network.filter(r => r.success).length;
  console.log(`🌍 Connectivité réseau: ${networkSuccess}/${results.network.length} tests réussis`);
  
  // Résumé SSL
  const sslSuccess = results.ssl.filter(r => r.success).length;
  console.log(`🔒 Certificats SSL: ${sslSuccess}/${results.ssl.length} tests réussis`);
  
  // Résumé frontend
  console.log(`🌐 Frontend: ${results.frontend.success ? '✅ Opérationnel' : '❌ Problème'}`);
  
  // Résumé backend
  if (results.backend.results) {
    const backendSuccess = results.backend.results.filter(r => r.success).length;
    console.log(`📡 Backend: ${backendSuccess}/${results.backend.results.length} endpoints opérationnels`);
  }
  
  // Recommandations
  console.log('\n💡 Recommandations:');
  console.log('=' .repeat(70));
  
  if (networkSuccess < results.network.length) {
    console.log('⚠️  Problèmes de connectivité réseau détectés');
    console.log('   - Vérifiez la configuration DNS');
    console.log('   - Vérifiez que les domaines sont configurés dans Blueprint');
  }
  
  if (sslSuccess < results.ssl.length) {
    console.log('⚠️  Problèmes SSL détectés');
    console.log('   - Vérifiez la configuration SSL dans Blueprint');
    console.log('   - Attendez que les certificats Let\'s Encrypt soient émis');
  }
  
  if (!results.frontend.success) {
    console.log('⚠️  Frontend non accessible');
    console.log('   - Vérifiez le déploiement du service frontend');
    console.log('   - Vérifiez les logs Blueprint');
  }
  
  if (results.backend.results && results.backend.results.filter(r => !r.success).length > 0) {
    console.log('⚠️  Certains endpoints backend ne répondent pas');
    console.log('   - Vérifiez le déploiement du service backend');
    console.log('   - Vérifiez la configuration de la base de données');
  }
  
  // Statut global
  const allTests = [
    ...results.network,
    ...results.ssl,
    results.frontend,
    ...(results.backend.results || [])
  ];
  
  const totalSuccess = allTests.filter(r => r.success).length;
  const totalTests = allTests.length;
  
  console.log('\n🎯 Statut Global:');
  console.log('=' .repeat(70));
  console.log(`✅ Tests réussis: ${totalSuccess}/${totalTests}`);
  
  if (totalSuccess === totalTests) {
    console.log('🎉 Tous les tests sont passés avec succès !');
    console.log('✅ Le déploiement Blueprint est opérationnel');
  } else {
    console.log('⚠️  Certains tests ont échoué');
    console.log('🔧 Consultez les recommandations ci-dessus');
  }
  
  console.log('\n📞 Support:');
  console.log('- Blueprint: https://blueprint.com/support');
  console.log('- AMD International: pascalouoba5@gmail.com');
}

// Exécution du test
if (require.main === module) {
  runBlueprintTests().catch(console.error);
}

module.exports = { 
  testEndpoint, 
  testFrontend, 
  testBackend, 
  testNetworkConnectivity, 
  testSSL,
  runBlueprintTests 
};
