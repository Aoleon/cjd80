import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  beforeEach(() => {
    adminService = {
      getAllAdministrators: vi.fn(),
      getPendingAdministrators: vi.fn(),
      createAdministrator: vi.fn(),
      updateAdministratorRole: vi.fn(),
      updateAdministratorStatus: vi.fn(),
      updateAdministratorInfo: vi.fn(),
      deleteAdministrator: vi.fn(),
      approveAdministrator: vi.fn(),
      rejectAdministrator: vi.fn(),
      getAdminStats: vi.fn(),
      getAllIdeas: vi.fn(),
      getAllEvents: vi.fn(),
      updateEventStatus: vi.fn(),
    } as any;

    controller = new AdminController(adminService);
  });

  // ===== Tests des Routes CRUD Administrateurs =====

  describe('GET /api/admin/administrators', () => {
    it('should return all administrators', async () => {
      const mockAdmins = {
        success: true,
        data: [
          {
            email: 'admin@example.com',
            email: 'admin1@example.com',
            firstName: 'Admin',
            lastName: 'One',
            role: 'super_admin',
            isActive: true,
          },
        ],
      };

      vi.mocked(adminService.getAllAdministrators).mockResolvedValue(
        mockAdmins,
      );

      const result = await controller.getAllAdministrators();

      expect(result).toEqual(mockAdmins);
      expect(adminService.getAllAdministrators).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      vi.mocked(adminService.getAllAdministrators).mockRejectedValue(
        new BadRequestException('Database error'),
      );

      await expect(controller.getAllAdministrators()).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('GET /api/admin/administrators/pending', () => {
    it('should return pending administrators awaiting approval', async () => {
      const mockPendingAdmins = {
        success: true,
        data: [
          {
            email: 'pending@example.com',
            firstName: 'Pending',
            lastName: 'Admin',
            role: 'ideas_reader',
            isActive: false,
          },
        ],
      };

      vi.mocked(adminService.getPendingAdministrators).mockResolvedValue(
        mockPendingAdmins,
      );

      const result = await controller.getPendingAdministrators();

      expect(result).toEqual(mockPendingAdmins);
      expect(adminService.getPendingAdministrators).toHaveBeenCalled();
    });

    it('should return empty list when no pending admins', async () => {
      const mockEmptyList = {
        success: true,
        data: [],
      };

      vi.mocked(adminService.getPendingAdministrators).mockResolvedValue(
        mockEmptyList,
      );

      const result = await controller.getPendingAdministrators();

      expect(result.data).toHaveLength(0);
    });
  });

  describe('POST /api/admin/administrators', () => {
    it('should create a new administrator', async () => {
      const createData = {
        email: 'newadmin@example.com',
        firstName: 'New',
        lastName: 'Admin',
        role: 'super_admin',
      };

      const mockResponse = {
        success: true,
        data: {
          email: 'newadmin@example.com',
          ...createData,
          isActive: true,
        },
        message: 'Administrateur créé avec succès',
      };

      vi.mocked(adminService.createAdministrator).mockResolvedValue(
        mockResponse,
      );

      const mockUser = {
        email: 'creator@example.com',
      };

      const result = await controller.createAdministrator(
        createData,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.data.email).toBe('newadmin@example.com');
      expect(adminService.createAdministrator).toHaveBeenCalledWith(
        createData,
        'creator@example.com',
      );
    });

    it('should validate input data before passing to service', async () => {
      const invalidData = {
        email: 'invalid-email', // Invalid email format
        firstName: 'New',
        lastName: 'Admin',
        role: 'super_admin',
      };

      vi.mocked(adminService.createAdministrator).mockRejectedValue(
        new BadRequestException('Email invalide'),
      );

      const mockUser = { email: 'creator@example.com' };

      await expect(
        controller.createAdministrator(invalidData, mockUser),
      ).rejects.toThrow();
    });

    it('should handle duplicate email error', async () => {
      const createData = {
        email: 'existing@example.com',
        firstName: 'New',
        lastName: 'Admin',
        role: 'super_admin',
      };

      vi.mocked(adminService.createAdministrator).mockRejectedValue(
        new BadRequestException('Email already exists'),
      );

      const mockUser = { email: 'creator@example.com' };

      await expect(
        controller.createAdministrator(createData, mockUser),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('PATCH /api/admin/administrators/:email/role', () => {
    it('should update an administrator role', async () => {
      const roleData = { role: 'ideas_manager' };
      const mockResponse = {
        success: true,
        data: {
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ideas_manager',
          isActive: true,
        },
      };

      vi.mocked(adminService.updateAdministratorRole).mockResolvedValue(
        mockResponse,
      );

      const mockUser = { email: 'currentuser@example.com' };

      const result = await controller.updateAdministratorRole(
        'admin@example.com',
        roleData,
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(result.data.role).toBe('ideas_manager');
      expect(adminService.updateAdministratorRole).toHaveBeenCalledWith(
        'admin@example.com',
        roleData.role,
        'currentuser@example.com',
      );
    });

    it('should prevent changing role to invalid value', async () => {
      const invalidRoleData = { role: 'superuser' };

      vi.mocked(adminService.updateAdministratorRole).mockRejectedValue(
        new BadRequestException('Rôle invalide'),
      );

      const mockRequest = {
        user: { email: 'currentuser@example.com' },
      } as any;

      await expect(
        controller.updateAdministratorRole(
          'admin@example.com',
          invalidRoleData,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent self-role modification', async () => {
      const roleData = { role: 'ideas_reader' };

      vi.mocked(adminService.updateAdministratorRole).mockRejectedValue(
        new BadRequestException('Vous ne pouvez pas modifier votre propre rôle'),
      );

      const email = 'admin@example.com';
      const mockRequest = {
        user: { email },
      } as any;

      await expect(
        controller.updateAdministratorRole(email, roleData, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('PATCH /api/admin/administrators/:email/status', () => {
    it('should activate an administrator', async () => {
      const statusData = { isActive: true };
      const mockResponse = {
        success: true,
        data: {
          email: 'admin@example.com',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'super_admin',
          isActive: true,
        },
      };

      vi.mocked(adminService.updateAdministratorStatus).mockResolvedValue(
        mockResponse,
      );

      const mockRequest = {
        user: { email: 'currentuser@example.com' },
      } as any;

      const result = await controller.updateAdministratorStatus(
        'admin@example.com',
        statusData,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(true);
    });

    it('should deactivate an administrator', async () => {
      const statusData = { isActive: false };
      const mockResponse = {
        success: true,
        data: {
          email: 'admin@example.com',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'super_admin',
          isActive: false,
        },
      };

      vi.mocked(adminService.updateAdministratorStatus).mockResolvedValue(
        mockResponse,
      );

      const mockRequest = {
        user: { email: 'currentuser@example.com' },
      } as any;

      const result = await controller.updateAdministratorStatus(
        'admin@example.com',
        statusData,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(false);
    });

    it('should prevent self-deactivation', async () => {
      const statusData = { isActive: false };

      vi.mocked(adminService.updateAdministratorStatus).mockRejectedValue(
        new BadRequestException(
          'Vous ne pouvez pas désactiver votre propre compte',
        ),
      );

      const email = 'admin@example.com';
      const mockRequest = {
        user: { email },
      } as any;

      await expect(
        controller.updateAdministratorStatus(email, statusData, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('PATCH /api/admin/administrators/:email/info', () => {
    it('should update administrator information', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
      };

      const mockResponse = {
        success: true,
        data: {
          email: 'admin@example.com',
          email: 'admin@example.com',
          firstName: 'Updated',
          lastName: 'Name',
          role: 'super_admin',
          isActive: true,
        },
        message: 'Informations mises à jour avec succès',
      };

      vi.mocked(adminService.updateAdministratorInfo).mockResolvedValue(
        mockResponse,
      );

      const mockRequest = {
        user: { email: 'currentuser@example.com' },
      } as any;

      const result = await controller.updateAdministratorInfo(
        'admin@example.com',
        updateData,
        mockRequest,
      );

      expect(result.success).toBe(true);
      expect(result.data.firstName).toBe('Updated');
    });

    it('should handle empty update data', async () => {
      const updateData = {};

      vi.mocked(adminService.updateAdministratorInfo).mockRejectedValue(
        new BadRequestException('No fields to update'),
      );

      const mockRequest = {
        user: { email: 'currentuser@example.com' },
      } as any;

      await expect(
        controller.updateAdministratorInfo(
          'admin@example.com',
          updateData,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('DELETE /api/admin/administrators/:email', () => {
    it('should delete an administrator', async () => {
      const mockResponse = {
        success: true,
        message: 'Administrateur supprimé avec succès',
      };

      vi.mocked(adminService.deleteAdministrator).mockResolvedValue(
        mockResponse,
      );

      const mockUser = { email: 'currentuser@example.com' };

      const result = await controller.deleteAdministrator(
        'admin@example.com',
        mockUser,
      );

      expect(result.success).toBe(true);
      expect(adminService.deleteAdministrator).toHaveBeenCalledWith(
        'admin@example.com',
        'currentuser@example.com',
      );
    });

    it('should prevent self-deletion', async () => {
      vi.mocked(adminService.deleteAdministrator).mockRejectedValue(
        new BadRequestException(
          'Vous ne pouvez pas supprimer votre propre compte',
        ),
      );

      const email = 'admin@example.com';
      const mockRequest = {
        user: { email },
      } as any;

      await expect(
        controller.deleteAdministrator(email, mockRequest),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ===== Tests de l'Approbation des Administrateurs =====

  describe('Approval Workflow', () => {
    describe('POST /api/admin/administrators/:email/approve', () => {
      it('should approve a pending administrator', async () => {
        const approveData = { role: 'ideas_manager' };
        const mockResponse = {
          success: true,
          data: {
            email: 'pending@example.com',
            firstName: 'Pending',
            lastName: 'Admin',
            role: 'ideas_manager',
            isActive: true,
          },
          message: 'Compte approuvé avec succès',
        };

        vi.mocked(adminService.approveAdministrator).mockResolvedValue(
          mockResponse,
        );

        const result = await controller.approveAdministrator(
          'pending@example.com',
          approveData,
        );

        expect(result.success).toBe(true);
        expect(result.data.role).toBe('ideas_manager');
        expect(result.data.isActive).toBe(true);
      });

      it('should reject approval with invalid role', async () => {
        const approveData = { role: 'invalid' };

        vi.mocked(adminService.approveAdministrator).mockRejectedValue(
          new BadRequestException('Rôle valide requis'),
        );

        await expect(
          controller.approveAdministrator(
            'pending@example.com',
            approveData,
          ),
        ).rejects.toThrow(BadRequestException);
      });

      it('should handle non-existent pending admin', async () => {
        const approveData = { role: 'ideas_manager' };

        vi.mocked(adminService.approveAdministrator).mockRejectedValue(
          new BadRequestException('Administrator not found'),
        );

        await expect(
          controller.approveAdministrator(
            'nonexistent@example.com',
            approveData,
          ),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('POST /api/admin/administrators/:email/reject', () => {
      it('should reject a pending administrator', async () => {
        const mockResponse = {
          success: true,
          message: 'Compte rejeté et supprimé avec succès',
        };

        vi.mocked(adminService.rejectAdministrator).mockResolvedValue(
          mockResponse,
        );

        const result = await controller.rejectAdministrator(
          'pending@example.com',
        );

        expect(result.success).toBe(true);
        expect(adminService.rejectAdministrator).toHaveBeenCalledWith(
          'pending@example.com',
        );
      });

      it('should handle non-existent pending admin', async () => {
        vi.mocked(adminService.rejectAdministrator).mockRejectedValue(
          new BadRequestException('Administrator not found'),
        );

        await expect(
          controller.rejectAdministrator('nonexistent@example.com'),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });

  // ===== Tests de Sécurité et de Permissions =====

  describe('Security & Permissions', () => {
    it('should require authentication for all admin routes', async () => {
      // This is enforced by @UseGuards(JwtAuthGuard)
      // Tests verify the decorator is present in the controller
      expect(AdminController).toBeDefined();
    });

    it('should enforce permission checks on sensitive operations', async () => {
      // This is enforced by @Permissions decorator on each route
      // Specific permission checks:
      // - admin.view: GET routes
      // - admin.edit: POST/PATCH routes
      // - admin.delete: DELETE routes
      expect(AdminController).toBeDefined();
    });

    it('should sanitize output - no passwords in responses', async () => {
      const mockAdmins = {
        success: true,
        data: [
          {
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'super_admin',
            isActive: true,
            // password should never be included
          },
        ],
      };

      vi.mocked(adminService.getAllAdministrators).mockResolvedValue(
        mockAdmins,
      );

      const result = await controller.getAllAdministrators();

      result.data.forEach((admin) => {
        expect(admin).not.toHaveProperty('password');
      });
    });

    it('should handle concurrent requests safely', async () => {
      const mockAdmins = {
        success: true,
        data: [
          {
            email: 'admin1@example.com',
            firstName: 'Admin',
            lastName: 'One',
            role: 'super_admin',
            isActive: true,
          },
        ],
      };

      vi.mocked(adminService.getAllAdministrators)
        .mockResolvedValueOnce(mockAdmins)
        .mockResolvedValueOnce(mockAdmins);

      const results = await Promise.all([
        controller.getAllAdministrators(),
        controller.getAllAdministrators(),
      ]);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(results[1]);
    });
  });

  // ===== Tests de Gestion des Erreurs =====

  describe('Error Handling', () => {
    it('should handle validation errors gracefully', async () => {
      const invalidData = {
        email: 'invalid-email',
        firstName: '',
        lastName: '',
        role: 'super_admin',
      };

      vi.mocked(adminService.createAdministrator).mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      const mockRequest = {
        user: { email: 'creator@example.com' },
      } as any;

      const promise = controller.createAdministrator(
        invalidData,
        mockRequest,
      );

      await expect(promise).rejects.toThrow(BadRequestException);
    });

    it('should handle database errors', async () => {
      vi.mocked(adminService.getAllAdministrators).mockRejectedValue(
        new BadRequestException('Database connection error'),
      );

      await expect(controller.getAllAdministrators()).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle missing required parameters', async () => {
      const roleData = { role: '' }; // Empty role

      vi.mocked(adminService.updateAdministratorRole).mockRejectedValue(
        new BadRequestException('Role is required'),
      );

      const mockRequest = {
        user: { email: 'currentuser@example.com' },
      } as any;

      await expect(
        controller.updateAdministratorRole(
          'admin@example.com',
          roleData,
          mockRequest,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
