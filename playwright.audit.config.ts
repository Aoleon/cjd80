import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour audit des routes admin
 * Utilise le serveur existant sur le port 5003 (production/staging)
 */
export default defineConfig({
  testDir: './tests/e2e/e2e',
  testMatch: '**/admin-network-audit.spec.ts',
  fullyParallel: false, // Sequential for network audit
  forbidOnly: false,
  retries: 0,
  workers: 1, // Single worker for accurate network capture
  timeout: 120000, // 2 minutes per test
  expect: {
    timeout: 15000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-audit', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:5003', // Existing server
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // NO webServer - use existing server on port 5003
});
