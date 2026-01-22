import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour audit des sections Admin
 * Utilise le serveur existant sur le port 5003
 */
export default defineConfig({
  testDir: './tests/e2e/e2e',
  testMatch: '**/admin-sections-audit.spec.ts',
  fullyParallel: false, // Sequential pour eviter les conflits de session
  forbidOnly: false,
  retries: 1, // Un retry en cas d'echec
  workers: 1,
  timeout: 60000, // 1 minute par test
  expect: {
    timeout: 15000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-admin', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:5003',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15000,
    // Conserver l'etat entre les tests
    storageState: undefined,
  },
  outputDir: 'test-results',
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
});
