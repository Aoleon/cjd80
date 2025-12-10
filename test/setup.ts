import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock logger pour tous les tests
vi.mock('../server/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Mock global pour bcrypt (module natif)
vi.mock('bcrypt', async () => {
  return {
    default: {
      hash: vi.fn().mockResolvedValue('$2b$12$mockedHashValue'),
      compare: vi.fn().mockImplementation((plain, hash) => {
        return Promise.resolve(hash === '$2b$12$mockedHashValue' || plain === 'validPassword');
      }),
    },
    hash: vi.fn().mockResolvedValue('$2b$12$mockedHashValue'),
    compare: vi.fn().mockImplementation((plain, hash) => {
      return Promise.resolve(hash === '$2b$12$mockedHashValue' || plain === 'validPassword');
    }),
  };
});

// Réinitialiser les mocks entre les tests
beforeEach(() => {
  vi.clearAllMocks();
});
