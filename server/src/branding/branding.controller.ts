import { Controller, Get, Put, Body, UseGuards, Inject } from '@nestjs/common';
import { BrandingService } from './branding.service';
import { JwtAuthGuard } from '@robinswood/auth';
import { Public } from '../auth/decorators/public.decorator';
// import { PermissionsGuard } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
// import { RequirePermission } from '@robinswood/auth'; // TEMPORAIRE - À réimplémenter
import { User } from '@robinswood/auth';

@Controller('api/admin/branding')
export class BrandingController {
  constructor(@Inject(BrandingService) private readonly brandingService: BrandingService) {}

  @Public()
  @Get()
  async getBranding() {
    const data = await this.brandingService.getBrandingConfig();
    return { success: true, data };
  }

  @Put()
  @UseGuards(JwtAuthGuard) // TODO: Restore PermissionsGuard
  // @RequirePermission // TODO: Restore('admin.manage')
  async updateBranding(@Body() body: { config: string }, @User() user: any) {
    const data = await this.brandingService.updateBrandingConfig(body.config, user.email);
    return { success: true, data };
  }
}


