import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthentikStrategy } from './strategies/authentik.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserSyncService } from './user-sync.service';
import { PasswordService } from './password.service';
import { PasswordResetService } from './password-reset.service';
import { StorageModule } from '../common/storage/storage.module';
import { AuthentikModule } from '../integrations/authentik/authentik.module';
import session from 'express-session';
import { StorageService } from '../common/storage/storage.service';
import { logger } from '../../lib/logger';

// Déterminer le mode d'authentification
const authMode = process.env.AUTH_MODE || 'oauth';
const useLocalAuth = authMode === 'local';
const authentikConfigured = process.env.AUTHENTIK_CLIENT_ID && process.env.AUTHENTIK_CLIENT_SECRET;

if (useLocalAuth) {
  logger.info('[AuthModule] Mode authentification: LOCAL (formulaire)');
} else if (authentikConfigured) {
  logger.info('[AuthModule] Mode authentification: AUTHENTIK (OAuth2)');
} else {
  logger.warn('[AuthModule] Aucune stratégie d\'authentification configurée');
}

@Module({
  imports: [
    PassportModule.register({
      session: true,
    }),
    StorageModule,
    AuthentikModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordService,
    PasswordResetService,
    UserSyncService,
    // Charger LocalStrategy si mode local
    ...(useLocalAuth ? [LocalStrategy] : []),
    // Charger AuthentikStrategy si mode oauth et configuré
    ...((!useLocalAuth && authentikConfigured) ? [AuthentikStrategy] : []),
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
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          },
        };
        return sessionSettings;
      },
      inject: [StorageService],
    },
    {
      provide: 'AUTH_MODE',
      useValue: useLocalAuth ? 'local' : 'oauth',
    },
  ],
  exports: [AuthService, PasswordService, PasswordResetService, PassportModule, 'SESSION_CONFIG', 'AUTH_MODE'],
})
export class AuthModule {}
