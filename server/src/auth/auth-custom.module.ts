import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth-wrapper.service';
import { StorageModule } from '../common/storage/storage.module';

/**
 * Module statique pour les routes custom /api/auth/*
 * Utilisé en complément de @robinswood/auth (AuthUnifiedModule)
 *
 * Note: Les refresh tokens sont gérés par AuthUnifiedModule,
 * ce module ne fournit que les routes custom (login, logout, user)
 */
@Module({
  imports: [StorageModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthCustomModule {}
