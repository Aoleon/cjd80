import { Controller, Get, Post, Body } from '@nestjs/common';
import { SetupService } from './setup.service';

@Controller('api/setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Get('status')
  async getStatus() {
    const data = await this.setupService.getSetupStatus();
    return { success: true, data };
  }

  @Post('create-admin')
  async createAdmin(@Body() body: { email: string; firstName: string; lastName: string }) {
    const data = await this.setupService.createFirstAdmin(body.email, body.firstName, body.lastName);
    return {
      success: true,
      data,
      message: "Premier administrateur créé avec succès"
    };
  }

  @Post('test-email')
  async testEmail(@Body() body: { email: string }) {
    const data = await this.setupService.testEmail(body.email);
    return { success: true, ...data };
  }

  @Post('generate-config')
  async generateConfig() {
    const data = await this.setupService.generateConfig();
    return { success: true, ...data };
  }
}


