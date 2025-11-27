import { Module } from '@nestjs/common';
import {
  PatronsController,
  AdminPatronsController,
  AdminDonationsController,
  AdminProposalsController,
  AdminPatronUpdatesController,
  AdminSponsorshipsController,
} from './patrons.controller';
import { PatronsService } from './patrons.service';
import { StorageModule } from '../common/storage/storage.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [StorageModule, AuthModule],
  controllers: [
    PatronsController,
    AdminPatronsController,
    AdminDonationsController,
    AdminProposalsController,
    AdminPatronUpdatesController,
    AdminSponsorshipsController,
  ],
  providers: [PatronsService],
  exports: [PatronsService],
})
export class PatronsModule {}

