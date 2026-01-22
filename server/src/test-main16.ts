// Test ULTRA-MINIMAL - tout défini inline, zéro import de auth/
import { NestFactory } from '@nestjs/core';
import { Module, Injectable, Inject } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

// Token custom simple
const MY_DB = 'MY_DB';
const MY_SCHEMAS = 'MY_SCHEMAS';

// Service ultra-minimal qui imite AuthService
@Injectable()
class SimpleService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(MY_DB) private readonly db: any,
    @Inject(MY_SCHEMAS) private readonly schemas: any,
  ) {
    console.log('[SIMPLE] Constructor called!');
  }
}

@Module({
  imports: [
    JwtModule.register({
      secret: 'test-secret',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  providers: [
    { provide: MY_DB, useValue: null },
    { provide: MY_SCHEMAS, useValue: { users: {}, refreshTokens: {} } },
    SimpleService,
  ],
})
class MinimalModule {}

async function bootstrap() {
  console.log('[TEST16] AVANT NestFactory.create()');

  const app = await NestFactory.create(MinimalModule, {
    logger: false,
  });

  console.log('[TEST16] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3016);
  console.log('[TEST16] Server listening on port 3016');
}

bootstrap().catch((error) => {
  console.error('[TEST16] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
