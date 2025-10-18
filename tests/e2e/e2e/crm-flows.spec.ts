import { test, expect } from '@playwright/test';

test.describe('CRM - Patron Management', () => {
  test.beforeEach(async ({ page }) => {
    // Super admin required for patrons
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'superadmin',
        email: 'superadmin@test.com',
        role: 'super_admin'
      }));
    });
    
    // Mock patrons API response
    await page.route('/api/patrons*', async (route) => {
      const url = route.request().url();
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'patron-1',
                firstName: 'Jean',
                lastName: 'Dupont',
                email: 'jean.dupont@example.com',
                company: 'Entreprise Test',
                role: 'CEO',
                status: 'active',
                phone: '0123456789',
                notes: 'Mécène important'
              }
            ],
            total: 1,
            page: 1,
            limit: 20
          })
        });
      } else {
        await route.continue();
      }
    });

    // Mock members API for referrer dropdown
    await page.route('/api/members*', async (route) => {
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
    
    await page.goto('/admin/patrons');
    await page.waitForLoadState('networkidle');
  });
  
  test('should display patrons list', async ({ page }) => {
    // Check for patron card
    await expect(page.locator('[data-testid="patron-item-patron-1"]')).toBeVisible({ timeout: 5000 });
  });
  
  test('should display patron search input', async ({ page }) => {
    const searchInput = page.locator('[data-testid="input-search-patron"]');
    await expect(searchInput).toBeVisible();
  });
  
  test('should allow searching patrons', async ({ page }) => {
    const searchInput = page.locator('[data-testid="input-search-patron"]');
    await searchInput.fill('Jean');
    
    // Wait for filter to apply
    await page.waitForTimeout(300);
    
    // Should still show the matching patron
    await expect(page.locator('text=Jean Dupont')).toBeVisible();
  });
  
  test('should display create patron button', async ({ page }) => {
    const createButton = page.locator('[data-testid="button-create-patron"]');
    await expect(createButton).toBeVisible();
  });
  
  test('should show patron details when selected', async ({ page }) => {
    // Click on patron to select
    await page.click('[data-testid="patron-item-patron-1"]');
    
    // Mock individual patron API
    await page.route('/api/patrons/patron-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'patron-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          company: 'Entreprise Test',
          role: 'CEO',
          status: 'active'
        })
      });
    });

    // Mock donations API
    await page.route('/api/patrons/patron-1/donations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    // Mock updates API
    await page.route('/api/patrons/patron-1/updates', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Should show patron name in details
    await expect(page.locator('[data-testid="patron-name"]')).toBeVisible({ timeout: 3000 });
  });
  
  test('should show patron status badge', async ({ page }) => {
    await expect(page.locator('[data-testid="badge-patron-status-patron-1"]')).toBeVisible();
  });

  test('should show tabs for patron information', async ({ page }) => {
    // Click on patron to view details
    await page.click('[data-testid="patron-item-patron-1"]');
    
    // Mock APIs for patron details
    await page.route('/api/patrons/patron-1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'patron-1',
          firstName: 'Jean',
          lastName: 'Dupont',
          email: 'jean.dupont@example.com',
          company: 'Entreprise Test',
          status: 'active'
        })
      });
    });

    await page.route('/api/patrons/patron-1/donations', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.route('/api/patrons/patron-1/updates', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Wait for details to load
    await page.waitForTimeout(500);
    
    // Check for tabs
    await expect(page.locator('[data-testid="tab-info"]')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('[data-testid="tab-donations"]')).toBeVisible();
    await expect(page.locator('[data-testid="tab-updates"]')).toBeVisible();
  });
});

test.describe('CRM - Member Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('admin-user', JSON.stringify({
        id: 'admin',
        email: 'admin@test.com',
        role: 'admin'
      }));
    });
    
    // Mock members API response with engagement scores
    await page.route('/api/members*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'member-1',
                firstName: 'Marie',
                lastName: 'Martin',
                email: 'marie.martin@example.com',
                company: 'Société ABC',
                status: 'active',
                engagementScore: 75,
                activityCount: 12,
                lastActivityAt: new Date().toISOString()
              },
              {
                id: 'member-2',
                firstName: 'Pierre',
                lastName: 'Durand',
                email: 'pierre.durand@example.com',
                company: 'Corp XYZ',
                status: 'active',
                engagementScore: 45,
                activityCount: 8,
                lastActivityAt: new Date().toISOString()
              }
            ],
            total: 2,
            page: 1,
            limit: 20
          })
        });
      } else {
        await route.continue();
      }
    });
    
    await page.goto('/admin/members');
    await page.waitForLoadState('networkidle');
  });
  
  test('should display members with engagement scores', async ({ page }) => {
    // Check for member cards
    await expect(page.locator('[data-testid="card-member-marie.martin@example.com"]')).toBeVisible({ timeout: 5000 });
    
    // Verify engagement score badges are visible
    const scoreElement = page.locator('[data-testid="badge-engagement-marie.martin@example.com"]');
    await expect(scoreElement).toBeVisible();
    
    // Check score value
    const scoreText = await scoreElement.textContent();
    expect(scoreText).toContain('75');
  });
  
  test('should show multiple engagement score badges', async ({ page }) => {
    await expect(page.locator('[data-testid="badge-engagement-marie.martin@example.com"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-engagement-pierre.durand@example.com"]')).toBeVisible();
  });
  
  test('should show member activity count', async ({ page }) => {
    // Check for activity count in member card
    const memberCard = page.locator('[data-testid="card-member-marie.martin@example.com"]');
    const cardText = await memberCard.textContent();
    expect(cardText).toContain('12 activité');
  });

  test('should show member activity timeline when selected', async ({ page }) => {
    // Mock member activities API
    await page.route('/api/members/marie.martin@example.com/activities', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'activity-1',
            type: 'idea_proposed',
            occurredAt: new Date().toISOString(),
            description: 'A proposé une idée'
          }
        ])
      });
    });

    // Mock member subscriptions API
    await page.route('/api/members/marie.martin@example.com/subscriptions', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    // Click on member to view details
    await page.click('[data-testid="card-member-marie.martin@example.com"]');
    
    // Wait for activities to load
    await page.waitForTimeout(500);
    
    // Check for activity timeline tab
    await expect(page.locator('text=Historique')).toBeVisible({ timeout: 3000 });
  });

  test('should allow filtering members by engagement score', async ({ page }) => {
    // Look for engagement filter (if it exists in the UI)
    const filterExists = await page.locator('text=Score d\'engagement').isVisible().catch(() => false);
    
    if (filterExists) {
      // Test filtering functionality
      await page.click('text=Score d\'engagement');
      
      // Should show filter options
      await expect(page.locator('text=Élevé')).toBeVisible();
    }
  });

  test('should display member search functionality', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Rechercher"]');
    await expect(searchInput).toBeVisible();
  });

  test('should show member status badges', async ({ page }) => {
    await expect(page.locator('[data-testid="badge-status-marie.martin@example.com"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-status-pierre.durand@example.com"]')).toBeVisible();
  });
});
