import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/create-test-app';
import type { IStorage } from '@server/storage';

const mockStorage: Partial<IStorage> = {
  getBrandingConfig: vi.fn(),
  updateBrandingConfig: vi.fn(),
};

// Mock branding-core module
vi.mock('../../client/src/config/branding-core', () => ({
  brandingCore: {
    orgName: "Default Organization",
    theme: {
      primaryColor: "#3b82f6",
      secondaryColor: "#10b981"
    },
    logo: {
      url: "/default-logo.png",
      altText: "Default Logo"
    }
  }
}));

describe('Branding Configuration API', () => {
  let app: any;

  beforeEach(() => {
    // Create app with REAL routes using mock storage
    app = createTestApp(mockStorage as IStorage);
    vi.clearAllMocks();
  });

  describe('GET /api/admin/branding', () => {
    it('should allow public access to read branding', async () => {
      mockStorage.getBrandingConfig.mockResolvedValue({
        success: true,
        data: {
          id: 1,
          config: JSON.stringify({ orgName: 'Test Org' }),
          updatedBy: 'admin@test.com',
          updatedAt: new Date()
        }
      });

      const response = await request(app)
        .get('/api/admin/branding')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.isDefault).toBe(false);
    });

    it('should return default config if none in DB', async () => {
      mockStorage.getBrandingConfig.mockResolvedValue({
        success: true,
        data: null
      });

      const response = await request(app)
        .get('/api/admin/branding')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.isDefault).toBe(true);
      const config = JSON.parse(response.body.data.config);
      expect(config.orgName).toBe('Default Organization');
    });

    it('should return saved config from DB', async () => {
      const customConfig = {
        orgName: 'Custom Organization',
        theme: { primaryColor: '#ff0000' }
      };
      
      mockStorage.getBrandingConfig.mockResolvedValue({
        success: true,
        data: {
          id: 1,
          config: JSON.stringify(customConfig),
          updatedBy: 'admin@test.com',
          updatedAt: new Date()
        }
      });

      const response = await request(app)
        .get('/api/admin/branding')
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(response.body.data.isDefault).toBe(false);
      const config = JSON.parse(response.body.data.config);
      expect(config.orgName).toBe('Custom Organization');
    });

    it('should return 500 on storage error', async () => {
      mockStorage.getBrandingConfig.mockResolvedValue({
        success: false,
        error: { message: 'Database error' }
      });

      const response = await request(app)
        .get('/api/admin/branding')
        .expect(500);
      
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
    });
  });

  describe('PUT /api/admin/branding', () => {
    it('should require authentication', async () => {
      // App without authenticated user
      const unauthApp = createTestApp(mockStorage as IStorage);

      const response = await request(unauthApp)
        .put('/api/admin/branding')
        .send({ config: JSON.stringify({ orgName: 'New Name' }) })
        .expect(401);

      expect(response.body.message).toBe('Authentication required');
    });

    it('should require admin.manage permission (deny non-super_admin)', async () => {
      // App with authenticated user but insufficient permissions
      const appWithLimitedUser = createTestApp(mockStorage as IStorage, {
        email: 'admin@test.com',
        role: 'ideas_manager',
        status: 'active'
      });

      await request(appWithLimitedUser)
        .put('/api/admin/branding')
        .send({ config: JSON.stringify({}) })
        .expect(403);
    });

    it('should allow super_admin to update config', async () => {
      // App with super_admin user
      const superAdminApp = createTestApp(mockStorage as IStorage, {
        email: 'superadmin@test.com',
        role: 'super_admin',
        status: 'active'
      });

      const newConfig = JSON.stringify({ orgName: 'New Organization' });
      (mockStorage.updateBrandingConfig as any).mockResolvedValue({
        success: true,
        data: {
          id: 1,
          config: newConfig,
          updatedBy: 'superadmin@test.com',
          updatedAt: new Date()
        }
      });

      const response = await request(superAdminApp)
        .put('/api/admin/branding')
        .send({ config: newConfig })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockStorage.updateBrandingConfig).toHaveBeenCalledWith(
        newConfig,
        'superadmin@test.com'
      );
    });

    it('should reject missing config', async () => {
      const superAdminApp = createTestApp(mockStorage as IStorage, {
        email: 'superadmin@test.com',
        role: 'super_admin',
        status: 'active'
      });

      await request(superAdminApp)
        .put('/api/admin/branding')
        .send({})
        .expect(400);
    });

    it('should handle storage errors', async () => {
      const superAdminApp = createTestApp(mockStorage as IStorage, {
        email: 'superadmin@test.com',
        role: 'super_admin',
        status: 'active'
      });

      (mockStorage.updateBrandingConfig as any).mockResolvedValue({
        success: false,
        error: { message: 'Database constraint violation' }
      });

      const response = await request(superAdminApp)
        .put('/api/admin/branding')
        .send({ config: JSON.stringify({ orgName: 'Test' }) })
        .expect(400);

      expect(response.body.error).toBe('Database constraint violation');
    });
  });
});
