import { Module } from '@nestjs/common';
import { AuthUnifiedModule } from '@robinswood/auth';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CJD80AuthUnifiedAdapter } from './adapters/cjd80-auth-unified.adapter';
import { CJD80_ROLE_PERMISSIONS } from './cjd80-permissions';
import { hasPermission } from './utils/permissions';
import { PasswordResetService } from './password-reset.service';
import { StorageModule } from '../common/storage/storage.module';
import { StorageService } from '../common/storage/storage.service';
import session from 'express-session';
import { logger } from '../../lib/logger';

logger.info('[AuthModule] Mode authentification: JWT LOCAL (email/password) - auth-unified v2.0.0');

@Module({
  imports: [
    AuthUnifiedModule.forRoot({
      adapter: new CJD80AuthUnifiedAdapter(),
      jwt: {
        secret: process.env.JWT_SECRET || 'cjd80-dev-secret-change-in-production',
        expiresIn: '24h',
      },
      features: {
        localAuth: true,
        passwordReset: true,
        permissions: {
          enabled: true,
          rolePermissionsMap: CJD80_ROLE_PERMISSIONS,
          customPermissionChecker: (user, permission) => {
            return hasPermission(user.role, permission, CJD80_ROLE_PERMISSIONS);
          },
        },
      },
    }),
    StorageModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetService,
    {
      provide: 'SESSION_CONFIG',
      useFactory: (storageService: StorageService) => {
        const sessionSettings: session.SessionOptions = {
          secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
          resave: false,
          saveUninitialized: false,
          store: storageService.sessionStore,
          rolling: true,
          cookie: {
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          },
        };
        return sessionSettings;
      },
      inject: [StorageService],
    },
  ],
  exports: [AuthUnifiedModule, AuthService, 'SESSION_CONFIG'],
})
export class AuthModule {}
