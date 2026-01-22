import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('api/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {
    console.log('[HealthController] Constructor called, healthService:', healthService ? 'INJECTED' : 'UNDEFINED');
  }

  /**
   * GET /api/health - Health check global
   */
  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async getHealth() {
    if (!this.healthService) {
      // Fallback minimal pour éviter les erreurs si l'injection échoue
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
      };
    }
    return this.healthService.getHealthCheck();
  }

  /**
   * GET /api/health/db - Database health check
   */
  @Public()
  @Get('db')
  @HttpCode(HttpStatus.OK)
  async getDatabaseHealth() {
    if (!this.healthService) {
      return {
        status: 'unknown',
        message: 'HealthService not available',
      };
    }
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
  @Public()
  @Get('ready')
  @HttpCode(HttpStatus.OK)
  async getReadiness() {
    if (!this.healthService) {
      return {
        status: 'ready',
        timestamp: new Date().toISOString(),
      };
    }
    return this.healthService.getReadiness();
  }

  /**
   * GET /api/health/live - Liveness probe
   */
  @Public()
  @Get('live')
  @HttpCode(HttpStatus.OK)
  getLiveness() {
    if (!this.healthService) {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        fallback: 'HealthService not injected',
      };
    }
    return this.healthService.getLiveness();
  }
}

@Controller('api')
export class StatusController {
  constructor(private readonly healthService: HealthService) {
    console.log('[StatusController] Constructor called, healthService:', healthService ? 'INJECTED' : 'UNDEFINED');
  }

  /**
   * GET /api/version - Version de l'application
   */
  @Public()
  @Get('version')
  @HttpCode(HttpStatus.OK)
  getVersion() {
    if (!this.healthService) {
      return {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };
    }
    return this.healthService.getVersion();
  }

  /**
   * GET /api/status/all - Centralisation de tous les checks
   */
  @Public()
  @Get('status/all')
  @HttpCode(HttpStatus.OK)
  async getAllStatus() {
    if (!this.healthService) {
      return {
        status: 'unknown',
        message: 'HealthService not available',
      };
    }
    return this.healthService.getAllStatus();
  }
}
