import { 
  admins, 
  ideas, 
  votes, 
  events, 
  inscriptions,
  type Admin, 
  type InsertAdmin,
  type User,
  type InsertUser,
  type Idea,
  type InsertIdea,
  type Vote,
  type InsertVote,
  type Event,
  type InsertEvent,
  type Inscription,
  type InsertInscription,
  type Result,
  ValidationError,
  DuplicateError,
  DatabaseError,
  NotFoundError
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // Admin users - Ultra-robust with Result pattern
  getUser(email: string): Promise<Result<User | null>>;
  getUserByEmail(email: string): Promise<Result<User | null>>;
  createUser(user: InsertUser): Promise<Result<User>>;
  
  // Ideas - Ultra-robust with business validation
  getIdeas(): Promise<Result<(Idea & { voteCount: number })[]>>;
  getIdea(id: string): Promise<Result<Idea | null>>;
  createIdea(idea: InsertIdea): Promise<Result<Idea>>;
  deleteIdea(id: string): Promise<Result<void>>;
  updateIdeaStatus(id: string, status: string): Promise<Result<void>>;
  isDuplicateIdea(title: string): Promise<boolean>;
  
  // Votes - Ultra-robust with duplicate protection
  getVotesByIdea(ideaId: string): Promise<Result<Vote[]>>;
  createVote(vote: InsertVote): Promise<Result<Vote>>;
  hasUserVoted(ideaId: string, email: string): Promise<boolean>;
  
  // Events - Ultra-robust with validation
  getEvents(): Promise<Result<(Event & { inscriptionCount: number })[]>>;
  getEvent(id: string): Promise<Result<Event | null>>;
  createEvent(event: InsertEvent): Promise<Result<Event>>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Result<Event>>;
  deleteEvent(id: string): Promise<Result<void>>;
  isDuplicateEvent(title: string, date: Date): Promise<boolean>;
  
  // Inscriptions - Ultra-robust with duplicate protection
  getEventInscriptions(eventId: string): Promise<Result<Inscription[]>>;
  createInscription(inscription: InsertInscription): Promise<Result<Inscription>>;
  hasUserRegistered(eventId: string, email: string): Promise<boolean>;
  
  // Admin stats
  getStats(): Promise<Result<{
    totalIdeas: number;
    totalVotes: number;
    upcomingEvents: number;
    totalInscriptions: number;
  }>>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;

  constructor() {
    // Configuration optimisée du store de sessions
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      // Optimisations pour les sessions
      tableName: 'user_sessions',
      pruneSessionInterval: 900, // 15 minutes - nettoyage automatique
      errorLog: (error) => {
        console.error('[Session Store] Erreur:', error.message);
      },
      // Configuration du schéma
      schemaName: 'public',
      // TTL pour les sessions expirées  
      ttl: 30 * 24 * 60 * 60 // 30 jours
    });
  }

  // Ultra-robust User methods with Result pattern
  async getUser(email: string): Promise<Result<User | null>> {
    try {
      const [user] = await db.select().from(admins).where(eq(admins.email, email));
      return { success: true, data: user || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération utilisateur: ${error}`) };
    }
  }

  async getUserByEmail(email: string): Promise<Result<User | null>> {
    return this.getUser(email); // Delegate to avoid duplication
  }

  async createUser(insertUser: InsertUser): Promise<Result<User>> {
    try {
      // Check for duplicate admin
      const existingUser = await this.getUser(insertUser.email);
      if (existingUser.success && existingUser.data) {
        return { success: false, error: new DuplicateError("Utilisateur déjà existant") };
      }

      const [user] = await db
        .insert(admins)
        .values(insertUser)
        .returning();
      
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création utilisateur: ${error}`) };
    }
  }

  // Ultra-robust Ideas methods with Result pattern and business validation
  async getIdeas(): Promise<Result<(Idea & { voteCount: number })[]>> {
    try {
      const result = await db
        .select({
          id: ideas.id,
          title: ideas.title,
          description: ideas.description,
          proposedBy: ideas.proposedBy,
          proposedByEmail: ideas.proposedByEmail,
          status: ideas.status,
          deadline: ideas.deadline,
          createdAt: ideas.createdAt,
          updatedAt: ideas.updatedAt,
          updatedBy: ideas.updatedBy,
          voteCount: count(votes.id),
        })
        .from(ideas)
        .leftJoin(votes, eq(ideas.id, votes.ideaId))
        .groupBy(ideas.id)
        .orderBy(desc(ideas.createdAt));
      
      const formattedResult = result.map(row => ({
        ...row,
        voteCount: Number(row.voteCount),
      }));

      return { success: true, data: formattedResult };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des idées: ${error}`) };
    }
  }

  async getIdea(id: string): Promise<Result<Idea | null>> {
    try {
      const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
      return { success: true, data: idea || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération de l'idée: ${error}`) };
    }
  }

  async isDuplicateIdea(title: string): Promise<boolean> {
    try {
      const [existing] = await db
        .select({ id: ideas.id })
        .from(ideas)
        .where(eq(ideas.title, title))
        .limit(1);
      return !!existing;
    } catch (error) {
      console.error('[Storage] Erreur vérification duplicate idée:', error);
      return false; // Fail safe - allow creation
    }
  }

  async createIdea(idea: InsertIdea): Promise<Result<Idea>> {
    try {
      // Business validation: Check for duplicate
      if (await this.isDuplicateIdea(idea.title)) {
        return { success: false, error: new DuplicateError("Une idée avec ce titre existe déjà") };
      }

      // Transaction for atomic operation
      const result = await db.transaction(async (tx) => {
        const [newIdea] = await tx
          .insert(ideas)
          .values([idea])
          .returning();
        
        // Log audit trail
        console.log(`[Storage] Nouvelle idée créée: ${newIdea.id} par ${idea.proposedBy}`);
        
        return newIdea;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création de l'idée: ${error}`) };
    }
  }

  async deleteIdea(id: string): Promise<Result<void>> {
    try {
      // Check if idea exists
      const ideaResult = await this.getIdea(id);
      if (!ideaResult.success) {
        return { success: false, error: ideaResult.error };
      }
      if (!ideaResult.data) {
        return { success: false, error: new NotFoundError("Idée introuvable") };
      }

      // Transaction for atomic deletion (cascade will handle votes)
      await db.transaction(async (tx) => {
        await tx.delete(ideas).where(eq(ideas.id, id));
        console.log(`[Storage] Idée supprimée: ${id}`);
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de l'idée: ${error}`) };
    }
  }

  async updateIdeaStatus(id: string, status: string): Promise<Result<void>> {
    try {
      // Validate status
      const validStatuses = ["open", "closed", "realized"];
      if (!validStatuses.includes(status)) {
        return { success: false, error: new ValidationError("Statut invalide") };
      }

      // Check if idea exists
      const ideaResult = await this.getIdea(id);
      if (!ideaResult.success) {
        return { success: false, error: ideaResult.error };
      }
      if (!ideaResult.data) {
        return { success: false, error: new NotFoundError("Idée introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx
          .update(ideas)
          .set({ 
            status, 
            updatedAt: sql`NOW()`,
            updatedBy: "admin" // Could be improved with actual user
          })
          .where(eq(ideas.id, id));
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du statut: ${error}`) };
    }
  }

  // Ultra-robust Votes methods with Result pattern
  async getVotesByIdea(ideaId: string): Promise<Result<Vote[]>> {
    try {
      const votesList = await db.select().from(votes).where(eq(votes.ideaId, ideaId)).orderBy(desc(votes.createdAt));
      return { success: true, data: votesList };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des votes: ${error}`) };
    }
  }

  async createVote(vote: InsertVote): Promise<Result<Vote>> {
    try {
      // Business validation: Check for duplicate vote
      if (await this.hasUserVoted(vote.ideaId, vote.voterEmail)) {
        return { success: false, error: new DuplicateError("Vous avez déjà voté pour cette idée") };
      }

      // Check if idea exists
      const ideaResult = await this.getIdea(vote.ideaId);
      if (!ideaResult.success) {
        return { success: false, error: ideaResult.error };
      }
      if (!ideaResult.data) {
        return { success: false, error: new NotFoundError("Idée introuvable") };
      }

      const result = await db.transaction(async (tx) => {
        const [newVote] = await tx
          .insert(votes)
          .values([vote])
          .returning();
        
        console.log(`[Storage] Nouveau vote créé: ${newVote.id} pour idée ${vote.ideaId} par ${vote.voterEmail}`);
        return newVote;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création du vote: ${error}`) };
    }
  }

  async hasUserVoted(ideaId: string, email: string): Promise<boolean> {
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.ideaId, ideaId), eq(votes.voterEmail, email)));
    return !!existingVote;
  }

  // Ultra-robust Events methods with Result pattern and business validation
  async getEvents(): Promise<Result<(Event & { inscriptionCount: number })[]>> {
    try {
      const result = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          date: events.date,
          helloAssoLink: events.helloAssoLink,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          updatedBy: events.updatedBy,
          inscriptionCount: count(inscriptions.id),
        })
        .from(events)
        .leftJoin(inscriptions, eq(events.id, inscriptions.eventId))
        .groupBy(events.id)
        .orderBy(events.date);
      
      const formattedResult = result.map(row => ({
        ...row,
        inscriptionCount: Number(row.inscriptionCount),
      }));

      return { success: true, data: formattedResult };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des événements: ${error}`) };
    }
  }

  async getEvent(id: string): Promise<Result<Event | null>> {
    try {
      const [event] = await db.select().from(events).where(eq(events.id, id));
      return { success: true, data: event || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération de l'événement: ${error}`) };
    }
  }

  async isDuplicateEvent(title: string, date: Date): Promise<boolean> {
    try {
      const [existing] = await db
        .select({ id: events.id })
        .from(events)
        .where(and(
          eq(events.title, title),
          eq(events.date, sql`${date.toISOString()}::timestamp`)
        ))
        .limit(1);
      return !!existing;
    } catch (error) {
      console.error('[Storage] Erreur vérification duplicate événement:', error);
      return false; // Fail safe - allow creation
    }
  }

  async createEvent(event: InsertEvent): Promise<Result<Event>> {
    try {
      // Business validation: Check for duplicate event (same title and date)
      if (await this.isDuplicateEvent(event.title, new Date(event.date))) {
        return { success: false, error: new DuplicateError("Un événement avec ce titre et cette date existe déjà") };
      }

      // Validate date is in the future
      if (new Date(event.date) <= new Date()) {
        return { success: false, error: new ValidationError("La date de l'événement doit être dans le futur") };
      }

      const result = await db.transaction(async (tx) => {
        const [newEvent] = await tx
          .insert(events)
          .values([event])
          .returning();
        
        console.log(`[Storage] Nouvel événement créé: ${newEvent.id} - ${newEvent.title}`);
        return newEvent;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création de l'événement: ${error}`) };
    }
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Result<Event>> {
    try {
      // Check if event exists
      const eventResult = await this.getEvent(id);
      if (!eventResult.success) {
        return { success: false, error: eventResult.error };
      }
      if (!eventResult.data) {
        return { success: false, error: new NotFoundError("Événement introuvable") };
      }

      // Validate date if being updated
      if (eventData.date && new Date(eventData.date) <= new Date()) {
        return { success: false, error: new ValidationError("La date de l'événement doit être dans le futur") };
      }

      const result = await db.transaction(async (tx) => {
        const formattedData = {
          ...eventData,
          updatedAt: sql`NOW()`,
          updatedBy: "admin" // Could be improved with actual user
        };
        
        // Convert date string to Date object if present
        if (eventData.date) {
          formattedData.date = new Date(eventData.date);
        }
        
        const [updatedEvent] = await tx
          .update(events)
          .set(formattedData)
          .where(eq(events.id, id))
          .returning();
        
        console.log(`[Storage] Événement mis à jour: ${id}`);
        return updatedEvent;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour de l'événement: ${error}`) };
    }
  }

  async deleteEvent(id: string): Promise<Result<void>> {
    try {
      // Check if event exists
      const eventResult = await this.getEvent(id);
      if (!eventResult.success) {
        return { success: false, error: eventResult.error };
      }
      if (!eventResult.data) {
        return { success: false, error: new NotFoundError("Événement introuvable") };
      }

      // Transaction for atomic deletion (cascade will handle inscriptions)
      await db.transaction(async (tx) => {
        await tx.delete(events).where(eq(events.id, id));
        console.log(`[Storage] Événement supprimé: ${id}`);
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de l'événement: ${error}`) };
    }
  }

  // Ultra-robust Inscriptions methods with Result pattern
  async getEventInscriptions(eventId: string): Promise<Result<Inscription[]>> {
    try {
      const inscriptionsList = await db.select().from(inscriptions)
        .where(eq(inscriptions.eventId, eventId))
        .orderBy(desc(inscriptions.createdAt));
      return { success: true, data: inscriptionsList };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des inscriptions: ${error}`) };
    }
  }

  async createInscription(inscription: InsertInscription): Promise<Result<Inscription>> {
    try {
      // Business validation: Check for duplicate registration
      if (await this.hasUserRegistered(inscription.eventId, inscription.email)) {
        return { success: false, error: new DuplicateError("Vous êtes déjà inscrit à cet événement") };
      }

      // Check if event exists
      const eventResult = await this.getEvent(inscription.eventId);
      if (!eventResult.success) {
        return { success: false, error: eventResult.error };
      }
      if (!eventResult.data) {
        return { success: false, error: new NotFoundError("Événement introuvable") };
      }

      const result = await db.transaction(async (tx) => {
        const [newInscription] = await tx
          .insert(inscriptions)
          .values([inscription])
          .returning();
        
        console.log(`[Storage] Nouvelle inscription créée: ${newInscription.id} pour événement ${inscription.eventId}`);
        return newInscription;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création de l'inscription: ${error}`) };
    }
  }

  async hasUserRegistered(eventId: string, email: string): Promise<boolean> {
    const [existingInscription] = await db
      .select()
      .from(inscriptions)
      .where(and(eq(inscriptions.eventId, eventId), eq(inscriptions.email, email)));
    return !!existingInscription;
  }

  // Ultra-robust Stats method with Result pattern
  async getStats(): Promise<Result<{
    totalIdeas: number;
    totalVotes: number;
    upcomingEvents: number;
    totalInscriptions: number;
  }>> {
    try {
      const [ideaCount] = await db.select({ count: count() }).from(ideas);
      const [voteCount] = await db.select({ count: count() }).from(votes);
      const [eventCount] = await db.select({ count: count() }).from(events);
      const [inscriptionCount] = await db.select({ count: count() }).from(inscriptions);

      const stats = {
        totalIdeas: Number(ideaCount.count),
        totalVotes: Number(voteCount.count),
        upcomingEvents: Number(eventCount.count),
        totalInscriptions: Number(inscriptionCount.count),
      };

      return { success: true, data: stats };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des statistiques: ${error}`) };
    }
  }
}

export const storage = new DatabaseStorage();
