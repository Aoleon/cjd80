import '@testing-library/jest-dom';
import { vi, afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';

// ============================================================================
// MSW 2.x Setup - Serveur de mocking HTTP
// ============================================================================
// Créer une instance serveur vide - les tests ajoutent leurs handlers
export const server = setupServer();

// Démarrer le serveur MSW avant tous les tests
// Note: 'warn' au lieu d'error car les tests d'intégration Express/supertest
// font des requêtes HTTP réelles qui ne doivent pas être interceptées par MSW
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Réinitialiser les handlers après chaque test
afterEach(() => {
  server.resetHandlers();
});

// Arrêter le serveur après tous les tests
afterAll(() => {
  server.close();
});

// ============================================================================
// Mocks Globaux
// ============================================================================

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

// ============================================================================
// Hooks Globaux
// ============================================================================

// Réinitialiser les mocks vitest entre les tests
afterEach(() => {
  vi.clearAllMocks();
});

// Supprimer les effets de bord entre les tests
afterEach(() => {
  // Nettoyer les timers
  vi.clearAllTimers();
});
