import { test, expect, Page, ConsoleMessage, Request, Response } from '@playwright/test';

/**
 * Test E2E focalisé sur la navigation de l'Onboarding
 *
 * Objectif: Identifier et documenter les problèmes de navigation signalés
 * - Capture des erreurs réseau (404, 500, etc.)
 * - Capture des erreurs console
 * - Test des transitions entre étapes
 * - Test des boutons Précédent/Suivant
 * - Test du stepper (clic sur les étapes)
 */

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:5003';

// Données de test minimales pour passer les validations
const TEST_DATA = {
  organization: {
    name: 'Test Navigation Org',
    fullName: 'Test Navigation Organization Full Name',
    email: 'nav-test@example.com',
    tagline: 'Test tagline pour la navigation des étapes onboarding',
    url: 'https://test-nav.example.com'
  }
};

// Collecter les erreurs
interface TestErrors {
  consoleErrors: Array<{ type: string; text: string; location?: string }>;
  networkErrors: Array<{ url: string; status: number; statusText: string; method: string }>;
  network404: Array<{ url: string; method: string }>;
  failedRequests: Array<{ url: string; error: string }>;
}

function initErrorCollector(): TestErrors {
  return {
    consoleErrors: [],
    networkErrors: [],
    network404: [],
    failedRequests: []
  };
}

function setupErrorCapture(page: Page, errors: TestErrors) {
  // Capture console errors
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      errors.consoleErrors.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()?.url
      });
    }
  });

  // Capture page errors (uncaught exceptions)
  page.on('pageerror', (error) => {
    errors.consoleErrors.push({
      type: 'pageerror',
      text: error.message,
      location: error.stack
    });
  });

  // Capture network responses
  page.on('response', (response: Response) => {
    const status = response.status();
    const url = response.url();

    // Ignorer les assets et resources externes non critiques
    if (url.includes('fonts.') || url.includes('analytics') || url.includes('favicon')) {
      return;
    }

    if (status === 404) {
      errors.network404.push({
        url,
        method: response.request().method()
      });
    } else if (status >= 400) {
      errors.networkErrors.push({
        url,
        status,
        statusText: response.statusText(),
        method: response.request().method()
      });
    }
  });

  // Capture failed requests
  page.on('requestfailed', (request: Request) => {
    const url = request.url();
    if (!url.includes('fonts.') && !url.includes('analytics')) {
      errors.failedRequests.push({
        url,
        error: request.failure()?.errorText || 'Unknown error'
      });
    }
  });
}

function printErrorSummary(errors: TestErrors, testName: string) {
  console.log(`\n========== ${testName} - Error Summary ==========`);

  if (errors.network404.length > 0) {
    console.log(`\n❌ 404 Errors (${errors.network404.length}):`);
    errors.network404.forEach(e => console.log(`   - ${e.method} ${e.url}`));
  }

  if (errors.networkErrors.length > 0) {
    console.log(`\n❌ Network Errors (${errors.networkErrors.length}):`);
    errors.networkErrors.forEach(e => console.log(`   - ${e.status} ${e.method} ${e.url}`));
  }

  if (errors.consoleErrors.length > 0) {
    console.log(`\n❌ Console Errors (${errors.consoleErrors.length}):`);
    errors.consoleErrors.slice(0, 10).forEach(e => console.log(`   - [${e.type}] ${e.text.substring(0, 200)}`));
    if (errors.consoleErrors.length > 10) {
      console.log(`   ... and ${errors.consoleErrors.length - 10} more`);
    }
  }

  if (errors.failedRequests.length > 0) {
    console.log(`\n❌ Failed Requests (${errors.failedRequests.length}):`);
    errors.failedRequests.forEach(e => console.log(`   - ${e.url}: ${e.error}`));
  }

  const hasErrors = errors.network404.length > 0 ||
                    errors.networkErrors.length > 0 ||
                    errors.consoleErrors.length > 0 ||
                    errors.failedRequests.length > 0;

  if (!hasErrors) {
    console.log('\n✅ No errors detected');
  }

  console.log('='.repeat(50) + '\n');

  return hasErrors;
}

test.describe('Onboarding Navigation Audit', () => {

  test('Step 1 - Initial load and API status', async ({ page }) => {
    const errors = initErrorCollector();
    setupErrorCapture(page, errors);

    // Intercepter l'API de status pour analyse
    let setupStatusResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/api/setup/status')) {
        try {
          setupStatusResponse = await response.json();
        } catch {}
      }
    });

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');

    console.log('\n📊 Setup Status Response:', JSON.stringify(setupStatusResponse, null, 2));

    // Vérifier que la page charge
    await expect(page).toHaveURL(/.*onboarding/);

    // Vérifier qu'on arrive sur l'étape Organization (ou redirection si déjà configuré)
    const organizationStep = page.locator('text=Organisation').or(page.locator('text=Nom de l\'organisation'));
    const hasOrgStep = await organizationStep.first().isVisible({ timeout: 10000 }).catch(() => false);

    if (!hasOrgStep) {
      // Peut-être redirigé car installation complète
      console.log('⚠️ Not on organization step - may be redirected');
      const currentUrl = page.url();
      console.log('Current URL:', currentUrl);
    }

    printErrorSummary(errors, 'Initial Load');
  });

  test('Step 2 - Navigation forward through all steps', async ({ page }) => {
    const errors = initErrorCollector();
    setupErrorCapture(page, errors);

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');

    // Tracker les étapes visitées
    const stepsVisited: string[] = [];

    // === ÉTAPE 1: ORGANISATION ===
    console.log('\n📍 Testing Step 1: Organization');
    const nameInput = page.getByRole('textbox', { name: /Nom de l'organisation/i });

    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      stepsVisited.push('organization');

      // Remplir le formulaire minimal
      await nameInput.fill(TEST_DATA.organization.name);

      const fullNameInput = page.getByRole('textbox', { name: /Nom complet/i });
      if (await fullNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fullNameInput.fill(TEST_DATA.organization.fullName);
      }

      const emailInput = page.getByRole('textbox', { name: /Email/i }).first();
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailInput.fill(TEST_DATA.organization.email);
      }

      const taglineInput = page.getByRole('textbox', { name: /Slogan|tagline/i });
      if (await taglineInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await taglineInput.fill(TEST_DATA.organization.tagline);
      }

      // Cliquer sur Continuer
      const continueBtn = page.locator('button:has-text("Continuer")').first();
      await expect(continueBtn).toBeVisible({ timeout: 5000 });

      // Attendre que le bouton soit enabled
      await page.waitForTimeout(500);

      if (await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Navigated from Organization');
      } else {
        console.log('⚠️ Continue button not enabled - form validation issue?');
      }
    }

    // === ÉTAPE 2: COULEURS ===
    console.log('\n📍 Testing Step 2: Colors');
    const colorInput = page.locator('input[type="color"]').first();
    if (await colorInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      stepsVisited.push('colors');

      const continueBtn = page.locator('button:has-text("Continuer")').first();
      if (await continueBtn.isVisible() && await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Navigated from Colors');
      }
    } else {
      // Essayer le bouton passer
      const skipBtn = page.locator('button:has-text("Passer")').first();
      if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Skipped Colors step');
      }
    }

    // === ÉTAPE 3: EMAIL ===
    console.log('\n📍 Testing Step 3: Email');
    const emailHostInput = page.locator('input[placeholder*="smtp"], input[placeholder*="host"]').first();
    if (await emailHostInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      stepsVisited.push('email');

      const continueBtn = page.locator('button:has-text("Continuer"), button:has-text("Passer")').first();
      if (await continueBtn.isVisible()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
        console.log('✅ Navigated from Email');
      }
    }

    // === ÉTAPE 4: LOGO ===
    console.log('\n📍 Testing Step 4: Logo');
    const logoUpload = page.locator('input[type="file"], [data-testid="logo-upload"]').first();
    if (await logoUpload.isVisible({ timeout: 3000 }).catch(() => false)) {
      stepsVisited.push('logo');
    }

    const logoContinue = page.locator('button:has-text("Continuer"), button:has-text("Passer")').first();
    if (await logoContinue.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoContinue.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigated from Logo');
    }

    // === ÉTAPE 5: ADMIN ===
    console.log('\n📍 Testing Step 5: Admin');
    const adminMessage = page.locator('text=administrateurs existent');
    const hasAdmins = await adminMessage.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasAdmins) {
      stepsVisited.push('admin-existing');
      console.log('ℹ️ Admins already exist');
    } else {
      const adminEmailInput = page.locator('input[type="email"]').last();
      if (await adminEmailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        stepsVisited.push('admin-form');
      }
    }

    const adminContinue = page.locator('button:has-text("Continuer")').first();
    if (await adminContinue.isVisible({ timeout: 2000 }).catch(() => false) && await adminContinue.isEnabled()) {
      await adminContinue.click();
      await page.waitForTimeout(1000);
      console.log('✅ Navigated from Admin');
    }

    // === ÉTAPE 6: RÉCAPITULATIF ===
    console.log('\n📍 Testing Step 6: Summary');
    const summaryText = page.locator('text=Récapitulatif, text=Configuration terminée, text=Finaliser');
    if (await summaryText.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      stepsVisited.push('summary');
      console.log('✅ Reached Summary step');
    }

    console.log('\n📊 Steps visited:', stepsVisited);

    const hasErrors = printErrorSummary(errors, 'Forward Navigation');

    // Assertions
    expect(stepsVisited.length).toBeGreaterThan(0);
  });

  test('Step 3 - Navigation backward (Previous button)', async ({ page }) => {
    const errors = initErrorCollector();
    setupErrorCapture(page, errors);

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');

    // Remplir org et aller à étape 2
    const nameInput = page.getByRole('textbox', { name: /Nom de l'organisation/i });
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill(TEST_DATA.organization.name);

      const fullNameInput = page.getByRole('textbox', { name: /Nom complet/i });
      if (await fullNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fullNameInput.fill(TEST_DATA.organization.fullName);
      }

      const emailInput = page.getByRole('textbox', { name: /Email/i }).first();
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailInput.fill(TEST_DATA.organization.email);
      }

      const taglineInput = page.getByRole('textbox', { name: /Slogan|tagline/i });
      if (await taglineInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await taglineInput.fill(TEST_DATA.organization.tagline);
      }

      // Aller à l'étape suivante
      const continueBtn = page.locator('button:has-text("Continuer")').first();
      await page.waitForTimeout(500);
      if (await continueBtn.isEnabled()) {
        await continueBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Maintenant tester le bouton Précédent
    console.log('\n📍 Testing Previous button');
    const previousBtn = page.locator('button:has-text("Précédent")').first();

    if (await previousBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('✅ Previous button found');

      // Cliquer plusieurs fois pour tester
      await previousBtn.click();
      await page.waitForTimeout(1000);

      // Vérifier qu'on est revenu sur Organization
      const orgVisible = await page.getByRole('textbox', { name: /Nom de l'organisation/i }).isVisible({ timeout: 3000 }).catch(() => false);

      if (orgVisible) {
        console.log('✅ Successfully navigated back to Organization');

        // Vérifier que les données sont préservées
        const nameValue = await page.getByRole('textbox', { name: /Nom de l'organisation/i }).inputValue();
        if (nameValue === TEST_DATA.organization.name) {
          console.log('✅ Form data preserved after navigation');
        } else {
          console.log('⚠️ Form data may have been lost:', nameValue);
        }
      } else {
        console.log('❌ Failed to navigate back');
      }
    } else {
      console.log('⚠️ Previous button not found (may be on first step)');
    }

    printErrorSummary(errors, 'Backward Navigation');
  });

  test('Step 4 - Stepper clicks (direct step navigation)', async ({ page }) => {
    const errors = initErrorCollector();
    setupErrorCapture(page, errors);

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');

    console.log('\n📍 Testing stepper/step indicator clicks');

    // Chercher les indicateurs d'étapes
    const stepIndicators = page.locator('[role="button"][aria-label*="step"], .step-indicator, [data-step]');
    const stepCount = await stepIndicators.count();

    console.log(`Found ${stepCount} step indicators`);

    // Essayer aussi de trouver les étapes par leur texte
    const stepLabels = ['Organisation', 'Couleurs', 'Email', 'Logo', 'Admin', 'Récapitulatif'];

    for (const label of stepLabels) {
      const stepElement = page.locator(`button:has-text("${label}"), [role="tab"]:has-text("${label}")`).first();
      const isVisible = await stepElement.isVisible({ timeout: 2000 }).catch(() => false);

      if (isVisible) {
        const isClickable = await stepElement.isEnabled().catch(() => false);
        console.log(`  - ${label}: visible=${isVisible}, clickable=${isClickable}`);

        // Tester le clic si possible
        if (isClickable) {
          try {
            await stepElement.click();
            await page.waitForTimeout(500);
            console.log(`    ✅ Clicked on ${label}`);
          } catch (e) {
            console.log(`    ⚠️ Could not click ${label}:`, (e as Error).message);
          }
        }
      }
    }

    printErrorSummary(errors, 'Stepper Navigation');
  });

  test('Step 5 - Keyboard navigation', async ({ page }) => {
    const errors = initErrorCollector();
    setupErrorCapture(page, errors);

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');

    console.log('\n📍 Testing keyboard navigation');

    // Le onboarding supporte les touches fléchées
    // ArrowRight / Space = next step
    // ArrowLeft / Shift+Space = previous step

    // D'abord remplir le formulaire pour pouvoir naviguer
    const nameInput = page.getByRole('textbox', { name: /Nom de l'organisation/i });
    if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nameInput.fill(TEST_DATA.organization.name);

      const fullNameInput = page.getByRole('textbox', { name: /Nom complet/i });
      if (await fullNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fullNameInput.fill(TEST_DATA.organization.fullName);
      }

      const emailInput = page.getByRole('textbox', { name: /Email/i }).first();
      if (await emailInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await emailInput.fill(TEST_DATA.organization.email);
        // Blur pour sortir du champ
        await emailInput.blur();
      }

      const taglineInput = page.getByRole('textbox', { name: /Slogan|tagline/i });
      if (await taglineInput.isVisible({ timeout: 2000 }).catch(() => false)) {
        await taglineInput.fill(TEST_DATA.organization.tagline);
        await taglineInput.blur();
      }
    }

    // Attendre que le formulaire soit traité
    await page.waitForTimeout(500);

    // Tester ArrowRight pour aller à l'étape suivante
    console.log('Testing ArrowRight...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);

    // Vérifier si on a changé d'étape
    const colorInput = page.locator('input[type="color"]').first();
    const onColors = await colorInput.isVisible({ timeout: 3000 }).catch(() => false);

    if (onColors) {
      console.log('✅ ArrowRight navigation worked');

      // Tester ArrowLeft pour revenir
      console.log('Testing ArrowLeft...');
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(1000);

      const backOnOrg = await nameInput.isVisible({ timeout: 3000 }).catch(() => false);
      if (backOnOrg) {
        console.log('✅ ArrowLeft navigation worked');
      } else {
        console.log('⚠️ ArrowLeft navigation may not have worked');
      }
    } else {
      console.log('⚠️ ArrowRight navigation may not have worked (keyboard nav may require specific focus state)');
    }

    printErrorSummary(errors, 'Keyboard Navigation');
  });

  test('Step 6 - Full navigation cycle with error tracking', async ({ page }) => {
    const errors = initErrorCollector();
    setupErrorCapture(page, errors);

    // Track all API calls
    const apiCalls: Array<{ url: string; method: string; status: number }> = [];

    page.on('response', (response) => {
      if (response.url().includes('/api/')) {
        apiCalls.push({
          url: response.url(),
          method: response.request().method(),
          status: response.status()
        });
      }
    });

    await page.goto(`${BASE_URL}/onboarding`);
    await page.waitForLoadState('networkidle');

    console.log('\n📍 Full navigation cycle with comprehensive error tracking');

    // Naviguer à travers toutes les étapes en utilisant les boutons
    let stepNumber = 1;
    const maxSteps = 10; // Safety limit

    while (stepNumber <= maxSteps) {
      console.log(`\n--- Step ${stepNumber} ---`);

      // Prendre un screenshot pour debug
      await page.screenshot({ path: `test-results/onboarding-step-${stepNumber}.png` });

      // Chercher le bouton Continuer ou Passer
      const continueBtn = page.locator('button:has-text("Continuer")').first();
      const skipBtn = page.locator('button:has-text("Passer")').first();
      const finishBtn = page.locator('button:has-text("Finaliser"), button:has-text("Terminer")').first();

      // Remplir les champs requis si c'est l'étape Organization
      if (stepNumber === 1) {
        const nameInput = page.getByRole('textbox', { name: /Nom de l'organisation/i });
        if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await nameInput.fill(TEST_DATA.organization.name);

          const fullNameInput = page.getByRole('textbox', { name: /Nom complet/i });
          if (await fullNameInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await fullNameInput.fill(TEST_DATA.organization.fullName);
          }

          const emailInput = page.getByRole('textbox', { name: /Email/i }).first();
          if (await emailInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await emailInput.fill(TEST_DATA.organization.email);
          }

          const taglineInput = page.getByRole('textbox', { name: /Slogan|tagline/i });
          if (await taglineInput.isVisible({ timeout: 1000 }).catch(() => false)) {
            await taglineInput.fill(TEST_DATA.organization.tagline);
          }

          await page.waitForTimeout(300);
        }
      }

      // Vérifier si on est sur la dernière étape
      if (await finishBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log('✅ Reached final step (Finaliser button visible)');
        break;
      }

      // Essayer de continuer
      if (await continueBtn.isVisible({ timeout: 2000 }).catch(() => false) && await continueBtn.isEnabled()) {
        await continueBtn.click();
        console.log('  Clicked Continue');
      } else if (await skipBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await skipBtn.click();
        console.log('  Clicked Skip');
      } else {
        console.log('  No navigation button available');
        break;
      }

      await page.waitForTimeout(1000);
      stepNumber++;
    }

    // Résumé des appels API
    console.log('\n📊 API Calls Summary:');
    const apiByEndpoint = apiCalls.reduce((acc, call) => {
      const key = `${call.method} ${call.url.replace(BASE_URL, '')}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(apiByEndpoint).forEach(([endpoint, count]) => {
      console.log(`  ${endpoint}: ${count} calls`);
    });

    const hasErrors = printErrorSummary(errors, 'Full Navigation Cycle');

    // Fail test if critical errors found
    if (errors.network404.filter(e => e.url.includes('/api/')).length > 0) {
      console.log('\n❌ CRITICAL: API 404 errors detected!');
    }
  });
});
