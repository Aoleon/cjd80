import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { dbMonitoringMiddleware, getPoolStatsEndpoint } from "./middleware/db-monitoring";
import { checkDatabaseHealth } from "./utils/db-health";
import { 
  insertIdeaSchema,
  insertVoteSchema,
  insertEventSchema,
  insertInscriptionSchema 
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
      await storage.updateIdeaStatus(req.params.id, status);
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
        return res.status(400).json({ message: "Vous avez déjà voté pour cette idée" });
      }

      const vote = await storage.createVote(validatedData);
      res.status(201).json(vote);
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
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
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

  app.patch("/api/admin/ideas/:id/approve", requireAuth, async (req, res, next) => {
    try {
      const { approved } = req.body;
      const result = await storage.approveIdea(req.params.id, approved);
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

  const httpServer = createServer(app);
  return httpServer;
}
