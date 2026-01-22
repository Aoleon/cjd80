// Test avec JwtService + UN custom token
import { NestFactory } from '@nestjs/core';
import { Module, Injectable, Inject } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

const MY_TOKEN = 'MY_TOKEN';

// Service avec JwtService + custom token
@Injectable()
class ServiceWithJwtAndToken {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(MY_TOKEN) private readonly myToken: any,
  ) {
    console.log('[JWT+TOKEN] Constructor called!');
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
    { provide: MY_TOKEN, useValue: 'test-value' },
    ServiceWithJwtAndToken,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST19] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: false,
  });

  console.log('[TEST19] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3019);
  console.log('[TEST19] Server listening on port 3019');
}

bootstrap().catch((error) => {
  console.error('[TEST19] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
