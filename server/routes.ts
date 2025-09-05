import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { dbMonitoringMiddleware, getPoolStatsEndpoint } from "./middleware/db-monitoring";
import { checkDatabaseHealth } from "./utils/db-health";
import { notificationService } from "./notification-service";
import { hashPassword } from "./auth";
import { 
  insertIdeaSchema,
  insertVoteSchema,
  insertEventSchema,
  insertInscriptionSchema,
  insertUnsubscriptionSchema,
  insertDevelopmentRequestSchema,
  updateDevelopmentRequestSchema,
  updateIdeaStatusSchema,
  updateIdeaSchema,
  updateEventStatusSchema,
  insertAdminSchema,
  updateAdminSchema,
  updateAdminInfoSchema,
  updateAdminPasswordSchema,
  hasPermission,
  ADMIN_ROLES
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

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
    if (!user || !hasPermission(user.role, permission)) {
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
      if (error instanceof ZodError) {
        return res.status(400).json({ success: false, error: fromZodError(error).toString() });
      }
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
        const dateString = typeof result.data.date === 'string' 
          ? result.data.date 
          : result.data.date.toISOString();
        
        await notificationService.notifyNewEvent({
          title: result.data.title,
          date: dateString,
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

  // Admin unsubscriptions routes
  app.get("/api/admin/events/:id/unsubscriptions", requireAuth, async (req, res, next) => {
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

  app.delete("/api/admin/unsubscriptions/:id", requireAuth, async (req, res, next) => {
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

  app.put("/api/admin/unsubscriptions/:id", requireAuth, async (req, res, next) => {
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

  // Unsubscriptions routes
  app.post("/api/unsubscriptions", async (req, res, next) => {
    try {
      const validatedData = insertUnsubscriptionSchema.parse(req.body);
      
      const result = await storage.createUnsubscription(validatedData);
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

  // Admin routes for managing inscriptions
  app.get("/api/admin/inscriptions/:eventId", requireAuth, async (req, res, next) => {
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

  app.post("/api/admin/inscriptions", requireAuth, async (req, res, next) => {
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

  app.delete("/api/admin/inscriptions/:inscriptionId", requireAuth, async (req, res, next) => {
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
  app.post("/api/admin/inscriptions/bulk", requireAuth, async (req, res, next) => {
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
  app.get("/api/admin/votes/:ideaId", requireAuth, async (req, res, next) => {
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

  app.post("/api/admin/votes", requireAuth, async (req, res, next) => {
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

  app.delete("/api/admin/votes/:voteId", requireAuth, async (req, res, next) => {
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

  app.patch("/api/admin/ideas/:id/featured", requireAuth, async (req, res, next) => {
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
  app.post("/api/admin/ideas/:id/transform-to-event", requireAuth, async (req, res, next) => {
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
  app.put("/api/admin/ideas/:id", requireAuth, async (req, res, next) => {
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

  // Créer un nouvel administrateur (super admin seulement)
  app.post("/api/admin/administrators", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const validatedData = insertAdminSchema.parse({
        ...req.body,
        addedBy: req.user!.email
      });

      // Hacher le mot de passe
      const hashedPassword = await hashPassword(validatedData.password);
      
      const result = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      // Masquer le mot de passe de la réponse
      const sanitizedAdmin = {
        ...result.data,
        password: undefined
      };

      res.status(201).json({ success: true, data: sanitizedAdmin });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
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
      
      const result = await storage.createDevelopmentRequest(validatedData);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      // TODO: Créer l'issue GitHub ici
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

  app.delete("/api/admin/development-requests/:id", requirePermission('admin.manage'), async (req, res, next) => {
    try {
      const result = await storage.deleteDevelopmentRequest(req.params.id);
      
      if (!result.success) {
        return res.status(400).json({ message: result.error.message });
      }

      res.json({ success: true, message: "Demande supprimée avec succès" });
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
