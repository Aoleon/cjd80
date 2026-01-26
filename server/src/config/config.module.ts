import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import configuration from './configuration';
import databaseConfig from './database.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      load: [configuration, databaseConfig],
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
  ],
  exports: [NestConfigModule],
})
export class ConfigModule {}


