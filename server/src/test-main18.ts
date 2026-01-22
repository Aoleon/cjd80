// Test avec injection de JwtService UNIQUEMENT
import { NestFactory } from '@nestjs/core';
import { Module, Injectable } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

// Service qui injecte SEULEMENT JwtService
@Injectable()
class ServiceWithOnlyJwt {
  constructor(
    private readonly jwtService: JwtService,
  ) {
    console.log('[ONLY_JWT] Constructor called!');
    console.log('[ONLY_JWT] JwtService type:', typeof jwtService);
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
    ServiceWithOnlyJwt,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST18] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: false,
  });

  console.log('[TEST18] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3018);
  console.log('[TEST18] Server listening on port 3018');
}

bootstrap().catch((error) => {
  console.error('[TEST18] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
