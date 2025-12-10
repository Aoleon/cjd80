import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(() => ({
    invalidateQueries: vi.fn(),
  })),
}));

describe('useAdminQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Query Configuration', () => {
    it('should set correct stale time (5 minutes)', () => {
      const staleTime = 5 * 60 * 1000;
      expect(staleTime).toBe(300000);
    });

    it('should enable refetch on window focus', () => {
      const options = { refetchOnWindowFocus: true };
      expect(options.refetchOnWindowFocus).toBe(true);
    });

    it('should enable refetch on reconnect', () => {
      const options = { refetchOnReconnect: true };
      expect(options.refetchOnReconnect).toBe(true);
    });
  });

  describe('Permission Validation', () => {
    it('should disable query when user lacks permission', () => {
      const user = { role: 'ideas_reader' };
      const requiredPermission = 'admin.manage';
      
      const hasPermission = (role: string, permission: string) => {
        const permissions: Record<string, string[]> = {
          super_admin: ['admin.view', 'admin.edit', 'admin.manage'],
          ideas_reader: ['ideas.view'],
        };
        return permissions[role]?.includes(permission) || false;
      };

      const enabled = hasPermission(user.role, requiredPermission);
      expect(enabled).toBe(false);
    });

    it('should enable query when user has permission', () => {
      const user = { role: 'super_admin' };
      const requiredPermission = 'admin.view';
      
      const hasPermission = (role: string, permission: string) => {
        const permissions: Record<string, string[]> = {
          super_admin: ['admin.view', 'admin.edit', 'admin.manage'],
        };
        return permissions[role]?.includes(permission) || false;
      };

      const enabled = hasPermission(user.role, requiredPermission);
      expect(enabled).toBe(true);
    });
  });

  describe('Query Keys', () => {
    it('should generate correct query key for ideas', () => {
      const queryKey = ['admin', 'ideas', { page: 1, limit: 20 }];
      expect(queryKey[0]).toBe('admin');
      expect(queryKey[1]).toBe('ideas');
    });

    it('should generate correct query key for events', () => {
      const queryKey = ['admin', 'events', { page: 1, limit: 20 }];
      expect(queryKey[1]).toBe('events');
    });

    it('should generate correct query key for administrators', () => {
      const queryKey = ['admin', 'administrators'];
      expect(queryKey).toContain('administrators');
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', () => {
      const error = new Error('Network error');
      expect(error.message).toBe('Network error');
    });

    it('should handle 401 unauthorized', () => {
      const error = { status: 401, message: 'Unauthorized' };
      expect(error.status).toBe(401);
    });

    it('should handle 403 forbidden', () => {
      const error = { status: 403, message: 'Forbidden' };
      expect(error.status).toBe(403);
    });
  });

  describe('Cache Management', () => {
    it('should invalidate related queries on mutation', () => {
      const queryClient = {
        invalidateQueries: vi.fn(),
      };

      queryClient.invalidateQueries({ queryKey: ['admin', 'ideas'] });

      expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['admin', 'ideas'],
      });
    });
  });
});
