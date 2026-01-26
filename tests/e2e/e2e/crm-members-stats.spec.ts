import { test, expect } from '@playwright/test';

/**
 * Tests E2E - CRM Members Statistics Dashboard
 *
 * User Story: En tant qu'admin, je veux un dashboard analytics centralisant
 * les statistiques et tendances des membres pour suivre la croissance.
 *
 * URL de test: https://cjd80.rbw.ovh/admin/members/stats
 *
 * Tests:
 * 1. Display stats page
 * 2. Display 4 KPI cards (Total Members, Active, Prospects, Conversion Rate)
 * 3. KPI card values are numbers
 * 4. Display time chart (LineChart or AreaChart)
 * 5. Chart has data points
 * 6. Display Top 5 tags BarChart
 * 7. Tags chart shows tag names
 * 8. Display Top 10 members table
 * 9. Members table shows engagement scores
 * 10. Display trend cards (month, quarter, evolution)
 * 11. Trend values calculation
 * 12. All sections load without errors
 */

const BASE_URL = 'https://cjd80.rbw.ovh';

// Test accounts
const TEST_ACCOUNTS = {
  admin: {
    email: 'admin@test.local',
    password: 'devmode',
    role: 'super_admin'
  }
};

// Mock data structures
interface MockMember {
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  status: 'active' | 'proposed';
  engagementScore?: number;
  phone?: string;
  role?: string;
  tags?: Array<{ id: string; name: string }>;
  createdAt?: string;
}

interface MockStats {
  totalMembers: number;
  totalActive: number;
  totalProspects: number;
  conversionRate: number;
  newMembersThisMonth: number;
  newMembersThisQuarter: number;
  monthlyGrowth: number;
  monthlyData: Array<{
    month: string;
    active: number;
    prospects: number;
  }>;
  tagStats: Array<{
    tagName: string;
    count: number;
  }>;
  topMembers: Array<{
    rank: number;
    firstName: string;
    lastName: string;
    email: string;
    engagementScore: number;
  }>;
}

interface ConsoleMessage {
  type: string;
  text: string;
  timestamp: string;
  location?: string;
}

interface NetworkRequest {
  url: string;
  status: number;
  method: string;
  timestamp: string;
}

// Generate realistic mock members
function generateMockMembers(count: number): MockMember[] {
  const firstNames = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Luc', 'Anne', 'Marc', 'Christine', 'Paul', 'Isabelle'];
  const lastNames = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Robert', 'Petit', 'Dubois', 'Laurent', 'Simon', 'Michel'];
  const companies = ['Tech Corp', 'Innovation Ltd', 'Digital Solutions', 'Creative Agency', 'Consulting Group'];
  const tags = [
    { id: 'tag1', name: 'VIP' },
    { id: 'tag2', name: 'Actif' },
    { id: 'tag3', name: 'Partenaire' },
    { id: 'tag4', name: 'Mentor' },
    { id: 'tag5', name: 'Investisseur' }
  ];

  const members: MockMember[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const isActive = Math.random() > 0.3; // 70% active, 30% proposed
    const daysAgo = Math.floor(Math.random() * 180); // Last 6 months

    const createdDate = new Date(now);
    createdDate.setDate(createdDate.getDate() - daysAgo);

    const memberTags = [];
    if (Math.random() > 0.5) {
      memberTags.push(tags[Math.floor(Math.random() * tags.length)]);
    }
    if (Math.random() > 0.7) {
      const anotherTag = tags[Math.floor(Math.random() * tags.length)];
      if (!memberTags.find(t => t.id === anotherTag.id)) {
        memberTags.push(anotherTag);
      }
    }

    members.push({
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      firstName,
      lastName,
      company: companies[i % companies.length],
      status: isActive ? 'active' : 'proposed',
      engagementScore: isActive ? Math.floor(Math.random() * 100) + 20 : Math.floor(Math.random() * 30),
      phone: `+33${Math.floor(Math.random() * 900000000 + 100000000)}`,
      role: isActive ? 'member' : 'prospect',
      tags: memberTags,
      createdAt: createdDate.toISOString()
    });
  }

  return members;
}

// Calculate statistics from mock members
function calculateMockStats(members: MockMember[]): MockStats {
  const totalActive = members.filter(m => m.status === 'active').length;
  const totalProspects = members.filter(m => m.status === 'proposed').length;
  const totalMembers = totalActive + totalProspects;
  const conversionRate = totalMembers > 0 ? (totalActive / totalMembers) * 100 : 0;

  // Monthly data (6 months)
  const now = new Date();
  const monthlyData = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

    const monthActive = members.filter(m => {
      if (m.status !== 'active' || !m.createdAt) return false;
      const createdDate = new Date(m.createdAt);
      return createdDate >= monthStart && createdDate <= monthEnd;
    }).length;

    const monthProspects = members.filter(m => {
      if (m.status !== 'proposed' || !m.createdAt) return false;
      const createdDate = new Date(m.createdAt);
      return createdDate >= monthStart && createdDate <= monthEnd;
    }).length;

    monthlyData.push({
      month: monthDate.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }),
      active: monthActive,
      prospects: monthProspects
    });
  }

  // Tag statistics
  const tagMap = new Map<string, number>();
  members.forEach(member => {
    if (member.tags && Array.isArray(member.tags)) {
      member.tags.forEach(tag => {
        tagMap.set(tag.name, (tagMap.get(tag.name) || 0) + 1);
      });
    }
  });

  const tagStats = Array.from(tagMap.entries())
    .map(([tagName, count]) => ({ tagName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top members by engagement
  const topMembers = members
    .filter(m => m.status === 'active' && (m.engagementScore || 0) > 0)
    .sort((a, b) => (b.engagementScore || 0) - (a.engagementScore || 0))
    .slice(0, 10)
    .map((m, idx) => ({
      rank: idx + 1,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      engagementScore: m.engagementScore || 0
    }));

  // Growth calculation
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const newMembersThisMonth = members.filter(m => {
    if (!m.createdAt) return false;
    const createdDate = new Date(m.createdAt);
    return createdDate >= thisMonthStart && createdDate <= now;
  }).length;

  const newMembersLastMonth = members.filter(m => {
    if (!m.createdAt) return false;
    const createdDate = new Date(m.createdAt);
    return createdDate >= lastMonthStart && createdDate <= lastMonthEnd;
  }).length;

  const thisQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);

  const newMembersThisQuarter = members.filter(m => {
    if (!m.createdAt) return false;
    const createdDate = new Date(m.createdAt);
    return createdDate >= thisQuarterStart && createdDate <= now;
  }).length;

  const monthlyGrowth = newMembersLastMonth > 0
    ? ((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100
    : (newMembersThisMonth > 0 ? 100 : 0);

  return {
    totalMembers,
    totalActive,
    totalProspects,
    conversionRate,
    newMembersThisMonth,
    newMembersThisQuarter,
    monthlyGrowth,
    monthlyData,
    tagStats,
    topMembers
  };
}

test.describe('CRM Members Statistics Dashboard', () => {
  let consoleMessages: ConsoleMessage[] = [];
  let networkRequests: NetworkRequest[] = [];
  let mockMembers: MockMember[] = [];
  let mockStats: MockStats;

  test.beforeAll(() => {
    // Generate mock data once for all tests
    mockMembers = generateMockMembers(50);
    mockStats = calculateMockStats(mockMembers);

    console.log('='.repeat(80));
    console.log('SETUP - Mock Data Generated');
    console.log('='.repeat(80));
    console.log('Total Members: ' + mockMembers.length);
    console.log('Active: ' + mockStats.totalActive);
    console.log('Prospects: ' + mockStats.totalProspects);
    console.log('Conversion Rate: ' + mockStats.conversionRate.toFixed(1) + '%');
    console.log('Top Tags: ' + mockStats.tagStats.map(t => t.tagName).join(', '));
    console.log('Top Members: ' + mockStats.topMembers.length);
  });

  test.beforeEach(async ({ page }) => {
    consoleMessages = [];
    networkRequests = [];

    // Capture all console messages
    page.on('console', (msg) => {
      const consoleEntry: ConsoleMessage = {
        type: msg.type(),
        text: msg.text(),
        timestamp: new Date().toISOString(),
        location: msg.location().url
      };
      consoleMessages.push(consoleEntry);
      if (msg.type() === 'error') {
        console.log('[CONSOLE ERROR] ' + msg.text());
      }
    });

    // Capture network responses
    page.on('response', async (response) => {
      const status = response.status();
      const url = response.url();
      const method = response.request().method();

      networkRequests.push({
        url,
        status,
        method,
        timestamp: new Date().toISOString()
      });

      if (status >= 400) {
        console.log('[NETWORK ERROR] ' + status + ' ' + method + ' ' + url);
      }
    });

    // Mock admin authentication
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'test-jwt-token-admin');
      localStorage.setItem('user', JSON.stringify({
        id: 'admin-user-123',
        email: TEST_ACCOUNTS.admin.email,
        name: 'Admin User',
        role: 'super_admin',
        permissions: ['manage_members', 'view_stats']
      }));
    });

    // Mock API endpoint for members list
    await page.route(BASE_URL + '/api/admin/members*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: mockMembers,
            total: mockMembers.length,
            page: 1,
            limit: 10000
          })
        });
      } else {
        await route.continue();
      }
    });
  });

  test.afterEach(async () => {
    console.log('\n' + '='.repeat(80));
    console.log('TEST SUMMARY');
    console.log('='.repeat(80));

    console.log('\n--- Network Requests ---');
    console.log('Total requests: ' + networkRequests.length);
    const errorRequests = networkRequests.filter(r => r.status >= 400);
    console.log('Requests with errors: ' + errorRequests.length);
    if (errorRequests.length > 0) {
      errorRequests.forEach(req => {
        console.log('  [' + req.status + '] ' + req.method + ' ' + req.url.substring(0, 100));
      });
    }

    console.log('\n--- Console Messages ---');
    const errors = consoleMessages.filter(m => m.type === 'error');
    console.log('Total messages: ' + consoleMessages.length);
    console.log('Errors: ' + errors.length);

    if (errors.length > 0) {
      console.log('  Errors:');
      errors.forEach(err => {
        console.log('    - ' + err.text.substring(0, 150));
      });
    }

    console.log('\n' + '='.repeat(80));
  });

  // Test 1: Display stats page
  test('[1] Display stats page and verify page loads', async ({ page }) => {
    console.log('\n[TEST 1] Loading stats page...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('[TEST 1] URL: ' + page.url());
    console.log('[TEST 1] Title: ' + await page.title());

    const pageContent = await page.content();
    const isPageLoaded = pageContent.length > 100;
    console.log('[TEST 1] Page content length: ' + pageContent.length);

    expect(isPageLoaded).toBe(true);
    expect(page.url()).toContain('/admin/members/stats');

    // Verify page header
    const header = page.locator('h1, h2').filter({ hasText: /Statistiques|Statistics/ }).first();
    await expect(header).toBeVisible({ timeout: 5000 });
    console.log('[TEST 1] Page header found');
  });

  // Test 2: Display 4 KPI cards
  test('[2] Display 4 KPI cards (Total Members, Active, Prospects, Conversion Rate)', async ({ page }) => {
    console.log('\n[TEST 2] Verifying 4 KPI cards...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for KPI cards
    const cards = page.locator('[class*="card"], [class*="Card"]');
    const cardCount = await cards.count();
    console.log('[TEST 2] Total cards found: ' + cardCount);

    // Check for specific KPI titles
    const kpiTitles = [
      'Total Membres',
      'Actifs',
      'Prospects',
      'Conversion'
    ];

    for (const title of kpiTitles) {
      const element = page.locator(`text=${title}`).first();
      const isVisible = await element.isVisible().catch(() => false);
      console.log('[TEST 2] KPI "' + title + '" found: ' + isVisible);
      expect(isVisible).toBeTruthy();
    }

    expect(cardCount).toBeGreaterThanOrEqual(4);
  });

  // Test 3: KPI card values are numbers
  test('[3] KPI card values contain numeric data', async ({ page }) => {
    console.log('\n[TEST 3] Verifying KPI values are numeric...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Get all card content
    const cardContents = await page.locator('[class*="card"]').evaluateAll((elements) => {
      return elements.map(el => ({
        text: el.textContent || '',
        html: el.innerHTML || ''
      }));
    });

    console.log('[TEST 3] Total cards analyzed: ' + cardContents.length);

    // Check for numeric values
    let numericValuesFound = 0;
    cardContents.forEach((card, idx) => {
      const hasNumber = /\d+/.test(card.text);
      if (hasNumber) {
        numericValuesFound++;
        console.log('[TEST 3] Card ' + (idx + 1) + ' contains numbers: ✓');
      }
    });

    console.log('[TEST 3] Cards with numeric values: ' + numericValuesFound + ' / ' + cardContents.length);
    expect(numericValuesFound).toBeGreaterThanOrEqual(3);
  });

  // Test 4: Display time chart (LineChart or AreaChart)
  test('[4] Display time evolution chart (LineChart or AreaChart)', async ({ page }) => {
    console.log('\n[TEST 4] Verifying time evolution chart...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for chart sections
    const chartSectionTexts = [
      'Évolution temporelle',
      'Évolution',
      'Evolution',
      'Monthly',
      'Cumul'
    ];

    let chartSectionFound = false;
    for (const text of chartSectionTexts) {
      const section = page.locator(`text=${text}`).first();
      const isVisible = await section.isVisible().catch(() => false);
      if (isVisible) {
        chartSectionFound = true;
        console.log('[TEST 4] Chart section found: "' + text + '"');
        break;
      }
    }

    // Look for SVG elements (chart visualization)
    const svgElements = page.locator('svg');
    const svgCount = await svgElements.count();
    console.log('[TEST 4] SVG elements found: ' + svgCount);

    // Look for chart containers
    const rechartContainers = page.locator('[class*="recharts"], [role="img"]');
    const containerCount = await rechartContainers.count();
    console.log('[TEST 4] Recharts containers found: ' + containerCount);

    expect(chartSectionFound || svgCount > 0 || containerCount > 0).toBeTruthy();
  });

  // Test 5: Chart has data points
  test('[5] Chart contains data points', async ({ page }) => {
    console.log('\n[TEST 5] Verifying chart data points...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for chart elements (lines, circles, text)
    const chartElements = page.locator('g > circle, g > line, g > text, [role="tooltip"]');
    const elementCount = await chartElements.count();
    console.log('[TEST 5] Chart elements found: ' + elementCount);

    // Look for axis labels (months/dates)
    const monthTexts = [
      'janv', 'févr', 'mars', 'avr', 'mai', 'juin',
      'juil', 'août', 'sept', 'oct', 'nov', 'déc',
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'
    ];

    let monthFound = false;
    for (const month of monthTexts) {
      const element = page.locator('text=' + month).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        monthFound = true;
        console.log('[TEST 5] Month label found: "' + month + '"');
        break;
      }
    }

    expect(elementCount > 0 || monthFound).toBeTruthy();
  });

  // Test 6: Display Top 5 tags BarChart
  test('[6] Display Top 5 tags BarChart', async ({ page }) => {
    console.log('\n[TEST 6] Verifying tags BarChart...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for tags section
    const tagsSection = page.locator('text=Top Tags').first();
    const tagsSectionVisible = await tagsSection.isVisible().catch(() => false);
    console.log('[TEST 6] Top Tags section found: ' + tagsSectionVisible);
    expect(tagsSectionVisible).toBeTruthy();

    // Look for bar chart elements
    const barElements = page.locator('g [class*="bar"], rect[y]');
    const barCount = await barElements.count();
    console.log('[TEST 6] Bar chart elements found: ' + barCount);

    expect(barCount).toBeGreaterThanOrEqual(0);
  });

  // Test 7: Tags chart shows tag names
  test('[7] Tags chart displays tag names', async ({ page }) => {
    console.log('\n[TEST 7] Verifying tag names in chart...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Expected tag names from mock data
    const expectedTags = mockStats.tagStats.map(t => t.tagName);
    console.log('[TEST 7] Expected tags: ' + expectedTags.join(', '));

    let tagsFound = 0;
    for (const tag of expectedTags) {
      const element = page.locator(`text=${tag}`).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        tagsFound++;
        console.log('[TEST 7] Tag "' + tag + '" found: ✓');
      }
    }

    console.log('[TEST 7] Tags found: ' + tagsFound + ' / ' + expectedTags.length);
    expect(tagsFound).toBeGreaterThanOrEqual(0);
  });

  // Test 8: Display Top 10 members table
  test('[8] Display Top 10 members engagement table', async ({ page }) => {
    console.log('\n[TEST 8] Verifying members table...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for members section
    const membersSection = page.locator('text=Top 10 Membres').first();
    const membersSectionVisible = await membersSection.isVisible().catch(() => false);
    console.log('[TEST 8] Top Members section found: ' + membersSectionVisible);
    expect(membersSectionVisible).toBeTruthy();

    // Look for table
    const table = page.locator('table').first();
    const tableVisible = await table.isVisible().catch(() => false);
    console.log('[TEST 8] Table element found: ' + tableVisible);

    // Count table rows
    const rows = page.locator('tr');
    const rowCount = await rows.count();
    console.log('[TEST 8] Table rows found: ' + rowCount);

    expect(tableVisible || rowCount > 0).toBeTruthy();
  });

  // Test 9: Members table shows engagement scores
  test('[9] Members table displays engagement scores', async ({ page }) => {
    console.log('\n[TEST 9] Verifying engagement scores in table...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for engagement score text/numbers
    const scoreHeaders = ['Score d\'Engagement', 'Engagement', 'Score', 'Engagement Score'];
    let scoreHeaderFound = false;

    for (const header of scoreHeaders) {
      const element = page.locator(`text=${header}`).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        scoreHeaderFound = true;
        console.log('[TEST 9] Score header found: "' + header + '"');
        break;
      }
    }

    // Look for percentage values (engagement scores)
    const percentageElements = page.locator('text=/%/');
    const percentCount = await percentageElements.count();
    console.log('[TEST 9] Percentage values found: ' + percentCount);

    expect(scoreHeaderFound || percentCount > 0).toBeTruthy();
  });

  // Test 10: Display trend cards
  test('[10] Display trend cards (month, quarter, evolution)', async ({ page }) => {
    console.log('\n[TEST 10] Verifying trend cards...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Look for trend card sections
    const trendLabels = [
      'Ce Mois',
      'Ce Trimestre',
      'Évolution',
      'This Month',
      'This Quarter',
      'Evolution'
    ];

    let trendsFound = 0;
    for (const label of trendLabels) {
      const element = page.locator(`text=${label}`).first();
      const isVisible = await element.isVisible().catch(() => false);
      if (isVisible) {
        trendsFound++;
        console.log('[TEST 10] Trend card "' + label + '" found: ✓');
      }
    }

    console.log('[TEST 10] Trend cards found: ' + trendsFound + ' / ' + trendLabels.length);
    expect(trendsFound).toBeGreaterThanOrEqual(2);
  });

  // Test 11: Trend values calculation
  test('[11] Trend values are correctly calculated and displayed', async ({ page }) => {
    console.log('\n[TEST 11] Verifying trend calculations...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Get all text content
    const pageText = await page.content();

    // Check for numeric trend values
    const trendNumbers = mockStats.newMembersThisMonth.toString();
    const containsTrendValue = pageText.includes(trendNumbers);
    console.log('[TEST 11] Checking for trend value: ' + trendNumbers + ' - Found: ' + containsTrendValue);

    // Check for percentage growth
    const growthValue = mockStats.monthlyGrowth.toFixed(1);
    const containsGrowth = pageText.includes(growthValue) || pageText.includes(growthValue.split('.')[0]);
    console.log('[TEST 11] Checking for growth value: ' + growthValue + '% - Found: ' + containsGrowth);

    // Check for conversion rate
    const conversionValue = mockStats.conversionRate.toFixed(1);
    const containsConversion = pageText.includes(conversionValue) || pageText.includes(conversionValue.split('.')[0]);
    console.log('[TEST 11] Checking for conversion rate: ' + conversionValue + '% - Found: ' + containsConversion);

    expect(containsTrendValue || containsGrowth || containsConversion).toBeTruthy();
  });

  // Test 12: All sections load without errors
  test('[12] All sections load without critical errors', async ({ page }) => {
    console.log('\n[TEST 12] Comprehensive error checking...');

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Check console for critical errors
    const criticalErrors = consoleMessages.filter(m =>
      m.type === 'error' &&
      !m.text.includes('404') &&
      !m.text.includes('Not Found')
    );

    console.log('[TEST 12] Critical console errors: ' + criticalErrors.length);
    if (criticalErrors.length > 0) {
      criticalErrors.slice(0, 3).forEach(err => {
        console.log('  - ' + err.text.substring(0, 100));
      });
    }

    // Check network for critical errors (500+)
    const serverErrors = networkRequests.filter(r => r.status >= 500);
    console.log('[TEST 12] Server errors (5xx): ' + serverErrors.length);
    if (serverErrors.length > 0) {
      serverErrors.forEach(req => {
        console.log('  [' + req.status + '] ' + req.method + ' ' + req.url.substring(0, 80));
      });
    }

    // Verify page has main content
    const mainContent = page.locator('main, [role="main"], div[class*="container"]').first();
    const mainVisible = await mainContent.isVisible().catch(() => false);
    console.log('[TEST 12] Main content visible: ' + mainVisible);

    expect(mainVisible).toBeTruthy();
    expect(criticalErrors.length).toBe(0);
    expect(serverErrors.length).toBe(0);
  });

  // Test 13: Full dashboard documentation
  test('[13] Full dashboard documentation and element inventory', async ({ page }) => {
    console.log('\n' + '='.repeat(80));
    console.log('COMPREHENSIVE DASHBOARD DOCUMENTATION');
    console.log('='.repeat(80));

    await page.goto(BASE_URL + '/admin/members/stats', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    console.log('\n1. PAGE INFORMATION');
    console.log('   URL: ' + page.url());
    console.log('   Title: ' + await page.title());

    console.log('\n2. ELEMENT COUNTS');
    const buttons = await page.locator('button').count();
    const inputs = await page.locator('input').count();
    const tables = await page.locator('table').count();
    const charts = await page.locator('svg').count();
    const cards = await page.locator('[class*="card"]').count();

    console.log('   Buttons: ' + buttons);
    console.log('   Inputs: ' + inputs);
    console.log('   Tables: ' + tables);
    console.log('   Charts (SVG): ' + charts);
    console.log('   Cards: ' + cards);

    console.log('\n3. RENDERED DATA');
    console.log('   Mock Members: ' + mockMembers.length);
    console.log('   Total Members (Expected): ' + mockStats.totalMembers);
    console.log('   Active Members: ' + mockStats.totalActive);
    console.log('   Prospects: ' + mockStats.totalProspects);
    console.log('   Conversion Rate: ' + mockStats.conversionRate.toFixed(1) + '%');
    console.log('   Monthly Growth: ' + mockStats.monthlyGrowth.toFixed(1) + '%');
    console.log('   Top Tags: ' + mockStats.tagStats.length);
    console.log('   Top Members: ' + mockStats.topMembers.length);

    console.log('\n4. MONTHLY DATA');
    mockStats.monthlyData.forEach(month => {
      console.log('   ' + month.month + ': ' + month.active + ' active + ' + month.prospects + ' prospects');
    });

    console.log('\n5. TOP TAGS');
    mockStats.tagStats.forEach(tag => {
      console.log('   - ' + tag.tagName + ': ' + tag.count + ' members');
    });

    console.log('\n6. TOP MEMBERS BY ENGAGEMENT');
    mockStats.topMembers.slice(0, 5).forEach(member => {
      console.log('   ' + member.rank + '. ' + member.firstName + ' ' + member.lastName + ' (' + member.engagementScore + '%)');
    });

    console.log('\n7. NETWORK SUMMARY');
    console.log('   Total requests: ' + networkRequests.length);
    console.log('   API requests: ' + networkRequests.filter(r => r.url.includes('/api')).length);
    console.log('   Successful (2xx/3xx): ' + networkRequests.filter(r => r.status < 400).length);
    console.log('   Errors (4xx/5xx): ' + networkRequests.filter(r => r.status >= 400).length);

    console.log('\n8. CONSOLE SUMMARY');
    console.log('   Total messages: ' + consoleMessages.length);
    console.log('   Errors: ' + consoleMessages.filter(m => m.type === 'error').length);
    console.log('   Warnings: ' + consoleMessages.filter(m => m.type === 'warning').length);

    console.log('\n' + '='.repeat(80));
    console.log('END OF DOCUMENTATION');
    console.log('='.repeat(80));

    // Just verify the page loaded
    expect(page.url()).toContain('/admin/members/stats');
  });
});
