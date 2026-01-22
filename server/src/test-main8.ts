// Test avec JwtModule + PassportModule + JwtStrategy
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { JwtStrategy } from './auth/jwt.strategy';
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
    { provide: DRIZZLE_DB, useValue: null },
    { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
    { provide: AUTH_OPTIONS, useValue: {} },
    JwtStrategy,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST8] AVANT NestFactory.create() - +JwtStrategy');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST8] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3008);
  console.log('[TEST8] Server listening on port 3008');
}

bootstrap().catch((error) => {
  console.error('[TEST8] ❌ Error:', error);
  process.exit(1);
});
