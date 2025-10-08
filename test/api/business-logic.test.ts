import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import { createTestApp } from '../helpers/create-test-app';
import type { IStorage } from '@server/storage';

const mockStorage: Partial<IStorage> = {
  createVote: vi.fn(),
  hasUserVoted: vi.fn(),
  createInscription: vi.fn(),
  hasUserRegistered: vi.fn(),
  getEvent: vi.fn(),
  getEventInscriptions: vi.fn(),
  trackMemberActivity: vi.fn(),
  createOrUpdateMember: vi.fn(),
  getMemberByEmail: vi.fn(),
  getIdea: vi.fn(),
};

describe('Business Logic', () => {
  let app: any;

  beforeEach(() => {
    // Create app with REAL routes using mock storage
    app = createTestApp(mockStorage as IStorage);
    vi.clearAllMocks();
  });

  describe('Vote Deduplication', () => {
    it('should prevent duplicate votes', async () => {
      mockStorage.hasUserVoted.mockResolvedValueOnce(false);
      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: 'vote-1', ideaId: 'idea-1', voterEmail: 'user@test.com' }
      });
      mockStorage.getIdea.mockResolvedValue({
        success: true,
        data: { id: 'idea-1', title: 'Test Idea' }
      });
      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com' }
      });
      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: {}
      });

      // First vote should succeed
      const firstResponse = await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'idea-1', 
          voterEmail: 'user@test.com',
          voterName: 'John Doe'
        })
        .expect(201);

      expect(firstResponse.body.success).toBe(true);

      // Second vote should fail
      mockStorage.hasUserVoted.mockResolvedValueOnce(true);

      const secondResponse = await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'idea-1', 
          voterEmail: 'user@test.com',
          voterName: 'John Doe'
        })
        .expect(400);

      expect(secondResponse.body.error).toContain('déjà voté');
    });

    it('should allow same user to vote on different ideas', async () => {
      mockStorage.hasUserVoted.mockResolvedValue(false);
      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: 'vote-1' }
      });
      mockStorage.getIdea.mockResolvedValue({
        success: true,
        data: { id: 'idea-1', title: 'Test Idea' }
      });
      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com' }
      });
      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: {}
      });

      await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'idea-1', 
          voterEmail: 'user@test.com',
          voterName: 'John Doe'
        })
        .expect(201);

      await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'idea-2', 
          voterEmail: 'user@test.com',
          voterName: 'John Doe'
        })
        .expect(201);

      expect(mockStorage.createVote).toHaveBeenCalledTimes(2);
    });

    it('should allow different users to vote on same idea', async () => {
      mockStorage.hasUserVoted.mockResolvedValue(false);
      mockStorage.createVote.mockResolvedValue({
        success: true,
        data: { id: 'vote-1' }
      });
      mockStorage.getIdea.mockResolvedValue({
        success: true,
        data: { id: 'idea-1', title: 'Test Idea' }
      });
      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com' }
      });
      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: {}
      });

      await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'idea-1', 
          voterEmail: 'user1@test.com',
          voterName: 'John Doe'
        })
        .expect(201);

      await request(app)
        .post('/api/votes')
        .send({ 
          ideaId: 'idea-1', 
          voterEmail: 'user2@test.com',
          voterName: 'Jane Smith'
        })
        .expect(201);

      expect(mockStorage.createVote).toHaveBeenCalledTimes(2);
    });
  });

  describe('Member Engagement Scoring', () => {
    it('should track activity and update engagement score', async () => {
      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com', engagementScore: 0 }
      });

      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: { id: 'activity-1', scoreImpact: 10 }
      });

      mockStorage.getMemberByEmail.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com', engagementScore: 10 }
      });

      const response = await request(app)
        .post('/api/members/activity')
        .send({
          email: 'user@test.com',
          activityType: 'idea_proposed',
          scoreImpact: 10
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.member.engagementScore).toBe(10);
    });

    it('should calculate cumulative engagement score', async () => {
      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com', engagementScore: 10 }
      });

      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: { id: 'activity-2', scoreImpact: 5 }
      });

      mockStorage.getMemberByEmail.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com', engagementScore: 15 }
      });

      const response = await request(app)
        .post('/api/members/activity')
        .send({
          email: 'user@test.com',
          activityType: 'event_registered',
          scoreImpact: 5
        })
        .expect(200);

      expect(response.body.member.engagementScore).toBe(15);
    });

    it('should apply correct score impact for different activities', async () => {
      const activities = [
        { type: 'idea_proposed', impact: 10 },
        { type: 'vote_cast', impact: 2 },
        { type: 'event_registered', impact: 5 },
      ];

      for (const activity of activities) {
        mockStorage.createOrUpdateMember.mockResolvedValue({
          success: true,
          data: { email: 'user@test.com' }
        });

        mockStorage.trackMemberActivity.mockResolvedValue({
          success: true,
          data: { id: `activity-${activity.type}`, scoreImpact: activity.impact }
        });

        mockStorage.getMemberByEmail.mockResolvedValue({
          success: true,
          data: { email: 'user@test.com', engagementScore: activity.impact }
        });

        await request(app)
          .post('/api/members/activity')
          .send({
            email: 'user@test.com',
            activityType: activity.type,
            scoreImpact: activity.impact
          })
          .expect(200);

        expect(mockStorage.trackMemberActivity).toHaveBeenCalledWith(
          expect.objectContaining({ scoreImpact: activity.impact })
        );
      }
    });
  });

  describe('Event Inscriptions', () => {
    it('should prevent inscription when event is full', async () => {
      mockStorage.hasUserRegistered.mockResolvedValue(false);
      mockStorage.getEvent.mockResolvedValue({
        success: true,
        data: { 
          id: 'event-1', 
          title: 'Full Event',
          maxParticipants: 10 
        }
      });

      mockStorage.getEventInscriptions.mockResolvedValue({
        success: true,
        data: Array(10).fill({ id: 'inscription' }) // 10 inscriptions
      });

      const response = await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: 'event-1', 
          email: 'user@test.com',
          name: 'John Doe'
        })
        .expect(400);

      expect(response.body.message).toContain('complet');
    });

    it('should allow inscription when event has capacity', async () => {
      mockStorage.hasUserRegistered.mockResolvedValue(false);
      mockStorage.getEvent.mockResolvedValue({
        success: true,
        data: { 
          id: 'event-1', 
          title: 'Available Event',
          maxParticipants: 10 
        }
      });

      mockStorage.getEventInscriptions.mockResolvedValue({
        success: true,
        data: Array(5).fill({ id: 'inscription' }) // 5 inscriptions
      });

      mockStorage.createInscription.mockResolvedValue({
        success: true,
        data: { id: 'inscription-1', eventId: 'event-1' }
      });

      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com' }
      });

      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: {}
      });

      await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: 'event-1', 
          email: 'user@test.com',
          name: 'John Doe'
        })
        .expect(201);

      expect(mockStorage.createInscription).toHaveBeenCalled();
    });

    it('should allow inscription when no maxParticipants set', async () => {
      mockStorage.hasUserRegistered.mockResolvedValue(false);
      mockStorage.getEvent.mockResolvedValue({
        success: true,
        data: { 
          id: 'event-1', 
          title: 'Unlimited Event',
          maxParticipants: null
        }
      });

      mockStorage.createInscription.mockResolvedValue({
        success: true,
        data: { id: 'inscription-1', eventId: 'event-1' }
      });

      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com' }
      });

      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: {}
      });

      await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: 'event-1', 
          email: 'user@test.com',
          name: 'John Doe'
        })
        .expect(201);
    });

    it('should prevent duplicate inscriptions', async () => {
      mockStorage.hasUserRegistered.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: 'event-1', 
          email: 'user@test.com',
          name: 'John Doe'
        })
        .expect(400);

      expect(response.body.message).toContain('déjà inscrit');
    });

    it('should return 404 for non-existent event', async () => {
      mockStorage.hasUserRegistered.mockResolvedValue(false);
      mockStorage.getEvent.mockResolvedValue({
        success: true,
        data: null
      });

      const response = await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: 'non-existent', 
          email: 'user@test.com',
          name: 'John Doe'
        })
        .expect(404);

      expect(response.body.message).toContain('non trouvé');
    });

    it('should track member activity on successful inscription', async () => {
      mockStorage.hasUserRegistered.mockResolvedValue(false);
      mockStorage.getEvent.mockResolvedValue({
        success: true,
        data: { 
          id: 'event-1', 
          title: 'Test Event',
          maxParticipants: null
        }
      });

      mockStorage.createInscription.mockResolvedValue({
        success: true,
        data: { id: 'inscription-1', eventId: 'event-1' }
      });

      mockStorage.createOrUpdateMember.mockResolvedValue({
        success: true,
        data: { email: 'user@test.com' }
      });

      mockStorage.trackMemberActivity.mockResolvedValue({
        success: true,
        data: {}
      });

      await request(app)
        .post('/api/inscriptions')
        .send({ 
          eventId: 'event-1', 
          email: 'user@test.com',
          name: 'John Doe'
        })
        .expect(201);

      expect(mockStorage.trackMemberActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          memberEmail: 'user@test.com',
          activityType: 'event_registered',
          scoreImpact: 5
        })
      );
    });
  });
});
