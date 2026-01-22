import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { BadRequestException } from '@nestjs/common';
import { StorageService } from '../common/storage/storage.service';

describe('AdminService', () => {
  let service: AdminService;
  let mockStorageService: Partial<StorageService>;

  beforeEach(async () => {
    mockStorageService = {
      instance: {
        createUser: jest.fn(),
        updatePassword: jest.fn(),
        updateAdminRole: jest.fn(),
        updateAdminStatus: jest.fn(),
        updateAdminInfo: jest.fn(),
        deleteAdmin: jest.fn(),
        getAllAdmins: jest.fn(),
      } as any,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAdministrator', () => {
    it('should create admin with valid data', async () => {
      const adminData = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'ideas_reader',
        password: 'securePassword123',
      };

      (mockStorageService.instance!.createUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { ...adminData, password: undefined, isActive: true, status: 'pending' },
      });

      const result = await service.createAdministrator(adminData, 'admin@test.com');

      expect(result.success).toBe(true);
      expect(mockStorageService.instance!.createUser).toHaveBeenCalledWith({
        email: adminData.email,
        password: adminData.password,
        firstName: adminData.firstName,
        lastName: adminData.lastName,
        role: adminData.role,
        addedBy: 'admin@test.com',
      });
    });

    it('should reject admin creation with missing required fields', async () => {
      const invalidData = {
        email: 'test@example.com',
        // firstName manquant
        lastName: 'User',
        role: 'ideas_reader',
      };

      await expect(
        service.createAdministrator(invalidData, 'admin@test.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateAdministratorPassword', () => {
    it('should update password with valid data', async () => {
      (mockStorageService.instance!.updatePassword as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await service.updateAdministratorPassword(
        'test@example.com',
        'newSecurePassword123'
      );

      expect(result.success).toBe(true);
      expect(mockStorageService.instance!.updatePassword).toHaveBeenCalledWith(
        'test@example.com',
        'newSecurePassword123'
      );
    });

    it('should reject short passwords', async () => {
      await expect(
        service.updateAdministratorPassword('test@example.com', 'short')
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject empty passwords', async () => {
      await expect(
        service.updateAdministratorPassword('test@example.com', '')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateAdministratorRole', () => {
    it('should update role for different user', async () => {
      (mockStorageService.instance!.updateAdminRole as jest.Mock).mockResolvedValue({
        success: true,
        data: { email: 'test@example.com', role: 'ideas_manager' },
      });

      const result = await service.updateAdministratorRole(
        'test@example.com',
        { role: 'ideas_manager' },
        'admin@example.com'
      );

      expect(result.success).toBe(true);
    });

    it('should prevent user from changing own role', async () => {
      await expect(
        service.updateAdministratorRole(
          'admin@example.com',
          { role: 'super_admin' },
          'admin@example.com'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateAdministratorStatus', () => {
    it('should update status for different user', async () => {
      (mockStorageService.instance!.updateAdminStatus as jest.Mock).mockResolvedValue({
        success: true,
        data: { email: 'test@example.com', isActive: false },
      });

      const result = await service.updateAdministratorStatus(
        'test@example.com',
        { isActive: false },
        'admin@example.com'
      );

      expect(result.success).toBe(true);
    });

    it('should prevent user from deactivating own account', async () => {
      await expect(
        service.updateAdministratorStatus(
          'admin@example.com',
          { isActive: false },
          'admin@example.com'
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteAdministrator', () => {
    it('should delete different user', async () => {
      (mockStorageService.instance!.deleteAdmin as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await service.deleteAdministrator(
        'test@example.com',
        'admin@example.com'
      );

      expect(result.success).toBe(true);
    });

    it('should prevent user from deleting own account', async () => {
      await expect(
        service.deleteAdministrator('admin@example.com', 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
