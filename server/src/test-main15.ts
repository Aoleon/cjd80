// Test SANS bcrypt pour voir si c'est le problème
import { NestFactory } from '@nestjs/core';
import { Module, Injectable, Inject } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { DRIZZLE_DB, AUTH_SCHEMAS } from './auth/auth.constants';
import { admins, refreshTokens } from '../../shared/schema';

// Service minimal SANS bcrypt
@Injectable()
class MinimalAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE_DB) private readonly db: any,
    @Inject(AUTH_SCHEMAS) private readonly schemas: { users: any; refreshTokens: any },
  ) {
    console.log('[MINIMAL] Constructor called!');
  }

  async test() {
    return 'test';
  }
}

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
    {
      provide: DRIZZLE_DB,
      useFactory: async (db: any) => db,
      inject: [DATABASE],
    },
    { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
    MinimalAuthService,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST15] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: false,
  });

  console.log('[TEST15] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3015);
  console.log('[TEST15] Server listening on port 3015');
}

bootstrap().catch((error) => {
  console.error('[TEST15] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
