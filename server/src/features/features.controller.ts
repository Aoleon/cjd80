import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { FeaturesService } from './features.service';
import { JwtAuthGuard } from '@robinswood/auth';
import { Public } from '../auth/decorators/public.decorator';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
import { User } from '@robinswood/auth';

/**
 * Features Controller - Public read, admin write
 * GET /api/features - Public (returns feature flags for all users)
 * PUT /api/features/:key - Admin only (update feature flag)
 */
@Controller('api/features')
export class FeaturesController {
  constructor(@Inject(FeaturesService) private readonly featuresService: FeaturesService) {}

  /**
   * Get all features - Public endpoint
   * No authentication required so frontend can load features for all users
   */
  @Public()
  @Get()
  async getAllFeatures() {
    try {
      const features = await this.featuresService.getAllFeatures();
      return {
        success: true,
        data: features,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Failed to fetch features',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get a single feature by key - Public endpoint
   */
  @Public()
  @Get(':featureKey')
  async getFeature(@Param('featureKey') featureKey: string) {
    const feature = await this.featuresService.getFeature(featureKey);

    if (!feature) {
      throw new HttpException(
        {
          success: false,
          error: `Feature ${featureKey} not found`,
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      success: true,
      data: feature,
    };
  }

  /**
   * Update a feature - Admin only
   */
  @Put(':featureKey')
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateFeature(
    @Param('featureKey') featureKey: string,
    @Body() body: { enabled: boolean },
    @User() user: { email: string },
  ) {
    if (typeof body.enabled !== 'boolean') {
      throw new HttpException(
        {
          success: false,
          error: 'enabled must be a boolean',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const updated = await this.featuresService.updateFeature(
        featureKey,
        body.enabled,
        user.email,
      );

      return {
        success: true,
        data: updated,
        message: `Feature ${featureKey} ${body.enabled ? 'enabled' : 'disabled'}`,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: 'Failed to update feature',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
