import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthModule } from './health/health.module';

/**
 * AppModule ULTRA MINIMAL pour debug - JUSTE ConfigModule + HealthModule
 * Pas d'AuthModule pour isoler le problème
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

    // HealthModule pour tester que le serveur répond
    HealthModule,
  ],
})
export class AppModuleUltraMinimal {}
