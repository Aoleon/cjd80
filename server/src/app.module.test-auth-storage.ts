import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { db } from '../db';
import { admins, refreshTokens } from '../../shared/schema';
import { StorageModuleMinimal } from './common/storage/storage.module.minimal';

/**
 * AppModule TEST AUTH WITH MINIMAL STORAGE
 * Teste AuthModule avec StorageModuleMinimal (pas DatabaseStorage)
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

    // StorageModule minimal AVANT AuthModule
    StorageModuleMinimal,

    // AuthModule avec forRootAsync
    AuthModule.forRootAsync({
      useFactory: () => ({
        db,
        schemas: {
          users: admins,
          refreshTokens,
        },
        config: {
          accessTokenTTL: process.env.ACCESS_TOKEN_TTL || '15m',
        },
      }),
    }),

    // HealthModule pour tester que le serveur répond
    HealthModule,
  ],
})
export class AppModuleTestAuthStorage {}
