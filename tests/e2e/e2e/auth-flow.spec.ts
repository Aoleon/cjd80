import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show admin login form when not authenticated', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should show login form or redirect to auth page
    const hasLoginForm = await page.locator('input[type="email"]').isVisible().catch(() => false);
    const hasPasswordInput = await page.locator('input[type="password"]').isVisible().catch(() => false);
    
    // At least one auth-related element should be visible
    expect(hasLoginForm || hasPasswordInput).toBeTruthy();
  });
  
  test('should allow authenticated admin to access admin panel', async ({ page }) => {
    // Mock authenticated admin user
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    });
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should show admin interface
    await expect(page.locator('text=Administration')).toBeVisible({ timeout: 5000 });
  });
  
  test('should deny access to super_admin routes for regular admin', async ({ page }) => {
    // Mock regular ADMIN (not super_admin)
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    });
    
    await page.goto('/admin/branding');
    await page.waitForLoadState('networkidle');
    
    // Should show access denied
    await expect(page.locator('text=Accès refusé')).toBeVisible({ timeout: 3000 });
  });

  test('should allow super_admin access to branding page', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'superadmin',
        email: 'superadmin@test.com',
        role: 'super_admin'
      }));
    });
    
    await page.goto('/admin/branding');
    await page.waitForLoadState('networkidle');
    
    // Should show branding page
    await expect(page.locator('text=Personnalisation du branding')).toBeVisible({ timeout: 5000 });
  });

  test('should allow super_admin access to patrons page', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'superadmin',
        email: 'superadmin@test.com',
        role: 'super_admin'
      }));
    });
    
    // Mock the API response
    await page.route('/api/patrons*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          total: 0,
          page: 1,
          limit: 20
        })
      });
    });

    await page.goto('/admin/patrons');
    await page.waitForLoadState('networkidle');
    
    // Should show patrons page
    await expect(page.locator('text=Mécènes')).toBeVisible({ timeout: 5000 });
  });

  test('should deny regular admin access to patrons page', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    });
    
    await page.goto('/admin/patrons');
    await page.waitForLoadState('networkidle');
    
    // Should show access denied
    await expect(page.locator('text=Accès refusé')).toBeVisible({ timeout: 3000 });
  });

  test('should allow any authenticated admin to access members page', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    });
    
    // Mock the API response
    await page.route('/api/members*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          total: 0,
          page: 1,
          limit: 20
        })
      });
    });

    await page.goto('/admin/members');
    await page.waitForLoadState('networkidle');
    
    // Should show members page
    await expect(page.locator('text=Membres')).toBeVisible({ timeout: 5000 });
  });

  test('should maintain session across page navigation', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    });
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Navigate to different admin section
    await page.goto('/admin/members');
    await page.waitForLoadState('networkidle');
    
    // Mock the API
    await page.route('/api/members*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          total: 0,
          page: 1,
          limit: 20
        })
      });
    });
    
    // Should still be authenticated
    await expect(page.locator('text=Membres')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('API Authentication', () => {
  test('should return 401 for unauthenticated API requests', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    
    // Try to access protected API endpoint
    const response = await page.request.get('/api/admin/ideas');
    
    // Should return 401 Unauthorized or redirect
    expect([401, 403, 302]).toContain(response.status());
  });
});
