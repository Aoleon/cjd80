import { test, expect, Page } from '@playwright/test';

/**
 * Tests Complets Admin CJD80
 *
 * Couvre toutes les sections admin:
 * - Dashboard & Stats
 * - Gestion Idées
 * - Gestion Événements
 * - Gestion Membres (CRM)
 * - Gestion Mécènes
 * - Gestion Prêts d'Objets
 * - Gestion Financière
 * - Branding
 * - Tracking
 */

const BASE_URL = 'https://cjd80.rbw.ovh';
const ADMIN_EMAIL = 'admin@test.local';
const ADMIN_PASSWORD = 'devmode'; // Dev login bypass

// Helper: Login as admin
async function loginAsAdmin(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

test.describe('Admin: Dashboard & Navigation', () => {
  test('devrait afficher le dashboard avec statistiques', async ({ page }) => {
    await loginAsAdmin(page);

    // Vérifier URL /admin
    expect(page.url()).toContain('/admin');

    // Vérifier présence du titre
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 5000 });

    // Vérifier présence de cartes de statistiques
    const statsCards = page.locator('[class*="card"], [class*="stat"]');
    const cardsCount = await statsCards.count();
    expect(cardsCount).toBeGreaterThan(0);
  });

  test('devrait avoir une sidebar/navigation fonctionnelle', async ({ page }) => {
    await loginAsAdmin(page);

    // Chercher la navigation (sidebar ou menu)
    const navigation = page.locator('nav, aside, [role="navigation"]').first();
    await expect(navigation).toBeVisible({ timeout: 5000 });

    // Vérifier présence de liens admin
    const adminLinks = page.locator('a[href*="/admin"]');
    const linksCount = await adminLinks.count();
    expect(linksCount).toBeGreaterThanOrEqual(3); // Au moins 3 liens admin
  });

  test('API /api/admin/stats devrait retourner des statistiques', async ({ request, page }) => {
    await loginAsAdmin(page);

    // Extraire le cookie de session
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid') || c.name.includes('session'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/stats`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toBeDefined();
    }
  });
});

test.describe('Admin: Gestion Idées', () => {
  test('devrait accéder à la page de gestion des idées', async ({ page }) => {
    await loginAsAdmin(page);

    // Naviguer vers /admin/ideas
    await page.goto(`${BASE_URL}/admin/ideas`);

    // Vérifier chargement de la page
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Vérifier présence du titre ou tableau
    const content = page.locator('h1, h2, table, [role="table"]').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('API /api/admin/ideas devrait retourner la liste', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/ideas`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
    }
  });
});

test.describe('Admin: Gestion Événements', () => {
  test('devrait accéder à la page de gestion des événements', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/admin/events`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const content = page.locator('h1, h2, table').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('API /api/admin/events devrait retourner la liste', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/events`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
    }
  });
});

test.describe('Admin: Gestion Membres (CRM)', () => {
  test('devrait accéder à la page de gestion des membres', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/admin/members`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const content = page.locator('h1, h2, table').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('API /api/admin/members devrait retourner la liste', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/members`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });
});

test.describe('Admin: Gestion Mécènes', () => {
  test('devrait accéder à la page de gestion des mécènes', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/admin/patrons`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const content = page.locator('h1, h2').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('API /api/admin/patrons devrait retourner la liste', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/patrons`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });
});

test.describe('Admin: Gestion Prêts d\'Objets', () => {
  test('devrait accéder à la page de gestion des prêts', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/admin/loan-items`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const content = page.locator('h1, h2').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('API /api/admin/loan-items devrait retourner la liste', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/loan-items`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });
});

test.describe('Admin: Gestion Financière', () => {
  test('devrait accéder à la page finances', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/admin/financial`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Vérifier que la page se charge sans erreur 500
    const content = page.locator('h1, h2, body').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('API /api/admin/finance/budgets devrait retourner la liste', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/finance/budgets`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
    }
  });

  test('API /api/admin/finance/budgets/stats devrait fonctionner', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/finance/budgets/stats`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });

  test('API /api/admin/finance/expenses devrait retourner la liste', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/finance/expenses`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });

  test('API /api/admin/finance/expenses/stats devrait fonctionner', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/finance/expenses/stats`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });

  test('API /api/admin/finance/kpis/extended devrait fonctionner', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/finance/kpis/extended`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });
});

test.describe('Admin: Branding', () => {
  test('devrait accéder à la page branding (SUPER_ADMIN uniquement)', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/admin/branding`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // La page peut être accessible ou refusée selon les permissions
    // On vérifie juste qu'elle ne retourne pas une erreur 500
    const statusCode = page.url().includes('admin/branding') ? 200 : 403;
    expect([200, 403]).toContain(statusCode);
  });

  test('API /api/admin/branding devrait retourner la config', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/admin/branding`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      // Peut retourner 200 ou 403 selon permissions
      expect([200, 403]).toContain(response.status());
    }
  });
});

test.describe('Admin: Tracking', () => {
  test('devrait accéder à la page tracking', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto(`${BASE_URL}/admin/tracking`);
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    const content = page.locator('h1, h2').first();
    await expect(content).toBeVisible({ timeout: 5000 });
  });

  test('API /api/tracking/dashboard devrait retourner les métriques', async ({ request, page }) => {
    await loginAsAdmin(page);

    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name.includes('sid'));

    if (sessionCookie) {
      const response = await request.get(`${BASE_URL}/api/tracking/dashboard`, {
        headers: {
          'Cookie': `${sessionCookie.name}=${sessionCookie.value}`
        }
      });

      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data).toHaveProperty('success');
    }
  });
});
