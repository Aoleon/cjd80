// Test AuthModule sans controllers
import { NestFactory } from '@nestjs/core';
import { Module, DynamicModule, Provider, Global } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { StorageModule } from './common/storage/storage.module';
import { AuthService } from './auth/auth.service';
import { RefreshTokenService } from './auth/services/refresh-token.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { admins, refreshTokens } from '../../shared/schema';
import { DRIZZLE_DB, AUTH_SCHEMAS, AUTH_OPTIONS } from './auth/auth.constants';

// AuthModule minimal sans controllers
@Global()
@Module({})
class MinimalAuthModule {
  static forTest(): DynamicModule {
    return {
      module: MinimalAuthModule,
      imports: [
        ConfigModule,
        DatabaseModule,
        StorageModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            secret: config.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '15m' },
          }),
        }),
        ThrottlerModule.forRoot([{
          ttl: 60000,
          limit: 10,
        }]),
      ],
      controllers: [], // Pas de controllers pour tester
      providers: [
        { provide: DRIZZLE_DB, useValue: null },
        { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
        { provide: AUTH_OPTIONS, useValue: {} },
        AuthService,
        RefreshTokenService,
        JwtStrategy,
        JwtAuthGuard,
      ],
      exports: [AuthService],
    };
  }
}

async function bootstrap() {
  console.log('[TEST5] AVANT NestFactory.create() - Auth sans controllers');

  const app = await NestFactory.create(MinimalAuthModule.forTest(), {
    logger: ['log'],
  });

  console.log('[TEST5] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3005);
  console.log('[TEST5] Server listening on port 3005');
}

bootstrap().catch((error) => {
  console.error('[TEST5] ❌ Error:', error);
  process.exit(1);
});
