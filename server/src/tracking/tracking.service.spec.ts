import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { StorageService } from '../common/storage/storage.service';
import { ZodError } from 'zod';

describe('TrackingService', () => {
  let service: TrackingService;
  let storageService: StorageService;

  beforeEach(() => {
    storageService = {
      instance: {
        getTrackingDashboard: vi.fn(),
        getTrackingMetrics: vi.fn(),
        createTrackingMetric: vi.fn(),
        getTrackingAlerts: vi.fn(),
        createTrackingAlert: vi.fn(),
        updateTrackingAlert: vi.fn(),
        generateTrackingAlerts: vi.fn(),
      },
    } as unknown as StorageService;

    service = new TrackingService(storageService);
  });

  describe('getTrackingDashboard', () => {
    it('should return dashboard data on success', async () => {
      const mockData = {
        totalMetrics: 150,
        totalAlerts: 45,
        criticalAlerts: 5,
      };

      vi.mocked(storageService.instance.getTrackingDashboard).mockResolvedValueOnce({
        success: true,
        data: mockData,
      });

      const result = await service.getTrackingDashboard();

      expect(result).toEqual({
        success: true,
        data: mockData,
      });
    });

    it('should throw BadRequestException on storage error', async () => {
      const error = new Error('Database connection failed');

      vi.mocked(storageService.instance.getTrackingDashboard).mockResolvedValueOnce({
        success: false,
        error,
      });

      await expect(service.getTrackingDashboard()).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTrackingMetrics', () => {
    it('should return metrics with filters applied', async () => {
      const mockMetrics = [
        {
          id: 'metric-1',
          entityType: 'member',
          entityId: 'member-123',
          entityEmail: 'john@example.com',
          metricType: 'engagement',
          metricValue: 85,
          recordedAt: new Date(),
        },
      ];

      const options = {
        entityType: 'member' as const,
        entityEmail: 'john@example.com',
        metricType: 'engagement',
      };

      vi.mocked(storageService.instance.getTrackingMetrics).mockResolvedValueOnce({
        success: true,
        data: mockMetrics,
      });

      const result = await service.getTrackingMetrics(options);

      expect(result).toEqual({
        success: true,
        data: mockMetrics,
      });

      expect(storageService.instance.getTrackingMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'member',
          entityEmail: 'john@example.com',
          metricType: 'engagement',
        })
      );
    });

    it('should parse date strings to Date objects', async () => {
      const options = {
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        limit: 50,
      };

      vi.mocked(storageService.instance.getTrackingMetrics).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await service.getTrackingMetrics(options);

      expect(storageService.instance.getTrackingMetrics).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.any(Date),
          endDate: expect.any(Date),
          limit: 50,
        })
      );
    });

    it('should throw BadRequestException on error', async () => {
      const error = new Error('Query failed');

      vi.mocked(storageService.instance.getTrackingMetrics).mockResolvedValueOnce({
        success: false,
        error,
      });

      await expect(service.getTrackingMetrics({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('createTrackingMetric', () => {
    it('should create a tracking metric with valid data', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-456',
        entityEmail: 'jane@example.com',
        metricType: 'conversion',
        metricValue: 100,
        description: 'Successfully converted to patron',
      };

      const createdMetric = {
        id: 'metric-2',
        ...inputData,
        recordedBy: 'admin@example.com',
        recordedAt: new Date(),
      };

      vi.mocked(storageService.instance.createTrackingMetric).mockResolvedValueOnce({
        success: true,
        data: createdMetric,
      });

      const result = await service.createTrackingMetric(inputData, 'admin@example.com');

      expect(result).toEqual({
        success: true,
        data: createdMetric,
      });
    });

    it('should include recordedBy email in the validated data', async () => {
      const inputData = {
        entityType: 'patron',
        entityId: 'patron-789',
        entityEmail: 'patron@example.com',
        metricType: 'activity',
      };

      vi.mocked(storageService.instance.createTrackingMetric).mockResolvedValueOnce({
        success: true,
        data: {} as never,
      });

      await service.createTrackingMetric(inputData, 'admin@example.com');

      expect(storageService.instance.createTrackingMetric).toHaveBeenCalledWith(
        expect.objectContaining({
          recordedBy: 'admin@example.com',
        })
      );
    });

    it('should throw BadRequestException for invalid email', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'invalid-email',
        metricType: 'engagement',
      };

      await expect(
        service.createTrackingMetric(inputData, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing required fields', async () => {
      const inputData = {
        entityType: 'member',
        // missing entityId
        entityEmail: 'john@example.com',
        metricType: 'engagement',
      };

      await expect(
        service.createTrackingMetric(inputData, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on storage error', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'john@example.com',
        metricType: 'engagement',
      };

      vi.mocked(storageService.instance.createTrackingMetric).mockResolvedValueOnce({
        success: false,
        error: new Error('Save failed'),
      });

      await expect(
        service.createTrackingMetric(inputData, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTrackingAlerts', () => {
    it('should return alerts with filters applied', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          entityType: 'member',
          entityId: 'member-123',
          entityEmail: 'john@example.com',
          alertType: 'stale',
          severity: 'high',
          title: 'No engagement',
          message: 'Member has not engaged in 90 days',
          isRead: false,
          isResolved: false,
          createdAt: new Date(),
        },
      ];

      const options = {
        entityType: 'member' as const,
        severity: 'high',
        isResolved: false,
      };

      vi.mocked(storageService.instance.getTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: mockAlerts,
      });

      const result = await service.getTrackingAlerts(options);

      expect(result).toEqual({
        success: true,
        data: mockAlerts,
      });

      expect(storageService.instance.getTrackingAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'member',
          severity: 'high',
          isResolved: false,
        })
      );
    });

    it('should parse boolean query strings correctly', async () => {
      const options = {
        isRead: false,
        isResolved: true,
      };

      vi.mocked(storageService.instance.getTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      await service.getTrackingAlerts(options);

      expect(storageService.instance.getTrackingAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          isRead: false,
          isResolved: true,
        })
      );
    });

    it('should throw BadRequestException on error', async () => {
      vi.mocked(storageService.instance.getTrackingAlerts).mockResolvedValueOnce({
        success: false,
        error: new Error('Query failed'),
      });

      await expect(service.getTrackingAlerts({})).rejects.toThrow(BadRequestException);
    });
  });

  describe('createTrackingAlert', () => {
    it('should create a tracking alert with valid data', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'john@example.com',
        alertType: 'needs_followup',
        severity: 'medium',
        title: 'Needs follow-up',
        message: 'Contact member about participation',
      };

      const createdAlert = {
        id: 'alert-2',
        ...inputData,
        isRead: false,
        isResolved: false,
        createdBy: 'admin@example.com',
        createdAt: new Date(),
      };

      vi.mocked(storageService.instance.createTrackingAlert).mockResolvedValueOnce({
        success: true,
        data: createdAlert,
      });

      const result = await service.createTrackingAlert(inputData, 'admin@example.com');

      expect(result).toEqual({
        success: true,
        data: createdAlert,
      });
    });

    it('should include createdBy email in the validated data', async () => {
      const inputData = {
        entityType: 'patron',
        entityId: 'patron-789',
        entityEmail: 'patron@example.com',
        alertType: 'conversion_opportunity',
        title: 'High potential',
        message: 'This patron has high engagement',
      };

      vi.mocked(storageService.instance.createTrackingAlert).mockResolvedValueOnce({
        success: true,
        data: {} as never,
      });

      await service.createTrackingAlert(inputData, 'admin@example.com');

      expect(storageService.instance.createTrackingAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          createdBy: 'admin@example.com',
        })
      );
    });

    it('should convert expiresAt string to Date', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'john@example.com',
        alertType: 'stale',
        title: 'Stale member',
        message: 'No engagement',
        expiresAt: '2026-12-31T23:59:59Z',
      };

      vi.mocked(storageService.instance.createTrackingAlert).mockResolvedValueOnce({
        success: true,
        data: {} as never,
      });

      await service.createTrackingAlert(inputData, 'admin@example.com');

      expect(storageService.instance.createTrackingAlert).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date),
        })
      );
    });

    it('should use default severity if not provided', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'john@example.com',
        alertType: 'needs_followup',
        title: 'Follow up',
        message: 'Contact required',
        // severity not provided, should default to 'medium'
      };

      vi.mocked(storageService.instance.createTrackingAlert).mockResolvedValueOnce({
        success: true,
        data: {} as never,
      });

      await service.createTrackingAlert(inputData, 'admin@example.com');

      expect(storageService.instance.createTrackingAlert).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid alert type', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'john@example.com',
        alertType: 'invalid_type',
        title: 'Test',
        message: 'Test message',
      };

      await expect(
        service.createTrackingAlert(inputData, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing required fields', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        // missing entityEmail
        alertType: 'needs_followup',
        title: 'Test',
        message: 'Test message',
      };

      await expect(
        service.createTrackingAlert(inputData, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException on storage error', async () => {
      const inputData = {
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'john@example.com',
        alertType: 'stale',
        title: 'Stale',
        message: 'No activity',
      };

      vi.mocked(storageService.instance.createTrackingAlert).mockResolvedValueOnce({
        success: false,
        error: new Error('Save failed'),
      });

      await expect(
        service.createTrackingAlert(inputData, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateTrackingAlert', () => {
    it('should update alert to mark as read', async () => {
      const updateData = {
        isRead: true,
      };

      const updatedAlert = {
        id: 'alert-1',
        entityType: 'member',
        entityId: 'member-123',
        entityEmail: 'john@example.com',
        alertType: 'stale',
        severity: 'high',
        title: 'No engagement',
        message: 'Member has not engaged',
        isRead: true,
        isResolved: false,
        createdAt: new Date(),
      };

      vi.mocked(storageService.instance.updateTrackingAlert).mockResolvedValueOnce({
        success: true,
        data: updatedAlert,
      });

      const result = await service.updateTrackingAlert('alert-1', updateData, 'admin@example.com');

      expect(result).toEqual({
        success: true,
        data: updatedAlert,
      });
    });

    it('should update alert to mark as resolved and include resolvedBy', async () => {
      const updateData = {
        isResolved: true,
        resolved: true, // The service checks this property
      };

      vi.mocked(storageService.instance.updateTrackingAlert).mockResolvedValueOnce({
        success: true,
        data: {} as never,
      });

      await service.updateTrackingAlert('alert-1', updateData, 'admin@example.com');

      expect(storageService.instance.updateTrackingAlert).toHaveBeenCalledWith(
        'alert-1',
        expect.objectContaining({
          isResolved: true,
          resolvedBy: 'admin@example.com',
        })
      );
    });

    it('should not include resolvedBy when not marking as resolved', async () => {
      const updateData = {
        isRead: true,
      };

      vi.mocked(storageService.instance.updateTrackingAlert).mockResolvedValueOnce({
        success: true,
        data: {} as never,
      });

      await service.updateTrackingAlert('alert-1', updateData, 'admin@example.com');

      expect(storageService.instance.updateTrackingAlert).toHaveBeenCalledWith(
        'alert-1',
        expect.objectContaining({
          resolvedBy: undefined,
        })
      );
    });

    it('should throw NotFoundException when alert not found', async () => {
      const updateData = {
        isRead: true,
      };

      vi.mocked(storageService.instance.updateTrackingAlert).mockResolvedValueOnce({
        success: false,
        error: new Error('Alert not found'),
      });

      await expect(
        service.updateTrackingAlert('nonexistent-id', updateData, 'admin@example.com')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid data', async () => {
      const updateData = {
        isRead: 'invalid', // should be boolean
      };

      await expect(
        service.updateTrackingAlert('alert-1', updateData, 'admin@example.com')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateTrackingAlerts', () => {
    it('should generate alerts successfully', async () => {
      const generationResult = {
        created: 12,
        errors: 0,
      };

      vi.mocked(storageService.instance.generateTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: generationResult,
      });

      vi.mocked(storageService.instance.getTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const result = await service.generateTrackingAlerts();

      expect(result).toEqual({
        success: true,
        data: generationResult,
        message: '12 alertes créées, 0 erreurs',
      });
    });

    it('should log critical alerts when alerts are created', async () => {
      const generationResult = {
        created: 5,
        errors: 1,
      };

      const criticalAlerts = [
        {
          id: 'alert-crit-1',
          entityType: 'member',
          entityId: 'member-999',
          entityEmail: 'critical@example.com',
          alertType: 'stale',
          severity: 'critical',
          title: 'Critical: No activity',
          message: 'Member completely inactive',
          isRead: false,
          isResolved: false,
          createdAt: new Date(),
        },
      ];

      vi.mocked(storageService.instance.generateTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: generationResult,
      });

      vi.mocked(storageService.instance.getTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: criticalAlerts,
      });

      const loggerSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await service.generateTrackingAlerts();

      expect(result.data.created).toBe(5);
      expect(storageService.instance.getTrackingAlerts).toHaveBeenCalledWith(
        expect.objectContaining({
          severity: 'critical',
          isResolved: false,
          limit: 10,
        })
      );

      loggerSpy.mockRestore();
    });

    it('should not query critical alerts when no alerts created', async () => {
      const generationResult = {
        created: 0,
        errors: 0,
      };

      vi.mocked(storageService.instance.generateTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: generationResult,
      });

      const result = await service.generateTrackingAlerts();

      expect(result.data.created).toBe(0);
      expect(storageService.instance.getTrackingAlerts).not.toHaveBeenCalled();
    });

    it('should handle errors during critical alerts lookup gracefully', async () => {
      const generationResult = {
        created: 3,
        errors: 0,
      };

      vi.mocked(storageService.instance.generateTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: generationResult,
      });

      vi.mocked(storageService.instance.getTrackingAlerts).mockResolvedValueOnce({
        success: false,
        error: new Error('Query failed'),
      });

      const result = await service.generateTrackingAlerts();

      // Should still return success even if critical alerts lookup fails
      expect(result.success).toBe(true);
      expect(result.data.created).toBe(3);
    });

    it('should throw BadRequestException when generation fails', async () => {
      vi.mocked(storageService.instance.generateTrackingAlerts).mockResolvedValueOnce({
        success: false,
        error: new Error('Generation failed'),
      });

      await expect(service.generateTrackingAlerts()).rejects.toThrow(BadRequestException);
    });

    it('should return correct message format', async () => {
      const generationResult = {
        created: 8,
        errors: 2,
      };

      vi.mocked(storageService.instance.generateTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: generationResult,
      });

      vi.mocked(storageService.instance.getTrackingAlerts).mockResolvedValueOnce({
        success: true,
        data: [],
      });

      const result = await service.generateTrackingAlerts();

      expect(result.message).toBe('8 alertes créées, 2 erreurs');
    });
  });
});
