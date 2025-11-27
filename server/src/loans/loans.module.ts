import { Module } from '@nestjs/common';
import { LoansController, AdminLoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { StorageModule } from '../common/storage/storage.module';
import { AuthModule } from '../auth/auth.module';
import { MinIOModule } from '../integrations/minio/minio.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [StorageModule, AuthModule, MinIOModule, ThrottlerModule],
  controllers: [LoansController, AdminLoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}

