// SOLUTION: Utiliser @Inject() pour JwtService aussi
import { NestFactory } from '@nestjs/core';
import { Module, Injectable, Inject } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';

const MY_TOKEN = 'MY_TOKEN';

// Service avec @Inject() pour TOUTES les dépendances
@Injectable()
class FixedService {
  constructor(
    @Inject(JwtService) private readonly jwtService: JwtService,  // <-- @Inject()
    @Inject(MY_TOKEN) private readonly myToken: any,
  ) {
    console.log('[FIXED] Constructor called!');
    console.log('[FIXED] JwtService type:', typeof jwtService);
    console.log('[FIXED] myToken:', myToken);
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
    FixedService,
  ],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST20] AVANT NestFactory.create()');

  const app = await NestFactory.create(TestModule, {
    logger: false,
  });

  console.log('[TEST20] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3020);
  console.log('[TEST20] Server listening on port 3020');
}

bootstrap().catch((error) => {
  console.error('[TEST20] ❌ Error:', error);
  console.error(error.stack);
  process.exit(1);
});
