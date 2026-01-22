import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        ACCESS_TOKEN_TTL: '15m',
        REFRESH_TOKEN_TTL: '7d',
      };
      return config[key as keyof typeof config];
    }),
  };

  const mockDb = {
    query: {
      admins: {
        findFirst: jest.fn(),
      },
      refreshTokens: {
        findFirst: jest.fn(),
      },
    },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn(),
      }),
    }),
    update: jest.fn().mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn(),
        }),
      }),
    }),
  };

  const mockSchemas = {
    admins: {},
    refreshTokens: {},
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: 'DRIZZLE_DB',
          useValue: mockDb,
        },
        {
          provide: 'AUTH_SCHEMAS',
          useValue: mockSchemas,
        },
        {
          provide: 'AUTH_OPTIONS',
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        role: 'super_admin',
        isActive: true,
        status: 'active',
      };

      (mockDb.query.admins.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeDefined();
      expect(result?.email).toBe('test@example.com');
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user does not exist', async () => {
      (mockDb.query.admins.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password123');

      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        role: 'super_admin',
        isActive: true,
        status: 'active',
      };

      (mockDb.query.admins.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('test@example.com', 'wrongpassword');

      expect(result).toBeNull();
    });

    it('should return null when user is inactive', async () => {
      const mockUser = {
        email: 'test@example.com',
        password: await bcrypt.hash('password123', 10),
        firstName: 'Test',
        lastName: 'User',
        role: 'super_admin',
        isActive: false,
        status: 'active',
      };

      (mockDb.query.admins.findFirst as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens for valid user', async () => {
      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'super_admin',
      };

      mockJwtService.sign.mockReturnValue('mock-jwt-token');

      const result = await service.login(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('test@example.com');
      expect(mockJwtService.sign).toHaveBeenCalled();
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const mockUser = {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'super_admin',
      };

      mockJwtService.sign.mockReturnValue('mock-access-token');

      const token = service.generateAccessToken(mockUser);

      expect(token).toBe('mock-access-token');
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          role: 'super_admin',
        }),
        expect.any(Object)
      );
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify and return decoded token when valid', () => {
      const mockPayload = {
        email: 'test@example.com',
        role: 'super_admin',
        sub: 'test@example.com',
      };

      mockJwtService.verify.mockReturnValue(mockPayload);

      const result = service.verifyAccessToken('valid-token');

      expect(result).toEqual(mockPayload);
      expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token', expect.any(Object));
    });

    it('should throw UnauthorizedException when token is invalid', () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => service.verifyAccessToken('invalid-token')).toThrow(UnauthorizedException);
    });
  });
});
