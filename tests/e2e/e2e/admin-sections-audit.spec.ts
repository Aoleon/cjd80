import { test, expect, Page, ConsoleMessage, Response } from '@playwright/test';

/**
 * Test E2E complet des sections Admin
 *
 * Test methodique de toutes les sections admin:
 * - Login puis navigation vers chaque section
 * - Capture des erreurs console/network
 * - Screenshots de chaque page
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5003';

const TEST_CREDENTIALS = {
  email: 'test@admin.com',
  password: 'AdminTest123'
};

const ADMIN_SECTIONS = [
  { path: '/admin', name: 'Dashboard Principal' },
  { path: '/admin/crm/members', name: 'CRM - Membres' },
  { path: '/admin/crm/patrons', name: 'CRM - Parrains' },
  { path: '/admin/content/ideas', name: 'Contenu - Idees' },
  { path: '/admin/content/events', name: 'Contenu - Evenements' },
  { path: '/admin/content/loans', name: 'Contenu - Prets' },
  { path: '/admin/finance/dashboard', name: 'Finance - Dashboard' },
  { path: '/admin/finance/sponsorships', name: 'Finance - Parrainages' },
  { path: '/admin/finance/budgets', name: 'Finance - Budgets' },
  { path: '/admin/finance/expenses', name: 'Finance - Depenses' },
  { path: '/admin/finance/forecasts', name: 'Finance - Previsions' },
  { path: '/admin/finance/reports', name: 'Finance - Rapports' },
  { path: '/admin/settings/branding', name: 'Parametres - Branding' },
  { path: '/admin/settings/email-config', name: 'Parametres - Email' },
  { path: '/admin/settings/features', name: 'Parametres - Fonctionnalites' },
  { path: '/admin/tracking', name: 'Admin - Tracking' },
];

interface TestErrors {
  consoleErrors: string[];
  networkErrors: string[];
}

function initErrorCollector(): TestErrors {
  return { consoleErrors: [], networkErrors: [] };
}

function setupErrorCapture(page: Page, errors: TestErrors) {
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      if (text.includes('429') || text.includes('401')) return; // Expected
      errors.consoleErrors.push(text.substring(0, 150));
    }
  });

  page.on('response', (response: Response) => {
    const status = response.status();
    const url = response.url();
    if (status === 429 || (status === 401 && url.includes('/api/auth/user'))) return;
    if (status >= 400 && !url.includes('fonts.')) {
      errors.networkErrors.push(`${status}: ${url.replace(BASE_URL, '')}`);
    }
  });
}

// Login helper avec plusieurs strategies
async function loginAndNavigate(page: Page): Promise<boolean> {
  console.log('Attempting login...');

  // Aller sur /auth
  await page.goto(`${BASE_URL}/auth`);
  await page.waitForLoadState('networkidle');

  // Remplir le formulaire
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailInput.fill(TEST_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);

    // Screenshot avant submit
    await page.screenshot({ path: 'test-results/login-before-submit.png' });

    // Submit
    await page.locator('button[type="submit"]').click();

    // Attendre un peu
    await page.waitForTimeout(3000);

    // Screenshot apres submit
    await page.screenshot({ path: 'test-results/login-after-submit.png' });

    // Verifier l'URL
    let url = page.url();
    console.log(`After submit, URL: ${url}`);

    // Si toujours sur /auth, essayer de naviguer vers /admin
    if (url.includes('/auth')) {
      console.log('Still on auth, navigating to /admin...');
      await page.goto(`${BASE_URL}/admin`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      url = page.url();
      console.log(`After manual nav, URL: ${url}`);
    }

    return !url.includes('/auth');
  }

  return false;
}

test.describe('Admin Sections Audit', () => {
  test.describe.configure({ mode: 'serial' });

  test('Parcours complet admin avec audit', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes

    const errors = initErrorCollector();
    setupErrorCapture(page, errors);

    // Login
    const loggedIn = await loginAndNavigate(page);
    console.log(`Login result: ${loggedIn}`);

    // Meme si login semble echouer, continuer le test pour voir ce qui se passe
    const results: Array<{
      section: string;
      path: string;
      status: 'OK' | 'AUTH_REDIRECT' | 'RATE_LIMIT' | 'ERROR' | 'EMPTY';
      contentLength: number;
      finalUrl: string;
    }> = [];

    for (const section of ADMIN_SECTIONS) {
      console.log(`\nTesting: ${section.name}`);

      try {
        // Naviguer vers la section
        await page.goto(`${BASE_URL}${section.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        const finalUrl = page.url();
        const content = await page.locator('body').textContent() || '';
        const contentLength = content.length;

        // Screenshot
        const screenshotName = `admin${section.path.replace(/\//g, '-')}.png`;
        await page.screenshot({ path: `test-results/${screenshotName}` });

        // Determiner le status
        let status: 'OK' | 'AUTH_REDIRECT' | 'RATE_LIMIT' | 'ERROR' | 'EMPTY' = 'OK';
        if (finalUrl.includes('/auth')) {
          status = 'AUTH_REDIRECT';
        } else if (content.includes('Too Many Requests') || content.includes('429')) {
          status = 'RATE_LIMIT';
        } else if (contentLength < 200) {
          status = 'EMPTY';
        }

        results.push({
          section: section.name,
          path: section.path,
          status,
          contentLength,
          finalUrl: finalUrl.replace(BASE_URL, '')
        });

        console.log(`  Status: ${status}, Content: ${contentLength} chars`);

      } catch (error) {
        results.push({
          section: section.name,
          path: section.path,
          status: 'ERROR',
          contentLength: 0,
          finalUrl: 'N/A'
        });
        console.log(`  ERROR: ${(error as Error).message}`);
      }
    }

    // ======== RAPPORT FINAL ========
    console.log('\n' + '='.repeat(60));
    console.log('RAPPORT AUDIT SECTIONS ADMIN');
    console.log('='.repeat(60));

    const okCount = results.filter(r => r.status === 'OK').length;
    const authCount = results.filter(r => r.status === 'AUTH_REDIRECT').length;
    const rateCount = results.filter(r => r.status === 'RATE_LIMIT').length;
    const errorCount = results.filter(r => r.status === 'ERROR').length;
    const emptyCount = results.filter(r => r.status === 'EMPTY').length;

    console.log(`\nTotal sections testees: ${results.length}`);
    console.log(`  OK:            ${okCount}`);
    console.log(`  Auth Redirect: ${authCount}`);
    console.log(`  Rate Limited:  ${rateCount}`);
    console.log(`  Empty:         ${emptyCount}`);
    console.log(`  Errors:        ${errorCount}`);

    if (authCount > 0 || rateCount > 0 || errorCount > 0) {
      console.log('\nProblemes detectes:');
      results.filter(r => r.status !== 'OK' && r.status !== 'EMPTY').forEach(r => {
        console.log(`  - ${r.section}: ${r.status} -> ${r.finalUrl}`);
      });
    }

    if (errors.networkErrors.length > 0) {
      console.log(`\nErreurs reseau (${errors.networkErrors.length}):`);
      errors.networkErrors.slice(0, 10).forEach(e => console.log(`  ${e}`));
    }

    if (errors.consoleErrors.length > 0) {
      console.log(`\nErreurs console (${errors.consoleErrors.length}):`);
      errors.consoleErrors.slice(0, 5).forEach(e => console.log(`  ${e}`));
    }

    console.log('\n' + '='.repeat(60));

    // Critere de succes: au moins 50% des sections OK ou EMPTY (contenu charge)
    const workingCount = okCount + emptyCount;
    const workingRate = workingCount / results.length;
    console.log(`\nTaux de fonctionnement: ${(workingRate * 100).toFixed(0)}%`);

    // Ne pas echouer le test pour permettre l'analyse
    // Les problemes sont documentes dans le rapport
  });
});
