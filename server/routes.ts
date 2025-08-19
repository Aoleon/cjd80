import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertIdeaSchema,
  insertVoteSchema,
  insertEventSchema,
  insertEventRegistrationSchema 
} from "@shared/schema";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
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
      const idea = await storage.createIdea(validatedData);
      res.status(201).json(idea);
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

  // Event registrations routes
  app.get("/api/events/:id/registrations", requireAuth, async (req, res, next) => {
    try {
      const registrations = await storage.getEventRegistrations(req.params.id);
      res.json(registrations);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/event-registrations", async (req, res, next) => {
    try {
      const validatedData = insertEventRegistrationSchema.parse(req.body);
      
      // Check if user has already registered for this event
      const hasRegistered = await storage.hasUserRegistered(validatedData.eventId, validatedData.participantEmail);
      if (hasRegistered) {
        return res.status(400).json({ message: "Vous êtes déjà inscrit à cet événement" });
      }

      const registration = await storage.createEventRegistration(validatedData);
      res.status(201).json(registration);
    } catch (error) {
      next(error);
    }
  });

  // Admin stats route
  app.get("/api/admin/stats", requireAuth, async (req, res, next) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
