// Test avec AuthService instrumenté pour logs
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule, DATABASE } from './common/database/database.module';
import { DRIZZLE_DB, AUTH_SCHEMAS, AUTH_OPTIONS } from './auth/auth.constants';
import { admins, refreshTokens } from '../../shared/schema';
import { Injectable, Inject } from '@nestjs/common';

// Version instrumentée de AuthService
@Injectable()
class InstrumentedAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(DRIZZLE_DB) private readonly db: any,
    @Inject(AUTH_SCHEMAS) private readonly schemas: { users: any; refreshTokens: any },
  ) {
    console.log('[INSTRUMENTED] AuthService constructor START');
    console.log('[INSTRUMENTED] JwtService:', typeof jwtService);
    console.log('[INSTRUMENTED] DRIZZLE_DB:', typeof db);
    console.log('[INSTRUMENTED] AUTH_SCHEMAS:', typeof schemas);
    console.log('[INSTRUMENTED] AuthService constructor END');
  }
}

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        console.log('[TEST12] JwtModule useFactory START');
        const result = {
          secret: config.get<string>('JWT_SECRET') || 'test-secret',
          signOptions: { expiresIn: '15m' },
        };
        console.log('[TEST12] JwtModule useFactory END');
        return result;
      },
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: DRIZZLE_DB,
      useValue: null,
    },
    { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
    { provide: AUTH_OPTIONS, useValue: {} },
    InstrumentedAuthService,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST12] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: ['log', 'debug', 'verbose'],
  });

  console.log('[TEST12] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3012);
  console.log('[TEST12] Server listening on port 3012');
}

bootstrap().catch((error) => {
  console.error('[TEST12] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
