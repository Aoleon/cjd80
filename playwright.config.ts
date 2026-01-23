import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000, // 60 seconds timeout for tests
  expect: {
    timeout: 10000, // 10 seconds timeout for assertions
  },
  reporter: [
    ['html'],
    ['./tests/playwright-reporter.ts']
  ],
  use: {
    baseURL: 'http://localhost:5001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 10000, // 10 seconds timeout for actions
  },

  projects: [
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome', // Use Google Chrome instead of Chromium
      },
    },
  ],

  webServer: {
    command: 'NODE_ENV=test PORT=5001 nest start --watch',
    url: 'http://localhost:5001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL || process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
    },
  },
});
