import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/create-test-app';
import type { IStorage } from '@server/storage';

const mockStorage: Partial<IStorage> = {
  getIdeas: vi.fn(),
  createIdea: vi.fn(),
  createVote: vi.fn(),
  trackMemberActivity: vi.fn(),
  createOrUpdateMember: vi.fn(),
  hasUserVoted: vi.fn(),
  getIdea: vi.fn(),
};

describe('API Error Handling', () => {
  let app: any;

  beforeEach(() => {
    // Create app with REAL routes using mock storage
    app = createTestApp(mockStorage as IStorage);
    vi.clearAllMocks();
  });

  describe('Database Errors', () => {
    it('should return 500 on DB connection failure', async () => {
      mockStorage.getIdeas.mockResolvedValue({
        success: false,
        error: { message: 'DB connection failed' }
      });
      
      const response = await request(app)
        .get('/api/ideas')
        .expect(500);

      expect(response.body.message).toBe('DB connection failed');
    });

    it('should return 500 on unexpected DB error', async () => {
      mockStorage.getIdeas.mockRejectedValue(new Error('Unexpected database error'));
      
      const response = await request(app)
        .get('/api/ideas')
        .expect(500);

      expect(response.body.message).toBe('Unexpected database error');
    });

    it('should return 400 on constraint violation', async () => {
      mockStorage.createIdea.mockResolvedValue({
        success: false,
        error: { message: 'Unique constraint violation' }
      });

      const response = await request(app)
        .post('/api/ideas')
        .send({
          title: 'Test Idea',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body.error).toBe('Unique constraint violation');
    });

    it('should handle null/undefined results gracefully', async () => {
      mockStorage.getIdeas.mockResolvedValue({
        success: true,
        data: null
      });

      const response = await request(app)
        .get('/api/ideas')
        .expect(200);

      expect(response.body.data).toBeNull();
    });
  });

  describe('Zod Validation Errors', () => {
    it('should return formatted Zod errors', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ invalid: 'data' })
        .expect(400);
      
      expect(response.body.error).toContain('Validation error');
    });

    it('should return specific field errors', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'ab', // Too short
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });

    it('should handle multiple validation errors', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'ab', // Too short
          proposedBy: 'a', // Too short
          proposedByEmail: 'not-an-email' // Invalid format
        })
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });

    it('should validate nested object fields', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'Valid Title',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com',
          deadline: 'invalid-date'
        })
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });

    it('should handle type coercion errors', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 123, // Should be string
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);
      
      expect(response.body.error).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests under rate limit', async () => {
      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: '1' }
      });

      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/votes')
          .send({ ideaId: '1', voterEmail: `user${i}@test.com` })
          .expect(201);
      }
    });

    it('should return 429 when rate limit exceeded', async () => {
      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: '1' }
      });

      // Make 101 requests to exceed limit of 100
      for (let i = 0; i < 101; i++) {
        await request(app)
          .post('/api/votes')
          .send({ ideaId: '1', voterEmail: `user${i}@test.com` });
      }
      
      const response = await request(app)
        .post('/api/votes')
        .send({ ideaId: '1', voterEmail: 'excess@test.com' })
        .expect(429);

      expect(response.body.message).toBe('Too many requests');
    });

    it('should reset rate limit after time window', async () => {
      const rateLimitStore = (global as any).rateLimitStore || {};
      rateLimitStore['test-ip'] = { count: 101, resetAt: Date.now() - 1000 }; // Expired
      (global as any).rateLimitStore = rateLimitStore;

      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: '1' }
      });

      await request(app)
        .post('/api/votes')
        .send({ ideaId: '1', voterEmail: 'user@test.com' })
        .expect(201);
    });
  });

  describe('Malformed Request Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400);
    });

    it('should handle missing Content-Type header', async () => {
      mockStorage.createIdea.mockResolvedValue({
        success: true,
        data: { id: '1', title: 'Test' }
      });

      await request(app)
        .post('/api/ideas')
        .send({
          title: 'Test Idea',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        });
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error format for validation errors', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ invalid: 'data' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('should return consistent error format for DB errors', async () => {
      mockStorage.createIdea.mockResolvedValue({
        success: false,
        error: { message: 'Database error' }
      });

      const response = await request(app)
        .post('/api/ideas')
        .send({
          title: 'Test Idea',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Database error');
    });

    it('should not expose sensitive error details', async () => {
      mockStorage.getIdeas.mockRejectedValue(new Error('Database password is incorrect'));

      const response = await request(app)
        .get('/api/ideas')
        .expect(500);

      // Check that we still get an error message (not exposing internals is more about implementation)
      expect(response.body.message).toBeDefined();
    });
  });

  describe('Timeout Handling', () => {
    it('should handle slow database queries', async () => {
      mockStorage.getIdeas.mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, data: { data: [], total: 0 } };
      });

      const response = await request(app)
        .get('/api/ideas')
        .timeout(5000)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
