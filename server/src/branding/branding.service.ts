import { Injectable, BadRequestException, Optional, Inject } from '@nestjs/common';
import { StorageService } from '../common/storage/storage.service';

@Injectable()
export class BrandingService {
  constructor(@Optional() @Inject(StorageService) private readonly storageService: StorageService) {}

  async getBrandingConfig() {
    if (!this.storageService) {
      throw new Error('StorageService not available');
    }
    const result = await this.storageService.instance.getBrandingConfig();
    
    if (!result.success) {
      const error = 'error' in result ? result.error : new Error('Unknown error');
      throw new BadRequestException(error.message);
    }
    
    if (!result.data) {
      const { brandingCore } = await import('../../../client/src/config/branding-core');
      return {
        config: JSON.stringify(brandingCore),
        isDefault: true
      };
    }
    
    return {
      ...result.data,
      isDefault: false
    };
  }

  async updateBrandingConfig(config: string, userEmail: string) {
    if (!this.storageService) {
      throw new Error('StorageService not available');
    }
    if (!config) {
      throw new BadRequestException("Configuration manquante");
    }

    const result = await this.storageService.instance.updateBrandingConfig(config, userEmail);
    
    if (!result.success) {
      const error = 'error' in result ? result.error : new Error('Unknown error');
      throw new BadRequestException(error.message);
    }
    
    return result.data;
  }
}


