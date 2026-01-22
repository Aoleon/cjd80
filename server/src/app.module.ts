import { Module, type NestModule, type MiddlewareConsumer } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import session from 'express-session';
// ServeStaticModule n'est plus nécessaire - le SpaFallbackController gère tout
// import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { StorageService } from './common/storage/storage.service';
import { ConfigModule } from './config/config.module';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { StorageModule } from './common/storage/storage.module';
import { AuthUnifiedModule } from '@robinswood/auth';
import { AuthCustomModule } from './auth/auth-custom.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CJD80AuthUnifiedAdapter } from './auth/adapters/cjd80-auth-unified.adapter';
import { CJD80_ROLE_PERMISSIONS } from './auth/config/permissions.config';
import { hasPermission } from './auth/utils/permissions';
import { AuthService } from './auth/auth-wrapper.service';
import { admins, refreshTokens } from '../../shared/schema';
import { HealthModule } from './health/health.module';
import { IdeasModule } from './ideas/ideas.module';
import { EventsModule } from './events/events.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { SetupModule } from './setup/setup.module';
import { BrandingModule } from './branding/branding.module';
import { AdminModule } from './admin/admin.module';
import { MembersModule } from './members/members.module';
import { PatronsModule } from './patrons/patrons.module';
import { LoansModule } from './loans/loans.module';
import { FinancialModule } from './financial/financial.module';
import { TrackingModule } from './tracking/tracking.module';
import { FeaturesModule } from './features/features.module';
import { MinIOModule } from './integrations/minio/minio.module';
import { TRPCModule } from './trpc/trpc.module';
// OBSOLÈTE avec Next.js - Frontend géré par Next.js dev server (port 5174)
// import { ViteModule } from './integrations/vite/vite.module';
import { DbMonitoringInterceptor } from './common/interceptors/db-monitoring.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

// Note: ServeStaticModule n'est plus utilisé
// Le fallback SPA et le service des fichiers statiques sont maintenant gérés
// entièrement par ViteModule/SpaFallbackController qui utilise un Controller NestJS
// avec @Get('*') et res.sendFile() au lieu du middleware Express ServeStaticModule

@Module({
  imports: [
    // Configuration globale (remplacé par ConfigModule personnalisé)
    ConfigModule,
    // Rate limiting global
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
    ]),
    // Schedule pour les tâches cron
    ScheduleModule.forRoot(),
    // Modules de base
    DatabaseModule,
    StorageModule,
    // Health Module AVANT Auth pour éviter problèmes d'injection
    HealthModule,
    // Auth Module with JWT + Refresh Tokens - Using @robinswood/auth
    AuthUnifiedModule.forRoot({
      adapter: new CJD80AuthUnifiedAdapter(),
      jwt: {
        secret: process.env.JWT_SECRET || 'cjd80-dev-secret-change-in-production',
        expiresIn: process.env.ACCESS_TOKEN_TTL || '24h',
      },
      features: {
        localAuth: true,
        refreshTokens: true,
        passwordReset: true,
        permissions: {
          enabled: true,
          rolePermissionsMap: CJD80_ROLE_PERMISSIONS,
          customPermissionChecker: (user, permission) => {
            return hasPermission(user.role || '', permission, CJD80_ROLE_PERMISSIONS);
          },
        },
      },
    }),
    // Local Auth Custom Module (pour routes custom /api/auth/*)
    AuthCustomModule,
    IdeasModule,
    EventsModule,
    ChatbotModule,
    SetupModule,
    BrandingModule,
    AdminModule,
    MembersModule,
    PatronsModule,
    LoansModule,
    FinancialModule,
    TrackingModule,
    FeaturesModule,
    MinIOModule,
    TRPCModule,
  ],
  controllers: [],
  providers: [
    // Auth wrapper service for Passport compatibility
    AuthService,
    // Interceptors globaux
    {
      provide: APP_INTERCEPTOR,
      useClass: DbMonitoringInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    // Exception filter global
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    // JWT Auth guard global (requires @Public() decorator to bypass)
    // Use useFactory to properly inject Reflector
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => {
        return new JwtAuthGuard(reflector);
      },
      inject: [Reflector],
    },
    // Rate limiting guard global
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Session configuration for Express sessions
    {
      provide: 'SESSION_CONFIG',
      useFactory: (storageService: StorageService, configService: ConfigService) => {
        // Essayer d'obtenir le session store, sinon fallback vers sessions en mémoire
        let store: session.Store | undefined;
        try {
          store = storageService.sessionStore;
        } catch (error) {
          // Mode dégradé : sessions en mémoire (development only)
          console.warn('[AppModule] SessionStore not available, using in-memory sessions (development mode)');
          console.warn('[AppModule] Reason:', error instanceof Error ? error.message : 'Unknown error');
          store = undefined; // express-session utilisera MemoryStore par défaut
        }

        const sessionSettings: session.SessionOptions = {
          secret: configService.get<string>('SESSION_SECRET') || 'your-secret-key-change-in-production',
          resave: false,
          saveUninitialized: false,
          store, // Peut être undefined (MemoryStore) ou sessionStore (PostgreSQL)
          rolling: true,
          cookie: {
            secure: configService.get<string>('NODE_ENV') === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          },
        };
        return sessionSettings;
      },
      inject: [StorageService, ConfigService],
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // SPA fallback is now handled by ViteModule/SpaFallbackController
    // No middleware needed here
  }
}
