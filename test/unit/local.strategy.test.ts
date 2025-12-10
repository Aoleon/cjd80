import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';

// Mock dependencies
const mockStorageService = {
  storage: {
    getUser: vi.fn(),
  },
};

const mockPasswordService = {
  verifyPassword: vi.fn(),
};

vi.mock('../../server/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

// Import after mocks
import { LocalStrategy } from '../../server/src/auth/strategies/local.strategy';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;

  beforeEach(() => {
    vi.clearAllMocks();
    localStrategy = new LocalStrategy(
      mockStorageService as any,
      mockPasswordService as any
    );
  });

  describe('validate', () => {
    const validUser = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      password: '$2b$12$hashedPassword',
      role: 'admin',
      status: 'active',
      isActive: true,
    };

    it('should return user for valid credentials', async () => {
      mockStorageService.storage.getUser.mockResolvedValue({
        success: true,
        data: validUser,
      });
      mockPasswordService.verifyPassword.mockResolvedValue(true);

      const result = await localStrategy.validate('test@example.com', 'ValidPass1');

      expect(result).toEqual(validUser);
      expect(mockStorageService.storage.getUser).toHaveBeenCalledWith('test@example.com');
      expect(mockPasswordService.verifyPassword).toHaveBeenCalledWith('ValidPass1', '$2b$12$hashedPassword');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockStorageService.storage.getUser.mockResolvedValue({
        success: false,
        data: null,
      });

      await expect(localStrategy.validate('unknown@example.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user has no password', async () => {
      const userWithoutPassword = { ...validUser, password: null };
      mockStorageService.storage.getUser.mockResolvedValue({
        success: true,
        data: userWithoutPassword,
      });

      await expect(localStrategy.validate('test@example.com', 'password'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockStorageService.storage.getUser.mockResolvedValue({
        success: true,
        data: validUser,
      });
      mockPasswordService.verifyPassword.mockResolvedValue(false);

      await expect(localStrategy.validate('test@example.com', 'WrongPassword'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for pending user', async () => {
      const pendingUser = { ...validUser, status: 'pending' };
      mockStorageService.storage.getUser.mockResolvedValue({
        success: true,
        data: pendingUser,
      });
      mockPasswordService.verifyPassword.mockResolvedValue(true);

      await expect(localStrategy.validate('test@example.com', 'ValidPass1'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      const inactiveUser = { ...validUser, status: 'inactive' };
      mockStorageService.storage.getUser.mockResolvedValue({
        success: true,
        data: inactiveUser,
      });
      mockPasswordService.verifyPassword.mockResolvedValue(true);

      await expect(localStrategy.validate('test@example.com', 'ValidPass1'))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should normalize email to lowercase', async () => {
      mockStorageService.storage.getUser.mockResolvedValue({
        success: true,
        data: validUser,
      });
      mockPasswordService.verifyPassword.mockResolvedValue(true);

      await localStrategy.validate('TEST@EXAMPLE.COM', 'ValidPass1');

      expect(mockStorageService.storage.getUser).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle database error gracefully', async () => {
      mockStorageService.storage.getUser.mockRejectedValue(new Error('Database error'));

      await expect(localStrategy.validate('test@example.com', 'password'))
        .rejects.toThrow();
    });
  });
});
