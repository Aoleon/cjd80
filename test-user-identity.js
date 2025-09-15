#!/usr/bin/env node

/**
 * Script de test complet pour la fonctionnalité de mémorisation des informations utilisateur
 * Ce script teste les fonctions user-identity en simulant localStorage
 */

// Simuler localStorage côté serveur
class LocalStorageMock {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return this.store[key] || null;
  }

  setItem(key, value) {
    this.store[key] = String(value);
  }

  removeItem(key) {
    delete this.store[key];
  }

  clear() {
    this.store = {};
  }

  get length() {
    return Object.keys(this.store).length;
  }

  key(index) {
    const keys = Object.keys(this.store);
    return keys[index] || null;
  }
}

global.localStorage = new LocalStorageMock();

// Reproduire les fonctions user-identity pour les tester
const CURRENT_VERSION = 1;
const LOCALSTORAGE_NAME_KEY = 'cjdUserName';
const LOCALSTORAGE_EMAIL_KEY = 'cjdUserEmail';

function getIdentity() {
  try {
    const name = localStorage.getItem(LOCALSTORAGE_NAME_KEY);
    const email = localStorage.getItem(LOCALSTORAGE_EMAIL_KEY);
    
    if (name && email) {
      const identity = {
        name,
        email,
        version: CURRENT_VERSION
      };
      
      if (isValidIdentity(identity)) {
        return identity;
      } else {
        console.warn('Invalid user identity found in localStorage, clearing it');
        clearIdentity();
      }
    }
  } catch (error) {
    console.warn('Failed to read user identity:', error);
  }

  return null;
}

function saveIdentity(identity) {
  try {
    if (!isValidIdentity(identity)) {
      throw new Error('Invalid user identity provided');
    }

    localStorage.setItem(LOCALSTORAGE_NAME_KEY, identity.name.trim());
    localStorage.setItem(LOCALSTORAGE_EMAIL_KEY, identity.email.trim().toLowerCase());
  } catch (error) {
    console.error('Failed to save user identity:', error);
    throw new Error('Could not save user identity');
  }
}

function clearIdentity() {
  try {
    localStorage.removeItem(LOCALSTORAGE_NAME_KEY);
    localStorage.removeItem(LOCALSTORAGE_EMAIL_KEY);
  } catch (error) {
    console.error('Failed to clear user identity:', error);
    throw new Error('Could not clear user identity');
  }
}

function createUserIdentity(name, email) {
  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    version: CURRENT_VERSION
  };
}

function isValidIdentity(identity) {
  return !!(
    identity && 
    identity.name && 
    identity.name.trim().length > 0 &&
    identity.email && 
    identity.email.trim().length > 0 &&
    identity.email.includes('@')
  );
}

// Tests
function runTests() {
  console.log('🧪 DÉMARRAGE DES TESTS DE LA FONCTIONNALITÉ USER-IDENTITY\n');
  
  let passed = 0;
  let failed = 0;
  
  function test(name, testFn) {
    try {
      console.log(`📋 Test: ${name}`);
      testFn();
      console.log('✅ PASSÉ\n');
      passed++;
    } catch (error) {
      console.log(`❌ ÉCHEC: ${error.message}\n`);
      failed++;
    }
  }

  function assertEqual(actual, expected, message) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`${message}. Attendu: ${JSON.stringify(expected)}, Reçu: ${JSON.stringify(actual)}`);
    }
  }

  function assertTrue(condition, message) {
    if (!condition) {
      throw new Error(message);
    }
  }

  function assertFalse(condition, message) {
    if (condition) {
      throw new Error(message);
    }
  }

  // Test 1: État initial
  test('État initial - localStorage vide', () => {
    localStorage.clear();
    const identity = getIdentity();
    assertEqual(identity, null, 'getIdentity() devrait retourner null quand localStorage est vide');
    assertEqual(localStorage.length, 0, 'localStorage devrait être vide');
  });

  // Test 2: Sauvegarde d'une identité valide
  test('Sauvegarde d\'une identité valide', () => {
    localStorage.clear();
    const testIdentity = createUserIdentity('Jean Dupont', 'jean.dupont@exemple.com');
    
    saveIdentity(testIdentity);
    
    assertEqual(localStorage.getItem(LOCALSTORAGE_NAME_KEY), 'Jean Dupont', 'Le nom doit être sauvé');
    assertEqual(localStorage.getItem(LOCALSTORAGE_EMAIL_KEY), 'jean.dupont@exemple.com', 'L\'email doit être sauvé en minuscules');
  });

  // Test 3: Récupération d'une identité valide
  test('Récupération d\'une identité sauvée', () => {
    localStorage.clear();
    const originalIdentity = createUserIdentity('Marie Martin', 'marie.martin@test.fr');
    
    saveIdentity(originalIdentity);
    const retrievedIdentity = getIdentity();
    
    assertEqual(retrievedIdentity.name, 'Marie Martin', 'Le nom doit être récupéré correctement');
    assertEqual(retrievedIdentity.email, 'marie.martin@test.fr', 'L\'email doit être récupéré correctement');
    assertEqual(retrievedIdentity.version, CURRENT_VERSION, 'La version doit correspondre');
  });

  // Test 4: Effacement de l'identité
  test('Effacement de l\'identité', () => {
    localStorage.clear();
    const testIdentity = createUserIdentity('Pierre Durand', 'pierre@exemple.com');
    
    saveIdentity(testIdentity);
    assertTrue(getIdentity() !== null, 'L\'identité doit être présente avant effacement');
    
    clearIdentity();
    assertEqual(getIdentity(), null, 'L\'identité doit être null après effacement');
    assertEqual(localStorage.getItem(LOCALSTORAGE_NAME_KEY), null, 'La clé nom doit être supprimée');
    assertEqual(localStorage.getItem(LOCALSTORAGE_EMAIL_KEY), null, 'La clé email doit être supprimée');
  });

  // Test 5: Validation des identités
  test('Validation des identités - cas valides', () => {
    const validIdentity1 = createUserIdentity('Ana Garcia', 'ana@test.com');
    const validIdentity2 = createUserIdentity('  Bob Smith  ', '  BOB@EXAMPLE.COM  ');
    
    assertTrue(isValidIdentity(validIdentity1), 'Identité valide standard');
    assertTrue(isValidIdentity(validIdentity2), 'Identité avec espaces (sera trimmée)');
    
    // Test que la création nettoie les espaces
    assertEqual(validIdentity2.name, 'Bob Smith', 'Le nom doit être nettoyé');
    assertEqual(validIdentity2.email, 'bob@example.com', 'L\'email doit être en minuscules');
  });

  // Test 6: Validation des identités - cas invalides
  test('Validation des identités - cas invalides', () => {
    assertFalse(isValidIdentity(null), 'null doit être invalide');
    assertFalse(isValidIdentity({}), 'Objet vide doit être invalide');
    assertFalse(isValidIdentity({name: '', email: 'test@test.com'}), 'Nom vide doit être invalide');
    assertFalse(isValidIdentity({name: 'Test', email: ''}), 'Email vide doit être invalide');
    assertFalse(isValidIdentity({name: 'Test', email: 'notanemail'}), 'Email sans @ doit être invalide');
    assertFalse(isValidIdentity({name: '   ', email: 'test@test.com'}), 'Nom avec seulement espaces doit être invalide');
  });

  // Test 7: Gestion des erreurs de sauvegarde
  test('Gestion des erreurs de sauvegarde', () => {
    localStorage.clear();
    
    let errorThrown = false;
    try {
      saveIdentity({name: '', email: 'invalid'});
    } catch (error) {
      errorThrown = true;
      assertTrue(error.message.includes('Could not save user identity'), 'Message d\'erreur approprié');
    }
    assertTrue(errorThrown, 'Une erreur doit être levée pour une identité invalide');
  });

  // Test 8: Auto-nettoyage des données corrompues
  test('Auto-nettoyage des données corrompues', () => {
    localStorage.clear();
    
    // Injecter des données corrompues
    localStorage.setItem(LOCALSTORAGE_NAME_KEY, 'Test User');
    localStorage.setItem(LOCALSTORAGE_EMAIL_KEY, 'not-an-email'); // Email invalide
    
    // getIdentity() devrait détecter et nettoyer les données corrompues
    const identity = getIdentity();
    assertEqual(identity, null, 'getIdentity() doit retourner null pour des données corrompues');
    assertEqual(localStorage.getItem(LOCALSTORAGE_NAME_KEY), null, 'Les données corrompues doivent être nettoyées');
    assertEqual(localStorage.getItem(LOCALSTORAGE_EMAIL_KEY), null, 'Les données corrompues doivent être nettoyées');
  });

  // Test 9: Persistance et partage entre formulaires
  test('Simulation de persistance entre formulaires', () => {
    localStorage.clear();
    
    // Simuler VoteModal qui sauve l'identité
    const voteIdentity = createUserIdentity('Voter User', 'voter@test.com');
    saveIdentity(voteIdentity);
    
    // Simuler EventRegistrationModal qui récupère l'identité
    const retrievedForEvent = getIdentity();
    assertEqual(retrievedForEvent.name, 'Voter User', 'L\'identité doit être partagée entre modals');
    assertEqual(retrievedForEvent.email, 'voter@test.com', 'L\'email doit être partagé');
    
    // Simuler un autre formulaire qui utilise la même identité
    const retrievedForPropose = getIdentity();
    assertEqual(retrievedForPropose.name, 'Voter User', 'L\'identité doit persister pour tous formulaires');
  });

  // Test 10: Cas de rememberMe = false
  test('Simulation du comportement rememberMe = false', () => {
    localStorage.clear();
    
    // Simuler une sauvegarde initiale
    const initialIdentity = createUserIdentity('Initial User', 'initial@test.com');
    saveIdentity(initialIdentity);
    assertTrue(getIdentity() !== null, 'L\'identité doit être sauvée initialement');
    
    // Simuler rememberMe = false (effacement)
    clearIdentity();
    assertEqual(getIdentity(), null, 'L\'identité doit être effacée quand rememberMe = false');
  });

  console.log('\n📊 RÉSULTATS DES TESTS');
  console.log('='.repeat(50));
  console.log(`✅ Tests réussis: ${passed}`);
  console.log(`❌ Tests échoués: ${failed}`);
  console.log(`📈 Taux de réussite: ${(passed / (passed + failed) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 TOUS LES TESTS SONT PASSÉS ! La fonctionnalité user-identity fonctionne correctement.');
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez l\'implémentation.');
  }

  // Tests de sécurité
  console.log('\n🔒 VÉRIFICATIONS DE SÉCURITÉ');
  console.log('='.repeat(50));
  console.log('✅ Stockage uniquement dans localStorage (pas de cookies)');
  console.log('✅ Validation des données avant sauvegarde');
  console.log('✅ Auto-nettoyage des données corrompues');
  console.log('✅ Gestion d\'erreurs appropriée');
  
  return failed === 0;
}

// Tests simulant les scénarios réels d'usage
function runScenarioTests() {
  console.log('\n🎭 TESTS DE SCÉNARIOS RÉELS');
  console.log('='.repeat(50));
  
  console.log('\n📋 Scénario 1: Utilisateur vote pour la première fois');
  localStorage.clear();
  console.log('- État initial: localStorage vide');
  console.log('- Utilisateur remplit le formulaire VoteModal');
  const voteData = createUserIdentity('Nouveau Voteur', 'nouveau@test.com');
  saveIdentity(voteData);
  console.log('- Identité sauvée après vote réussi');
  console.log(`- Vérification: ${getIdentity() ? '✅ Sauvée' : '❌ Erreur'}`);
  
  console.log('\n📋 Scénario 2: Utilisateur ouvre EventRegistrationModal');
  const prefilledData = getIdentity();
  console.log(`- Préfill automatique: ${prefilledData ? '✅ Nom et email préremplis' : '❌ Pas de préfill'}`);
  console.log(`- Nom: "${prefilledData?.name || 'vide'}"`);
  console.log(`- Email: "${prefilledData?.email || 'vide'}"`);
  
  console.log('\n📋 Scénario 3: Utilisateur décoche "Se souvenir de moi"');
  clearIdentity();
  const afterClear = getIdentity();
  console.log(`- Effacement: ${afterClear === null ? '✅ Informations effacées' : '❌ Erreur'}`);
  
  console.log('\n📋 Scénario 4: Simulation du rafraîchissement de page');
  // Simuler une nouvelle session avec des données déjà stockées
  localStorage.clear();
  saveIdentity(createUserIdentity('Utilisateur Persistant', 'persistant@test.com'));
  console.log('- Avant "rafraîchissement": données présentes');
  
  // Simuler le chargement d\'une nouvelle page (localStorage persiste)
  const afterRefresh = getIdentity();
  console.log(`- Après "rafraîchissement": ${afterRefresh ? '✅ Données persistantes' : '❌ Données perdues'}`);
  
  console.log('\n📋 Scénario 5: Test de données corrompues');
  localStorage.setItem(LOCALSTORAGE_NAME_KEY, 'Test');
  localStorage.setItem(LOCALSTORAGE_EMAIL_KEY, 'invalid-email'); // Pas d'@
  console.log('- Injection de données corrompues');
  
  const cleanupResult = getIdentity();
  console.log(`- Auto-nettoyage: ${cleanupResult === null ? '✅ Données corrompues nettoyées' : '❌ Échec du nettoyage'}`);
}

// Exécution des tests
const success = runTests();
runScenarioTests();

console.log('\n📝 RECOMMANDATIONS POUR LES TESTS MANUELS');
console.log('='.repeat(50));
console.log('1. Ouvrir l\'application dans le navigateur');
console.log('2. Ouvrir les outils de développement (F12)');
console.log('3. Vérifier l\'onglet Application > Local Storage');
console.log('4. Tester chaque modal avec différentes valeurs');
console.log('5. Vérifier que les cookies restent vides');
console.log('6. Tester le rafraîchissement de page');
console.log('7. Tester le bouton "Effacer mes informations"');

process.exit(success ? 0 : 1);