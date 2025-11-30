import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/guards/auth.guard';

@Controller('api/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /api/health - Health check global
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    return this.healthService.getHealthCheck();
  }

  /**
   * GET /api/health/db - Database health check
   */
  @Get('db')
  @HttpCode(HttpStatus.OK)
  async getDatabaseHealth() {
    return this.healthService.getDatabaseHealth();
  }

  /**
   * GET /api/health/detailed - Health check détaillé (ADMIN only)
   */
  @Get('detailed')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getDetailedHealth() {
    return this.healthService.getDetailedHealth();
  }

  /**
   * GET /api/health/ready - Readiness probe
   */
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async getReadiness() {
    return this.healthService.getReadiness();
  }

  /**
   * GET /api/health/live - Liveness probe
   */
  @Get('live')
  @HttpCode(HttpStatus.OK)
  getLiveness() {
    return this.healthService.getLiveness();
  }
}

@Controller('api')
export class StatusController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /api/version - Version de l'application
   */
  @Get('version')
  @HttpCode(HttpStatus.OK)
  getVersion() {
    return this.healthService.getVersion();
  }

  /**
   * GET /api/status/all - Centralisation de tous les checks
   */
  @Get('status/all')
  @HttpCode(HttpStatus.OK)
  async getAllStatus() {
    return this.healthService.getAllStatus();
  }
}

