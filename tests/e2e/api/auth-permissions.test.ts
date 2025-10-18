import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/create-test-app';
import type { IStorage } from '@server/storage';

const mockStorage: Partial<IStorage> = {
  getAllAdmins: vi.fn(),
  getAllIdeas: vi.fn(),
  getIdeas: vi.fn(),
};

describe('Authentication & Permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Protected Routes', () => {
    it('should return 401 for unauthenticated requests', async () => {
      const unauthApp = createTestApp(mockStorage as IStorage);

      await request(unauthApp)
        .get('/api/admin/ideas')
        .expect(401);
    });

    it('should allow access with valid authentication', async () => {
      const authenticatedApp = createTestApp(mockStorage as IStorage, {
        id: 'user-1',
        email: 'user@test.com',
        role: 'super_admin',
        status: 'active'
      });

      (mockStorage.getAllIdeas as any).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 20
        }
      });

      const response = await request(authenticatedApp)
        .get('/api/admin/ideas')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should allow public access to unprotected routes', async () => {
      const publicApp = createTestApp(mockStorage as IStorage);
      
      (mockStorage.getIdeas as any).mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 20
      });

      await request(publicApp)
        .get('/api/ideas')
        .expect(200);
    });
  });

  describe('Role-Based Access Control', () => {
    it('should deny IDEAS_READER access to admin.manage routes', async () => {
      const readerApp = createTestApp(mockStorage as IStorage, {
        id: 'reader-1',
        email: 'reader@test.com',
        role: 'ideas_reader',
        status: 'active'
      });

      await request(readerApp)
        .get('/api/admin/administrators')
        .expect(403);
    });

    it('should allow IDEAS_READER access to admin.view routes', async () => {
      const readerApp = createTestApp(mockStorage as IStorage, {
        id: 'reader-1',
        email: 'reader@test.com',
        role: 'ideas_reader',
        status: 'active'
      });

      (mockStorage.getAllIdeas as any).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 20
        }
      });

      await request(readerApp)
        .get('/api/admin/ideas')
        .expect(200);
    });

    it('should allow SUPER_ADMIN access to all routes', async () => {
      const superAdminApp = createTestApp(mockStorage as IStorage, {
        id: 'super-1',
        email: 'superadmin@test.com',
        role: 'super_admin',
        status: 'active'
      });

      (mockStorage.getAllAdmins as any).mockResolvedValue({
        success: true,
        data: []
      });

      const response = await request(superAdminApp)
        .get('/api/admin/administrators')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should deny access with missing user object', async () => {
      const noUserApp = createTestApp(mockStorage as IStorage, null);

      const response = await request(noUserApp)
        .get('/api/admin/ideas')
        .expect(401);

      expect(response.body.message).toBe('Authentication required');
    });
  });

  describe('Account Status Validation', () => {
    it('should deny access to pending accounts', async () => {
      const pendingApp = createTestApp(mockStorage as IStorage, {
        id: 'pending-1',
        email: 'pending@test.com',
        role: 'ideas_reader',
        status: 'pending'
      });

      const response = await request(pendingApp)
        .get('/api/admin/ideas')
        .expect(403);

      expect(response.body.message).toContain('en attente de validation');
      expect(response.body.status).toBe('pending');
    });

    it('should deny access to inactive accounts', async () => {
      const inactiveApp = createTestApp(mockStorage as IStorage, {
        id: 'inactive-1',
        email: 'inactive@test.com',
        role: 'ideas_reader',
        status: 'inactive'
      });

      const response = await request(inactiveApp)
        .get('/api/admin/ideas')
        .expect(403);

      expect(response.body.message).toContain('désactivé');
      expect(response.body.status).toBe('inactive');
    });

    it('should allow access to active accounts', async () => {
      const activeApp = createTestApp(mockStorage as IStorage, {
        id: 'active-1',
        email: 'active@test.com',
        role: 'super_admin',
        status: 'active'
      });

      (mockStorage.getAllIdeas as any).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 20
        }
      });

      const response = await request(activeApp)
        .get('/api/admin/ideas')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('Permission Hierarchy', () => {
    it('should enforce permission hierarchy for IDEAS_MANAGER', async () => {
      const managerApp = createTestApp(mockStorage as IStorage, {
        id: 'manager-1',
        email: 'manager@test.com',
        role: 'ideas_manager',
        status: 'active'
      });

      (mockStorage.getAllIdeas as any).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 20
        }
      });

      await request(managerApp)
        .get('/api/admin/ideas')
        .expect(200);

      await request(managerApp)
        .get('/api/admin/administrators')
        .expect(403);
    });

    it('should enforce permission hierarchy for EVENTS_READER', async () => {
      const eventsReaderApp = createTestApp(mockStorage as IStorage, {
        id: 'eventreader-1',
        email: 'eventreader@test.com',
        role: 'events_reader',
        status: 'active'
      });

      (mockStorage.getAllIdeas as any).mockResolvedValue({
        success: true,
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 20
        }
      });

      await request(eventsReaderApp)
        .get('/api/admin/ideas')
        .expect(200);
    });
  });
});
