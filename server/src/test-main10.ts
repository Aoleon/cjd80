// Test avec AuthService seul
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { JwtStrategy } from './auth/jwt.strategy';
import { AuthService } from './auth/auth.service';
import { DRIZZLE_DB, AUTH_SCHEMAS, AUTH_OPTIONS } from './auth/auth.constants';
import { admins, refreshTokens } from '../../shared/schema';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') || 'test-secret',
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  controllers: [],
  providers: [
    { provide: DRIZZLE_DB, useValue: null },  // Test avec null au lieu de factory
    { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
    { provide: AUTH_OPTIONS, useValue: {} },
    JwtStrategy,
    AuthService,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST10] AVANT NestFactory.create() - +AuthService');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST10] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3010);
  console.log('[TEST10] Server listening on port 3010');
}

bootstrap().catch((error) => {
  console.error('[TEST10] ❌ Error:', error);
  process.exit(1);
});
