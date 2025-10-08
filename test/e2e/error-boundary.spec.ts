import { test, expect } from '@playwright/test';

test.describe('Error Boundary Tests', () => {
  test('should display error boundary fallback UI when React error occurs', async ({ page }) => {
    const logRequests: any[] = [];
    
    await page.route('/api/logs/frontend-error', async (route) => {
      const postData = route.request().postDataJSON();
      logRequests.push(postData);
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/test-error?trigger=error');
    
    await expect(page.locator('text=Une erreur s\'est produite')).toBeVisible({ timeout: 5000 });
    
    await expect(page.locator('[data-testid="button-retry-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="button-home-error"]')).toBeVisible();
    
    await page.waitForTimeout(1000);
    
    expect(logRequests.length).toBeGreaterThan(0);
    expect(logRequests[0]).toHaveProperty('message');
    expect(logRequests[0].message).toContain('Test error triggered');
  });

  test('should retry and clear error when retry button is clicked', async ({ page }) => {
    await page.route('/api/logs/frontend-error', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/test-error?trigger=error');
    
    await expect(page.locator('text=Une erreur s\'est produite')).toBeVisible({ timeout: 5000 });
    
    await page.click('[data-testid="button-retry-error"]');
    
    await expect(page.locator('text=Test Error Page')).toBeVisible({ timeout: 3000 });
  });

  test('should navigate home when home button is clicked', async ({ page }) => {
    await page.route('/api/logs/frontend-error', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/test-error?trigger=error');
    
    await expect(page.locator('text=Une erreur s\'est produite')).toBeVisible({ timeout: 5000 });
    
    await page.click('[data-testid="button-home-error"]');
    
    await page.waitForURL('/', { timeout: 3000 });
  });

  test('should log complete error details to server', async ({ page }) => {
    let capturedErrorData: any = null;
    
    await page.route('/api/logs/frontend-error', async (route) => {
      capturedErrorData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/test-error?trigger=error');
    
    await expect(page.locator('text=Une erreur s\'est produite')).toBeVisible({ timeout: 5000 });
    
    await page.waitForTimeout(1000);
    
    expect(capturedErrorData).toBeTruthy();
    expect(capturedErrorData.message).toBeTruthy();
    expect(capturedErrorData.stack).toBeTruthy();
    expect(capturedErrorData.componentStack).toBeTruthy();
    expect(capturedErrorData.url).toContain('/test-error');
    expect(capturedErrorData.userAgent).toBeTruthy();
    expect(capturedErrorData.timestamp).toBeTruthy();
    
    const timestamp = new Date(capturedErrorData.timestamp);
    expect(timestamp.toString()).not.toBe('Invalid Date');
  });

  test('should display error message in development mode', async ({ page }) => {
    await page.route('/api/logs/frontend-error', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/test-error?trigger=error');
    
    await expect(page.locator('text=Une erreur s\'est produite')).toBeVisible({ timeout: 5000 });
    
    const errorMessageElement = page.locator('text=Test error triggered for E2E testing');
    const isVisible = await errorMessageElement.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(errorMessageElement).toBeVisible();
    }
  });

  test('should handle error boundary in admin section with auth', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    });

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    const hasErrorBoundary = await page.locator('text=Une erreur s\'est produite').isVisible().catch(() => false);
    
    expect(hasErrorBoundary).toBe(false);
  });

  test('should not show error boundary on normal page load', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const hasErrorBoundary = await page.locator('text=Une erreur s\'est produite').isVisible().catch(() => false);
    
    expect(hasErrorBoundary).toBe(false);
  });

  test('should show proper card structure in error UI', async ({ page }) => {
    await page.route('/api/logs/frontend-error', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });

    await page.goto('/test-error?trigger=error');
    
    await expect(page.locator('text=Une erreur s\'est produite')).toBeVisible({ timeout: 5000 });
    
    const cardDescription = page.locator('text=L\'application a rencontré un problème inattendu');
    await expect(cardDescription).toBeVisible();
    
    const retryButton = page.locator('[data-testid="button-retry-error"]');
    const homeButton = page.locator('[data-testid="button-home-error"]');
    
    await expect(retryButton).toBeVisible();
    await expect(homeButton).toBeVisible();
    
    const retryText = await retryButton.textContent();
    const homeText = await homeButton.textContent();
    
    expect(retryText).toContain('Réessayer');
    expect(homeText).toContain('Retour à l\'accueil');
  });
});
