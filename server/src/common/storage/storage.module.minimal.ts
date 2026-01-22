import { Module, Global } from '@nestjs/common';
import { StorageServiceMinimal } from './storage.service.minimal';

@Global()
@Module({
  providers: [
    {
      provide: 'StorageService',
      useClass: StorageServiceMinimal,
    },
  ],
  exports: ['StorageService'],
})
export class StorageModuleMinimal {}
