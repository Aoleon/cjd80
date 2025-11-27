import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { BrandingService } from './branding.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import { PermissionGuard } from '../auth/guards/permission.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { User } from '../auth/decorators/user.decorator';

@Controller('api/admin/branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  async getBranding() {
    const data = await this.brandingService.getBrandingConfig();
    return { success: true, data };
  }

  @Put()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @Permissions('admin.manage')
  async updateBranding(@Body() body: { config: string }, @User() user: any) {
    const data = await this.brandingService.updateBrandingConfig(body.config, user.email);
    return { success: true, data };
  }
}


