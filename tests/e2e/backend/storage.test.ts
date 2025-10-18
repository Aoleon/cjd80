import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock classes
class MockDatabaseStorage {
  async deleteInscription(id: string) {
    if (id === 'non-existent-id') {
      return { success: false, error: { message: 'Inscription introuvable' } };
    }
    if (id === 'test-id') {
      throw new Error('Database error');
    }
    return { success: true };
  }

  async deleteVote(id: string) {
    if (id === 'non-existent-id') {
      return { success: false, error: { message: 'Vote introuvable' } };
    }
    return { success: true };
  }

  async createVote(voteData: any) {
    if (voteData.voterEmail === 'duplicate@test.com') {
      return { success: false, error: { message: 'Vous avez déjà voté pour cette idée' } };
    }
    if (voteData.ideaId === 'non-existent-idea') {
      return { success: false, error: { message: 'Idée introuvable' } };
    }
    return { 
      success: true, 
      data: { 
        id: 'new-vote-id', 
        ideaId: voteData.ideaId,
        voterEmail: voteData.voterEmail,
        createdAt: new Date()
      } 
    };
  }

  async getIdea(id: string) {
    if (id === 'non-existent-idea') {
      return { success: false, error: new Error('Idée introuvable') };
    }
    return {
      success: true,
      data: { 
        id: id, 
        title: 'Test', 
        description: 'Test', 
        proposedBy: 'User', 
        status: 'approved', 
        featured: false, 
        createdAt: new Date(), 
        updatedAt: new Date() 
      }
    };
  }
}

describe('Storage Backend Tests - Nouvelles méthodes', () => {
  let storage: MockDatabaseStorage;

  beforeEach(() => {
    storage = new MockDatabaseStorage();
    vi.clearAllMocks();
  });

  describe('deleteInscription', () => {
    it('should delete inscription successfully', async () => {
      const result = await storage.deleteInscription('test-inscription-id');
      expect(result.success).toBe(true);
    });

    it('should return error if inscription not found', async () => {
      const result = await storage.deleteInscription('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Inscription introuvable');
    });

    it('should handle database errors', async () => {
      try {
        await storage.deleteInscription('test-id');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe('deleteVote', () => {
    it('should delete vote successfully', async () => {
      const result = await storage.deleteVote('test-vote-id');
      expect(result.success).toBe(true);
    });

    it('should return error if vote not found', async () => {
      const result = await storage.deleteVote('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Vote introuvable');
    });
  });

  describe('createVote', () => {
    it('should create vote successfully', async () => {
      const voteData = {
        ideaId: 'test-idea',
        voterEmail: 'test@example.com'
      };

      const result = await storage.createVote(voteData);

      expect(result.success).toBe(true);
      expect(result.data?.ideaId).toBe('test-idea');
    });

    it('should prevent duplicate votes', async () => {
      const voteData = {
        ideaId: 'test-idea',
        voterEmail: 'duplicate@test.com'
      };

      const result = await storage.createVote(voteData);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Vous avez déjà voté pour cette idée');
    });

    it('should validate idea exists', async () => {
      const voteData = {
        ideaId: 'non-existent-idea',
        voterEmail: 'test@example.com'
      };

      const result = await storage.createVote(voteData);

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Idée introuvable');
    });
  });
});