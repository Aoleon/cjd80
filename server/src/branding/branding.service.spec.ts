import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { BadRequestException } from '@nestjs/common';
import { BrandingService } from './branding.service';
import { StorageService } from '../common/storage/storage.service';
import type { BrandingConfig } from '../../shared/schema';

// Mock StorageService
vi.mock('../common/storage/storage.service');

describe('BrandingService', () => {
  let service: BrandingService;
  let mockStorageService: any;

  const mockBrandingConfig: BrandingConfig = {
    id: 1,
    config: JSON.stringify({
      colors: {
        primary: '#3B82F6',
        secondary: '#1a1a1a',
        success: '#00c853',
        error: '#f44336',
      },
      fonts: {
        primary: 'Lato',
      },
      organization: {
        name: 'Test Organization',
        email: 'test@example.com',
      },
    }),
    updatedBy: 'admin@test.com',
    updatedAt: new Date('2024-01-15T10:00:00Z'),
  };

  beforeEach(() => {
    // Create mock storage service
    mockStorageService = {
      instance: {
        getBrandingConfig: vi.fn(),
        updateBrandingConfig: vi.fn(),
      },
    };

    // Inject mock into service
    service = new BrandingService(mockStorageService as unknown as StorageService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getBrandingConfig', () => {
    it('should return custom branding config when exists in database', async () => {
      mockStorageService.instance.getBrandingConfig.mockResolvedValue({
        success: true,
        data: mockBrandingConfig,
      });

      const result = await service.getBrandingConfig();

      expect(result).toEqual({
        ...mockBrandingConfig,
        isDefault: false,
      });
      expect(mockStorageService.instance.getBrandingConfig).toHaveBeenCalledTimes(1);
    });

    it('should return default branding config when no custom config in database', async () => {
      mockStorageService.instance.getBrandingConfig.mockResolvedValue({
        success: true,
        data: null,
      });

      const result = await service.getBrandingConfig();

      expect(result.isDefault).toBe(true);
      expect(result.config).toBeDefined();
      // Verify the config is a stringified JSON
      const parsedConfig = JSON.parse(result.config as string);
      expect(parsedConfig).toHaveProperty('organization');
      expect(parsedConfig).toHaveProperty('colors');
      expect(mockStorageService.instance.getBrandingConfig).toHaveBeenCalledTimes(1);
    });

    it('should throw BadRequestException on storage error', async () => {
      const storageError = new Error('Database connection failed');
      mockStorageService.instance.getBrandingConfig.mockResolvedValue({
        success: false,
        error: storageError,
      });

      await expect(service.getBrandingConfig()).rejects.toThrow(BadRequestException);
      await expect(service.getBrandingConfig()).rejects.toThrow('Database connection failed');
    });

    it('should throw BadRequestException on unknown error', async () => {
      mockStorageService.instance.getBrandingConfig.mockResolvedValue({
        success: false,
      });

      await expect(service.getBrandingConfig()).rejects.toThrow(BadRequestException);
      await expect(service.getBrandingConfig()).rejects.toThrow('Unknown error');
    });

    it('should handle database errors gracefully', async () => {
      const dbError = new Error('PostgreSQL connection timeout');
      mockStorageService.instance.getBrandingConfig.mockResolvedValue({
        success: false,
        error: dbError,
      });

      await expect(service.getBrandingConfig()).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateBrandingConfig', () => {
    const userEmail = 'admin@test.com';
    const newConfigStr = JSON.stringify({
      colors: {
        primary: '#00a844',
        secondary: '#1a1a1a',
      },
      organization: {
        name: 'Updated Organization',
        email: 'updated@example.com',
      },
    });

    it('should update branding config successfully', async () => {
      const updatedConfig: BrandingConfig = {
        ...mockBrandingConfig,
        config: newConfigStr,
        updatedBy: userEmail,
      };

      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: updatedConfig,
      });

      const result = await service.updateBrandingConfig(newConfigStr, userEmail);

      expect(result).toEqual(updatedConfig);
      expect(mockStorageService.instance.updateBrandingConfig).toHaveBeenCalledWith(
        newConfigStr,
        userEmail
      );
    });

    it('should throw BadRequestException when config is empty string', async () => {
      await expect(service.updateBrandingConfig('', userEmail)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.updateBrandingConfig('', userEmail)).rejects.toThrow(
        'Configuration manquante'
      );
    });

    it('should throw BadRequestException when config is null', async () => {
      await expect(service.updateBrandingConfig(null as any, userEmail)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should throw BadRequestException when config is undefined', async () => {
      await expect(service.updateBrandingConfig(undefined as any, userEmail)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should propagate storage service errors', async () => {
      const storageError = new Error('Failed to update configuration');
      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: false,
        error: storageError,
      });

      await expect(service.updateBrandingConfig(newConfigStr, userEmail)).rejects.toThrow(
        BadRequestException
      );
      await expect(service.updateBrandingConfig(newConfigStr, userEmail)).rejects.toThrow(
        'Failed to update configuration'
      );
    });

    it('should pass correct parameters to storage service', async () => {
      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: mockBrandingConfig,
      });

      await service.updateBrandingConfig(newConfigStr, userEmail);

      expect(mockStorageService.instance.updateBrandingConfig).toHaveBeenCalledExactlyOnceWith(
        newConfigStr,
        userEmail
      );
    });

    it('should handle unknown error from storage service', async () => {
      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: false,
      });

      await expect(service.updateBrandingConfig(newConfigStr, userEmail)).rejects.toThrow(
        BadRequestException
      );
    });

    it('should support different user emails', async () => {
      const differentUserEmail = 'different-admin@test.com';
      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: mockBrandingConfig,
      });

      await service.updateBrandingConfig(newConfigStr, differentUserEmail);

      expect(mockStorageService.instance.updateBrandingConfig).toHaveBeenCalledWith(
        newConfigStr,
        differentUserEmail
      );
    });
  });

  describe('Color validation', () => {
    it('should accept valid hex color in config', async () => {
      const validConfigStr = JSON.stringify({
        colors: {
          primary: '#3B82F6',
          secondary: '#1a1a1a',
        },
      });

      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: mockBrandingConfig,
      });

      const result = await service.updateBrandingConfig(validConfigStr, 'admin@test.com');

      expect(result).toBeDefined();
      const parsedConfig = JSON.parse(result.config);
      expect(parsedConfig.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should handle config with RGB colors', async () => {
      const rgbConfigStr = JSON.stringify({
        colors: {
          primary: 'rgb(59, 130, 246)',
        },
      });

      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: mockBrandingConfig,
      });

      const result = await service.updateBrandingConfig(rgbConfigStr, 'admin@test.com');
      expect(result).toBeDefined();
    });
  });

  describe('Logo validation', () => {
    it('should handle logo URLs in config', async () => {
      const configWithLogo = JSON.stringify({
        organization: {
          name: 'Test Org',
          logo: {
            url: 'https://example.com/logo.png',
            altText: 'Test Organization Logo',
          },
        },
      });

      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: mockBrandingConfig,
      });

      const result = await service.updateBrandingConfig(configWithLogo, 'admin@test.com');
      expect(result).toBeDefined();
    });

    it('should handle base64 encoded logos', async () => {
      const configWithBase64Logo = JSON.stringify({
        organization: {
          name: 'Test Org',
          logo: {
            data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          },
        },
      });

      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: mockBrandingConfig,
      });

      const result = await service.updateBrandingConfig(configWithBase64Logo, 'admin@test.com');
      expect(result).toBeDefined();
    });
  });

  describe('Persistence', () => {
    it('should persist config changes to database', async () => {
      const newConfig = JSON.stringify({
        organization: { name: 'Persistent Organization' },
      });

      const persistedConfig: BrandingConfig = {
        id: 2,
        config: newConfig,
        updatedBy: 'admin@test.com',
        updatedAt: new Date(),
      };

      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: persistedConfig,
      });

      const result = await service.updateBrandingConfig(newConfig, 'admin@test.com');

      expect(result.id).toBe(2);
      expect(result.config).toBe(newConfig);
      expect(result.updatedBy).toBe('admin@test.com');
    });

    it('should track who updated the configuration', async () => {
      const updateByEmail = 'auditor@test.com';
      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: {
          ...mockBrandingConfig,
          updatedBy: updateByEmail,
        },
      });

      const result = await service.updateBrandingConfig(
        JSON.stringify({ colors: { primary: '#ff0000' } }),
        updateByEmail
      );

      expect(result.updatedBy).toBe(updateByEmail);
    });

    it('should track update timestamp', async () => {
      const updateTime = new Date('2024-01-20T15:30:00Z');
      mockStorageService.instance.updateBrandingConfig.mockResolvedValue({
        success: true,
        data: {
          ...mockBrandingConfig,
          updatedAt: updateTime,
        },
      });

      const result = await service.updateBrandingConfig(
        JSON.stringify({ colors: { primary: '#00ff00' } }),
        'admin@test.com'
      );

      expect(result.updatedAt).toEqual(updateTime);
    });
  });
});
