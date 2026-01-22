// Test SANS injection de JwtService
import { NestFactory } from '@nestjs/core';
import { Module, Injectable, Inject } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

const MY_DB = 'MY_DB';

// Service SANS JwtService
@Injectable()
class ServiceWithoutJwt {
  constructor(
    @Inject(MY_DB) private readonly db: any,
  ) {
    console.log('[NO_JWT] Constructor called!');
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
    ServiceWithoutJwt,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST17] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: false,
  });

  console.log('[TEST17] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3017);
  console.log('[TEST17] Server listening on port 3017');
}

bootstrap().catch((error) => {
  console.error('[TEST17] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
