import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import session from 'express-session';

// Controllers
import { AuthController } from './auth.controller';
// import { // AuthOAuthPkceController } from './auth-oauth-pkce.controller';
import { AuthRefreshController } from './auth-refresh.controller';

// Services
import { AuthService } from './auth.service';
// import { AuthOAuthService } from './auth-oauth.service'; // Not used in cjd80
import { RefreshTokenService } from './services/refresh-token.service';
import { StorageService } from '../common/storage/storage.service';
import { StorageModule } from '../common/storage/storage.module';

// Strategies
import { JwtStrategy } from './jwt.strategy';
// import { AzurePkceStrategy } from './strategies/azure-pkce.strategy'; // Not used in cjd80

// Guards
import { JwtAuthGuard } from './jwt-auth.guard';

// Types & Constants
import { AuthModuleOptions, AuthModuleAsyncOptions, AuthModuleOptionsFactory } from './auth.interfaces';
import { DRIZZLE_DB, AUTH_SCHEMAS, AUTH_OPTIONS } from './auth.constants';

/**
 * Module d'authentification configurable
 *
 * Usage:
 *
 * ```typescript
 * import { AuthModule } from '@workspace/auth';
 * import { db } from './db';
 * import { users, refreshTokens } from './schema';
 *
 * @Module({
 *   imports: [
 *     AuthModule.forRoot({
 *       db,
 *       schemas: { users, refreshTokens },
 *     }),
 *   ],
 * })
 * export class AppModule {}
 * ```
 */
@Global()
@Module({})
export class AuthModule {
  /**
   * Configuration synchrone
   */
  static forRoot(options: AuthModuleOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: DRIZZLE_DB,
        useValue: options.db,
      },
      {
        provide: AUTH_SCHEMAS,
        useValue: options.schemas,
      },
      {
        provide: AUTH_OPTIONS,
        useValue: options.config || {},
      },
      AuthService,
      RefreshTokenService,
      JwtStrategy,
      JwtAuthGuard,
      {
        provide: 'SESSION_CONFIG',
        useFactory: (storageService: StorageService, configService: ConfigService) => {
          // Essayer d'obtenir le session store, sinon fallback vers sessions en mémoire
          let store: session.Store | undefined;
          try {
            store = storageService.sessionStore;
          } catch (error) {
            // Mode dégradé : sessions en mémoire (development only)
            console.warn('[AuthModule] SessionStore not available, using in-memory sessions (development mode)');
            console.warn('[AuthModule] Reason:', error instanceof Error ? error.message : 'Unknown error');
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
    ];

    return {
      module: AuthModule,
      imports: [
        StorageModule,
        // ConfigModule est déjà global via app.module.ts - pas besoin de réimporter
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
            signOptions: {
              expiresIn: (config.get<string>('ACCESS_TOKEN_TTL') || options.config?.accessTokenTTL || '15m') as any,
            },
          }),
        }),
        ThrottlerModule.forRoot([{
          ttl: 60000, // 60 seconds
          limit: 10,  // 10 requests per TTL
        }]),
      ],
      controllers: [AuthController, AuthRefreshController],
      providers,
      exports: [AuthService, RefreshTokenService, JwtAuthGuard, DRIZZLE_DB, AUTH_SCHEMAS, 'SESSION_CONFIG'],
    };
  }

  /**
   * Configuration asynchrone (pour injecter des dépendances)
   */
  static forRootAsync(options: AuthModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      ...this.createAsyncProviders(options),
      // ConfigService est déjà global via ConfigModule - pas besoin de le fournir ici
      AuthService,
      RefreshTokenService,
      JwtStrategy,
      JwtAuthGuard,
      {
        provide: 'SESSION_CONFIG',
        useFactory: (storageService: StorageService, configService: ConfigService) => {
          // Essayer d'obtenir le session store, sinon fallback vers sessions en mémoire
          let store: session.Store | undefined;
          try {
            store = storageService.sessionStore;
          } catch (error) {
            // Mode dégradé : sessions en mémoire (development only)
            console.warn('[AuthModule] SessionStore not available, using in-memory sessions (development mode)');
            console.warn('[AuthModule] Reason:', error instanceof Error ? error.message : 'Unknown error');
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
    ];

    return {
      module: AuthModule,
      imports: [
        ...(options.imports || []),
        StorageModule,
        // ConfigModule est déjà global via app.module.ts - pas besoin de réimporter
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
            signOptions: {
              expiresIn: (config.get<string>('ACCESS_TOKEN_TTL') || '15m') as any,
            },
          }),
        }),
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 10,
        }]),
      ],
      controllers: [AuthController, AuthRefreshController],
      providers,
      exports: [AuthService, RefreshTokenService, JwtAuthGuard, DRIZZLE_DB, AUTH_SCHEMAS, 'SESSION_CONFIG'],
    };
  }

  /**
   * Créer les providers pour configuration asynchrone
   */
  private static createAsyncProviders(options: AuthModuleAsyncOptions): Provider[] {
    if (options.useFactory) {
      return [
        {
          provide: AUTH_OPTIONS,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory!(...args);
            return config.config || {};
          },
          inject: options.inject || [],
        },
        {
          provide: DRIZZLE_DB,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory!(...args);
            return config.db;
          },
          inject: options.inject || [],
        },
        {
          provide: AUTH_SCHEMAS,
          useFactory: async (...args: any[]) => {
            const config = await options.useFactory!(...args);
            return config.schemas;
          },
          inject: options.inject || [],
        },
      ];
    }

    if (options.useClass) {
      return [
        {
          provide: options.useClass,
          useClass: options.useClass,
        },
        {
          provide: AUTH_OPTIONS,
          useFactory: async (factory: AuthModuleOptionsFactory) => {
            const config = await factory.createAuthModuleOptions();
            return config.config || {};
          },
          inject: [options.useClass],
        },
        {
          provide: DRIZZLE_DB,
          useFactory: async (factory: AuthModuleOptionsFactory) => {
            const config = await factory.createAuthModuleOptions();
            return config.db;
          },
          inject: [options.useClass],
        },
        {
          provide: AUTH_SCHEMAS,
          useFactory: async (factory: AuthModuleOptionsFactory) => {
            const config = await factory.createAuthModuleOptions();
            return config.schemas;
          },
          inject: [options.useClass],
        },
      ];
    }

    throw new Error('Invalid AuthModule async configuration');
  }
}
