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
  NotFoundError,
  IDEA_STATUS,
  EVENT_STATUS
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, count, sql, or } from "drizzle-orm";
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
  
  // Admin management - Pour la gestion des administrateurs par les super-admins
  getAllAdmins(): Promise<Result<Admin[]>>;
  updateAdminRole(email: string, role: string): Promise<Result<Admin>>;
  updateAdminStatus(email: string, isActive: boolean): Promise<Result<Admin>>;
  updateAdminPassword(email: string, hashedPassword: string): Promise<Result<void>>;
  deleteAdmin(email: string): Promise<Result<void>>;
  
  // Ideas - Ultra-robust with business validation
  getIdeas(): Promise<Result<(Idea & { voteCount: number })[]>>;
  getIdea(id: string): Promise<Result<Idea | null>>;
  createIdea(idea: InsertIdea): Promise<Result<Idea>>;
  deleteIdea(id: string): Promise<Result<void>>;
  updateIdeaStatus(id: string, status: string): Promise<Result<void>>;
  updateIdea(id: string, ideaData: { title?: string; description?: string | null; proposedBy?: string; proposedByEmail?: string }): Promise<Result<Idea>>;
  transformIdeaToEvent(ideaId: string): Promise<Result<Event>>;
  isDuplicateIdea(title: string): Promise<boolean>;
  getAllIdeas(): Promise<Result<(Idea & { voteCount: number })[]>>;
  
  // Votes - Ultra-robust with duplicate protection
  getVotesByIdea(ideaId: string): Promise<Result<Vote[]>>;
  getIdeaVotes(ideaId: string): Promise<Result<Vote[]>>;
  createVote(vote: InsertVote): Promise<Result<Vote>>;
  hasUserVoted(ideaId: string, email: string): Promise<boolean>;
  
  // Events - Ultra-robust with validation
  getEvents(): Promise<Result<(Event & { inscriptionCount: number })[]>>;
  getEvent(id: string): Promise<Result<Event | null>>;
  createEvent(event: InsertEvent): Promise<Result<Event>>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Result<Event>>;
  deleteEvent(id: string): Promise<Result<void>>;
  updateEventStatus(id: string, status: string): Promise<Result<void>>;
  isDuplicateEvent(title: string, date: Date): Promise<boolean>;
  getAllEvents(): Promise<Result<(Event & { inscriptionCount: number })[]>>;
  
  // Inscriptions - Ultra-robust with duplicate protection
  getEventInscriptions(eventId: string): Promise<Result<Inscription[]>>;
  createInscription(inscription: InsertInscription): Promise<Result<Inscription>>;
  unsubscribeFromEvent(eventId: string, name: string, email: string): Promise<Result<void>>;
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
      pruneSessionInterval: 3600, // 1 heure - moins fréquent
      errorLog: (error) => {
        console.error('[Session Store] Erreur:', error.message);
      },
      // Configuration du schéma
      schemaName: 'public',
      // TTL aligné avec les cookies
      ttl: 24 * 60 * 60 // 24 heures
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

  // Admin management methods
  async getAllAdmins(): Promise<Result<Admin[]>> {
    try {
      const adminsList = await db
        .select()
        .from(admins)
        .orderBy(desc(admins.createdAt));
      
      return { success: true, data: adminsList };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des administrateurs: ${error}`) };
    }
  }

  async updateAdminRole(email: string, role: string): Promise<Result<Admin>> {
    try {
      const [updatedAdmin] = await db
        .update(admins)
        .set({ 
          role, 
          updatedAt: sql`NOW()` 
        })
        .where(eq(admins.email, email))
        .returning();

      if (!updatedAdmin) {
        return { success: false, error: new NotFoundError("Administrateur non trouvé") };
      }

      return { success: true, data: updatedAdmin };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du rôle: ${error}`) };
    }
  }

  async updateAdminStatus(email: string, isActive: boolean): Promise<Result<Admin>> {
    try {
      const [updatedAdmin] = await db
        .update(admins)
        .set({ 
          isActive, 
          updatedAt: sql`NOW()` 
        })
        .where(eq(admins.email, email))
        .returning();

      if (!updatedAdmin) {
        return { success: false, error: new NotFoundError("Administrateur non trouvé") };
      }

      return { success: true, data: updatedAdmin };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du statut: ${error}`) };
    }
  }

  async updateAdminInfo(email: string, info: { firstName: string; lastName: string }): Promise<Result<Admin>> {
    try {
      const [updatedAdmin] = await db
        .update(admins)
        .set({ 
          firstName: info.firstName,
          lastName: info.lastName,
          updatedAt: sql`NOW()` 
        })
        .where(eq(admins.email, email))
        .returning();

      if (!updatedAdmin) {
        return { success: false, error: new NotFoundError("Administrateur non trouvé") };
      }

      return { success: true, data: updatedAdmin };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour des informations: ${error}`) };
    }
  }

  async updateAdminPassword(email: string, hashedPassword: string): Promise<Result<void>> {
    try {
      const result = await db
        .update(admins)
        .set({ 
          password: hashedPassword, 
          updatedAt: sql`NOW()` 
        })
        .where(eq(admins.email, email));

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du mot de passe: ${error}`) };
    }
  }

  async deleteAdmin(email: string): Promise<Result<void>> {
    try {
      const result = await db
        .delete(admins)
        .where(eq(admins.email, email));

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de l'administrateur: ${error}`) };
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
          featured: ideas.featured,
          deadline: ideas.deadline,
          createdAt: ideas.createdAt,
          updatedAt: ideas.updatedAt,
          updatedBy: ideas.updatedBy,
          voteCount: count(votes.id),
        })
        .from(ideas)
        .leftJoin(votes, eq(ideas.id, votes.ideaId))
        .where(or(eq(ideas.status, 'approved'), eq(ideas.status, 'completed'))) // Show approved and completed ideas to public
        .groupBy(ideas.id)
        .orderBy(desc(ideas.featured), desc(ideas.createdAt)); // Featured en premier, puis par date
      
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

      // Prepare data with proper date conversion
      const ideaData = {
        ...idea,
        deadline: idea.deadline ? new Date(idea.deadline) : undefined
      };

      // Transaction for atomic operation
      const result = await db.transaction(async (tx) => {
        const [newIdea] = await tx
          .insert(ideas)
          .values([ideaData])
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



  // Ultra-robust Votes methods with Result pattern
  async getVotesByIdea(ideaId: string): Promise<Result<Vote[]>> {
    try {
      const votesList = await db.select().from(votes).where(eq(votes.ideaId, ideaId)).orderBy(desc(votes.createdAt));
      return { success: true, data: votesList };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des votes: ${error}`) };
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
          location: events.location,
          maxParticipants: events.maxParticipants,
          helloAssoLink: events.helloAssoLink,
          enableExternalRedirect: events.enableExternalRedirect,
          externalRedirectUrl: events.externalRedirectUrl,
          showInscriptionsCount: events.showInscriptionsCount,
          showAvailableSeats: events.showAvailableSeats,
          allowUnsubscribe: events.allowUnsubscribe,
          redUnsubscribeButton: events.redUnsubscribeButton,
          buttonMode: events.buttonMode,
          customButtonText: events.customButtonText,
          status: events.status,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          updatedBy: events.updatedBy,
          inscriptionCount: count(inscriptions.id),
        })
        .from(events)
        .leftJoin(inscriptions, eq(events.id, inscriptions.eventId))
        .where(sql`${events.date} > NOW()`) // Only show future events to public
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
      // Convert date string to Date object
      const eventDate = new Date(event.date);
      
      // Business validation: Check for duplicate event (same title and date)
      if (await this.isDuplicateEvent(event.title, eventDate)) {
        return { success: false, error: new DuplicateError("Un événement avec ce titre et cette date existe déjà") };
      }

      // Validate date is in the future
      if (eventDate <= new Date()) {
        return { success: false, error: new ValidationError("La date de l'événement doit être dans le futur") };
      }

      // Prepare data with proper date conversion
      const eventData = {
        ...event,
        date: eventDate
      };

      const result = await db.transaction(async (tx) => {
        const [newEvent] = await tx
          .insert(events)
          .values([eventData])
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
        const formattedData: any = {
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

  // Ultra-robust Votes methods with Result pattern
  async getIdeaVotes(ideaId: string): Promise<Result<Vote[]>> {
    try {
      const votesList = await db.select().from(votes)
        .where(eq(votes.ideaId, ideaId))
        .orderBy(desc(votes.createdAt));
      return { success: true, data: votesList };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des votes: ${error}`) };
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

      // Check participant limit if set
      if (eventResult.data.maxParticipants) {
        const currentInscriptionsResult = await this.getEventInscriptions(inscription.eventId);
        if (currentInscriptionsResult.success) {
          const currentCount = currentInscriptionsResult.data.length;
          if (currentCount >= eventResult.data.maxParticipants) {
            return { 
              success: false, 
              error: new ValidationError(`L'événement est complet (${eventResult.data.maxParticipants} participants maximum)`) 
            };
          }
        }
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

  async unsubscribeFromEvent(eventId: string, name: string, email: string): Promise<Result<void>> {
    try {
      // Check if user is registered for this event with exact name and email
      const [inscription] = await db
        .select()
        .from(inscriptions)
        .where(and(
          eq(inscriptions.eventId, eventId), 
          eq(inscriptions.email, email),
          eq(inscriptions.name, name)
        ));

      if (!inscription) {
        return { success: false, error: new NotFoundError("Inscription introuvable avec ce nom et cet email") };
      }

      await db.transaction(async (tx) => {
        await tx
          .delete(inscriptions)
          .where(and(
            eq(inscriptions.eventId, eventId), 
            eq(inscriptions.email, email),
            eq(inscriptions.name, name)
          ));
        console.log(`[Storage] Désinscription: ${name} (${email}) de l'événement ${eventId}`);
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la désinscription: ${error}`) };
    }
  }

  async deleteInscription(inscriptionId: string): Promise<Result<void>> {
    try {
      // Check if inscription exists
      const [inscription] = await db
        .select()
        .from(inscriptions)
        .where(eq(inscriptions.id, inscriptionId));

      if (!inscription) {
        return { success: false, error: new NotFoundError("Inscription introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(inscriptions).where(eq(inscriptions.id, inscriptionId));
        console.log(`[Storage] Inscription supprimée: ${inscriptionId}`);
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de l'inscription: ${error}`) };
    }
  }

  async createVote(vote: InsertVote): Promise<Result<Vote>> {
    try {
      // Check for duplicate vote
      const [existingVote] = await db
        .select()
        .from(votes)
        .where(and(eq(votes.ideaId, vote.ideaId), eq(votes.voterEmail, vote.voterEmail)));

      if (existingVote) {
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
        
        console.log(`[Storage] Nouveau vote créé: ${newVote.id} pour idée ${vote.ideaId}`);
        return newVote;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création du vote: ${error}`) };
    }
  }

  async deleteVote(voteId: string): Promise<Result<void>> {
    try {
      // Check if vote exists
      const [vote] = await db
        .select()
        .from(votes)
        .where(eq(votes.id, voteId));

      if (!vote) {
        return { success: false, error: new NotFoundError("Vote introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(votes).where(eq(votes.id, voteId));
        console.log(`[Storage] Vote supprimé: ${voteId}`);
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression du vote: ${error}`) };
    }
  }

  // Admin-only methods for complete data access and moderation
  async getAllIdeas(): Promise<Result<(Idea & { voteCount: number })[]>> {
    try {
      const result = await db
        .select({
          id: ideas.id,
          title: ideas.title,
          description: ideas.description,
          proposedBy: ideas.proposedBy,
          proposedByEmail: ideas.proposedByEmail,
          status: ideas.status,
          featured: ideas.featured,
          deadline: ideas.deadline,
          createdAt: ideas.createdAt,
          updatedAt: ideas.updatedAt,
          updatedBy: ideas.updatedBy,
          voteCount: count(votes.id),
        })
        .from(ideas)
        .leftJoin(votes, eq(ideas.id, votes.ideaId))
        .groupBy(ideas.id)
        .orderBy(desc(ideas.featured), desc(ideas.createdAt)); // Featured en premier
      
      const formattedResult = result.map(row => ({
        ...row,
        voteCount: Number(row.voteCount),
      }));

      return { success: true, data: formattedResult };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération admin des idées: ${error}`) };
    }
  }

  async getAllEvents(): Promise<Result<(Event & { inscriptionCount: number })[]>> {
    try {
      const result = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          date: events.date,
          location: events.location,
          maxParticipants: events.maxParticipants,
          helloAssoLink: events.helloAssoLink,
          enableExternalRedirect: events.enableExternalRedirect,
          externalRedirectUrl: events.externalRedirectUrl,
          showInscriptionsCount: events.showInscriptionsCount,
          showAvailableSeats: events.showAvailableSeats,
          allowUnsubscribe: events.allowUnsubscribe,
          redUnsubscribeButton: events.redUnsubscribeButton,
          buttonMode: events.buttonMode,
          customButtonText: events.customButtonText,
          status: events.status,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
          updatedBy: events.updatedBy,
          inscriptionCount: count(inscriptions.id),
        })
        .from(events)
        .leftJoin(inscriptions, eq(events.id, inscriptions.eventId))
        .groupBy(events.id)
        .orderBy(desc(events.date)); // Admin sees all events, past and future
      
      const formattedResult = result.map(row => ({
        ...row,
        inscriptionCount: Number(row.inscriptionCount),
      }));

      return { success: true, data: formattedResult };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération admin des événements: ${error}`) };
    }
  }

  async updateIdeaStatus(id: string, status: string): Promise<Result<void>> {
    try {
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
            updatedBy: "admin"
          })
          .where(eq(ideas.id, id));
        
        console.log(`[Storage] Statut de l'idée mis à jour: ${id} -> ${status}`);
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du statut de l'idée: ${error}`) };
    }
  }

  async updateIdea(id: string, ideaData: { title?: string; description?: string | null; proposedBy?: string; proposedByEmail?: string; createdAt?: string }): Promise<Result<Idea>> {
    try {
      // Check if idea exists
      const ideaResult = await this.getIdea(id);
      if (!ideaResult.success) {
        return { success: false, error: ideaResult.error };
      }
      if (!ideaResult.data) {
        return { success: false, error: new NotFoundError("Idée introuvable") };
      }

      // Check for duplicate title if title is being updated
      if (ideaData.title && ideaData.title !== ideaResult.data.title) {
        if (await this.isDuplicateIdea(ideaData.title)) {
          return { success: false, error: new DuplicateError("Une idée avec ce titre existe déjà") };
        }
      }

      const result = await db.transaction(async (tx) => {
        // Prepare update data with proper date conversion
        const updateData: any = {
          ...ideaData,
          updatedAt: sql`NOW()`,
          updatedBy: "admin"
        };
        
        // Convert createdAt string to Date object if provided
        if (ideaData.createdAt) {
          updateData.createdAt = new Date(ideaData.createdAt);
        }
        
        const [updatedIdea] = await tx
          .update(ideas)
          .set(updateData)
          .where(eq(ideas.id, id))
          .returning();
        
        console.log(`[Storage] Idée mise à jour: ${id} - ${ideaData.title || 'contenu modifié'}`);
        return updatedIdea;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour de l'idée: ${error}`) };
    }
  }

  async toggleIdeaFeatured(id: string): Promise<Result<boolean>> {
    try {
      // Check if idea exists
      const ideaResult = await this.getIdea(id);
      if (!ideaResult.success) {
        return { success: false, error: ideaResult.error };
      }
      if (!ideaResult.data) {
        return { success: false, error: new NotFoundError("Idée introuvable") };
      }

      const newFeaturedStatus = !ideaResult.data.featured;

      await db.transaction(async (tx) => {
        await tx
          .update(ideas)
          .set({ 
            featured: newFeaturedStatus,
            updatedAt: sql`NOW()`,
            updatedBy: "admin"
          })
          .where(eq(ideas.id, id));
        
        console.log(`[Storage] Featured idée mis à jour: ${id} -> ${newFeaturedStatus}`);
      });

      return { success: true, data: newFeaturedStatus };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du featured de l'idée: ${error}`) };
    }
  }

  async transformIdeaToEvent(ideaId: string): Promise<Result<Event>> {
    try {
      // Récupérer l'idée source
      const ideaResult = await this.getIdea(ideaId);
      if (!ideaResult.success) {
        return { success: false, error: ideaResult.error };
      }
      if (!ideaResult.data) {
        return { success: false, error: new NotFoundError("Idée introuvable") };
      }

      const idea = ideaResult.data;

      // Vérifier que l'idée peut être transformée (approuvée ou réalisée)
      if (idea.status !== IDEA_STATUS.APPROVED && idea.status !== IDEA_STATUS.COMPLETED) {
        return { success: false, error: new ValidationError("Seules les idées approuvées ou réalisées peuvent être transformées en événements") };
      }

      // Créer l'événement dans une transaction
      const result = await db.transaction(async (tx) => {
        // Créer l'événement basé sur l'idée
        const eventData = {
          title: `Événement: ${idea.title}`,
          description: idea.description ? 
            `Événement créé à partir de l'idée proposée par ${idea.proposedBy}.\n\n${idea.description}` : 
            `Événement créé à partir de l'idée proposée par ${idea.proposedBy}: "${idea.title}"`,
          // Définir la date à dans 30 jours par défaut
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          location: "À définir",
          maxParticipants: null,
          helloAssoLink: null,
          enableExternalRedirect: false,
          externalRedirectUrl: null,
          showInscriptionsCount: true,
          showAvailableSeats: true,
          status: EVENT_STATUS.DRAFT, // Créer en brouillon pour permettre les modifications
          updatedBy: "admin"
        };

        const [newEvent] = await tx
          .insert(events)
          .values([eventData])
          .returning();

        // Marquer l'idée comme réalisée si elle ne l'est pas déjà
        if (idea.status !== IDEA_STATUS.COMPLETED) {
          await tx
            .update(ideas)
            .set({ 
              status: IDEA_STATUS.COMPLETED,
              updatedAt: sql`NOW()`,
              updatedBy: "admin" 
            })
            .where(eq(ideas.id, ideaId));
        }

        console.log(`[Storage] Idée transformée en événement: ${ideaId} -> ${newEvent.id}`);
        return newEvent;
      });

      return { success: true, data: result };
    } catch (error) {
      console.error('[Storage] Erreur transformation idée vers événement:', error);
      return { success: false, error: new DatabaseError(`Erreur lors de la transformation de l'idée en événement: ${error}`) };
    }
  }

  async updateEventStatus(id: string, status: string): Promise<Result<void>> {
    try {
      // Check if event exists
      const eventResult = await this.getEvent(id);
      if (!eventResult.success) {
        return { success: false, error: eventResult.error };
      }
      if (!eventResult.data) {
        return { success: false, error: new NotFoundError("Événement introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx
          .update(events)
          .set({ 
            status,
            updatedAt: sql`NOW()`,
            updatedBy: "admin"
          })
          .where(eq(events.id, id));
        
        console.log(`[Storage] Statut de l'événement mis à jour: ${id} -> ${status}`);
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du statut de l'événement: ${error}`) };
    }
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
