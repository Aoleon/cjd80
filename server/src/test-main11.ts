// Test diagnostic - voir où exactement ça bloque
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
      useFactory: async (config: ConfigService) => {
        console.log('[DIAGNOSTIC] JwtModule useFactory appelé');
        const result = {
          secret: config.get<string>('JWT_SECRET') || 'test-secret',
          signOptions: { expiresIn: '15m' },
        };
        console.log('[DIAGNOSTIC] JwtModule useFactory terminé');
        return result;
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: DRIZZLE_DB,
      useFactory: async (db: any) => {
        console.log('[DIAGNOSTIC] DRIZZLE_DB useFactory appelé');
        return null;
      },
    },
    { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
    { provide: AUTH_OPTIONS, useValue: {} },
    JwtStrategy,
    AuthService,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST11] AVANT NestFactory.create()');
  console.log('[TEST11] Test diagnostic avec logs');

  const app = await NestFactory.create(TestModule, {
    logger: ['log', 'debug', 'verbose'],
  });

  console.log('[TEST11] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3011);
  console.log('[TEST11] Server listening on port 3011');
}

bootstrap().catch((error) => {
  console.error('[TEST11] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
