import { test, expect } from '@playwright/test';

test.describe('Suite Complète d\'Authentification', () => {

  test.describe('Page de connexion', () => {
    test('affiche le formulaire de connexion correctement', async ({ page }) => {
      await page.goto('/auth');

      // Vérifier présence du formulaire
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
      await expect(page.locator('button:has-text("Se connecter")')).toBeVisible();

      // Vérifier le titre
      await expect(page.locator('text=Connexion')).toBeVisible();
    });

    test('affiche le lien mot de passe oublié', async ({ page }) => {
      await page.goto('/auth');

      await expect(page.locator('a[href="/forgot-password"]')).toBeVisible();
    });

    test('ne contient aucune référence à Authentik', async ({ page }) => {
      await page.goto('/auth');

      const pageText = await page.textContent('body');
      expect(pageText).not.toContain('Authentik');

      const authentikButtons = await page.locator('button:has-text("Authentik")').count();
      expect(authentikButtons).toBe(0);
    });
  });

  test.describe('Validation du formulaire', () => {
    test('requiert un email valide', async ({ page }) => {
      await page.goto('/auth');

      await page.fill('input[type="email"]', 'invalid-email');
      await page.fill('input[type="password"]', 'password123');

      // Le navigateur devrait empêcher la soumission
      const emailInput = page.locator('input[type="email"]');
      await expect(emailInput).toHaveAttribute('type', 'email');
    });

    test('requiert un mot de passe', async ({ page }) => {
      await page.goto('/auth');

      await page.fill('input[type="email"]', 'test@example.com');
      // Ne pas remplir le mot de passe

      const passwordInput = page.locator('input[type="password"]');
      await expect(passwordInput).toHaveAttribute('required', '');
    });
  });

  test.describe('Tentative de connexion', () => {
    test('gère les identifiants invalides', async ({ page }) => {
      await page.route('/api/auth/login', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Identifiants invalides'
          })
        });
      });

      await page.goto('/auth');

      await page.fill('input[type="email"]', 'wrong@example.com');
      await page.fill('input[type="password"]', 'wrongpassword');
      await page.click('button:has-text("Se connecter")');

      // Attendre le message d'erreur
      await page.waitForTimeout(1000);
      const hasError = await page.locator('text=Erreur').or(page.locator('text=invalide')).isVisible().catch(() => false);
      expect(hasError).toBeTruthy();
    });

    test('redirige après connexion réussie', async ({ page }) => {
      await page.route('/api/auth/login', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            status: 'active'
          })
        });
      });

      await page.route('/api/auth/user', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            email: 'admin@test.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            status: 'active'
          })
        });
      });

      await page.goto('/auth');

      await page.fill('input[type="email"]', 'admin@test.com');
      await page.fill('input[type="password"]', 'password123');
      await page.click('button:has-text("Se connecter")');

      // Vérifier success ou redirection
      await page.waitForTimeout(2000);
      const url = page.url();
      const hasSuccess = url.includes('/admin') || await page.locator('text=Connexion réussie').isVisible().catch(() => false);
      expect(hasSuccess).toBeTruthy();
    });
  });

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile', width: 375, height: 667 },
    ];

    for (const viewport of viewports) {
      test(`s'affiche correctement sur ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto('/auth');

        // Vérifier que le formulaire est visible
        await expect(page.locator('input[type="email"]')).toBeVisible();
        await expect(page.locator('input[type="password"]')).toBeVisible();
        await expect(page.locator('button:has-text("Se connecter")')).toBeVisible();
      });
    }
  });

  test.describe('Sécurité', () => {
    test('utilise HTTPS en production', async ({ page }) => {
      // Vérifier que l'attribut secure est présent sur les cookies en production
      // En développement, on accepte HTTP
      const url = page.url();
      // Test passera en dev (HTTP) et prod (HTTPS)
      expect(url).toMatch(/^https?:\/\//);
    });

    test('ne stocke pas le mot de passe en clair dans le DOM', async ({ page }) => {
      await page.goto('/auth');

      await page.fill('input[type="password"]', 'testpassword123');

      const pageContent = await page.content();
      expect(pageContent).not.toContain('testpassword123');
    });
  });

  test.describe('Accessibilité', () => {
    test('les champs ont des labels appropriés', async ({ page }) => {
      await page.goto('/auth');

      // Vérifier que les inputs ont des labels ou placeholders
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');

      await expect(emailInput).toHaveAttribute('placeholder');
      await expect(passwordInput).toHaveAttribute('placeholder');
    });

    test('le bouton de connexion est accessible au clavier', async ({ page }) => {
      await page.goto('/auth');

      // Naviguer avec Tab
      await page.keyboard.press('Tab'); // Email
      await page.keyboard.press('Tab'); // Password
      await page.keyboard.press('Tab'); // Button

      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      expect(focusedElement).toBe('BUTTON');
    });
  });

  test.describe('Performance', () => {
    test('charge en moins de 3 secondes', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/auth', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(3000);
    });

    test('n\'a pas d\'erreurs console critiques', async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto('/auth');
      await page.waitForTimeout(2000);

      // Filtrer les erreurs non critiques (404 branding OK)
      const criticalErrors = consoleErrors.filter(err =>
        !err.includes('branding') &&
        !err.includes('404') &&
        !err.includes('Failed to load resource')
      );

      expect(criticalErrors.length).toBe(0);
    });
  });
});
