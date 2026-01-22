// Test avec DRIZZLE_DB qui injecte DATABASE (comme le vrai flow)
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
    console.log('[INSTRUMENTED] AuthService constructor called!');
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
        console.log('[TEST13] JwtModule useFactory');
        return {
          secret: config.get<string>('JWT_SECRET') || 'test-secret',
          signOptions: { expiresIn: '15m' },
        };
      },
    }),
  ],
  controllers: [],
  providers: [
    // Simuler le vrai provider DRIZZLE_DB qui injecte DATABASE
    {
      provide: DRIZZLE_DB,
      useFactory: async (db: any) => {
        console.log('[TEST13] DRIZZLE_DB useFactory START');
        console.log('[TEST13] DATABASE received:', typeof db);
        console.log('[TEST13] DRIZZLE_DB useFactory END');
        return db;
      },
      inject: [DATABASE],  // <-- Injecte DATABASE depuis DatabaseModule
    },
    { provide: AUTH_SCHEMAS, useValue: { users: admins, refreshTokens } },
    { provide: AUTH_OPTIONS, useValue: {} },
    InstrumentedAuthService,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST13] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST13] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3013);
  console.log('[TEST13] Server listening on port 3013');
}

bootstrap().catch((error) => {
  console.error('[TEST13] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
