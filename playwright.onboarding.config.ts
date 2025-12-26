import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright pour audit de navigation Onboarding
 * Utilise le serveur existant sur le port 5003
 */
export default defineConfig({
  testDir: './tests/e2e/e2e',
  testMatch: '**/onboarding-navigation-audit.spec.ts',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  timeout: 180000, // 3 minutes per test
  expect: {
    timeout: 15000,
  },
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-onboarding', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:5003',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15000,
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
