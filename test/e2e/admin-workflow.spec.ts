import { test, expect } from '@playwright/test';

test.describe('Admin E2E Tests - Nouvelles fonctionnalités', () => {
  test.beforeEach(async ({ page }) => {
    // Aller à la page d'admin
    await page.goto('/admin');
  });

  test('should display ideas sorted by status then date', async ({ page }) => {
    // Mock de l'authentification admin
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    // Attendre que les idées se chargent
    await page.waitForSelector('[data-testid="ideas-list"]', { timeout: 5000 });

    // Vérifier que les idées sont bien triées par statut
    const ideaTitles = await page.locator('.idea-title').allTextContents();
    
    // Les idées en attente devraient apparaître en premier
    expect(ideaTitles.length).toBeGreaterThan(0);
    
    // Vérifier l'ordre de tri via les badges de statut
    const statusBadges = await page.locator('.status-badge').allTextContents();
    
    // Les statuts "En attente" devraient apparaître avant "Approuvé", "Réalisé", etc.
    let pendingIndex = -1;
    let approvedIndex = -1;
    
    for (let i = 0; i < statusBadges.length; i++) {
      if (statusBadges[i].includes('En attente') && pendingIndex === -1) {
        pendingIndex = i;
      }
      if (statusBadges[i].includes('Idée soumise au vote')) {
        approvedIndex = i;
        break;
      }
    }
    
    if (pendingIndex >= 0 && approvedIndex >= 0) {
      expect(pendingIndex).toBeLessThan(approvedIndex);
    }
  });

  test('should open manage votes modal on votes button click', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    // Attendre le chargement
    await page.waitForSelector('[title="Gérer les votes"]', { timeout: 5000 });

    // Cliquer sur le premier bouton de gestion des votes
    await page.click('[title="Gérer les votes"]');

    // Vérifier que la modale s'ouvre
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Vérifier le titre de la modale
    await expect(page.locator('text=Gestion des votes')).toBeVisible();
  });

  test('should open manage inscriptions modal on inscriptions button click', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    // Aller sur l'onglet événements
    await page.click('text=Événements');
    
    // Attendre le chargement
    await page.waitForSelector('[title="Gérer les inscriptions"]', { timeout: 5000 });

    // Cliquer sur le bouton de gestion des inscriptions
    await page.click('[title="Gérer les inscriptions"]');

    // Vérifier que la modale s'ouvre
    await expect(page.locator('[role="dialog"]')).toBeVisible();
    
    // Vérifier le titre de la modale
    await expect(page.locator('text=Gestion des inscriptions')).toBeVisible();
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Simuler un appareil mobile
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    // Attendre le chargement
    await page.waitForLoadState('networkidle');

    // Vérifier que la vue mobile est active
    const mobileLayout = page.locator('.lg\\:hidden');
    await expect(mobileLayout.first()).toBeVisible();

    // Vérifier que la table desktop est cachée
    const desktopTable = page.locator('.hidden.lg\\:block');
    await expect(desktopTable.first()).not.toBeVisible();

    // Tester la navigation par onglets sur mobile
    await page.click('text=Événements');
    await expect(page.locator('text=Gestion des événements')).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    // Attendre le chargement
    await page.waitForLoadState('networkidle');

    // Tester la navigation clavier entre les onglets
    await page.focus('text=Idées');
    await expect(page.locator('text=Idées')).toBeFocused();

    // Naviguer avec Tab
    await page.keyboard.press('Tab');
    await expect(page.locator('text=Événements')).toBeFocused();

    // Activer avec Enter
    await page.keyboard.press('Enter');
    await expect(page.locator('text=Gestion des événements')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Intercepter les requêtes API pour simuler des erreurs
    await page.route('/api/admin/ideas', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Server error' })
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    await page.goto('/admin');

    // L'application ne devrait pas crash
    await expect(page.locator('text=Administration')).toBeVisible();
    
    // Vérifier qu'une indication d'erreur ou de chargement est visible
    await expect(page.locator('text=Chargement')).toBeVisible();
  });

  test('should preserve description formatting with line breaks', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    // Aller sur l'onglet événements
    await page.click('text=Événements');
    
    // Attendre le chargement
    await page.waitForLoadState('networkidle');

    // Vérifier que les descriptions d'événements préservent les sauts de ligne
    const descriptions = page.locator('.event-description');
    
    if (await descriptions.count() > 0) {
      const firstDescription = descriptions.first();
      
      // Vérifier que le CSS whitespace-pre-line est appliqué
      const whiteSpace = await firstDescription.evaluate(el => 
        window.getComputedStyle(el).whiteSpace
      );
      
      expect(whiteSpace).toBe('pre-line');
    }
  });

  test('should maintain performance standards', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com'
      }));
    });

    // Mesurer les performances
    const startTime = Date.now();
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Vérifier que le chargement prend moins de 3 secondes
    expect(loadTime).toBeLessThan(3000);

    // Vérifier les Core Web Vitals basiques
    const performanceEntries = await page.evaluate(() => {
      return JSON.stringify(performance.getEntriesByType('navigation'));
    });
    
    const entries = JSON.parse(performanceEntries);
    if (entries.length > 0) {
      const entry = entries[0];
      // DOM Content Loaded doit être raisonnable
      expect(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart).toBeLessThan(1000);
    }
  });
});