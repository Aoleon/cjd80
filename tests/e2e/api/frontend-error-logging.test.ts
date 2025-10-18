import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/create-test-app';
import type { IStorage } from '@server/storage';

const mockLogger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};

// Mock the logger module
vi.mock('@server/lib/logger', () => ({
  logger: mockLogger
}));

describe('Frontend Error Logging API', () => {
  let app: any;
  let mockStorage: IStorage;

  beforeEach(() => {
    // Create minimal mock storage (logging endpoint doesn't use storage)
    mockStorage = {} as IStorage;
    
    // Create app with REAL routes
    app = createTestApp(mockStorage);
    
    vi.clearAllMocks();
  });

  describe('POST /api/logs/frontend-error - Valid Payloads', () => {
    it('should accept valid error payload with all fields', async () => {
      const validPayload = {
        message: 'Test error',
        stack: 'Error stack trace',
        componentStack: 'Component stack',
        url: 'http://localhost:5000/test',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        timestamp: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/logs/frontend-error')
        .send(validPayload)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(mockLogger.error).toHaveBeenCalledWith('Frontend error', expect.objectContaining({
        message: 'Test error',
        url: 'http://localhost:5000/test'
      }));
    });

    it('should accept valid error payload without optional fields', async () => {
      const minimalPayload = {
        message: 'Minimal error',
        url: 'https://example.com',
        userAgent: 'Mozilla/5.0',
        timestamp: new Date().toISOString()
      };
      
      const response = await request(app)
        .post('/api/logs/frontend-error')
        .send(minimalPayload)
        .expect(200);
      
      expect(response.body.success).toBe(true);
      expect(mockLogger.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/logs/frontend-error - Validation Rules', () => {
    it('should reject invalid URL format', async () => {
      const invalidPayload = {
        message: 'Test',
        url: 'not-a-valid-url',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(invalidPayload)
        .expect(400);

      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should reject message exceeding 1000 chars', async () => {
      const longMessage = 'a'.repeat(1001);
      const payload = {
        message: longMessage,
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });

    it('should accept message at exactly 1000 chars', async () => {
      const maxMessage = 'a'.repeat(1000);
      const payload = {
        message: maxMessage,
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(200);
    });

    it('should reject empty message', async () => {
      const payload = {
        message: '',
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });

    it('should reject URL exceeding 500 chars', async () => {
      const longUrl = 'http://example.com/' + 'a'.repeat(500);
      const payload = {
        message: 'Test',
        url: longUrl,
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });

    it('should reject userAgent exceeding 500 chars', async () => {
      const longUserAgent = 'a'.repeat(501);
      const payload = {
        message: 'Test',
        url: 'http://localhost:5000',
        userAgent: longUserAgent,
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });

    it('should reject invalid timestamp format', async () => {
      const payload = {
        message: 'Test',
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: 'not-a-valid-date'
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });
  });

  describe('POST /api/logs/frontend-error - Stack Trace Sanitization', () => {
    it('should sanitize stack traces to 5000 chars', async () => {
      const longStack = 'Error: '.repeat(1000);
      const payload = {
        message: 'Test error',
        stack: longStack,
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(200);

      const logCall = mockLogger.error.mock.calls[0][1];
      expect(logCall.stack.length).toBeLessThanOrEqual(5000);
    });

    it('should sanitize component stack to 3000 chars', async () => {
      const longComponentStack = 'Component: '.repeat(500);
      const payload = {
        message: 'Test error',
        componentStack: longComponentStack,
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(200);

      const logCall = mockLogger.error.mock.calls[0][1];
      expect(logCall.componentStack.length).toBeLessThanOrEqual(3000);
    });

    it('should handle missing stack with N/A', async () => {
      const payload = {
        message: 'Test error',
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(200);

      const logCall = mockLogger.error.mock.calls[0][1];
      expect(logCall.stack).toBe('N/A');
      expect(logCall.componentStack).toBe('N/A');
    });
  });

  describe('POST /api/logs/frontend-error - Missing Required Fields', () => {
    it('should reject payload missing message', async () => {
      const payload = {
        url: 'http://localhost:5000',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });

    it('should reject payload missing url', async () => {
      const payload = {
        message: 'Test',
        userAgent: 'Mozilla',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });

    it('should reject payload missing userAgent', async () => {
      const payload = {
        message: 'Test',
        url: 'http://localhost:5000',
        timestamp: new Date().toISOString()
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });

    it('should reject payload missing timestamp', async () => {
      const payload = {
        message: 'Test',
        url: 'http://localhost:5000',
        userAgent: 'Mozilla'
      };
      
      await request(app)
        .post('/api/logs/frontend-error')
        .send(payload)
        .expect(400);
    });
  });
});
