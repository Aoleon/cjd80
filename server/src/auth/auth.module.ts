import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthentikStrategy } from './strategies/authentik.strategy';
import { UserSyncService } from './user-sync.service';
import { StorageModule } from '../common/storage/storage.module';
import { AuthentikModule } from '../integrations/authentik/authentik.module';
import session from 'express-session';
import { StorageService } from '../common/storage/storage.service';
import { logger } from '../../lib/logger';

// Charger AuthentikStrategy seulement si les credentials sont configurés
const authentikConfigured = process.env.AUTHENTIK_CLIENT_ID && process.env.AUTHENTIK_CLIENT_SECRET;
if (!authentikConfigured) {
  logger.warn('[AuthModule] AuthentikStrategy non chargée - credentials manquants');
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
    // Charger AuthentikStrategy seulement si configuré
    ...(authentikConfigured ? [AuthentikStrategy] : []),
    UserSyncService,
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
  ],
  exports: [AuthService, PassportModule, 'SESSION_CONFIG'],
})
export class AuthModule {}

