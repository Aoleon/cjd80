import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import session from 'express-session';

/**
 * AppModule TEST AUTH - Teste si le problème vient de l'injection StorageService
 * dans SESSION_CONFIG factory
 *
 * Cette version fournit SESSION_CONFIG SANS StorageModule ni StorageService
 */
@Module({
  imports: [
    // ConfigModule global
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),

    // PassportModule simple
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JwtModule simple
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'your-secret-key-change-in-production',
        signOptions: {
          expiresIn: (config.get<string>('ACCESS_TOKEN_TTL') || '15m') as any,
        },
      }),
    }),

    // HealthModule pour tester que le serveur répond
    HealthModule,
  ],
  providers: [
    // SESSION_CONFIG sans StorageService - juste ConfigService
    {
      provide: 'SESSION_CONFIG',
      useFactory: (configService: ConfigService) => {
        console.log('[TEST] SESSION_CONFIG factory appelée');
        const sessionSettings: session.SessionOptions = {
          secret: configService.get<string>('SESSION_SECRET') || 'your-secret-key-change-in-production',
          resave: false,
          saveUninitialized: false,
          store: undefined, // Utilise MemoryStore par défaut
          rolling: true,
          cookie: {
            secure: configService.get<string>('NODE_ENV') === 'production',
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
          },
        };
        console.log('[TEST] SESSION_CONFIG factory terminée');
        return sessionSettings;
      },
      inject: [ConfigService],
    },
  ],
  exports: ['SESSION_CONFIG'],
})
export class AppModuleTestAuth {}
