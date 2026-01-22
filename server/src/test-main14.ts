// Test avec le VRAI AuthService (pas une version instrumentée)
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { AuthService } from './auth/auth.service';  // <-- VRAI AuthService
import { DRIZZLE_DB, AUTH_SCHEMAS, AUTH_OPTIONS } from './auth/auth.constants';
import { admins, refreshTokens } from '../../shared/schema';

console.log('[TEST14] AuthService imported:', typeof AuthService);

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('[TEST14] JwtModule useFactory');
        return {
          secret: config.get<string>('JWT_SECRET') || 'test-secret',
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: DRIZZLE_DB,
      useFactory: async (db: any) => {
        console.log('[TEST14] DRIZZLE_DB useFactory');
        return db;
      },
      inject: [DATABASE],
    },
    { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
    { provide: AUTH_OPTIONS, useValue: {} },
    AuthService,  // <-- VRAI AuthService
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST14] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST14] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3014);
  console.log('[TEST14] Server listening on port 3014');
}

bootstrap().catch((error) => {
  console.error('[TEST14] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
