import { Module } from '@nestjs/common';
import { AuthentikService } from './authentik.service';

@Module({
  providers: [AuthentikService],
  exports: [AuthentikService],
})
export class AuthentikModule {}


