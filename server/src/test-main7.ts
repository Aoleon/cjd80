// Test avec JwtModule et PassportModule uniquement
import { NestFactory } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
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
  providers: [],
})
class TestModule {}

async function bootstrap() {
  console.log('[TEST7] AVANT NestFactory.create() - Jwt + Passport');

  const app = await NestFactory.create(TestModule, {
    logger: ['log'],
  });

  console.log('[TEST7] APRÈS NestFactory.create() - SUCCESS');

  await app.listen(3007);
  console.log('[TEST7] Server listening on port 3007');
}

bootstrap().catch((error) => {
  console.error('[TEST7] ❌ Error:', error);
  process.exit(1);
});
