// Test avec AuthModule
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { AuthModule } from './auth/auth.module';
import { admins, refreshTokens } from '../../shared/schema';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    AuthModule.forRootAsync({
      imports: [DatabaseModule],
      inject: [ConfigService, DATABASE],
      useFactory: (config: ConfigService, db: any) => ({
        db,
        schemas: {
          users: admins,
          refreshTokens,
        },
        config: {
          accessTokenTTL: config.get<string>('ACCESS_TOKEN_TTL') || '15m',
          refreshTokenTTLDays: config.get<number>('REFRESH_TOKEN_TTL_DAYS') || 30,
          bcryptRounds: 10,
        },
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST4] AVANT NestFactory.create() - Auth');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST4] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3004);
  console.log('[TEST4] Server listening on port 3004');
}

bootstrap().catch((error) => {
  console.error('[TEST4] ❌ Error:', error);
  process.exit(1);
});
