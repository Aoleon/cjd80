import { test, expect } from '@playwright/test';

/**
 * Test de démonstration pour le système de rapport de bugs automatique
 * Ce test échoue volontairement pour démontrer le workflow complet
 */

test.describe('Test du système de rapport de bugs', () => {
  test.skip('should demonstrate bug reporting - INTENTIONAL FAILURE', async ({ page }) => {
    // Ce test est désactivé par défaut (skip) pour ne pas polluer les rapports
    // Pour l'activer: npx playwright test test-bug-reporter --grep "INTENTIONAL"
    
    await page.goto('/');
    
    // Test qui échoue volontairement
    expect(1 + 1).toBe(3);
  });
});
