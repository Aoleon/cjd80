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
  type InsertInscription
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // Admin users
  getUser(email: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ideas
  getIdeas(): Promise<(Idea & { voteCount: number })[]>;
  getIdea(id: string): Promise<Idea | undefined>;
  createIdea(idea: InsertIdea): Promise<Idea>;
  deleteIdea(id: string): Promise<void>;
  updateIdeaStatus(id: string, status: string): Promise<void>;
  
  // Votes
  getVotesByIdea(ideaId: string): Promise<Vote[]>;
  createVote(vote: InsertVote): Promise<Vote>;
  hasUserVoted(ideaId: string, email: string): Promise<boolean>;
  
  // Events
  getEvents(): Promise<(Event & { inscriptionCount: number })[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  
  // Inscriptions
  getEventInscriptions(eventId: string): Promise<Inscription[]>;
  createInscription(inscription: InsertInscription): Promise<Inscription>;
  hasUserRegistered(eventId: string, email: string): Promise<boolean>;
  
  // Admin stats
  getStats(): Promise<{
    totalIdeas: number;
    totalVotes: number;
    upcomingEvents: number;
    totalInscriptions: number;
  }>;
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

  async getUser(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(admins).where(eq(admins.email, email));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(admins).where(eq(admins.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(admins)
      .values(insertUser)
      .returning();
    return user;
  }

  async getIdeas(): Promise<(Idea & { voteCount: number })[]> {
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
    
    return result.map(row => ({
      ...row,
      voteCount: Number(row.voteCount),
    }));
  }

  async getIdea(id: string): Promise<Idea | undefined> {
    const [idea] = await db.select().from(ideas).where(eq(ideas.id, id));
    return idea || undefined;
  }

  async createIdea(idea: InsertIdea): Promise<Idea> {
    const [newIdea] = await db
      .insert(ideas)
      .values(idea)
      .returning();
    return newIdea;
  }

  async deleteIdea(id: string): Promise<void> {
    await db.delete(ideas).where(eq(ideas.id, id));
  }

  async updateIdeaStatus(id: string, status: string): Promise<void> {
    await db.update(ideas).set({ status }).where(eq(ideas.id, id));
  }

  async getVotesByIdea(ideaId: string): Promise<Vote[]> {
    return await db.select().from(votes).where(eq(votes.ideaId, ideaId));
  }

  async createVote(vote: InsertVote): Promise<Vote> {
    const [newVote] = await db
      .insert(votes)
      .values(vote)
      .returning();
    return newVote;
  }

  async hasUserVoted(ideaId: string, email: string): Promise<boolean> {
    const [existingVote] = await db
      .select()
      .from(votes)
      .where(and(eq(votes.ideaId, ideaId), eq(votes.voterEmail, email)));
    return !!existingVote;
  }

  async getEvents(): Promise<(Event & { inscriptionCount: number })[]> {
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
    
    return result.map(row => ({
      ...row,
      inscriptionCount: Number(row.inscriptionCount),
    }));
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(event)
      .returning();
    return newEvent;
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getEventInscriptions(eventId: string): Promise<Inscription[]> {
    return await db.select().from(inscriptions).where(eq(inscriptions.eventId, eventId));
  }

  async createInscription(inscription: InsertInscription): Promise<Inscription> {
    const [newInscription] = await db
      .insert(inscriptions)
      .values(inscription)
      .returning();
    return newInscription;
  }

  async hasUserRegistered(eventId: string, email: string): Promise<boolean> {
    const [existingInscription] = await db
      .select()
      .from(inscriptions)
      .where(and(eq(inscriptions.eventId, eventId), eq(inscriptions.email, email)));
    return !!existingInscription;
  }

  async getStats(): Promise<{
    totalIdeas: number;
    totalVotes: number;
    upcomingEvents: number;
    totalInscriptions: number;
  }> {
    const [ideaCount] = await db.select({ count: count() }).from(ideas);
    const [voteCount] = await db.select({ count: count() }).from(votes);
    const [eventCount] = await db.select({ count: count() }).from(events);
    const [inscriptionCount] = await db.select({ count: count() }).from(inscriptions);

    return {
      totalIdeas: Number(ideaCount.count),
      totalVotes: Number(voteCount.count),
      upcomingEvents: Number(eventCount.count),
      totalInscriptions: Number(inscriptionCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
