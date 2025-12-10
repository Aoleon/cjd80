import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/unit/**/*.test.{ts,tsx}', 'tests/e2e/api/admin-routes*.test.ts', 'tests/e2e/backend/**/*.test.ts'],
    exclude: [
      '**/e2e/e2e/**',
      '**/node_modules/**',
      '**/dist/**',
      'tests/e2e/api/auth-permissions.test.ts',
      'tests/e2e/api/error-handling.test.ts',
      'tests/e2e/api/frontend-error-logging.test.ts',
      'tests/e2e/api/validation-edge-cases.test.ts',
      'tests/e2e/api/business-logic.test.ts',
      'tests/e2e/api/branding-api.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: [
        'server/src/**/*.ts',
        'server/storage.ts',
        'client/src/hooks/**/*.{ts,tsx}',
      ],
      exclude: [
        'node_modules',
        'dist',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './client/src'),
      '@shared': resolve(__dirname, './shared'),
      '@server': resolve(__dirname, './server'),
    },
  },
});
