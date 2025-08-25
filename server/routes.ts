import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { dbMonitoringMiddleware, getPoolStatsEndpoint } from "./middleware/db-monitoring";
import { checkDatabaseHealth } from "./utils/db-health";
import { notificationService } from "./notification-service";
import { 
  insertIdeaSchema,
  insertVoteSchema,
  insertEventSchema,
  insertInscriptionSchema,
  updateIdeaStatusSchema,
  updateEventStatusSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
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
      const ideas = await storage.getIdeas();
      res.json(ideas);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/ideas", async (req, res, next) => {
    try {
      const validatedData = insertIdeaSchema.parse(req.body);
      const result = await storage.createIdea(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      
      // Envoyer notification pour nouvelle idée
      try {
        await notificationService.notifyNewIdea({
          title: result.data.title,
          proposedBy: result.data.proposedBy
        });
      } catch (notifError) {
        console.error('[Notifications] Erreur envoi notification nouvelle idée:', notifError);
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/ideas/:id", requireAuth, async (req, res, next) => {
    try {
      await storage.deleteIdea(req.params.id);
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
        console.error('[Notifications] Erreur envoi notification changement statut:', notifError);
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

  app.post("/api/votes", async (req, res, next) => {
    try {
      const validatedData = insertVoteSchema.parse(req.body);
      
      // Check if user has already voted for this idea
      const hasVoted = await storage.hasUserVoted(validatedData.ideaId, validatedData.voterEmail);
      if (hasVoted) {
        return res.status(400).json({ success: false, error: "Vous avez déjà voté pour cette idée" });
      }

      const vote = await storage.createVote(validatedData);
      res.status(201).json({ success: true, data: vote });
    } catch (error) {
      next(error);
    }
  });

  // Events routes
  app.get("/api/events", async (req, res, next) => {
    try {
      const events = await storage.getEvents();
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
      
      // Envoyer notification pour nouvel événement
      try {
        await notificationService.notifyNewEvent({
          title: result.data.title,
          date: result.data.date.toISOString(),
          location: result.data.location || 'Lieu à définir'
        });
      } catch (notifError) {
        console.error('[Notifications] Erreur envoi notification nouvel événement:', notifError);
      }
      
      res.status(201).json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/events/:id", requireAuth, async (req, res, next) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.updateEvent(req.params.id, validatedData);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/events/:id", requireAuth, async (req, res, next) => {
    try {
      await storage.deleteEvent(req.params.id);
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

  app.post("/api/inscriptions", async (req, res, next) => {
    try {
      const validatedData = insertInscriptionSchema.parse(req.body);
      
      const result = await storage.createInscription(validatedData);
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

  // Admin routes
  app.get("/api/admin/stats", requireAuth, async (req, res, next) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/ideas", requireAuth, async (req, res, next) => {
    try {
      const result = await storage.getAllIdeas();
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/events", requireAuth, async (req, res, next) => {
    try {
      const result = await storage.getAllEvents();
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }
      res.json(result.data);
    } catch (error) {
      next(error);
    }
  });

  // Get inscriptions for a specific event (admin only)
  app.get("/api/admin/events/:eventId/inscriptions", requireAuth, async (req, res, next) => {
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

  // Get votes for a specific idea (admin only)
  app.get("/api/admin/ideas/:ideaId/votes", requireAuth, async (req, res, next) => {
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

  app.patch("/api/admin/ideas/:id/status", requireAuth, async (req, res, next) => {
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

  app.patch("/api/admin/events/:id/status", requireAuth, async (req, res, next) => {
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
  app.get("/api/admin/pool-stats", requireAuth, getPoolStatsEndpoint);

  // Health check de la base de données (admin seulement)
  app.get("/api/admin/db-health", requireAuth, async (req, res, next) => {
    try {
      const health = await checkDatabaseHealth();
      res.json(health);
    } catch (error) {
      next(error);
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
      console.error('[Notifications] Erreur abonnement:', error);
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
      console.error('[Notifications] Erreur désabonnement:', error);
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
      console.error('[Notifications] Erreur test notification:', error);
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

  const httpServer = createServer(app);
  return httpServer;
}
