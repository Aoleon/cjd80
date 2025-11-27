import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { StorageService } from '../common/storage/storage.service';
import { insertIdeaSchema, insertVoteSchema, updateIdeaStatusSchema, type Idea, type Vote } from '../../../shared/schema';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';
import { logger } from '../../lib/logger';
import { notificationService } from '../../notification-service';
import { emailNotificationService } from '../../email-notification-service';

@Injectable()
export class IdeasService {
  constructor(private readonly storageService: StorageService) {}

  async getIdeas(page: number = 1, limit: number = 20) {
    return await this.storageService.instance.getIdeas({ page, limit });
  }

  async createIdea(data: unknown) {
    try {
      const validatedData = insertIdeaSchema.parse(data);
      const result = await this.storageService.instance.createIdea(validatedData);
      
      if (!result.success) {
        throw new BadRequestException(result.error.message);
      }

      // Track member activity
      await this.trackMemberActivity(
        result.data.proposedByEmail,
        result.data.proposedBy,
        'idea_proposed',
        'idea',
        result.data.id,
        result.data.title,
        validatedData.company,
        validatedData.phone
      );

      // Envoyer notifications pour nouvelle idée
      try {
        await notificationService.notifyNewIdea({
          title: result.data.title,
          proposedBy: result.data.proposedBy
        });
        
        await emailNotificationService.notifyNewIdea(result.data);
      } catch (notifError) {
        logger.warn('Idea notification failed', { ideaId: result.data.id, error: notifError });
      }

      return result.data;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async deleteIdea(id: string) {
    const result = await this.storageService.instance.deleteIdea(id);
    if (!result.success) {
      if (result.error.name === 'NotFoundError') {
        throw new NotFoundException(result.error.message);
      }
      throw new BadRequestException(result.error.message);
    }
  }

  async updateIdeaStatus(id: string, status: unknown) {
    try {
      const validatedStatus = updateIdeaStatusSchema.parse({ status });
      const result = await this.storageService.instance.updateIdeaStatus(id, validatedStatus.status);
      
      if (!result.success) {
        if (result.error.name === 'NotFoundError') {
          throw new NotFoundException(result.error.message);
        }
        throw new BadRequestException(result.error.message);
      }

      // Envoyer notification pour changement de statut
      try {
        await notificationService.notifyIdeaStatusChange({
          title: `Idée ${id}`,
          status: validatedStatus.status,
          proposedBy: 'Utilisateur'
        });
      } catch (notifError) {
        logger.warn('Idea status change notification failed', { ideaId: id, error: notifError });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  async getVotesByIdea(ideaId: string): Promise<Vote[]> {
    const result = await this.storageService.instance.getVotesByIdea(ideaId);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return result.data;
  }

  async createVote(data: unknown) {
    try {
      const validatedData = insertVoteSchema.parse(data);
      
      // Check if user has already voted for this idea
      const hasVoted = await this.storageService.instance.hasUserVoted(
        validatedData.ideaId,
        validatedData.voterEmail
      );
      if (hasVoted) {
        throw new BadRequestException('Vous avez déjà voté pour cette idée');
      }

      const result = await this.storageService.instance.createVote(validatedData);
      
      if (!result.success) {
        throw new BadRequestException(result.error.message);
      }
      
      // Get idea title for activity
      const ideaResult = await this.storageService.instance.getIdea(validatedData.ideaId);
      const ideaTitle = ideaResult.success ? ideaResult.data?.title || 'Idée' : 'Idée';
      
      // Track member activity
      await this.trackMemberActivity(
        validatedData.voterEmail,
        validatedData.voterName,
        'vote_cast',
        'vote',
        result.data.id,
        ideaTitle
      );
      
      return result.data;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException(fromZodError(error).toString());
      }
      throw error;
    }
  }

  private async trackMemberActivity(
    email: string,
    name: string,
    activityType: 'idea_proposed' | 'vote_cast' | 'event_registered' | 'event_unregistered' | 'patron_suggested',
    entityType: 'idea' | 'vote' | 'event' | 'patron',
    entityId: string,
    entityTitle: string,
    company?: string,
    phone?: string
  ) {
    try {
      // 1. Créer ou mettre à jour le membre
      await this.storageService.instance.createOrUpdateMember({
        email,
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        company,
        phone,
      });

      // 2. Calculer l'impact sur le score selon le type d'activité
      const scoreImpact = {
        idea_proposed: 10,
        vote_cast: 2,
        event_registered: 5,
        event_unregistered: -3,
        patron_suggested: 8,
      }[activityType];

      // 3. Enregistrer l'activité
      await this.storageService.instance.trackMemberActivity({
        memberEmail: email,
        activityType,
        entityType,
        entityId,
        entityTitle,
        scoreImpact,
      });

      logger.info('Member activity tracked', { email, activityType, entityType, entityId });
    } catch (error) {
      logger.error('Member activity tracking failed', { email, activityType, error });
      // Ne pas faire échouer la requête principale si le tracking échoue
    }
  }
}

