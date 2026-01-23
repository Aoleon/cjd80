import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';
import { StorageService } from '../common/storage/storage.service';
import { IdeasService } from '../ideas/ideas.service';
import { EventsService } from '../events/events.service';

describe('AdminService', () => {
  let adminService: AdminService;
  let storageService: StorageService;
  let ideasService: IdeasService;
  let eventsService: EventsService;

  beforeEach(() => {
    // Mock dependencies
    storageService = {
      instance: {
        getAllIdeas: vi.fn(),
        updateIdea: vi.fn(),
        toggleIdeaFeatured: vi.fn(),
        transformIdeaToEvent: vi.fn(),
        getAllEvents: vi.fn(),
        updateEvent: vi.fn(),
        updateEventStatus: vi.fn(),
        getEventInscriptions: vi.fn(),
        createInscription: vi.fn(),
        deleteInscription: vi.fn(),
        getVotesByIdea: vi.fn(),
        deleteVote: vi.fn(),
        getAllAdmins: vi.fn(),
        getPendingAdmins: vi.fn(),
        createUser: vi.fn(),
        updateAdminRole: vi.fn(),
        updateAdminStatus: vi.fn(),
        updateAdminInfo: vi.fn(),
        deleteAdmin: vi.fn(),
        approveAdmin: vi.fn(),
        getAdminStats: vi.fn(),
        getEventUnsubscriptions: vi.fn(),
        deleteUnsubscription: vi.fn(),
        updateUnsubscription: vi.fn(),
        getDevelopmentRequests: vi.fn(),
        createDevelopmentRequest: vi.fn(),
        updateDevelopmentRequest: vi.fn(),
      },
    } as any;

    ideasService = {
      updateIdeaStatus: vi.fn(),
      getVotesByIdea: vi.fn(),
      createVote: vi.fn(),
    } as any;

    eventsService = {} as any;

    adminService = new AdminService(storageService, ideasService, eventsService);
  });

  // ===== Tests des Administrateurs (CRUD + RBAC) =====

  describe('Administrator Management - CRUD', () => {
    describe('getAllAdministrators', () => {
      it('should return all administrators with passwords sanitized', async () => {
        const mockAdmins = [
          {
            email: 'admin1@example.com',
            firstName: 'Admin',
            lastName: 'One',
            role: 'super_admin',
            isActive: true,
            password: 'hashed_password_1',
          },
          {
            email: 'admin2@example.com',
            firstName: 'Admin',
            lastName: 'Two',
            role: 'ideas_manager',
            isActive: true,
            password: 'hashed_password_2',
          },
        ];

        vi.mocked(storageService.instance.getAllAdmins).mockResolvedValue({
          success: true,
          data: mockAdmins,
        });

        const result = await adminService.getAllAdministrators();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(2);
        expect(result.data[0].password).toBeUndefined();
        expect(result.data[0].email).toBe('admin1@example.com');
        expect(result.data[1].role).toBe('ideas_manager');
      });

      it('should throw BadRequestException on storage error', async () => {
        const error = new Error('Database error');
        vi.mocked(storageService.instance.getAllAdmins).mockResolvedValue({
          success: false,
          error,
        });

        await expect(adminService.getAllAdministrators()).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('getPendingAdministrators', () => {
      it('should return pending administrators for approval', async () => {
        const mockPendingAdmins = [
          {
            email: 'pending@example.com',
            firstName: 'Pending',
            lastName: 'Admin',
            role: 'ideas_reader',
            isActive: false,
            password: 'hashed_password_3',
          },
        ];

        vi.mocked(storageService.instance.getPendingAdmins).mockResolvedValue({
          success: true,
          data: mockPendingAdmins,
        });

        const result = await adminService.getPendingAdministrators();

        expect(result.success).toBe(true);
        expect(result.data).toHaveLength(1);
        expect(result.data[0].email).toBe('pending@example.com');
        expect(result.data[0].password).toBeUndefined();
      });

      it('should throw BadRequestException when storage fails', async () => {
        const error = new Error('Database error');
        vi.mocked(storageService.instance.getPendingAdmins).mockResolvedValue({
          success: false,
          error,
        });

        await expect(adminService.getPendingAdministrators()).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('createAdministrator', () => {
      it('should create a new administrator with valid data', async () => {
        const createData = {
          email: 'newadmin@example.com',
          firstName: 'New',
          lastName: 'Admin',
          role: 'super_admin',
        };

        const mockCreatedAdmin = {
          ...createData,
          isActive: true,
          password: undefined,
        };

        vi.mocked(storageService.instance.createUser).mockResolvedValue({
          success: true,
          data: mockCreatedAdmin,
        });

        const result = await adminService.createAdministrator(
          createData,
          'creator@example.com',
        );

        expect(result.success).toBe(true);
        expect(result.data.email).toBe('newadmin@example.com');
        expect(result.data.role).toBe('super_admin');
        expect(result.message).toContain('succès');
      });

      it('should throw BadRequestException with invalid data', async () => {
        const invalidData = {
          email: 'newadmin@example.com',
          // Missing firstName, lastName, role
        };

        await expect(
          adminService.createAdministrator(invalidData, 'creator@example.com'),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when storage fails', async () => {
        const createData = {
          email: 'newadmin@example.com',
          firstName: 'New',
          lastName: 'Admin',
          role: 'admin',
        };

        const error = new Error('Email already exists');
        vi.mocked(storageService.instance.createUser).mockResolvedValue({
          success: false,
          error,
        });

        await expect(
          adminService.createAdministrator(createData, 'creator@example.com'),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('deleteAdministrator', () => {
      it('should delete an administrator', async () => {
        vi.mocked(storageService.instance.deleteAdmin).mockResolvedValue({
          success: true,
        });

        const result = await adminService.deleteAdministrator(
          'admin@example.com',
          'currentuser@example.com',
        );

        expect(result.success).toBe(true);
        expect(result.message).toContain('succès');
        expect(storageService.instance.deleteAdmin).toHaveBeenCalledWith(
          'admin@example.com',
        );
      });

      it('should throw error when trying to delete self', async () => {
        const email = 'currentuser@example.com';

        await expect(
          adminService.deleteAdministrator(email, email),
        ).rejects.toThrow(BadRequestException);

        expect(storageService.instance.deleteAdmin).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException on storage error', async () => {
        const error = new Error('Database error');
        vi.mocked(storageService.instance.deleteAdmin).mockResolvedValue({
          success: false,
          error,
        });

        await expect(
          adminService.deleteAdministrator(
            'admin@example.com',
            'currentuser@example.com',
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  // ===== Tests des Permissions RBAC =====

  describe('Administrator Permissions - RBAC', () => {
    describe('updateAdministratorRole', () => {
      it('should update an administrator role', async () => {
        const mockUpdatedAdmin = {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ideas_manager',
          isActive: true,
        };

        vi.mocked(storageService.instance.updateAdminRole).mockResolvedValue({
          success: true,
          data: mockUpdatedAdmin,
        });

        const result = await adminService.updateAdministratorRole(
          'admin@example.com',
          'ideas_manager',
          'currentuser@example.com',
        );

        expect(result.success).toBe(true);
        expect(result.data.role).toBe('ideas_manager');
        expect(storageService.instance.updateAdminRole).toHaveBeenCalledWith(
          'admin@example.com',
          'ideas_manager',
        );
      });

      it('should prevent self-role modification', async () => {
        const email = 'admin@example.com';

        await expect(
          adminService.updateAdministratorRole(email, 'moderator', email),
        ).rejects.toThrow(BadRequestException);

        expect(storageService.instance.updateAdminRole).not.toHaveBeenCalled();
      });

      it('should throw error for invalid role', async () => {
        const invalidRole = 'invalid_role'; // Invalid role

        await expect(
          adminService.updateAdministratorRole(
            'admin@example.com',
            invalidRole,
            'currentuser@example.com',
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException on storage error', async () => {
        const error = new Error('Update failed');
        vi.mocked(storageService.instance.updateAdminRole).mockResolvedValue({
          success: false,
          error,
        });

        await expect(
          adminService.updateAdministratorRole(
            'admin@example.com',
            'admin',
            'currentuser@example.com',
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateAdministratorStatus', () => {
      it('should activate an administrator', async () => {
        const mockUpdatedAdmin = {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: true,
        };

        vi.mocked(storageService.instance.updateAdminStatus).mockResolvedValue({
          success: true,
          data: mockUpdatedAdmin,
        });

        const result = await adminService.updateAdministratorStatus(
          'admin@example.com',
          true,
          'currentuser@example.com',
        );

        expect(result.success).toBe(true);
        expect(result.data.isActive).toBe(true);
      });

      it('should deactivate an administrator', async () => {
        const mockUpdatedAdmin = {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          isActive: false,
        };

        vi.mocked(storageService.instance.updateAdminStatus).mockResolvedValue({
          success: true,
          data: mockUpdatedAdmin,
        });

        const result = await adminService.updateAdministratorStatus(
          'admin@example.com',
          false,
          'currentuser@example.com',
        );

        expect(result.success).toBe(true);
        expect(result.data.isActive).toBe(false);
      });

      it('should prevent self-deactivation', async () => {
        const email = 'admin@example.com';

        await expect(
          adminService.updateAdministratorStatus(email, false, email),
        ).rejects.toThrow(BadRequestException);

        expect(storageService.instance.updateAdminStatus).not.toHaveBeenCalled();
      });

      it('should throw error when invalid status type provided', async () => {
        await expect(
          adminService.updateAdministratorStatus(
            'admin@example.com',
            'invalid',
            'currentuser@example.com',
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('approveAdministrator', () => {
      it('should approve a pending administrator with role assignment', async () => {
        const mockApprovedAdmin = {
          email: 'pending@example.com',
          firstName: 'Pending',
          lastName: 'Admin',
          role: 'ideas_manager',
          isActive: true,
        };

        vi.mocked(storageService.instance.approveAdmin).mockResolvedValue({
          success: true,
          data: mockApprovedAdmin,
        });

        const result = await adminService.approveAdministrator(
          'pending@example.com',
          'ideas_manager',
        );

        expect(result.success).toBe(true);
        expect(result.data.role).toBe('ideas_manager');
        expect(result.data.isActive).toBe(true);
        expect(result.message).toContain('succès');
      });

      it('should throw error for missing role', async () => {
        await expect(
          adminService.approveAdministrator('pending@example.com', null),
        ).rejects.toThrow(BadRequestException);

        expect(storageService.instance.approveAdmin).not.toHaveBeenCalled();
      });

      it('should throw error for invalid role', async () => {
        await expect(
          adminService.approveAdministrator(
            'pending@example.com',
            'invalid_role',
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException on storage error', async () => {
        const error = new Error('Approval failed');
        vi.mocked(storageService.instance.approveAdmin).mockResolvedValue({
          success: false,
          error,
        });

        await expect(
          adminService.approveAdministrator('pending@example.com', 'super_admin'),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('rejectAdministrator', () => {
      it('should reject a pending administrator (delete)', async () => {
        vi.mocked(storageService.instance.deleteAdmin).mockResolvedValue({
          success: true,
        });

        const result = await adminService.rejectAdministrator(
          'pending@example.com',
        );

        expect(result.success).toBe(true);
        expect(result.message).toContain('supprimé');
        expect(storageService.instance.deleteAdmin).toHaveBeenCalledWith(
          'pending@example.com',
        );
      });

      it('should throw BadRequestException on storage error', async () => {
        const error = new Error('Rejection failed');
        vi.mocked(storageService.instance.deleteAdmin).mockResolvedValue({
          success: false,
          error,
        });

        await expect(
          adminService.rejectAdministrator('pending@example.com'),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('updateAdministratorInfo', () => {
      it('should update administrator information', async () => {
        const updateData = {
          firstName: 'Updated',
          lastName: 'Name',
        };

        const mockUpdatedAdmin = {
          id: '1',
          email: 'admin@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          role: 'admin',
          isActive: true,
        };

        vi.mocked(storageService.instance.updateAdminInfo).mockResolvedValue({
          success: true,
          data: mockUpdatedAdmin,
        });

        const result = await adminService.updateAdministratorInfo(
          'admin@example.com',
          updateData,
          'currentuser@example.com',
        );

        expect(result.success).toBe(true);
        expect(result.data.firstName).toBe('Updated');
        expect(result.message).toContain('succès');
      });

      it('should prevent self-info modification', async () => {
        const email = 'admin@example.com';
        const updateData = { firstName: 'Updated' };

        await expect(
          adminService.updateAdministratorInfo(email, updateData, email),
        ).rejects.toThrow(BadRequestException);

        expect(storageService.instance.updateAdminInfo).not.toHaveBeenCalled();
      });

      it('should throw BadRequestException with invalid data', async () => {
        const invalidData = {
          firstName: '', // Empty name
        };

        await expect(
          adminService.updateAdministratorInfo(
            'admin@example.com',
            invalidData,
            'currentuser@example.com',
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException on storage error', async () => {
        const updateData = { firstName: 'Updated' };
        const error = new Error('Update failed');
        vi.mocked(storageService.instance.updateAdminInfo).mockResolvedValue({
          success: false,
          error,
        });

        await expect(
          adminService.updateAdministratorInfo(
            'admin@example.com',
            updateData,
            'currentuser@example.com',
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  // ===== Tests de la Synchronisation Authentik =====

  describe('Authentik User Sync', () => {
    it('should create administrator entry when Authentik user is created', async () => {
      const authentikUserData = {
        email: 'authentik@example.com',
        firstName: 'Authentik',
        lastName: 'User',
        role: 'ideas_reader',
      };

      const mockCreatedAdmin = {
        ...authentikUserData,
        isActive: false, // Pending approval
        password: undefined, // Handled by Authentik
      };

      vi.mocked(storageService.instance.createUser).mockResolvedValue({
        success: true,
        data: mockCreatedAdmin,
      });

      const result = await adminService.createAdministrator(
        authentikUserData,
        'admin@example.com',
      );

      expect(result.success).toBe(true);
      expect(result.data.password).toBeUndefined();
      expect(result.data.email).toBe('authentik@example.com');
    });

    it('should handle concurrent Authentik sync requests', async () => {
      const mockAdmin = {
        email: 'concurrent@example.com',
        firstName: 'Concurrent',
        lastName: 'Admin',
        role: 'ideas_manager',
        isActive: true,
      };

      vi.mocked(storageService.instance.createUser)
        .mockResolvedValueOnce({ success: true, data: mockAdmin })
        .mockResolvedValueOnce({ success: true, data: mockAdmin });

      const results = await Promise.all([
        adminService.createAdministrator(
          { email: 'concurrent@example.com', firstName: 'Concurrent', lastName: 'Admin', role: 'ideas_manager' },
          'admin@example.com',
        ),
        adminService.createAdministrator(
          { email: 'concurrent@example.com', firstName: 'Concurrent', lastName: 'Admin', role: 'ideas_manager' },
          'admin@example.com',
        ),
      ]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
  });

  // ===== Tests d'Intégrité et de Sécurité =====

  describe('Security & Integrity', () => {
    it('should never expose passwords in responses', async () => {
      const mockAdmins = [
        {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'super_admin',
          isActive: true,
          password: 'super_secret_hash',
        },
      ];

      vi.mocked(storageService.instance.getAllAdmins).mockResolvedValue({
        success: true,
        data: mockAdmins,
      });

      const result = await adminService.getAllAdministrators();

      expect(result.data[0].password).toBeUndefined();
      result.data.forEach((admin) => {
        expect(admin.password).toBeUndefined();
      });
    });

    it('should prevent privilege escalation - non-admins cannot create admins', async () => {
      // This is enforced by the controller with Permissions guard,
      // but service should validate role is valid
      const invalidRole = 'hacker';

      await expect(
        adminService.createAdministrator(
          {
            email: 'hack@example.com',
            firstName: 'Hack',
            lastName: 'Attempt',
            role: invalidRole,
          },
          'viewer@example.com',
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should enforce business rule - cannot modify own account', async () => {
      const email = 'admin@example.com';

      // Cannot change own role
      await expect(
        adminService.updateAdministratorRole(email, 'moderator', email),
      ).rejects.toThrow();

      // Cannot deactivate self
      await expect(
        adminService.updateAdministratorStatus(email, false, email),
      ).rejects.toThrow();

      // Cannot delete self
      await expect(
        adminService.deleteAdministrator(email, email),
      ).rejects.toThrow();

      // Cannot modify own info
      await expect(
        adminService.updateAdministratorInfo(
          email,
          { firstName: 'Updated' },
          email,
        ),
      ).rejects.toThrow();
    });
  });
});
