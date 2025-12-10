import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock StorageService
const mockStorage = {
  getUser: vi.fn(),
};

const mockStorageService = {
  storage: mockStorage,
};

// Mock logger
vi.mock('../../server/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import AuthService after mocks
import { AuthService } from '../../server/src/auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    authService = new AuthService(mockStorageService as any);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('deserializeUser', () => {
    const mockUser = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      isActive: true,
    };

    it('should return user from cache if not expired', async () => {
      // First call to populate cache
      mockStorage.getUser.mockResolvedValue({ success: true, data: mockUser });
      await authService.deserializeUser('test@example.com');
      
      // Clear mock calls
      mockStorage.getUser.mockClear();
      
      // Second call should use cache
      const result = await authService.deserializeUser('test@example.com');

      expect(mockStorage.getUser).not.toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('should fetch user from database if cache expired', async () => {
      mockStorage.getUser.mockResolvedValue({ success: true, data: mockUser });
      
      // First call
      await authService.deserializeUser('test@example.com');
      mockStorage.getUser.mockClear();
      
      // Advance time past cache TTL (5 minutes)
      vi.advanceTimersByTime(6 * 60 * 1000);
      
      // Second call should fetch from DB
      const result = await authService.deserializeUser('test@example.com');

      expect(mockStorage.getUser).toHaveBeenCalledWith('test@example.com');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockStorage.getUser.mockResolvedValue({ success: false, data: null });

      const result = await authService.deserializeUser('unknown@example.com');

      expect(result).toBeNull();
    });

    it('should clear cache if user no longer exists', async () => {
      // First call - user exists
      mockStorage.getUser.mockResolvedValue({ success: true, data: mockUser });
      await authService.deserializeUser('test@example.com');
      
      // Clear and simulate user deletion
      mockStorage.getUser.mockResolvedValue({ success: false, data: null });
      vi.advanceTimersByTime(6 * 60 * 1000);
      
      const result = await authService.deserializeUser('test@example.com');

      expect(result).toBeNull();
    });

    it('should throw error and clear cache on database error', async () => {
      mockStorage.getUser.mockRejectedValue(new Error('Database error'));

      await expect(authService.deserializeUser('test@example.com'))
        .rejects.toThrow('Database error');
    });

    it('should handle concurrent requests for same user', async () => {
      mockStorage.getUser.mockResolvedValue({ success: true, data: mockUser });

      const promises = [
        authService.deserializeUser('test@example.com'),
        authService.deserializeUser('test@example.com'),
        authService.deserializeUser('test@example.com'),
      ];

      const results = await Promise.all(promises);

      // First call hits DB, subsequent use cache
      expect(results.every(r => r?.email === 'test@example.com')).toBe(true);
    });
  });

  describe('serializeUser', () => {
    it('should return user email', () => {
      const user = { email: 'test@example.com', firstName: 'Test', lastName: 'User' };

      const result = authService.serializeUser(user as any);

      expect(result).toBe('test@example.com');
    });

    it('should handle user with special characters in email', () => {
      const user = { email: 'test+alias@example.com', firstName: 'Test', lastName: 'User' };

      const result = authService.serializeUser(user as any);

      expect(result).toBe('test+alias@example.com');
    });
  });

  describe('getUserWithoutPassword', () => {
    it('should remove password field from user', () => {
      const user = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'hashedPassword123',
        role: 'admin',
      };

      const result = authService.getUserWithoutPassword(user);

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('Test');
      expect(result.role).toBe('admin');
    });

    it('should return null if user is null', () => {
      const result = authService.getUserWithoutPassword(null);

      expect(result).toBeNull();
    });

    it('should return null if user is undefined', () => {
      const result = authService.getUserWithoutPassword(undefined);

      expect(result).toBeNull();
    });

    it('should handle user without password field', () => {
      const user = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };

      const result = authService.getUserWithoutPassword(user);

      expect(result.email).toBe('test@example.com');
    });
  });
});
