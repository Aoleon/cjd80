import { 
  adminUsers, 
  ideas, 
  votes, 
  events, 
  eventRegistrations,
  type AdminUser, 
  type InsertAdminUser,
  type User,
  type InsertUser,
  type Idea,
  type InsertIdea,
  type Vote,
  type InsertVote,
  type Event,
  type InsertEvent,
  type EventRegistration,
  type InsertEventRegistration
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.SessionStore;
  
  // Admin users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
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
  getEvents(): Promise<(Event & { registrationCount: number })[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<void>;
  
  // Event registrations
  getEventRegistrations(eventId: string): Promise<EventRegistration[]>;
  createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration>;
  hasUserRegistered(eventId: string, email: string): Promise<boolean>;
  
  // Admin stats
  getStats(): Promise<{
    totalIdeas: number;
    totalVotes: number;
    upcomingEvents: number;
    totalRegistrations: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(adminUsers)
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
        authorName: ideas.authorName,
        authorEmail: ideas.authorEmail,
        status: ideas.status,
        createdAt: ideas.createdAt,
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

  async getEvents(): Promise<(Event & { registrationCount: number })[]> {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        description: events.description,
        date: events.date,
        location: events.location,
        maxAttendees: events.maxAttendees,
        status: events.status,
        createdAt: events.createdAt,
        registrationCount: count(eventRegistrations.id),
      })
      .from(events)
      .leftJoin(eventRegistrations, eq(events.id, eventRegistrations.eventId))
      .where(eq(events.status, "open"))
      .groupBy(events.id)
      .orderBy(events.date);
    
    return result.map(row => ({
      ...row,
      registrationCount: Number(row.registrationCount),
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

  async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    return await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, eventId));
  }

  async createEventRegistration(registration: InsertEventRegistration): Promise<EventRegistration> {
    const [newRegistration] = await db
      .insert(eventRegistrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  async hasUserRegistered(eventId: string, email: string): Promise<boolean> {
    const [existingRegistration] = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.participantEmail, email)));
    return !!existingRegistration;
  }

  async getStats(): Promise<{
    totalIdeas: number;
    totalVotes: number;
    upcomingEvents: number;
    totalRegistrations: number;
  }> {
    const [ideaCount] = await db.select({ count: count() }).from(ideas);
    const [voteCount] = await db.select({ count: count() }).from(votes);
    const [eventCount] = await db.select({ count: count() }).from(events).where(eq(events.status, "open"));
    const [registrationCount] = await db.select({ count: count() }).from(eventRegistrations);

    return {
      totalIdeas: Number(ideaCount.count),
      totalVotes: Number(voteCount.count),
      upcomingEvents: Number(eventCount.count),
      totalRegistrations: Number(registrationCount.count),
    };
  }
}

export const storage = new DatabaseStorage();
