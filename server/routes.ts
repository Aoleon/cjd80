import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, type IStorage } from "./storage";
import { setupAuth } from "./auth";
import { dbMonitoringMiddleware, getPoolStatsEndpoint } from "./middleware/db-monitoring";
import { strictCreateRateLimiter, voteRateLimiter } from "./middleware/rate-limit";
import { checkDatabaseHealth } from "./utils/db-health";
import { notificationService } from "./notification-service";
import { emailNotificationService } from "./email-notification-service";
import { hashPassword } from "./auth";
import { 
  insertIdeaSchema,
  insertVoteSchema,
  insertEventSchema,
  createEventWithInscriptionsSchema,
  insertInscriptionSchema,
  insertUnsubscriptionSchema,
  insertDevelopmentRequestSchema,
  updateDevelopmentRequestSchema,
  updateDevelopmentRequestStatusSchema,
  updateIdeaStatusSchema,
  updateIdeaSchema,
  updateEventStatusSchema,
  insertAdminSchema,
  updateAdminSchema,
  updateAdminInfoSchema,
  updateAdminPasswordSchema,
  insertPatronSchema,
  updatePatronSchema,
  insertPatronDonationSchema,
  insertPatronUpdateSchema,
  insertIdeaPatronProposalSchema,
  updateIdeaPatronProposalSchema,
  proposeMemberSchema,
  insertMemberSubscriptionSchema,
  hasPermission,
  ADMIN_ROLES,
  DuplicateError
} from "@shared/schema";
import { ZodError, z } from "zod";
import { fromZodError } from "zod-validation-error";
import { logger } from "./lib/logger";

const updateMemberSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  role: z.string().optional(),
  notes: z.string().optional(),
});

const updatePatronUpdateSchema = z.object({
  subject: z.string().optional(),
  type: z.enum(["meeting", "email", "call", "lunch", "event"]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD").optional(),
  startTime: z.string().optional(),
  duration: z.number().int().min(0).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
});

async function trackMemberActivity(
  storage: IStorage,
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
    await storage.createOrUpdateMember({
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
    await storage.trackMemberActivity({
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

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

function requirePermission(permission: string) {
  return (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const user = req.user;
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }
    
    // Vérifier le statut du compte
    if (user.status === "pending") {
      return res.status(403).json({ 
        message: "Votre compte est en attente de validation par un administrateur",
        status: "pending"
      });
    }
    
    if (user.status === "inactive") {
      return res.status(403).json({ 
        message: "Votre compte a été désactivé",
        status: "inactive"
      });
    }
    
    // Vérifier les permissions
    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware de monitoring de la base de données
  app.use('/api', dbMonitoringMiddleware);
  
  // Health check endpoint (AVANT l'authentification pour être toujours accessible)
  app.get("/api/health", async (req, res) => {
    try {
      const health = await checkDatabaseHealth();
      const statusCode = health.status === 'healthy' ? 200 : 
                        health.status === 'degraded' ? 200 : 503;
      res.status(statusCode).json(health);
    } catch (error) {
      res.status(503).json({ 
        status: 'unhealthy', 
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Setup authentication
  setupAuth(app);

  // Ideas routes
  app.get("/api/ideas", async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const ideas = await storage.getIdeas({ page, limit });
      res.json(ideas);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ideas", strictCreateRateLimiter, async (req, res, next) => {
    try {
      const validatedData = insertIdeaSchema.parse(req.body);
      const result = await storage.createIdea(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      // Track member activity
      await trackMemberActivity(
        storage,
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
        // Notification push web
        await notificationService.notifyNewIdea({
          title: result.data.title,
          proposedBy: result.data.proposedBy
        });
        
        // Notification email aux administrateurs
        await emailNotificationService.notifyNewIdea(result.data);
      } catch (notifError) {
        logger.warn('Idea notification failed', { ideaId: result.data.id, error: notifError });
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/ideas/:id", requireAuth, async (req, res, next) => {
    try {
      const result = await storage.deleteIdea(req.params.id);
      if (!result.success) {
        const statusCode = result.error.name === 'NotFoundError' ? 404 : 400;
        return res.status(statusCode).json({ message: result.error.message });
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/ideas/:id/status", requireAuth, async (req, res, next) => {
    try {
      const { status } = req.body;
      const result = await storage.updateIdeaStatus(req.params.id, status);
      
      // Envoyer notification pour changement de statut (simplifié pour l'instant)
      try {
        await notificationService.notifyIdeaStatusChange({
          title: `Idée ${req.params.id}`,
          status: status,
          proposedBy: 'Utilisateur'
        });
      } catch (notifError) {
        logger.warn('Idea status change notification failed', { ideaId: req.params.id, error: notifError });
      }
      
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  // Votes routes
  app.get("/api/ideas/:id/votes", requireAuth, async (req, res, next) => {
    try {
      const votes = await storage.getVotesByIdea(req.params.id);
      res.json(votes);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/votes", voteRateLimiter, async (req, res, next) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      
      // Check if user has already voted for this idea
      const hasVoted = await storage.hasUserVoted(validatedData.ideaId, validatedData.voterEmail);
      if (hasVoted) {
        return res.status(400).json({ success: false, error: "Vous avez déjà voté pour cette idée" });
      }

      const result = await storage.createVote(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ success: false, error: result.error.message });
      }
      
      // Get idea title for activity
      const ideaResult = await storage.getIdea(validatedData.ideaId);
      const ideaTitle = ideaResult.success ? ideaResult.data?.title || 'Idée' : 'Idée';
      
      // Track member activity
      await trackMemberActivity(
        storage,
        validatedData.voterEmail,
        validatedData.voterName,
        'vote_cast',
        'vote',
        result.data.id,
        ideaTitle
      );
      
      res.status(201).json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Events routes
  app.get("/api/events", async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const events = await storage.getEvents({ page, limit });
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/events", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const result = await storage.createEvent(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      // Envoyer notifications pour nouvel événement
      try {
        const dateString = typeof result.data.date === 'string' 
          ? result.data.date 
          : result.data.date.toISOString();
        
        // Notification push web
        await notificationService.notifyNewEvent({
          title: result.data.title,
          date: dateString,
          location: result.data.location || 'Lieu à définir'
        });
        
        // Notification email aux administrateurs
        const organizerName = req.user?.firstName && req.user?.lastName 
          ? `${req.user.firstName} ${req.user.lastName}` 
          : req.user?.email || 'Organisateur inconnu';
        await emailNotificationService.notifyNewEvent(result.data, organizerName);
      } catch (notifError) {
        logger.warn('Event notification failed', { eventId: result.data.id, error: notifError });
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Create event with initial inscriptions (atomic transaction)
  app.post("/api/events/with-inscriptions", requireAuth, async (req, res, next) => {
    try {
      const validatedData = createEventWithInscriptionsSchema.parse(req.body);
      const result = await storage.createEventWithInscriptions(
        validatedData.event, 
        validatedData.initialInscriptions
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      // Envoyer notifications pour nouvel événement
      try {
        const dateString = typeof result.data.event.date === 'string' 
          ? result.data.event.date 
          : result.data.event.date.toISOString();
        
        // Notification push web
        await notificationService.notifyNewEvent({
          title: result.data.event.title,
          date: dateString,
          location: result.data.event.location || 'Lieu à définir'
        });
        
        // Notification email aux administrateurs
        const organizerName = req.user?.firstName && req.user?.lastName 
          ? `${req.user.firstName} ${req.user.lastName}` 
          : req.user?.email || 'Organisateur inconnu';
        await emailNotificationService.notifyNewEvent(result.data.event, organizerName);
      } catch (notifError) {
        logger.warn('Event notification failed', { eventId: result.data.event.id, error: notifError });
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  app.put("/api/events/:id", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const result = await storage.updateEvent(req.params.id, validatedData);
      if (!result.success) {
        return res.status(404).json({ message: result.error.message });
      }
      res.json({ success: true, data: result.data });
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res, next) => {
    try {
      const result = await storage.deleteEvent(req.params.id);
      if (!result.success) {
        const statusCode = result.error.name === 'NotFoundError' ? 404 : 400;
        return res.status(statusCode).json({ message: result.error.message });
      }
      res.sendStatus(204);
    } catch (error) {
      next(error);
    }
  });

  // Inscriptions routes
  app.get("/api/events/:id/inscriptions", requireAuth, async (req, res, next) => {
    try {
      const inscriptions = await storage.getEventInscriptions(req.params.id);
      res.json(inscriptions);
    } catch (error) {
      next(error);
    }
  });

  // Admin unsubscriptions routes
  app.get("/api/admin/events/:id/unsubscriptions", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const unsubscriptions = await storage.getEventUnsubscriptions(req.params.id);
      if (!unsubscriptions.success) {
        return res.status(400).json({ message: unsubscriptions.error.message });
      }
      res.json(unsubscriptions.data);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/unsubscriptions/:id", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const result = await storage.deleteUnsubscription(req.params.id);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.status(200).json({ message: "Absence supprimée avec succès" });
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/unsubscriptions/:id", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const validatedData = insertUnsubscriptionSchema.omit({ eventId: true }).parse(req.body);
      const result = await storage.updateUnsubscription(req.params.id, validatedData);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  app.post("/api/inscriptions", strictCreateRateLimiter, async (req, res, next) => {
    try {
      const validatedData = insertInscriptionSchema.parse(req.body);
      
      const result = await storage.createInscription(validatedData);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      // Get event title for activity
      const eventResult = await storage.getEvent(validatedData.eventId);
      const eventTitle = eventResult.success ? eventResult.data?.title || 'Événement' : 'Événement';
      
      // Track member activity
      await trackMemberActivity(
        storage,
        validatedData.email,
        validatedData.name,
        'event_registered',
        'event',
        result.data.id,
        eventTitle,
        validatedData.company,
        validatedData.phone
      );
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Unsubscriptions routes
  app.post("/api/unsubscriptions", async (req, res, next) => {
    try {
      const validatedData = insertUnsubscriptionSchema.parse(req.body);
      
      const result = await storage.createUnsubscription(validatedData);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      // Get event title for activity
      const eventResult = await storage.getEvent(validatedData.eventId);
      const eventTitle = eventResult.success ? eventResult.data?.title || 'Événement' : 'Événement';
      
      // Track member activity
      await trackMemberActivity(
        storage,
        validatedData.email,
        validatedData.name,
        'event_unregistered',
        'event',
        result.data.id,
        eventTitle
      );
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Admin routes
  app.get("/api/admin/ideas", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const result = await storage.getAllIdeas();
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data.data);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/events", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const result = await storage.getAllEvents();
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data.data);
    } catch (error) {
      next(error);
    }
  });

  // Get inscriptions for a specific event (admin only)
  app.get("/api/admin/events/:eventId/inscriptions", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const { eventId } = req.params;
      const inscriptionsResult = await storage.getEventInscriptions(eventId);
      if (!inscriptionsResult.success) {
        return res.status(500).json({ message: inscriptionsResult.error.message });
      }
      res.json(inscriptionsResult.data);
    } catch (error) {
      next(error);
    }
  });

  // Admin routes for managing inscriptions
  app.get("/api/admin/inscriptions/:eventId", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const inscriptionsResult = await storage.getEventInscriptions(req.params.eventId);
      if (!inscriptionsResult.success) {
        return res.status(500).json({ message: inscriptionsResult.error.message });
      }
      res.json(inscriptionsResult.data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/inscriptions", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const inscriptionData = req.body;
      const result = await storage.createInscription(inscriptionData);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/inscriptions/:inscriptionId", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const result = await storage.deleteInscription(req.params.inscriptionId);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Bulk import inscriptions
  app.post("/api/admin/inscriptions/bulk", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const { eventId, inscriptions } = req.body;
      
      if (!eventId || !Array.isArray(inscriptions)) {
        return res.status(400).json({ message: "eventId et inscriptions (array) requis" });
      }

      const results = [];
      const errors = [];

      for (const inscription of inscriptions) {
        if (!inscription.name || !inscription.email) {
          errors.push(`Inscription invalide: nom et email requis pour ${inscription.name || inscription.email || 'inscription inconnue'}`);
          continue;
        }

        const result = await storage.createInscription({
          eventId,
          name: inscription.name.trim(),
          email: inscription.email.trim(),
          comments: inscription.comments?.trim() || undefined,
        });

        if (result.success) {
          results.push(result.data);
        } else {
          errors.push(`Erreur pour ${inscription.name}: ${result.error.message}`);
        }
      }

      res.json({
        success: results.length > 0,
        created: results.length,
        errors: errors.length,
        errorMessages: errors,
        data: results
      });
    } catch (error) {
      next(error);
    }
  });

  // Admin routes for managing votes
  app.get("/api/admin/votes/:ideaId", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const votesResult = await storage.getIdeaVotes(req.params.ideaId);
      if (!votesResult.success) {
        return res.status(500).json({ message: votesResult.error.message });
      }
      res.json(votesResult.data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/votes", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const voteData = req.body;
      const result = await storage.createVote(voteData);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/votes/:voteId", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const result = await storage.deleteVote(req.params.voteId);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  });

  // Get votes for a specific idea (admin only)
  app.get("/api/admin/ideas/:ideaId/votes", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const { ideaId } = req.params;
      const votesResult = await storage.getIdeaVotes(ideaId);
      if (!votesResult.success) {
        return res.status(500).json({ message: votesResult.error.message });
      }
      res.json(votesResult.data);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/ideas/:id/status", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const validatedData = updateIdeaStatusSchema.parse(req.body);
      const result = await storage.updateIdeaStatus(req.params.id, validatedData.status);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/admin/ideas/:id/featured", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const result = await storage.toggleIdeaFeatured(req.params.id);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json({ featured: result.data });
    } catch (error) {
      next(error);
    }
  });

  // Transform idea to event (admin only)
  app.post("/api/admin/ideas/:id/transform-to-event", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const result = await storage.transformIdeaToEvent(req.params.id);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json({ success: true, eventId: result.data.id });
    } catch (error) {
      next(error);
    }
  });

  // Update idea content (admin only)
  app.put("/api/admin/ideas/:id", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const validatedData = updateIdeaSchema.parse(req.body);
      const result = await storage.updateIdea(req.params.id, validatedData);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      next(error);
    }
  });

  app.patch("/api/admin/events/:id/status", requirePermission('admin.edit'), async (req, res, next) => {
    try {
      const validatedData = updateEventStatusSchema.parse(req.body);
      const result = await storage.updateEventStatus(req.params.id, validatedData.status);
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  });

  // Pool de connexions stats (admin seulement)
  app.get("/api/admin/pool-stats", requirePermission('admin.view'), getPoolStatsEndpoint);

  // Health check de la base de données (admin seulement)
  app.get("/api/admin/db-health", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const health = await checkDatabaseHealth();
      res.json(health);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/stats", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const stats = await storage.getAdminStats();
      if (!stats.success) {
        return res.status(500).json({ 
          success: false, 
          error: stats.error.message 
        });
      }
      res.json({ success: true, data: stats.data });
    } catch (error) {
      logger.error('Admin stats fetch failed', { error });
      res.status(500).json({ 
        success: false, 
        error: "Erreur lors de la récupération des statistiques" 
      });
    }
  });

  // Routes pour les notifications push
  app.get("/api/notifications/vapid-key", (req, res) => {
    try {
      const publicKey = notificationService.getVapidPublicKey();
      res.json({ publicKey });
    } catch (error) {
      res.status(500).json({ message: "Erreur récupération clé VAPID" });
    }
  });

  app.post("/api/notifications/subscribe", async (req, res) => {
    try {
      const { endpoint, keys } = req.body;
      
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ message: "Données d'abonnement invalides" });
      }

      const success = await notificationService.addSubscription({
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userId: req.user?.email || undefined // Optionnel
      });

      if (success) {
        res.json({ success: true, message: "Abonnement créé" });
      } else {
        res.status(500).json({ message: "Erreur création abonnement" });
      }
    } catch (error) {
      logger.error('Notification subscription failed', { subscription: req.body, error });
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/notifications/unsubscribe", async (req, res) => {
    try {
      const { endpoint } = req.body;
      
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint requis" });
      }

      const success = await notificationService.removeSubscription(endpoint);
      
      if (success) {
        res.json({ success: true, message: "Désabonnement effectué" });
      } else {
        res.status(404).json({ message: "Abonnement non trouvé" });
      }
    } catch (error) {
      logger.error('Notification unsubscribe failed', { endpoint: req.body.endpoint, error });
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Test de notification (admin seulement)
  app.post("/api/notifications/test", requireAuth, async (req, res) => {
    try {
      const { title, message } = req.body;
      
      const result = await notificationService.sendToAll({
        title: title || "Test de notification",
        body: message || "Ceci est un test des notifications push",
        tag: "admin-test"
      });

      res.json({ 
        success: true, 
        message: "Notification de test envoyée",
        stats: result
      });
    } catch (error) {
      logger.error('Test notification failed', { error });
      res.status(500).json({ message: "Erreur envoi notification" });
    }
  });

  // Statistiques des notifications (admin seulement)
  app.get("/api/notifications/stats", requireAuth, async (req, res) => {
    try {
      const stats = notificationService.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erreur récupération statistiques" });
    }
  });

  // === ROUTES DE GESTION DES ADMINISTRATEURS ===

  // Récupérer tous les administrateurs (super admin seulement)
  app.get("/api/admin/administrators", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getAllAdmins();
      
      if (!result.success) {
        return res.status(500).json({ message: result.error.message });
      }

      // Masquer les mots de passe des réponses
      const sanitizedAdmins = result.data.map(admin => ({
        ...admin,
        password: undefined
      }));

      res.json({ success: true, data: sanitizedAdmins });
    } catch (error) {
      next(error);
    }
  });


  // Mettre à jour le rôle d'un administrateur (super admin seulement)
  app.patch("/api/admin/administrators/:email/role", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const { role } = updateAdminSchema.parse(req.body);
      
      if (!role) {
        return res.status(400).json({ message: "Le rôle est requis" });
      }

      // Empêcher la modification de son propre rôle
      if (req.params.email === req.user!.email) {
        return res.status(400).json({ message: "Vous ne pouvez pas modifier votre propre rôle" });
      }

      const result = await storage.updateAdminRole(req.params.email, role);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const sanitizedAdmin = {
        ...result.data,
        password: undefined
      };

      res.json({ success: true, data: sanitizedAdmin });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Activer/désactiver un administrateur (super admin seulement)
  app.patch("/api/admin/administrators/:email/status", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const { isActive } = updateAdminSchema.parse(req.body);
      
      if (typeof isActive !== 'boolean') {
        return res.status(400).json({ message: "Le statut actif est requis" });
      }

      // Empêcher la désactivation de son propre compte
      if (req.params.email === req.user!.email) {
        return res.status(400).json({ message: "Vous ne pouvez pas désactiver votre propre compte" });
      }

      const result = await storage.updateAdminStatus(req.params.email, isActive);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const sanitizedAdmin = {
        ...result.data,
        password: undefined
      };

      res.json({ success: true, data: sanitizedAdmin });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Mettre à jour les informations d'un administrateur (super admin seulement)
  app.patch("/api/admin/administrators/:email/info", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const { firstName, lastName } = updateAdminInfoSchema.parse(req.body);
      
      // Empêcher la modification de ses propres informations
      if (req.params.email === req.user!.email) {
        return res.status(400).json({ message: "Vous ne pouvez pas modifier vos propres informations" });
      }
      
      const result = await storage.updateAdminInfo(req.params.email, { firstName, lastName });

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      res.json({ success: true, data: result.data, message: "Informations mises à jour avec succès" });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Changer le mot de passe d'un administrateur (super admin seulement)
  app.patch("/api/admin/administrators/:email/password", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const { password } = updateAdminPasswordSchema.parse(req.body);
      
      // Hacher le nouveau mot de passe
      const hashedPassword = await hashPassword(password);
      
      const result = await storage.updateAdminPassword(req.params.email, hashedPassword);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      res.json({ success: true, message: "Mot de passe mis à jour avec succès" });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Supprimer un administrateur (super admin seulement)
  app.delete("/api/admin/administrators/:email", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      // Empêcher la suppression de son propre compte
      if (req.params.email === req.user!.email) {
        return res.status(400).json({ message: "Vous ne pouvez pas supprimer votre propre compte" });
      }

      const result = await storage.deleteAdmin(req.params.email);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      res.json({ success: true, message: "Administrateur supprimé avec succès" });
    } catch (error) {
      next(error);
    }
  });

  // Récupérer les comptes en attente de validation
  app.get("/api/admin/pending-admins", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getPendingAdmins();
      
      if (!result.success) {
        return res.status(500).json({ message: result.error.message });
      }

      // Masquer les mots de passe des réponses
      const sanitizedAdmins = result.data.map((admin: any) => ({
        ...admin,
        password: undefined
      }));

      res.json({ success: true, data: sanitizedAdmins });
    } catch (error) {
      next(error);
    }
  });

  // Créer un nouvel administrateur avec statut actif (super admin seulement)
  app.post("/api/admin/administrators", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const { email, password, firstName, lastName, role } = insertAdminSchema.parse(req.body);
      
      if (!email || !password || !firstName || !lastName || !role) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }

      // Hasher le mot de passe
      const hashedPassword = await hashPassword(password);
      
      // Créer l'admin (créé par un admin)
      const result = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        addedBy: req.user!.email
      });

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const sanitizedAdmin = {
        ...result.data,
        password: undefined
      };

      res.json({ success: true, data: sanitizedAdmin, message: "Administrateur créé avec succès" });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      next(error);
    }
  });

  // Approuver un compte en attente
  app.patch("/api/admin/administrators/:email/approve", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const { role } = req.body;
      
      if (!role || !Object.values(ADMIN_ROLES).includes(role)) {
        return res.status(400).json({ message: "Rôle valide requis" });
      }

      const result = await storage.approveAdmin(req.params.email, role);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      const sanitizedAdmin = {
        ...result.data,
        password: undefined
      };

      res.json({ success: true, data: sanitizedAdmin, message: "Compte approuvé avec succès" });
    } catch (error) {
      next(error);
    }
  });

  // Rejeter un compte en attente
  app.delete("/api/admin/administrators/:email/reject", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.deleteAdmin(req.params.email);

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      res.json({ success: true, message: "Compte rejeté et supprimé avec succès" });
    } catch (error) {
      next(error);
    }
  });

  // Development requests routes - Super admin only
  app.get("/api/admin/development-requests", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getDevelopmentRequests();
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/development-requests", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = insertDevelopmentRequestSchema.parse({
        ...req.body,
        requestedBy: req.user!.email,
        requestedByName: `${req.user!.firstName} ${req.user!.lastName}`
      });
      
      // Créer la demande dans la base de données
      const result = await storage.createDevelopmentRequest(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      // Créer l'issue GitHub en arrière-plan
      const { createGitHubIssue } = await import("./utils/github-integration");
      createGitHubIssue(validatedData).then(async (githubIssue) => {
        if (githubIssue) {
          // Mettre à jour la demande avec les informations GitHub
          await storage.updateDevelopmentRequest(result.data.id, {
            githubIssueNumber: githubIssue.number,
            githubIssueUrl: githubIssue.html_url
          });
          logger.info('GitHub issue created and linked', { requestId: result.data.id, issueNumber: githubIssue.number, issueUrl: githubIssue.html_url });
        }
      }).catch((error) => {
        logger.error('GitHub issue creation failed', { requestId: result.data.id, error });
      });

      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  app.put("/api/admin/development-requests/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = updateDevelopmentRequestSchema.parse(req.body);
      const result = await storage.updateDevelopmentRequest(req.params.id, validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Synchroniser une demande avec GitHub
  app.post("/api/admin/development-requests/:id/sync", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      // Récupérer la demande
      const getResult = await storage.getDevelopmentRequests();
      if (!getResult.success) {
        return res.status(400).json({ message: getResult.error.message });
      }

      const request = getResult.data.find(r => r.id === req.params.id);
      if (!request) {
        return res.status(404).json({ message: "Demande non trouvée" });
      }

      if (!request.githubIssueNumber) {
        return res.status(400).json({ message: "Aucune issue GitHub associée à cette demande" });
      }

      // Synchroniser avec GitHub
      const { syncGitHubIssueStatus } = await import("./utils/github-integration");
      const githubStatus = await syncGitHubIssueStatus(request.githubIssueNumber);

      if (!githubStatus) {
        return res.status(400).json({ message: "Impossible de récupérer le statut depuis GitHub" });
      }

      // Mettre à jour le statut local
      const updateResult = await storage.updateDevelopmentRequest(req.params.id, {
        githubStatus: githubStatus.status,
        status: githubStatus.closed ? "closed" : request.status,
        lastSyncedAt: new Date()
      });

      if (!updateResult.success) {
        return res.status(400).json({ message: updateResult.error.message });
      }

      logger.info('GitHub sync successful', { requestId: req.params.id, issueNumber: request.githubIssueNumber });
      res.json({ 
        success: true, 
        message: "Synchronisation avec GitHub réussie",
        data: updateResult.data
      });
    } catch (error) {
      logger.error('GitHub sync failed', { requestId: req.params.id, error });
      next(error);
    }
  });

  // Mettre à jour le statut d'une demande de développement - Réservé au super admin thibault@youcom.io
  app.patch("/api/admin/development-requests/:id/status", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      // Vérifier que l'utilisateur est le super administrateur autorisé
      if (req.user!.email !== "thibault@youcom.io") {
        return res.status(403).json({ message: "Seul le super administrateur thibault@youcom.io peut modifier les statuts des demandes de développement" });
      }

      const validatedData = updateDevelopmentRequestStatusSchema.parse({
        ...req.body,
        lastStatusChangeBy: req.user!.email
      });
      
      const result = await storage.updateDevelopmentRequestStatus(
        req.params.id,
        validatedData.status,
        validatedData.adminComment,
        validatedData.lastStatusChangeBy
      );
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      logger.info('Development request status updated by admin', { requestId: req.params.id, newStatus: validatedData.status, updatedBy: req.user!.email });
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  app.delete("/api/admin/development-requests/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      // Récupérer la demande avant suppression pour fermer l'issue GitHub
      const getResult = await storage.getDevelopmentRequests();
      if (getResult.success) {
        const request = getResult.data.find(r => r.id === req.params.id);
        if (request?.githubIssueNumber) {
          const { closeGitHubIssue } = await import("./utils/github-integration");
          closeGitHubIssue(request.githubIssueNumber, "not_planned").catch((error) => {
            logger.error('GitHub issue close failed', { issueNumber: request.githubIssueNumber, error });
          });
        }
      }

      const result = await storage.deleteDevelopmentRequest(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      res.json({ success: true, message: "Demande supprimée avec succès" });
    } catch (error) {
      next(error);
    }
  });

  // ==================== GESTION DES MÉCÈNES ====================
  
  // Proposer un mécène potentiel (accessible à tous les utilisateurs connectés)
  app.post("/api/patrons/propose", async (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentification requise pour proposer un mécène" });
    }

    try {
      const validatedData = insertPatronSchema.parse(req.body);
      
      const result = await storage.proposePatron({
        ...validatedData,
        createdBy: req.user?.email || validatedData.createdBy || "anonymous",
      });
      
      if (!result.success) {
        if (result.error instanceof DuplicateError) {
          return res.status(409).json({ message: result.error.message });
        }
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });
  
  // Lister tous les mécènes
  app.get("/api/patrons", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await storage.getPatrons({ page, limit });
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Chercher un mécène par email (pour éviter doublons)
  app.get("/api/patrons/search/email", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const email = req.query.email as string;
      
      if (!email) {
        return res.status(400).json({ message: "Email requis" });
      }
      
      const result = await storage.getPatronByEmail(email);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Récupérer un mécène par ID
  app.get("/api/patrons/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getPatronById(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      if (!result.data) {
        return res.status(404).json({ message: "Mécène non trouvé" });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Créer un nouveau mécène
  app.post("/api/patrons", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = insertPatronSchema.parse({
        ...req.body,
        createdBy: req.user!.email
      });
      
      const result = await storage.createPatron(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Mettre à jour un mécène
  app.patch("/api/patrons/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = updatePatronSchema.parse(req.body);
      
      const result = await storage.updatePatron(req.params.id, validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Supprimer un mécène
  app.delete("/api/patrons/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.deletePatron(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // ==================== GESTION DES DONS ====================

  // Créer un nouveau don pour un mécène
  app.post("/api/patrons/:id/donations", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = insertPatronDonationSchema.parse({
        ...req.body,
        patronId: req.params.id,
        recordedBy: req.user!.email
      });
      
      const result = await storage.createPatronDonation(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Récupérer les dons d'un mécène
  app.get("/api/patrons/:id/donations", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getPatronDonations(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Récupérer tous les dons
  app.get("/api/donations", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getAllDonations();
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Mettre à jour un don
  app.patch("/api/donations/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.updatePatronDonation(req.params.id, req.body);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Supprimer un don
  app.delete("/api/donations/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.deletePatronDonation(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // ==================== GESTION DES PROPOSITIONS MÉCÈNE-IDÉE ====================

  // Proposer un mécène pour une idée
  app.post("/api/ideas/:id/patrons", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = insertIdeaPatronProposalSchema.parse({
        ...req.body,
        ideaId: req.params.id,
        proposedByAdminEmail: req.user!.email
      });
      
      const result = await storage.createIdeaPatronProposal(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      // Track member activity for the admin who suggested the patron
      const ideaResult = await storage.getIdea(validatedData.ideaId);
      const ideaTitle = ideaResult.success && ideaResult.data ? ideaResult.data.title : 'Idée';
      
      await trackMemberActivity(
        storage,
        req.user!.email,
        `${req.user!.firstName} ${req.user!.lastName}`,
        'patron_suggested',
        'patron',
        result.data.id,
        `Mécène suggéré pour "${ideaTitle}"`
      );
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Récupérer les mécènes proposés pour une idée
  app.get("/api/ideas/:id/patrons", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getIdeaPatronProposals(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Récupérer les idées où un mécène a été proposé
  app.get("/api/patrons/:id/proposals", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getPatronProposals(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Mettre à jour une proposition (statut, commentaires)
  app.patch("/api/proposals/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = updateIdeaPatronProposalSchema.parse(req.body);
      
      const result = await storage.updateIdeaPatronProposal(req.params.id, validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Supprimer une proposition
  app.delete("/api/proposals/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.deleteIdeaPatronProposal(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // ==================== GESTION DES ACTUALITÉS MÉCÈNES ====================

  // Créer une actualité pour un mécène
  app.post("/api/patrons/:id/updates", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = insertPatronUpdateSchema.parse({
        ...req.body,
        patronId: req.params.id,
        createdBy: req.user!.email
      });
      
      const result = await storage.createPatronUpdate(validatedData);
      
      if (!result.success) {
        if (result.error instanceof DuplicateError) {
          return res.status(409).json({ message: result.error.message });
        }
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Récupérer les actualités d'un mécène
  app.get("/api/patrons/:id/updates", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.getPatronUpdates(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Mettre à jour une actualité
  app.patch("/api/patron-updates/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = updatePatronUpdateSchema.parse(req.body);
      
      const result = await storage.updatePatronUpdate(req.params.id, validatedData);
      
      if (!result.success) {
        if (result.error.name === 'NotFoundError') {
          return res.status(404).json({ message: result.error.message });
        }
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json(result.data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Supprimer une actualité
  app.delete("/api/patron-updates/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.deletePatronUpdate(req.params.id);
      
      if (!result.success) {
        if (result.error.name === 'NotFoundError') {
          return res.status(404).json({ message: result.error.message });
        }
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  // ==================== GESTION DES MEMBRES (CRM) ====================

  // Lister tous les membres avec leur score d'engagement et dernière activité
  app.get("/api/admin/members", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const result = await storage.getMembers({ page, limit });
      
      if (!result.success) {
        return res.status(500).json({ message: result.error.message });
      }
      
      res.json({ success: true, ...result.data });
    } catch (error) {
      next(error);
    }
  });

  // Récupérer les détails d'un membre spécifique
  app.get("/api/admin/members/:email", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const result = await storage.getMemberByEmail(req.params.email);
      
      if (!result.success) {
        return res.status(404).json({ message: result.error.message });
      }
      
      if (!result.data) {
        return res.status(404).json({ message: "Membre non trouvé" });
      }
      
      res.json({ success: true, data: result.data });
    } catch (error) {
      next(error);
    }
  });

  // Récupérer l'historique des activités d'un membre
  app.get("/api/admin/members/:email/activities", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const result = await storage.getMemberActivities(req.params.email);
      
      if (!result.success) {
        return res.status(500).json({ message: result.error.message });
      }
      
      res.json({ success: true, data: result.data });
    } catch (error) {
      next(error);
    }
  });

  // GET /api/admin/members/:email/subscriptions - Récupérer les souscriptions d'un membre
  app.get("/api/admin/members/:email/subscriptions", requirePermission('admin.view'), async (req, res) => {
    try {
      const { email } = req.params;
      const subscriptions = await storage.getSubscriptionsByMember(email);
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      logger.error('Member subscriptions fetch failed', { memberEmail: req.params.email, error });
      res.status(500).json({ 
        success: false, 
        error: "Erreur lors de la récupération des souscriptions" 
      });
    }
  });

  // POST /api/admin/members/:email/subscriptions - Créer une souscription
  app.post("/api/admin/members/:email/subscriptions", requirePermission('admin.view'), async (req, res) => {
    try {
      const { email } = req.params;
      
      // Validation avec Zod
      const validatedData = insertMemberSubscriptionSchema.parse({
        ...req.body,
        memberEmail: email,
      });
      
      const subscription = await storage.createSubscription(validatedData);
      res.status(201).json({ success: true, data: subscription });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          error: "Données invalides", 
          details: error.errors 
        });
        return;
      }
      logger.error('Subscription creation failed', { memberEmail: req.params.email, error });
      res.status(500).json({ 
        success: false, 
        error: "Erreur lors de la création de la souscription" 
      });
    }
  });

  // Mettre à jour les informations d'un membre
  app.patch("/api/admin/members/:email", requirePermission('admin.view'), async (req, res, next) => {
    try {
      const validatedData = updateMemberSchema.parse(req.body);
      
      const result = await storage.updateMember(req.params.email, validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      res.json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  // Proposer un membre potentiel (accessible à tous)
  app.post("/api/members/propose", async (req, res, next) => {
    try {
      const validatedData = proposeMemberSchema.parse(req.body);
      
      const result = await storage.proposeMember({
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        company: validatedData.company,
        phone: validatedData.phone,
        role: validatedData.role,
        notes: validatedData.notes,
        proposedBy: validatedData.proposedBy,
      });
      
      if (!result.success) {
        if (result.error instanceof DuplicateError) {
          return res.status(409).json({ message: result.error.message });
        }
        return res.status(400).json({ message: result.error.message });
      }
      
      res.status(201).json({ success: true, data: result.data });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
