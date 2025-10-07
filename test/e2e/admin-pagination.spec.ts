import { test, expect } from '@playwright/test';

test.describe('Admin Pagination - Affichage complet des idées et événements', () => {
  test.beforeEach(async ({ page }) => {
    // Se connecter en tant qu'admin
    await page.goto('/');
    
    // Remplir le formulaire de connexion
    await page.fill('input[name="email"]', 'admin@cjd-amiens.fr');
    await page.fill('input[name="password"]', 'Admin123!');
    
    // Cliquer sur le bouton de connexion
    await page.click('button[type="submit"]');
    
    // Attendre la redirection vers /admin
    await page.waitForURL('/admin');
  });

  test('should display all 33 ideas in admin interface', async ({ page }) => {
    // Cliquer sur l'onglet Gestion des idées
    await page.click('[value="ideas"]');
    
    // Attendre que les idées se chargent
    await page.waitForSelector('[data-testid^="button-view-idea"]', { timeout: 10000 });
    
    // Compter les idées visibles (desktop ou mobile)
    const desktopIdeas = await page.locator('[data-testid^="button-view-idea-"]:not([data-testid*="mobile"])').count();
    const mobileIdeas = await page.locator('[data-testid^="button-view-idea-mobile-"]').count();
    
    const totalIdeas = desktopIdeas + mobileIdeas;
    
    // Vérifier qu'il y a exactement 33 idées
    expect(totalIdeas).toBe(33);
    
    console.log(`✅ Total idées affichées: ${totalIdeas} (Desktop: ${desktopIdeas}, Mobile: ${mobileIdeas})`);
  });

  test('should display all 10 events in admin interface', async ({ page }) => {
    // Cliquer sur l'onglet Gestion des événements
    await page.click('[value="events"]');
    
    // Attendre que les événements se chargent
    await page.waitForSelector('[data-testid^="button-view-event"]', { timeout: 10000 });
    
    // Compter les événements visibles (desktop ou mobile)
    const desktopEvents = await page.locator('[data-testid^="button-view-event-"]:not([data-testid*="mobile"])').count();
    const mobileEvents = await page.locator('[data-testid^="button-view-event-mobile-"]').count();
    
    const totalEvents = desktopEvents + mobileEvents;
    
    // Vérifier qu'il y a exactement 10 événements
    expect(totalEvents).toBe(10);
    
    console.log(`✅ Total événements affichés: ${totalEvents} (Desktop: ${desktopEvents}, Mobile: ${mobileEvents})`);
  });

  test('should display tables on medium screens and cards on mobile', async ({ page }) => {
    // Test desktop (768px+)
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.click('[value="ideas"]');
    await page.waitForSelector('[data-testid^="button-view-idea"]', { timeout: 5000 });
    
    // Vérifier que le tableau est visible
    const table = page.locator('.md\\:block').first();
    await expect(table).toBeVisible();
    
    // Test mobile (<768px)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500); // Attendre le reflow
    
    // Vérifier que les cartes mobiles sont visibles
    const mobileCards = page.locator('.md\\:hidden').first();
    await expect(mobileCards).toBeVisible();
    
    console.log('✅ Affichage responsive vérifié');
  });

  test('should not show pagination controls', async ({ page }) => {
    // Vérifier sur les idées
    await page.click('[value="ideas"]');
    await page.waitForSelector('[data-testid^="button-view-idea"]', { timeout: 5000 });
    
    // Vérifier qu'il n'y a pas de boutons de pagination
    const nextButton = page.locator('[data-testid="button-next-page"]');
    const prevButton = page.locator('[data-testid="button-prev-page"]');
    
    await expect(nextButton).toHaveCount(0);
    await expect(prevButton).toHaveCount(0);
    
    // Vérifier sur les événements
    await page.click('[value="events"]');
    await page.waitForSelector('[data-testid^="button-view-event"]', { timeout: 5000 });
    
    await expect(nextButton).toHaveCount(0);
    await expect(prevButton).toHaveCount(0);
    
    console.log('✅ Pas de pagination - tous les éléments sur une seule page');
  });

  test('should verify table format with all columns', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1024, height: 768 });
    
    // Vérifier les colonnes du tableau des idées
    await page.click('[value="ideas"]');
    await page.waitForSelector('table', { timeout: 5000 });
    
    const ideaHeaders = await page.locator('table thead th').allTextContents();
    expect(ideaHeaders).toContain('Titre');
    expect(ideaHeaders).toContain('Auteur');
    expect(ideaHeaders).toContain('Statut');
    expect(ideaHeaders).toContain('Votants');
    expect(ideaHeaders).toContain('Date');
    expect(ideaHeaders).toContain('Actions');
    
    // Vérifier les colonnes du tableau des événements
    await page.click('[value="events"]');
    await page.waitForSelector('table', { timeout: 5000 });
    
    const eventHeaders = await page.locator('table thead th').allTextContents();
    expect(eventHeaders).toContain('Titre');
    expect(eventHeaders).toContain('Date');
    expect(eventHeaders).toContain('Lieu');
    expect(eventHeaders).toContain('HelloAsso');
    
    console.log('✅ Format tableau vérifié avec toutes les colonnes');
  });
});
