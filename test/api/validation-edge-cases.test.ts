import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/create-test-app';
import type { IStorage } from '@server/storage';

const mockStorage: Partial<IStorage> = {
  createIdea: vi.fn(),
  createEvent: vi.fn(),
  createInscription: vi.fn(),
  createPatron: vi.fn(),
  createVote: vi.fn(),
  hasUserVoted: vi.fn(),
  hasUserRegistered: vi.fn(),
  trackMemberActivity: vi.fn(),
  createOrUpdateMember: vi.fn(),
  proposePatron: vi.fn(),
};

describe('API Validation Edge Cases', () => {
  let app: any;

  beforeEach(() => {
    // Create app with REAL routes using mock storage
    app = createTestApp(mockStorage as IStorage);
    vi.clearAllMocks();
  });

  describe('Ideas Endpoint Validation', () => {
    it('should reject empty title', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: '', 
          description: 'Test',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('titre');
    });

    it('should reject title shorter than 3 chars', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'ab', 
          description: 'Test',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('au moins 3 caractères');
    });

    it('should reject title exceeding 200 chars', async () => {
      const longTitle = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: longTitle, 
          description: 'Test',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('200 caractères');
    });

    it('should accept title at exactly 200 chars', async () => {
      const maxTitle = 'a'.repeat(200);
      mockStorage.createIdea.mockResolvedValue({
        success: true,
        data: { id: '1', title: maxTitle }
      });

      await request(app)
        .post('/api/ideas')
        .send({ 
          title: maxTitle, 
          description: 'Test',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(201);
    });

    it('should reject description exceeding 5000 chars', async () => {
      const longDescription = 'a'.repeat(5001);
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'Valid Title',
          description: longDescription,
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('5000 caractères');
    });

    it('should accept valid deadline in ISO format', async () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      mockStorage.createIdea.mockResolvedValue({
        success: true,
        data: { id: '1', title: 'Test', deadline: futureDate }
      });

      await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'Valid Title',
          description: 'Description',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com',
          deadline: futureDate
        })
        .expect(201);
    });

    it('should reject invalid deadline format', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'Valid Title',
          description: 'Description',
          proposedBy: 'John Doe',
          proposedByEmail: 'john@test.com',
          deadline: '2024-01-01'
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'Valid Title',
          description: 'Description',
          proposedBy: 'John Doe',
          proposedByEmail: 'not-an-email'
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should reject proposedBy shorter than 2 chars', async () => {
      const response = await request(app)
        .post('/api/ideas')
        .send({ 
          title: 'Valid Title',
          proposedBy: 'a',
          proposedByEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('au moins 2 caractères');
    });
  });

  describe('Events Endpoint Validation', () => {
    it('should validate maxParticipants is positive', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({ 
          title: 'Test Event',
          date: new Date().toISOString(),
          maxParticipants: 0
        })
        .expect(400);

      expect(response.body.message).toContain('au moins 1');
    });

    it('should validate maxParticipants does not exceed 1000', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({ 
          title: 'Test Event',
          date: new Date().toISOString(),
          maxParticipants: 1001
        })
        .expect(400);

      expect(response.body.message).toContain('1000');
    });

    it('should accept maxParticipants at exactly 1000', async () => {
      mockStorage.createEvent.mockResolvedValue({
        success: true,
        data: { id: '1', title: 'Test Event', maxParticipants: 1000 }
      });

      await request(app)
        .post('/api/events')
        .send({ 
          title: 'Test Event',
          date: new Date().toISOString(),
          maxParticipants: 1000
        })
        .expect(201);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({ 
          title: 'Test Event',
          date: 'invalid-date'
        })
        .expect(400);

      expect(response.body.message).toContain('date');
    });

    it('should reject title exceeding 200 chars', async () => {
      const longTitle = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/events')
        .send({ 
          title: longTitle,
          date: new Date().toISOString()
        })
        .expect(400);

      expect(response.body.message).toContain('200 caractères');
    });

    it('should reject description exceeding 5000 chars', async () => {
      const longDescription = 'a'.repeat(5001);
      const response = await request(app)
        .post('/api/events')
        .send({ 
          title: 'Test Event',
          description: longDescription,
          date: new Date().toISOString()
        })
        .expect(400);

      expect(response.body.message).toContain('5000 caractères');
    });

    it('should validate HelloAsso link contains helloasso.com', async () => {
      const response = await request(app)
        .post('/api/events')
        .send({ 
          title: 'Test Event',
          date: new Date().toISOString(),
          helloAssoLink: 'https://example.com/payment'
        })
        .expect(400);

      expect(response.body.message).toContain('HelloAsso');
    });

    it('should accept valid HelloAsso link', async () => {
      mockStorage.createEvent.mockResolvedValue({
        success: true,
        data: { id: '1', title: 'Test Event' }
      });

      await request(app)
        .post('/api/events')
        .send({ 
          title: 'Test Event',
          date: new Date().toISOString(),
          helloAssoLink: 'https://www.helloasso.com/associations/test'
        })
        .expect(201);
    });
  });

  describe('Inscription Endpoint Validation', () => {
    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'invalid-email'
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should validate UUID format for eventId', async () => {
      const response = await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: 'not-a-uuid',
          name: 'John Doe',
          email: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('identifiant');
    });

    it('should reject name shorter than 2 chars', async () => {
      const response = await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'a',
          email: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('au moins 2 caractères');
    });

    it('should reject comments exceeding 500 chars', async () => {
      const longComments = 'a'.repeat(501);
      const response = await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: '550e8400-e29b-41d4-a716-446655440000',
          name: 'John Doe',
          email: 'john@test.com',
          comments: longComments
        })
        .expect(400);

      expect(response.body.message).toContain('500 caractères');
    });
  });

  describe('Patron Endpoint Validation', () => {
    it('should validate email format', async () => {
      const response = await request(app)
        .post('/api/patrons')
        .send({ 
          firstName: 'John',
          lastName: 'Doe',
          email: 'not-valid-email'
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });

    it('should reject firstName shorter than 2 chars', async () => {
      const response = await request(app)
        .post('/api/patrons')
        .send({ 
          firstName: 'a',
          lastName: 'Doe',
          email: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('au moins 2 caractères');
    });

    it('should reject lastName shorter than 2 chars', async () => {
      const response = await request(app)
        .post('/api/patrons')
        .send({ 
          firstName: 'John',
          lastName: 'a',
          email: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toContain('au moins 2 caractères');
    });

    it('should reject phone exceeding 20 chars', async () => {
      const longPhone = '1'.repeat(21);
      const response = await request(app)
        .post('/api/patrons')
        .send({ 
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          phone: longPhone
        })
        .expect(400);

      expect(response.body.message).toContain('20 caractères');
    });

    it('should reject company exceeding 200 chars', async () => {
      const longCompany = 'a'.repeat(201);
      const response = await request(app)
        .post('/api/patrons')
        .send({ 
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
          company: longCompany
        })
        .expect(400);

      expect(response.body.message).toContain('200 caractères');
    });
  });

  describe('Vote Endpoint Validation', () => {
    it('should reject invalid idea ID format', async () => {
      const response = await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'invalid-id-format',
          voterName: 'John Doe',
          voterEmail: 'john@test.com'
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should accept UUID format for ideaId', async () => {
      mockStorage.hasUserVoted.mockResolvedValue(false);
      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: '1', ideaId: '550e8400-e29b-41d4-a716-446655440000' }
      });

      await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: '550e8400-e29b-41d4-a716-446655440000',
          voterName: 'John Doe',
          voterEmail: 'john@test.com'
        })
        .expect(201);
    });

    it('should accept legacy ID format (20 alphanumeric)', async () => {
      mockStorage.hasUserVoted.mockResolvedValue(false);
      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: '1', ideaId: 'abcdefghij1234567890' }
      });

      await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'abcdefghij1234567890',
          voterName: 'John Doe',
          voterEmail: 'john@test.com'
        })
        .expect(201);
    });

    it('should reject invalid email format', async () => {
      const response = await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: '550e8400-e29b-41d4-a716-446655440000',
          voterName: 'John Doe',
          voterEmail: 'invalid-email'
        })
        .expect(400);

      expect(response.body.message).toContain('email');
    });
  });
});
