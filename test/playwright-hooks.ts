import { test as base } from '@playwright/test';
import { cleanupTestData } from './helpers/cleanup';

/**
 * Hook global qui s'exécute après chaque test Playwright
 * Nettoie automatiquement toutes les données de test de la base de données
 */
base.afterEach(async () => {
  try {
    await cleanupTestData();
  } catch (error) {
    console.error('[Test Hooks] Erreur lors du nettoyage automatique:', error);
    // On ne fait pas échouer le test si le nettoyage échoue
    // car le test lui-même a peut-être déjà réussi
  }
});

// Réexporter test pour que les tests puissent l'utiliser
export { base as test };
export { expect } from '@playwright/test';
