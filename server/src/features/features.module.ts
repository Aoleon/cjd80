import { Module, OnModuleInit } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';

@Module({
  controllers: [FeaturesController],
  providers: [FeaturesService],
  exports: [FeaturesService],
})
export class FeaturesModule implements OnModuleInit {
  constructor(private readonly featuresService: FeaturesService) {}

  async onModuleInit() {
    // Initialize default features if none exist
    await this.featuresService.initializeDefaultFeatures();
  }
}
