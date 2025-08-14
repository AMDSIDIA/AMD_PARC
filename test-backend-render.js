#!/usr/bin/env node

/**
 * Script de test pour vérifier la connectivité du backend sur Render
 * Usage: node test-backend-render.js
 */

const https = require('https');

const BACKEND_URL = 'https://amd-parc-backend.onrender.com';

// Fonction pour tester un endpoint
function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    const url = `${BACKEND_URL}${endpoint}`;
    
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
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          console.log(`⚠️  ${endpoint} - Status: ${res.statusCode} (Réponse non-JSON)`);
          console.log(`   Réponse: ${data}`);
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${endpoint} - Erreur: ${error.message}`);
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏰ ${endpoint} - Timeout après 10 secondes`);
      reject(new Error('Timeout'));
    });
  });
}

// Fonction principale de test
async function runTests() {
  console.log('🚀 Test de connectivité du backend AMD Parc Informatique');
  console.log('=' .repeat(60));
  console.log(`📍 URL du backend: ${BACKEND_URL}`);
  console.log('');
  
  const endpoints = [
    '/api/health',
    '/api/tickets',
    '/api/technicians',
    '/api/inventory'
  ];
  
  const results = [];
  
  for (const endpoint of endpoints) {
    try {
      const result = await testEndpoint(endpoint);
      results.push({ endpoint, ...result, success: true });
    } catch (error) {
      results.push({ endpoint, error: error.message, success: false });
    }
    console.log('');
  }
  
  // Résumé
  console.log('📊 Résumé des tests:');
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Tests réussis: ${successful}/${results.length}`);
  console.log(`❌ Tests échoués: ${failed}/${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Endpoints en échec:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`   - ${r.endpoint}: ${r.error}`);
    });
  }
  
  if (successful === results.length) {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    console.log('✅ Le backend est opérationnel sur Render');
  } else {
    console.log('\n⚠️  Certains endpoints ne répondent pas correctement');
    console.log('🔧 Vérifiez la configuration du backend sur Render');
  }
}

// Exécution du test
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testEndpoint, runTests };
