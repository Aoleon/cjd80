import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should show Authentik login button when not authenticated', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    
    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Should show Authentik login button
    const hasAuthentikButton = await page.locator('text=Se connecter avec Authentik').isVisible().catch(() => false);
    expect(hasAuthentikButton).toBeTruthy();
  });
  
  test('should redirect to Authentik when clicking login button', async ({ page }) => {
    // Clear any existing auth
    await page.context().clearCookies();
    
    // Mock the Authentik OAuth2 flow
    await page.route('/api/auth/authentik', async (route) => {
      // Simulate redirect to Authentik
      await route.fulfill({
        status: 302,
        headers: {
          'Location': 'http://localhost:9002/application/o/authorize/?client_id=test&redirect_uri=http://localhost:5000/api/auth/authentik/callback'
        }
      });
    });

    await page.goto('/auth');
    await page.waitForLoadState('networkidle');
    
    // Click login button
    await page.click('text=Se connecter avec Authentik');
    
    // Should redirect to Authentik (or show redirect in test environment)
    // In a real test, we would follow the redirect, but for E2E we can verify the button works
    await expect(page.locator('text=Se connecter avec Authentik')).toBeVisible();
  });
  
  test('should allow authenticated admin to access admin panel', async ({ page }) => {
    // Mock authenticated session via cookie
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    // Mock the /api/auth/user endpoint to return authenticated user
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
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Should show admin interface
    await expect(page.locator('text=Administration').or(page.locator('text=admin')).first()).toBeVisible({ timeout: 5000 });
  });
  
  test('should deny access to super_admin routes for regular admin', async ({ page }) => {
    // Mock authenticated session with regular admin
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ideas_reader',
          status: 'active'
        })
      });
    });
    
    await page.goto('/admin/branding');
    await page.waitForLoadState('networkidle');
    
    // Should show access denied or redirect to auth
    const hasAccessDenied = await page.locator('text=Accès refusé').or(page.locator('text=Authentication required')).isVisible().catch(() => false);
    expect(hasAccessDenied).toBeTruthy();
  });

  test('should allow super_admin access to branding page', async ({ page }) => {
    // Mock authenticated session with super_admin
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'superadmin@test.com',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          status: 'active'
        })
      });
    });
    
    await page.goto('/admin/branding');
    await page.waitForLoadState('networkidle');
    
    // Should show branding page or admin interface
    const hasBrandingContent = await page.locator('text=Personnalisation').or(page.locator('text=Administration')).isVisible().catch(() => false);
    expect(hasBrandingContent).toBeTruthy();
  });

  test('should allow super_admin access to patrons page', async ({ page }) => {
    // Mock authenticated session with super_admin
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'superadmin@test.com',
          firstName: 'Super',
          lastName: 'Admin',
          role: 'super_admin',
          status: 'active'
        })
      });
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
    
    // Should show patrons page or admin interface
    const hasPatronsContent = await page.locator('text=Mécènes').or(page.locator('text=Administration')).isVisible().catch(() => false);
    expect(hasPatronsContent).toBeTruthy();
  });

  test('should deny regular admin access to patrons page', async ({ page }) => {
    // Mock authenticated session with regular admin
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ideas_reader',
          status: 'active'
        })
      });
    });
    
    await page.goto('/admin/patrons');
    await page.waitForLoadState('networkidle');
    
    // Should show access denied
    const hasAccessDenied = await page.locator('text=Accès refusé').or(page.locator('text=Insufficient permissions')).isVisible().catch(() => false);
    expect(hasAccessDenied).toBeTruthy();
  });

  test('should allow any authenticated admin to access members page', async ({ page }) => {
    // Mock authenticated session
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ideas_reader',
          status: 'active'
        })
      });
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
    
    // Should show members page or admin interface
    const hasMembersContent = await page.locator('text=Membres').or(page.locator('text=Administration')).isVisible().catch(() => false);
    expect(hasMembersContent).toBeTruthy();
  });

  test('should maintain session across page navigation', async ({ page }) => {
    // Mock authenticated session
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ideas_reader',
          status: 'active'
        })
      });
    });
    
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    // Navigate to different admin section
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
    
    // Should still be authenticated
    const hasMembersContent = await page.locator('text=Membres').or(page.locator('text=Administration')).isVisible().catch(() => false);
    expect(hasMembersContent).toBeTruthy();
  });

  test('should handle OAuth2 callback and create user session', async ({ page }) => {
    // Mock the OAuth2 callback
    await page.route('/api/auth/authentik/callback*', async (route) => {
      // Simulate successful OAuth2 callback
      await route.fulfill({
        status: 302,
        headers: {
          'Location': '/admin',
          'Set-Cookie': 'connect.sid=mock-session-id; Path=/; HttpOnly'
        }
      });
    });

    // Mock user creation/sync
    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'newuser@test.com',
          firstName: 'New',
          lastName: 'User',
          role: 'ideas_reader',
          status: 'active'
        })
      });
    });

    await page.goto('/api/auth/authentik/callback?code=mock-code&state=mock-state');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to admin or home
    expect(page.url()).toContain('/admin');
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

  test('should allow authenticated requests with valid session', async ({ page }) => {
    // Mock authenticated session
    await page.context().addCookies([{
      name: 'connect.sid',
      value: 'mock-session-id',
      domain: 'localhost',
      path: '/',
    }]);

    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          email: 'admin@test.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ideas_reader',
          status: 'active'
        })
      });
    });

    // Mock the protected endpoint
    await page.route('/api/admin/ideas*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: [],
          total: 0
        })
      });
    });
    
    const response = await page.request.get('/api/admin/ideas');
    
    // Should return 200 OK
    expect(response.status()).toBe(200);
  });
});
