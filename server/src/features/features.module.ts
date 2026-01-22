import { Module, OnModuleInit, Optional } from '@nestjs/common';
import { FeaturesController } from './features.controller';
import { FeaturesService } from './features.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [FeaturesController],
  providers: [FeaturesService],
  exports: [FeaturesService],
})
export class FeaturesModule implements OnModuleInit {
  constructor(@Optional() private readonly featuresService: FeaturesService) {}

  async onModuleInit() {
    // Initialization temporarily disabled for debug
    // TODO: Re-enable after fixing blocking issue
    console.log('[FeaturesModule] onModuleInit: initialization skipped (debug mode)');
    /*
    // Initialize default features if none exist
    if (this.featuresService) {
      await this.featuresService.initializeDefaultFeatures();
    }
    */
  }
}
