import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { DATABASE } from '../common/database/database.providers';
import { sql } from 'drizzle-orm';
import { getPoolStats } from '../../db';
import { dbResilience } from '../../db';
import { MinIOService } from '../integrations/minio/minio.service';
import { logger } from '../../lib/logger';
import type { StatusResponse, StatusCheck } from '../../../shared/schema';

@Injectable()
export class HealthService {
  constructor(
    @Inject(DATABASE) private db: any,
    private minioService: MinIOService
  ) {}

  async getHealthCheck() {
    try {
      const dbStartTime = Date.now();
      await this.db.execute(sql`SELECT 1 as test`);
      const dbResponseTime = Date.now() - dbStartTime;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: true,
          responseTime: `${dbResponseTime}ms`,
        },
      };
    } catch (error) {
      logger.error('Health check failed - database unavailable', { error });
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: 'Database connection failed',
        },
      };
    }
  }

  async getDatabaseHealth() {
    try {
      const startTime = Date.now();
      await this.db.execute(sql`SELECT 1 as test`);
      const responseTime = Date.now() - startTime;
      const poolStats = getPoolStats();

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          responseTime: `${responseTime}ms`,
          pool: poolStats,
        },
      };
    } catch (error) {
      logger.error('Database health check failed', { error });
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: {
          connected: false,
          error: 'Database connection failed',
        },
      };
    }
  }

  async getDetailedHealth() {
    try {
      const memoryUsage = process.memoryUsage();
      const dbStartTime = Date.now();
      await this.db.execute(sql`SELECT 1 as test`);
      const dbResponseTime = Date.now() - dbStartTime;
      const poolStats = getPoolStats();

      // Health check MinIO
      let minioHealth;
      try {
        minioHealth = await this.minioService.healthCheck();
      } catch (error) {
        minioHealth = {
          status: 'unhealthy' as const,
          connected: false,
          buckets: [],
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: true,
          responseTime: `${dbResponseTime}ms`,
          pool: {
            totalCount: poolStats.totalCount,
            idleCount: poolStats.idleCount,
            waitingCount: poolStats.waitingCount,
            maxConnections: poolStats.maxConnections,
          },
        },
        minio: minioHealth,
        memory: {
          heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
          external: `${Math.round(memoryUsage.external / 1024 / 1024)}MB`,
          rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        },
      };
    } catch (error) {
      logger.error('Detailed health check failed', { error });
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      };
    }
  }

  async getReadiness() {
    try {
      const dbStatus = await dbResilience.healthCheck('readiness', 3000);

      if (dbStatus.status === 'healthy' || dbStatus.status === 'warning') {
        return {
          status: 'ready',
          timestamp: new Date().toISOString(),
          database: dbStatus,
        };
      } else {
        return {
          status: 'not ready',
          timestamp: new Date().toISOString(),
          database: dbStatus,
        };
      }
    } catch (error) {
      logger.warn('Readiness check failed', { error });
      return {
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  getLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }

  getVersion() {
    try {
      const version = process.env.GIT_TAG || process.env.APP_VERSION || '1.0.0';
      return {
        version,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
      };
    } catch (error) {
      logger.error('Error getting version', { error });
      return {
        version: '1.0.0',
        error: 'Failed to get version',
      };
    }
  }

  async getAllStatus(): Promise<StatusResponse> {
    const results: StatusResponse = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      overallStatus: 'healthy',
      checks: {},
    };

    // 1. Application status
    results.checks.application = {
      name: 'Application',
      status: 'healthy',
      message: 'Application is running',
      responseTime: 0,
    };

    // 2. Database connection
    results.checks.database = await dbResilience.healthCheck('status-all', 5000);

    // 3. Database pool
    results.checks.databasePool = await dbResilience.poolHealthCheck();

    // 4. MinIO storage
    try {
      const minioHealth = await this.minioService.healthCheck();
      results.checks.minio = {
        name: 'MinIO Storage',
        status: minioHealth.status,
        message: minioHealth.connected
          ? `Connected, ${minioHealth.buckets.length} bucket(s) available`
          : `Not connected: ${minioHealth.error || 'Unknown error'}`,
        responseTime: 0,
        details: {
          connected: minioHealth.connected,
          buckets: minioHealth.buckets,
        },
      };
    } catch (error) {
      results.checks.minio = {
        name: 'MinIO Storage',
        status: 'unknown',
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: 0,
      };
    }

    // 5. Memory usage
    try {
      const memoryUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(memoryUsage.heapTotal / 1024 / 1024);
      const rssMB = Math.round(memoryUsage.rss / 1024 / 1024);

      results.checks.memory = {
        name: 'Memory',
        status: heapUsedMB < 500 ? 'healthy' : heapUsedMB < 1000 ? 'warning' : 'unhealthy',
        message: `Heap: ${heapUsedMB}MB / ${heapTotalMB}MB, RSS: ${rssMB}MB`,
        responseTime: 0,
        details: {
          heapUsed: heapUsedMB,
          heapTotal: heapTotalMB,
          rss: rssMB,
        },
      };
    } catch (error) {
      results.checks.memory = {
        name: 'Memory',
        status: 'unknown',
        message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        responseTime: 0,
      };
    }

    // Calculer le statut global
    const statuses = Object.values(results.checks).map((check: StatusCheck) => check.status);
    if (statuses.some((s) => s === 'unhealthy')) {
      results.overallStatus = 'unhealthy';
    } else if (statuses.some((s) => s === 'warning')) {
      results.overallStatus = 'warning';
    } else {
      results.overallStatus = 'healthy';
    }

    return results;
  }
}

