import { Module } from '@nestjs/common';
import { MinIOService } from './minio.service';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [ConfigModule],
  providers: [MinIOService],
  exports: [MinIOService],
})
export class MinIOModule {}


