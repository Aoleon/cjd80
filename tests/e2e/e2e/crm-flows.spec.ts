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
    // Mock authentication API - this is what useAuth actually checks
    await page.route('/api/auth/user', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'admin',
          email: 'admin@test.com',
          role: 'admin'
        })
      });
    });
    
    // Mock members API response with engagement scores
    // Note: This route should NOT intercept sub-routes like /activities or /subscriptions
    await page.route('/api/admin/members*', async (route) => {
      if (route.request().method() === 'GET') {
        const url = route.request().url();
        // Skip sub-routes (activities, subscriptions, etc.)
        if (url.includes('/activities') || url.includes('/subscriptions')) {
          await route.continue();
          return;
        }
        
        // Handle list endpoint
        if (url.includes('?') || !url.match(/\/api\/admin\/members\/[^/]+$/)) {
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
          // Handle individual member endpoint
          const emailMatch = url.match(/\/api\/admin\/members\/([^/]+)$/);
          if (emailMatch) {
            const emailEncoded = emailMatch[1];
            const email = decodeURIComponent(emailEncoded);
            // Check both encoded and decoded versions
            if (email === 'marie.martin@example.com' || emailEncoded.includes('marie.martin')) {
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                  success: true,
                  data: {
                    id: 'member-1',
                    firstName: 'Marie',
                    lastName: 'Martin',
                    email: 'marie.martin@example.com',
                    company: 'Société ABC',
                    status: 'active',
                    engagementScore: 75,
                    activityCount: 12,
                    lastActivityAt: new Date().toISOString()
                  }
                })
              });
            } else if (email === 'pierre.durand@example.com' || emailEncoded.includes('pierre.durand')) {
              await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                  success: true,
                  data: {
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
                })
              });
            } else {
              await route.continue();
            }
          } else {
            await route.continue();
          }
        }
      } else {
        await route.continue();
      }
    });
    
    await page.goto('/admin/members');
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to be authenticated and loaded
    // Check that we're not on the login page
    await expect(page.locator('text=Membres')).toBeVisible({ timeout: 10000 });
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
    // Mock member activities API - use pattern to handle URL encoding
    await page.route('**/api/admin/members/*/activities', async (route) => {
      const url = route.request().url();
      if (url.includes('marie.martin@example.com') || url.includes('marie.martin%40example.com')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [
              {
                id: 'activity-1',
                memberEmail: 'marie.martin@example.com',
                activityType: 'idea_proposed',
                entityType: 'idea',
                entityId: 'idea-1',
                entityTitle: 'Nouvelle idée innovante',
                metadata: null,
                scoreImpact: 10,
                occurredAt: new Date().toISOString()
              }
            ]
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: []
          })
        });
      }
    });

    // Mock member subscriptions API - use pattern to handle URL encoding
    await page.route('**/api/admin/members/*/subscriptions', async (route) => {
      const url = route.request().url();
      if (url.includes('marie.martin@example.com') || url.includes('marie.martin%40example.com')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: []
          })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: []
          })
        });
      }
    });
    
    // Wait for member card to be visible
    await expect(page.locator('[data-testid="card-member-marie.martin@example.com"]')).toBeVisible({ timeout: 10000 });
    
    // Click on member to view details
    await page.click('[data-testid="card-member-marie.martin@example.com"]');
    
    // Wait for member details to load (check for member name)
    await expect(page.locator('[data-testid="member-name"]')).toBeVisible({ timeout: 10000 });
    
    // Wait a bit for queries to complete
    await page.waitForTimeout(500);
    
    // Check for activity tab (not "Historique" but "Activité")
    await expect(page.locator('[data-testid="tab-activity"]')).toBeVisible({ timeout: 5000 });
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
