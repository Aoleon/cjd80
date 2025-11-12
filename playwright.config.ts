import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['./tests/playwright-reporter.ts']
  ],
  use: {
    baseURL: 'http://localhost:5001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'NODE_ENV=test PORT=5001 tsx server/index.ts',
    url: 'http://localhost:5001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
    },
  },
});
