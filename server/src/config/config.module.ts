import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
  ],
  // NestConfigModule est global, ConfigService sera automatiquement disponible
  exports: [NestConfigModule],
})
export class ConfigModule {}


