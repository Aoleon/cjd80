import { 
  admins, 
  ideas, 
  votes, 
  events, 
  inscriptions,
  unsubscriptions,
  developmentRequests,
  patrons,
  patronDonations,
  patronUpdates,
  ideaPatronProposals,
  members,
  memberActivities,
  memberSubscriptions,
  brandingConfig,
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
  type Unsubscription,
  type InsertUnsubscription,
  type DevelopmentRequest,
  type InsertDevelopmentRequest,
  type Patron,
  type InsertPatron,
  type PatronDonation,
  type InsertPatronDonation,
  type PatronUpdate,
  type InsertPatronUpdate,
  type IdeaPatronProposal,
  type InsertIdeaPatronProposal,
  type Member,
  type InsertMember,
  type MemberActivity,
  type InsertMemberActivity,
  type MemberSubscription,
  type InsertMemberSubscription,
  type BrandingConfig,
  type Result,
  ValidationError,
  DuplicateError,
  DatabaseError,
  NotFoundError,
  IDEA_STATUS,
  EVENT_STATUS,
  updatePatronSchema,
  updateIdeaPatronProposalSchema,
  updateMemberSchema
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, desc, and, count, sql, or, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { logger } from "./lib/logger";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  
  // Admin users - Ultra-robust with Result pattern
  getUser(email: string): Promise<Result<User | null>>;
  getUserByEmail(email: string): Promise<Result<User | null>>;
  createUser(user: InsertUser): Promise<Result<User>>;
  
  // Admin management - Pour la gestion des administrateurs par les super-admins
  getAllAdmins(): Promise<Result<Admin[]>>;
  getPendingAdmins(): Promise<Result<Admin[]>>;
  approveAdmin(email: string, role: string): Promise<Result<Admin>>;
  updateAdminRole(email: string, role: string): Promise<Result<Admin>>;
  updateAdminStatus(email: string, isActive: boolean): Promise<Result<Admin>>;
  updateAdminPassword(email: string, hashedPassword: string): Promise<Result<void>>;
  updateAdminInfo(email: string, info: { firstName?: string; lastName?: string }): Promise<Result<Admin>>;
  deleteAdmin(email: string): Promise<Result<void>>;
  
  // Ideas - Ultra-robust with business validation
  getIdeas(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Idea & { voteCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>>;
  getIdea(id: string): Promise<Result<Idea | null>>;
  createIdea(idea: InsertIdea): Promise<Result<Idea>>;
  deleteIdea(id: string): Promise<Result<void>>;
  updateIdeaStatus(id: string, status: string): Promise<Result<void>>;
  updateIdea(id: string, ideaData: { title?: string; description?: string | null; proposedBy?: string; proposedByEmail?: string }): Promise<Result<Idea>>;
  transformIdeaToEvent(ideaId: string): Promise<Result<Event>>;
  toggleIdeaFeatured(id: string): Promise<Result<boolean>>;
  isDuplicateIdea(title: string): Promise<boolean>;
  getAllIdeas(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Idea & { voteCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>>;
  
  // Votes - Ultra-robust with duplicate protection
  getVotesByIdea(ideaId: string): Promise<Result<Vote[]>>;
  getIdeaVotes(ideaId: string): Promise<Result<Vote[]>>;
  createVote(vote: InsertVote): Promise<Result<Vote>>;
  deleteVote(voteId: string): Promise<Result<void>>;
  hasUserVoted(ideaId: string, email: string): Promise<boolean>;
  
  // Events - Ultra-robust with validation
  getEvents(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Event & { inscriptionCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>>;
  getEvent(id: string): Promise<Result<Event | null>>;
  createEvent(event: InsertEvent): Promise<Result<Event>>;
  createEventWithInscriptions(event: InsertEvent, initialInscriptions: Omit<InsertInscription, 'eventId'>[]): Promise<Result<{ event: Event; inscriptions: Inscription[] }>>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Result<Event>>;
  deleteEvent(id: string): Promise<Result<void>>;
  updateEventStatus(id: string, status: string): Promise<Result<void>>;
  isDuplicateEvent(title: string, date: Date): Promise<boolean>;
  getAllEvents(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Event & { inscriptionCount: number; unsubscriptionCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>>;
  
  // Inscriptions - Ultra-robust with duplicate protection
  getEventInscriptions(eventId: string): Promise<Result<Inscription[]>>;
  createInscription(inscription: InsertInscription): Promise<Result<Inscription>>;
  deleteInscription(inscriptionId: string): Promise<Result<void>>;
  unsubscribeFromEvent(eventId: string, name: string, email: string): Promise<Result<void>>;
  hasUserRegistered(eventId: string, email: string): Promise<boolean>;
  
  // Unsubscriptions - For declaring absence
  getEventUnsubscriptions(eventId: string): Promise<Result<Unsubscription[]>>;
  createUnsubscription(unsubscription: InsertUnsubscription): Promise<Result<Unsubscription>>;
  deleteUnsubscription(id: string): Promise<Result<void>>;
  updateUnsubscription(id: string, data: Partial<InsertUnsubscription>): Promise<Result<Unsubscription>>;
  
  // Admin stats
  getStats(): Promise<Result<{
    totalIdeas: number;
    totalVotes: number;
    upcomingEvents: number;
    totalInscriptions: number;
  }>>;
  
  getAdminStats(): Promise<Result<{
    members: { total: number; active: number; proposed: number; recentActivity: number };
    patrons: { total: number; active: number; proposed: number };
    ideas: { total: number; pending: number; approved: number };
    events: { total: number; upcoming: number };
  }>>;

  // Development requests
  getDevelopmentRequests(): Promise<Result<DevelopmentRequest[]>>;
  createDevelopmentRequest(request: InsertDevelopmentRequest): Promise<Result<DevelopmentRequest>>;
  updateDevelopmentRequest(id: string, data: Partial<DevelopmentRequest>): Promise<Result<DevelopmentRequest>>;
  updateDevelopmentRequestStatus(id: string, status: string, adminComment: string | undefined, updatedBy: string): Promise<Result<DevelopmentRequest>>;
  deleteDevelopmentRequest(id: string): Promise<Result<void>>;
  syncDevelopmentRequestWithGithub(id: string, githubData: { issueNumber: number; issueUrl: string; status: string }): Promise<Result<DevelopmentRequest>>;
  
  // Gestion des mécènes
  createPatron(patron: InsertPatron): Promise<Result<Patron>>;
  proposePatron(data: InsertPatron): Promise<Result<Patron>>;
  getPatrons(options?: { page?: number; limit?: number }): Promise<Result<{
    data: Patron[];
    total: number;
    page: number;
    limit: number;
  }>>;
  getPatronById(id: string): Promise<Result<Patron | null>>;
  getPatronByEmail(email: string): Promise<Result<Patron | null>>;
  updatePatron(id: string, data: z.infer<typeof updatePatronSchema>): Promise<Result<Patron>>;
  deletePatron(id: string): Promise<Result<void>>;
  
  // Gestion des dons
  createPatronDonation(donation: InsertPatronDonation): Promise<Result<PatronDonation>>;
  getPatronDonations(patronId: string): Promise<Result<PatronDonation[]>>;
  getAllDonations(): Promise<Result<PatronDonation[]>>;
  updatePatronDonation(id: string, data: Partial<InsertPatronDonation>): Promise<Result<PatronDonation>>;
  deletePatronDonation(id: string): Promise<Result<void>>;
  
  // Gestion des actualités mécènes
  createPatronUpdate(update: InsertPatronUpdate): Promise<Result<PatronUpdate>>;
  getPatronUpdates(patronId: string): Promise<Result<PatronUpdate[]>>;
  updatePatronUpdate(id: string, data: Partial<InsertPatronUpdate>): Promise<Result<PatronUpdate>>;
  deletePatronUpdate(id: string): Promise<Result<void>>;
  
  // Gestion des propositions mécène-idée
  createIdeaPatronProposal(proposal: InsertIdeaPatronProposal): Promise<Result<IdeaPatronProposal>>;
  getIdeaPatronProposals(ideaId: string): Promise<Result<IdeaPatronProposal[]>>;
  getPatronProposals(patronId: string): Promise<Result<IdeaPatronProposal[]>>;
  updateIdeaPatronProposal(id: string, data: z.infer<typeof updateIdeaPatronProposalSchema>): Promise<Result<IdeaPatronProposal>>;
  deleteIdeaPatronProposal(id: string): Promise<Result<void>>;
  
  // Gestion des membres
  createOrUpdateMember(memberData: Partial<InsertMember> & { email: string }): Promise<Result<Member>>;
  proposeMember(memberData: Partial<InsertMember> & { email: string; firstName: string; lastName: string; proposedBy: string }): Promise<Result<Member>>;
  getMembers(options?: { page?: number; limit?: number }): Promise<Result<{
    data: Member[];
    total: number;
    page: number;
    limit: number;
  }>>;
  getMemberByEmail(email: string): Promise<Result<Member | null>>;
  getMemberByCjdRole(cjdRole: string): Promise<Result<Member | null>>;
  updateMember(email: string, data: z.infer<typeof updateMemberSchema>): Promise<Result<Member>>;
  deleteMember(email: string): Promise<Result<void>>;

  // Gestion des activités membres
  trackMemberActivity(activity: InsertMemberActivity): Promise<Result<MemberActivity>>;
  getMemberActivities(memberEmail: string): Promise<Result<MemberActivity[]>>;
  getAllActivities(): Promise<Result<MemberActivity[]>>;
  
  // Member Subscriptions
  getSubscriptionsByMember(memberEmail: string): Promise<MemberSubscription[]>;
  createSubscription(subscription: InsertMemberSubscription): Promise<MemberSubscription>;
  
  // Branding configuration
  getBrandingConfig(): Promise<Result<BrandingConfig | null>>;
  updateBrandingConfig(config: string, updatedBy: string): Promise<Result<BrandingConfig>>;
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
        logger.error('Session store error', { error });
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

  async getPendingAdmins(): Promise<Result<Admin[]>> {
    try {
      const pendingAdminsList = await db
        .select()
        .from(admins)
        .where(eq(admins.status, "pending"))
        .orderBy(desc(admins.createdAt));
      
      return { success: true, data: pendingAdminsList };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des comptes en attente: ${error}`) };
    }
  }

  async approveAdmin(email: string, role: string): Promise<Result<Admin>> {
    try {
      const [updatedAdmin] = await db
        .update(admins)
        .set({ 
          status: "active",
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
      return { success: false, error: new DatabaseError(`Erreur lors de l'approbation du compte: ${error}`) };
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
        .where(eq(admins.email, email))
        .returning();

      if (result.length === 0) {
        return { success: false, error: new NotFoundError("Administrateur introuvable") };
      }

      logger.info('Admin deleted', { email });
      return { success: true, data: undefined };
    } catch (error) {
      logger.error('Admin deletion failed', { email, error });
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de l'administrateur: ${error}`) };
    }
  }

  // Ultra-robust Ideas methods with Result pattern and business validation
  async getIdeas(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Idea & { voteCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const page = Math.max(1, options?.page || 1);
      const limit = Math.min(100, Math.max(1, options?.limit || 20));
      const offset = (page - 1) * limit;

      // Count total
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(ideas)
        .where(or(eq(ideas.status, 'approved'), eq(ideas.status, 'completed')));

      // Get paginated results
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
        .where(or(eq(ideas.status, 'approved'), eq(ideas.status, 'completed')))
        .groupBy(ideas.id)
        .orderBy(
          desc(ideas.featured),
          asc(sql`CASE WHEN ${ideas.status} = 'approved' THEN 0 WHEN ${ideas.status} = 'completed' THEN 1 ELSE 2 END`),
          desc(ideas.createdAt)
        )
        .limit(limit)
        .offset(offset);
      
      const formattedResult = result.map(row => ({
        ...row,
        voteCount: Number(row.voteCount),
      }));

      return { 
        success: true, 
        data: {
          data: formattedResult,
          total: countResult.count,
          page,
          limit
        }
      };
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
      logger.error('Duplicate idea check failed', { title, error });
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
        logger.info('Idea created', { ideaId: newIdea.id, proposedBy: idea.proposedBy, title: newIdea.title });
        
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
        logger.info('Idea deleted', { ideaId: id });
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
  async getEvents(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Event & { inscriptionCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const page = Math.max(1, options?.page || 1);
      const limit = Math.min(100, Math.max(1, options?.limit || 20));
      const offset = (page - 1) * limit;

      // Count total
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(events)
        .where(sql`${events.date} > NOW()`);

      // Get paginated results
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
        .where(sql`${events.date} > NOW()`)
        .groupBy(events.id)
        .orderBy(events.date)
        .limit(limit)
        .offset(offset);
      
      const formattedResult = result.map(row => ({
        ...row,
        inscriptionCount: Number(row.inscriptionCount),
      }));

      return { 
        success: true, 
        data: {
          data: formattedResult,
          total: countResult.count,
          page,
          limit
        }
      };
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
      logger.error('Duplicate event check failed', { title, date, error });
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
        
        logger.info('Event created', { eventId: newEvent.id, title: newEvent.title, date: newEvent.date });
        return newEvent;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création de l'événement: ${error}`) };
    }
  }

  async createEventWithInscriptions(
    event: InsertEvent, 
    initialInscriptions: Omit<InsertInscription, 'eventId'>[]
  ): Promise<Result<{ event: Event; inscriptions: Inscription[] }>> {
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

      // Validate max participants limit if set
      if (event.maxParticipants && initialInscriptions.length > event.maxParticipants) {
        return { 
          success: false, 
          error: new ValidationError(`Le nombre d'inscriptions initiales (${initialInscriptions.length}) dépasse la limite de participants (${event.maxParticipants})`) 
        };
      }

      // Check for duplicate emails in initial inscriptions
      const emails = initialInscriptions.map(i => i.email.toLowerCase());
      const uniqueEmails = new Set(emails);
      if (emails.length !== uniqueEmails.size) {
        return { 
          success: false, 
          error: new ValidationError("Les inscriptions initiales contiennent des emails en double") 
        };
      }

      // Prepare data with proper date conversion
      const eventData = {
        ...event,
        date: eventDate
      };

      // Transaction for atomic operation - either all succeeds or all fails
      const result = await db.transaction(async (tx) => {
        // 1. Create the event
        const [newEvent] = await tx
          .insert(events)
          .values([eventData])
          .returning();
        
        logger.info('Event created with transaction', { eventId: newEvent.id, title: newEvent.title });

        // 2. Create all initial inscriptions
        const createdInscriptions: Inscription[] = [];
        
        if (initialInscriptions.length > 0) {
          // Add eventId to each inscription
          const inscriptionsWithEventId = initialInscriptions.map(inscription => ({
            ...inscription,
            eventId: newEvent.id
          }));

          const newInscriptions = await tx
            .insert(inscriptions)
            .values(inscriptionsWithEventId)
            .returning();
          
          createdInscriptions.push(...newInscriptions);
          
          logger.info('Initial inscriptions created', { 
            eventId: newEvent.id, 
            count: newInscriptions.length 
          });
        }

        return { event: newEvent, inscriptions: createdInscriptions };
      });

      logger.info('Event with inscriptions created successfully', { 
        eventId: result.event.id, 
        inscriptionsCount: result.inscriptions.length 
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error('Event with inscriptions creation failed', { error });
      return { success: false, error: new DatabaseError(`Erreur lors de la création de l'événement avec inscriptions: ${error}`) };
    }
  }

  async updateEvent(id: string, eventData: Partial<InsertEvent>): Promise<Result<Event>> {
    try {
      logger.info('UpdateEvent called', { id, eventData });
      
      // Check if event exists
      const eventResult = await this.getEvent(id);
      if (!eventResult.success) {
        logger.error('UpdateEvent: getEvent failed', { error: eventResult.error });
        return { success: false, error: eventResult.error };
      }
      if (!eventResult.data) {
        logger.error('UpdateEvent: event not found', { id });
        return { success: false, error: new NotFoundError("Événement introuvable") };
      }

      // Validate date if being updated
      if (eventData.date && new Date(eventData.date) <= new Date()) {
        logger.error('UpdateEvent: date validation failed', { date: eventData.date });
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
        
        logger.info('UpdateEvent: executing update', { id, formattedData });
        
        const [updatedEvent] = await tx
          .update(events)
          .set(formattedData)
          .where(eq(events.id, id))
          .returning();
        
        logger.info('UpdateEvent: update returned', { updatedEvent });
        
        if (!updatedEvent) {
          throw new Error("Aucune ligne mise à jour");
        }
        
        return updatedEvent;
      });

      logger.info('Event updated successfully', { eventId: id, updates: Object.keys(eventData) });
      return { success: true, data: result };
    } catch (error) {
      logger.error('UpdateEvent failed with exception', { error, message: String(error) });
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
        logger.info('Event deleted', { eventId: id });
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
        
        logger.info('Event registration created', { inscriptionId: newInscription.id, eventId: inscription.eventId, name: inscription.name });
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
        logger.info('Event unregistration', { eventId, name, email });
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
        logger.info('Event registration deleted', { inscriptionId });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de l'inscription: ${error}`) };
    }
  }

  async getEventUnsubscriptions(eventId: string): Promise<Result<Unsubscription[]>> {
    try {
      const result = await db
        .select()
        .from(unsubscriptions)
        .where(eq(unsubscriptions.eventId, eventId))
        .orderBy(desc(unsubscriptions.createdAt));

      logger.debug('Event unsubscriptions retrieved', { eventId, count: result.length });
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des absences: ${error}`) };
    }
  }

  async createUnsubscription(unsubscription: InsertUnsubscription): Promise<Result<Unsubscription>> {
    try {
      // Check if user has already declared absence for this event
      const [existingUnsubscription] = await db
        .select()
        .from(unsubscriptions)
        .where(and(eq(unsubscriptions.eventId, unsubscription.eventId), eq(unsubscriptions.email, unsubscription.email)));

      if (existingUnsubscription) {
        return { success: false, error: new DuplicateError("Vous avez déjà déclaré votre absence pour cet événement") };
      }

      // Check if event exists
      const eventResult = await this.getEvent(unsubscription.eventId);
      if (!eventResult.success) {
        return { success: false, error: eventResult.error };
      }
      if (!eventResult.data) {
        return { success: false, error: new NotFoundError("Événement introuvable") };
      }

      const result = await db.transaction(async (tx) => {
        const [newUnsubscription] = await tx
          .insert(unsubscriptions)
          .values([unsubscription])
          .returning();
        
        logger.info('Event unsubscription created', { unsubscriptionId: newUnsubscription.id, eventId: unsubscription.eventId, name: unsubscription.name });
        return newUnsubscription;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la déclaration d'absence: ${error}`) };
    }
  }

  async deleteUnsubscription(id: string): Promise<Result<void>> {
    try {
      // Check if unsubscription exists
      const [unsubscription] = await db
        .select()
        .from(unsubscriptions)
        .where(eq(unsubscriptions.id, id));

      if (!unsubscription) {
        return { success: false, error: new NotFoundError("Déclaration d'absence introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(unsubscriptions).where(eq(unsubscriptions.id, id));
        logger.info('Event unsubscription deleted', { unsubscriptionId: id });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de la déclaration d'absence: ${error}`) };
    }
  }

  async updateUnsubscription(id: string, data: Partial<InsertUnsubscription>): Promise<Result<Unsubscription>> {
    try {
      // Check if unsubscription exists
      const [existingUnsubscription] = await db
        .select()
        .from(unsubscriptions)
        .where(eq(unsubscriptions.id, id));

      if (!existingUnsubscription) {
        return { success: false, error: new NotFoundError("Déclaration d'absence introuvable") };
      }

      const result = await db.transaction(async (tx) => {
        const [updatedUnsubscription] = await tx
          .update(unsubscriptions)
          .set(data)
          .where(eq(unsubscriptions.id, id))
          .returning();

        logger.info('Event unsubscription updated', { unsubscriptionId: id, updates: Object.keys(data) });
        return updatedUnsubscription;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la modification de la déclaration d'absence: ${error}`) };
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
        
        logger.info('Vote created', { voteId: newVote.id, ideaId: vote.ideaId, voterEmail: vote.voterEmail });
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
        logger.info('Vote deleted', { voteId });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression du vote: ${error}`) };
    }
  }

  // Admin-only methods for complete data access and moderation
  async getAllIdeas(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Idea & { voteCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const page = Math.max(1, options?.page || 1);
      const limit = Math.min(100, Math.max(1, options?.limit || 20));
      const offset = (page - 1) * limit;

      // Count total
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(ideas);

      // Get paginated results
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
        .orderBy(desc(ideas.featured), desc(ideas.createdAt))
        .limit(limit)
        .offset(offset);
      
      const formattedResult = result.map(row => ({
        ...row,
        voteCount: Number(row.voteCount),
      }));

      return { 
        success: true, 
        data: {
          data: formattedResult,
          total: countResult.count,
          page,
          limit
        }
      };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération admin des idées: ${error}`) };
    }
  }

  async getAllEvents(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Event & { inscriptionCount: number; unsubscriptionCount: number })[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const page = Math.max(1, options?.page || 1);
      const limit = Math.min(100, Math.max(1, options?.limit || 20));
      const offset = (page - 1) * limit;

      // Count total
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(events);

      // Get paginated results
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
          unsubscriptionCount: count(unsubscriptions.id),
        })
        .from(events)
        .leftJoin(inscriptions, eq(events.id, inscriptions.eventId))
        .leftJoin(unsubscriptions, eq(events.id, unsubscriptions.eventId))
        .groupBy(events.id)
        .orderBy(desc(events.date))
        .limit(limit)
        .offset(offset);
      
      const formattedResult = result.map(row => ({
        ...row,
        inscriptionCount: Number(row.inscriptionCount),
        unsubscriptionCount: Number(row.unsubscriptionCount),
      }));

      return { 
        success: true, 
        data: {
          data: formattedResult,
          total: countResult.count,
          page,
          limit
        }
      };
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
        
        logger.info('Idea status updated', { ideaId: id, newStatus: status });
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
        
        logger.info('Idea updated', { ideaId: id, title: ideaData.title || 'content modified', updates: Object.keys(ideaData) });
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
        
        logger.info('Idea featured status updated', { ideaId: id, featured: newFeaturedStatus });
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

        logger.info('Idea transformed to event', { ideaId, eventId: newEvent.id, title: newEvent.title });
        return newEvent;
      });

      return { success: true, data: result };
    } catch (error) {
      logger.error('Idea to event transformation failed', { ideaId, error });
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
        
        logger.info('Event status updated', { eventId: id, newStatus: status });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du statut de l'événement: ${error}`) };
    }
  }

  // Development requests methods
  async getDevelopmentRequests(): Promise<Result<DevelopmentRequest[]>> {
    try {
      const requests = await db
        .select()
        .from(developmentRequests)
        .orderBy(desc(developmentRequests.createdAt));
      
      logger.debug('Development requests retrieved', { count: requests.length });
      return { success: true, data: requests };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des demandes de développement: ${error}`) };
    }
  }

  async createDevelopmentRequest(request: InsertDevelopmentRequest): Promise<Result<DevelopmentRequest>> {
    try {
      const result = await db.transaction(async (tx) => {
        const [newRequest] = await tx
          .insert(developmentRequests)
          .values(request)
          .returning();
        
        logger.info('Development request created', { requestId: newRequest.id, title: newRequest.title, requestedBy: request.requestedBy });
        return newRequest;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création de la demande de développement: ${error}`) };
    }
  }

  async updateDevelopmentRequest(id: string, data: Partial<DevelopmentRequest>): Promise<Result<DevelopmentRequest>> {
    try {
      // Check if request exists
      const [existingRequest] = await db
        .select()
        .from(developmentRequests)
        .where(eq(developmentRequests.id, id));

      if (!existingRequest) {
        return { success: false, error: new NotFoundError("Demande de développement introuvable") };
      }

      const result = await db.transaction(async (tx) => {
        const [updatedRequest] = await tx
          .update(developmentRequests)
          .set({ ...data, updatedAt: sql`NOW()` })
          .where(eq(developmentRequests.id, id))
          .returning();

        logger.info('Development request updated', { requestId: id, updates: Object.keys(data) });
        return updatedRequest;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour de la demande de développement: ${error}`) };
    }
  }

  async updateDevelopmentRequestStatus(id: string, status: string, adminComment: string | undefined, updatedBy: string): Promise<Result<DevelopmentRequest>> {
    try {
      // Check if request exists
      const [existingRequest] = await db
        .select()
        .from(developmentRequests)
        .where(eq(developmentRequests.id, id));

      if (!existingRequest) {
        return { success: false, error: new NotFoundError("Demande de développement introuvable") };
      }

      const result = await db.transaction(async (tx) => {
        const [updatedRequest] = await tx
          .update(developmentRequests)
          .set({
            status,
            adminComment,
            lastStatusChangeBy: updatedBy,
            updatedAt: sql`NOW()`
          })
          .where(eq(developmentRequests.id, id))
          .returning();

        logger.info('Development request status updated', { requestId: id, newStatus: status, updatedBy });
        return updatedRequest;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du statut de la demande de développement: ${error}`) };
    }
  }

  async deleteDevelopmentRequest(id: string): Promise<Result<void>> {
    try {
      // Check if request exists
      const [request] = await db
        .select()
        .from(developmentRequests)
        .where(eq(developmentRequests.id, id));

      if (!request) {
        return { success: false, error: new NotFoundError("Demande de développement introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(developmentRequests).where(eq(developmentRequests.id, id));
        logger.info('Development request deleted', { requestId: id });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de la demande de développement: ${error}`) };
    }
  }

  async syncDevelopmentRequestWithGithub(id: string, githubData: { issueNumber: number; issueUrl: string; status: string }): Promise<Result<DevelopmentRequest>> {
    try {
      const result = await db.transaction(async (tx) => {
        const [updatedRequest] = await tx
          .update(developmentRequests)
          .set({
            githubIssueNumber: githubData.issueNumber,
            githubIssueUrl: githubData.issueUrl,
            githubStatus: githubData.status,
            lastSyncedAt: sql`NOW()`,
            updatedAt: sql`NOW()`
          })
          .where(eq(developmentRequests.id, id))
          .returning();

        logger.info('Development request synced with GitHub', { requestId: id, issueNumber: githubData.issueNumber, issueUrl: githubData.issueUrl });
        return updatedRequest;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la synchronisation avec GitHub: ${error}`) };
    }
  }

  // ===== GESTION DES MÉCÈNES (6 méthodes) =====
  
  async createPatron(patron: InsertPatron): Promise<Result<Patron>> {
    try {
      const [newPatron] = await db
        .insert(patrons)
        .values(patron)
        .returning();
      
      logger.info('Patron created', { patronId: newPatron.id, name: `${newPatron.firstName} ${newPatron.lastName}`, email: newPatron.email });
      return { success: true, data: newPatron };
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'patrons_email_unique') {
        return { success: false, error: new DuplicateError("Un mécène avec cet email existe déjà") };
      }
      return { success: false, error: new DatabaseError(`Erreur lors de la création du mécène: ${error}`) };
    }
  }

  async proposePatron(data: InsertPatron): Promise<Result<Patron>> {
    try {
      const existing = await db
        .select()
        .from(patrons)
        .where(eq(patrons.email, data.email))
        .limit(1);

      if (existing.length > 0) {
        logger.warn('Patron already exists', { email: data.email });
        return {
          success: false,
          error: new DuplicateError("Un mécène avec cet email existe déjà"),
        };
      }

      const [newPatron] = await db
        .insert(patrons)
        .values({
          ...data,
          status: "proposed",
        })
        .returning();

      logger.info('Patron proposed', { patronId: newPatron.id, email: data.email });
      return { success: true, data: newPatron };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la proposition du mécène: ${error}`) };
    }
  }

  async getPatrons(options?: { page?: number; limit?: number }): Promise<Result<{
    data: (Patron & { referrer?: { id: string; firstName: string; lastName: string; email: string; company: string | null } | null })[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const page = Math.max(1, options?.page || 1);
      const limit = Math.min(100, Math.max(1, options?.limit || 20));
      const offset = (page - 1) * limit;

      // Count total
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(patrons);

      logger.debug('Patrons retrieved', { limit, offset, page });
      
      // Get paginated results with referrer info
      const patronsList = await db
        .select({
          id: patrons.id,
          firstName: patrons.firstName,
          lastName: patrons.lastName,
          role: patrons.role,
          company: patrons.company,
          phone: patrons.phone,
          email: patrons.email,
          notes: patrons.notes,
          status: patrons.status,
          referrerId: patrons.referrerId,
          createdAt: patrons.createdAt,
          updatedAt: patrons.updatedAt,
          createdBy: patrons.createdBy,
          referrer: {
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            email: members.email,
            company: members.company,
          }
        })
        .from(patrons)
        .leftJoin(members, eq(patrons.referrerId, members.id))
        .orderBy(desc(patrons.createdAt))
        .limit(limit)
        .offset(offset);
      
      return { 
        success: true, 
        data: {
          data: patronsList,
          total: countResult.count,
          page,
          limit
        }
      };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des mécènes: ${error}`) };
    }
  }

  async getPatronById(id: string): Promise<Result<(Patron & { referrer?: { id: string; firstName: string; lastName: string; email: string; company: string | null } | null }) | null>> {
    try {
      logger.debug('Patron retrieved by ID', { patronId: id });
      const [patron] = await db
        .select({
          id: patrons.id,
          firstName: patrons.firstName,
          lastName: patrons.lastName,
          role: patrons.role,
          company: patrons.company,
          phone: patrons.phone,
          email: patrons.email,
          notes: patrons.notes,
          status: patrons.status,
          referrerId: patrons.referrerId,
          createdAt: patrons.createdAt,
          updatedAt: patrons.updatedAt,
          createdBy: patrons.createdBy,
          referrer: {
            id: members.id,
            firstName: members.firstName,
            lastName: members.lastName,
            email: members.email,
            company: members.company,
          }
        })
        .from(patrons)
        .leftJoin(members, eq(patrons.referrerId, members.id))
        .where(eq(patrons.id, id));
      
      return { success: true, data: patron || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération du mécène: ${error}`) };
    }
  }

  async getPatronByEmail(email: string): Promise<Result<Patron | null>> {
    try {
      logger.debug('Patron retrieved by email', { email });
      const [patron] = await db
        .select()
        .from(patrons)
        .where(sql`lower(${patrons.email}) = lower(${email})`);
      
      return { success: true, data: patron || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération du mécène par email: ${error}`) };
    }
  }

  async updatePatron(id: string, data: z.infer<typeof updatePatronSchema>): Promise<Result<Patron>> {
    try {
      const patronResult = await this.getPatronById(id);
      if (!patronResult.success) {
        return { success: false, error: patronResult.error };
      }
      if (!patronResult.data) {
        return { success: false, error: new NotFoundError("Mécène introuvable") };
      }

      const [updatedPatron] = await db
        .update(patrons)
        .set({ 
          ...data,
          updatedAt: sql`NOW()` 
        })
        .where(eq(patrons.id, id))
        .returning();

      logger.info('Patron updated', { patronId: id, updates: Object.keys(data) });
      return { success: true, data: updatedPatron };
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'patrons_email_unique') {
        return { success: false, error: new DuplicateError("Un mécène avec cet email existe déjà") };
      }
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du mécène: ${error}`) };
    }
  }

  async deletePatron(id: string): Promise<Result<void>> {
    try {
      const patronResult = await this.getPatronById(id);
      if (!patronResult.success) {
        return { success: false, error: patronResult.error };
      }
      if (!patronResult.data) {
        return { success: false, error: new NotFoundError("Mécène introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(patrons).where(eq(patrons.id, id));
        logger.info('Patron deleted with cascade', { patronId: id });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression du mécène: ${error}`) };
    }
  }

  // ===== GESTION DES DONS (5 méthodes) =====
  
  async createPatronDonation(donation: InsertPatronDonation): Promise<Result<PatronDonation>> {
    try {
      const donationData = {
        ...donation,
        donatedAt: new Date(donation.donatedAt)
      };

      const [newDonation] = await db
        .insert(patronDonations)
        .values(donationData)
        .returning();
      
      logger.info('Patron donation created', { donationId: newDonation.id, patronId: newDonation.patronId, amount: newDonation.amount, occasion: newDonation.occasion });
      return { success: true, data: newDonation };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création du don: ${error}`) };
    }
  }

  async getPatronDonations(patronId: string): Promise<Result<PatronDonation[]>> {
    try {
      logger.debug('Patron donations retrieved', { patronId });
      const donations = await db
        .select()
        .from(patronDonations)
        .where(eq(patronDonations.patronId, patronId))
        .orderBy(desc(patronDonations.donatedAt));
      
      return { success: true, data: donations };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des dons du mécène: ${error}`) };
    }
  }

  async getAllDonations(): Promise<Result<PatronDonation[]>> {
    try {
      logger.debug('All donations retrieved');
      const donations = await db
        .select()
        .from(patronDonations)
        .orderBy(desc(patronDonations.donatedAt));
      
      return { success: true, data: donations };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des dons: ${error}`) };
    }
  }

  async updatePatronDonation(id: string, data: Partial<InsertPatronDonation>): Promise<Result<PatronDonation>> {
    try {
      const [existingDonation] = await db
        .select()
        .from(patronDonations)
        .where(eq(patronDonations.id, id));

      if (!existingDonation) {
        return { success: false, error: new NotFoundError("Don introuvable") };
      }

      const updateData: any = { ...data };
      if (data.donatedAt) {
        updateData.donatedAt = new Date(data.donatedAt);
      }

      const [updatedDonation] = await db
        .update(patronDonations)
        .set(updateData)
        .where(eq(patronDonations.id, id))
        .returning();

      logger.info('Patron donation updated', { donationId: id, updates: Object.keys(data) });
      return { success: true, data: updatedDonation };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du don: ${error}`) };
    }
  }

  async deletePatronDonation(id: string): Promise<Result<void>> {
    try {
      const [donation] = await db
        .select()
        .from(patronDonations)
        .where(eq(patronDonations.id, id));

      if (!donation) {
        return { success: false, error: new NotFoundError("Don introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(patronDonations).where(eq(patronDonations.id, id));
        logger.info('Patron donation deleted', { donationId: id });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression du don: ${error}`) };
    }
  }

  // ===== GESTION DES ACTUALITÉS MÉCÈNES (4 méthodes) =====
  
  async createPatronUpdate(update: InsertPatronUpdate): Promise<Result<PatronUpdate>> {
    try {
      const [newUpdate] = await db
        .insert(patronUpdates)
        .values(update)
        .returning();
      
      logger.info('Patron update created', { updateId: newUpdate.id, patronId: newUpdate.patronId, type: newUpdate.type, subject: newUpdate.subject });
      return { success: true, data: newUpdate };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création de l'actualité: ${error}`) };
    }
  }

  async getPatronUpdates(patronId: string): Promise<Result<PatronUpdate[]>> {
    try {
      logger.debug('Patron updates retrieved', { patronId });
      const updates = await db
        .select()
        .from(patronUpdates)
        .where(eq(patronUpdates.patronId, patronId))
        .orderBy(desc(patronUpdates.date), desc(patronUpdates.createdAt));
      
      return { success: true, data: updates };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des actualités du mécène: ${error}`) };
    }
  }

  async updatePatronUpdate(id: string, data: Partial<InsertPatronUpdate>): Promise<Result<PatronUpdate>> {
    try {
      const [existingUpdate] = await db
        .select()
        .from(patronUpdates)
        .where(eq(patronUpdates.id, id));

      if (!existingUpdate) {
        return { success: false, error: new NotFoundError("Actualité introuvable") };
      }

      const [updatedUpdate] = await db
        .update(patronUpdates)
        .set({ 
          ...data,
          updatedAt: sql`NOW()` 
        })
        .where(eq(patronUpdates.id, id))
        .returning();

      logger.info('Patron update updated', { updateId: id, updates: Object.keys(data) });
      return { success: true, data: updatedUpdate };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour de l'actualité: ${error}`) };
    }
  }

  async deletePatronUpdate(id: string): Promise<Result<void>> {
    try {
      const [update] = await db
        .select()
        .from(patronUpdates)
        .where(eq(patronUpdates.id, id));

      if (!update) {
        return { success: false, error: new NotFoundError("Actualité introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(patronUpdates).where(eq(patronUpdates.id, id));
        logger.info('Patron update deleted', { updateId: id });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de l'actualité: ${error}`) };
    }
  }

  // ===== GESTION DES PROPOSITIONS MÉCÈNE-IDÉE (5 méthodes) =====
  
  async createIdeaPatronProposal(proposal: InsertIdeaPatronProposal): Promise<Result<IdeaPatronProposal>> {
    try {
      const [newProposal] = await db
        .insert(ideaPatronProposals)
        .values(proposal)
        .returning();
      
      logger.info('Idea-patron proposal created', { proposalId: newProposal.id, ideaId: newProposal.ideaId, patronId: newProposal.patronId });
      return { success: true, data: newProposal };
    } catch (error: any) {
      if (error.code === '23505' && error.constraint === 'idea_patron_proposals_idea_id_patron_id_unique') {
        return { success: false, error: new DuplicateError("Une proposition existe déjà pour ce mécène et cette idée") };
      }
      return { success: false, error: new DatabaseError(`Erreur lors de la création de la proposition: ${error}`) };
    }
  }

  async getIdeaPatronProposals(ideaId: string): Promise<Result<IdeaPatronProposal[]>> {
    try {
      logger.debug('Idea patron proposals retrieved', { ideaId });
      const proposals = await db
        .select()
        .from(ideaPatronProposals)
        .where(eq(ideaPatronProposals.ideaId, ideaId))
        .orderBy(desc(ideaPatronProposals.proposedAt));
      
      return { success: true, data: proposals };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des propositions de l'idée: ${error}`) };
    }
  }

  async getPatronProposals(patronId: string): Promise<Result<IdeaPatronProposal[]>> {
    try {
      logger.debug('Patron proposals retrieved', { patronId });
      const proposals = await db
        .select()
        .from(ideaPatronProposals)
        .where(eq(ideaPatronProposals.patronId, patronId))
        .orderBy(desc(ideaPatronProposals.proposedAt));
      
      return { success: true, data: proposals };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des propositions du mécène: ${error}`) };
    }
  }

  async updateIdeaPatronProposal(id: string, data: z.infer<typeof updateIdeaPatronProposalSchema>): Promise<Result<IdeaPatronProposal>> {
    try {
      const [existingProposal] = await db
        .select()
        .from(ideaPatronProposals)
        .where(eq(ideaPatronProposals.id, id));

      if (!existingProposal) {
        return { success: false, error: new NotFoundError("Proposition introuvable") };
      }

      const [updatedProposal] = await db
        .update(ideaPatronProposals)
        .set({ 
          ...data,
          updatedAt: sql`NOW()` 
        })
        .where(eq(ideaPatronProposals.id, id))
        .returning();

      logger.info('Idea-patron proposal updated', { proposalId: id, newStatus: data.status || 'unchanged', updates: Object.keys(data) });
      return { success: true, data: updatedProposal };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour de la proposition: ${error}`) };
    }
  }

  async deleteIdeaPatronProposal(id: string): Promise<Result<void>> {
    try {
      const [proposal] = await db
        .select()
        .from(ideaPatronProposals)
        .where(eq(ideaPatronProposals.id, id));

      if (!proposal) {
        return { success: false, error: new NotFoundError("Proposition introuvable") };
      }

      await db.transaction(async (tx) => {
        await tx.delete(ideaPatronProposals).where(eq(ideaPatronProposals.id, id));
        logger.info('Idea-patron proposal deleted', { proposalId: id });
      });

      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression de la proposition: ${error}`) };
    }
  }

  async createOrUpdateMember(memberData: Partial<InsertMember> & { email: string }): Promise<Result<Member>> {
    try {
      const [existingMember] = await db
        .select()
        .from(members)
        .where(eq(members.email, memberData.email));

      const now = new Date();

      if (existingMember) {
        const updateData: any = {
          lastActivityAt: now,
          updatedAt: now
        };
        
        if (memberData.firstName !== undefined) updateData.firstName = memberData.firstName;
        if (memberData.lastName !== undefined) updateData.lastName = memberData.lastName;
        if (memberData.company !== undefined) updateData.company = memberData.company;
        if (memberData.phone !== undefined) updateData.phone = memberData.phone;
        if (memberData.role !== undefined) updateData.role = memberData.role;

        const [updatedMember] = await db
          .update(members)
          .set(updateData)
          .where(eq(members.email, memberData.email))
          .returning();

        logger.info('Member updated', { email: memberData.email, updates: Object.keys(memberData) });
        return { success: true, data: updatedMember };
      } else {
        const newMemberData = {
          email: memberData.email,
          firstName: memberData.firstName || '',
          lastName: memberData.lastName || '',
          company: memberData.company,
          phone: memberData.phone,
          role: memberData.role,
          notes: memberData.notes,
          engagementScore: 0,
          firstSeenAt: now,
          lastActivityAt: now,
          activityCount: 0
        };

        const [newMember] = await db
          .insert(members)
          .values(newMemberData)
          .returning();

        logger.info('Member created', { email: memberData.email, name: `${memberData.firstName} ${memberData.lastName}` });
        return { success: true, data: newMember };
      }
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la création/mise à jour du membre: ${error}`) };
    }
  }

  async proposeMember(memberData: Partial<InsertMember> & { email: string; firstName: string; lastName: string; proposedBy: string }): Promise<Result<Member>> {
    try {
      const [existingMember] = await db
        .select()
        .from(members)
        .where(eq(members.email, memberData.email));
      
      if (existingMember) {
        return { success: false, error: new DuplicateError("Un membre avec cet email existe déjà") };
      }
      
      const now = new Date();
      const newMemberData = {
        email: memberData.email,
        firstName: memberData.firstName,
        lastName: memberData.lastName,
        company: memberData.company,
        phone: memberData.phone,
        role: memberData.role,
        notes: memberData.notes,
        status: 'proposed' as const,
        proposedBy: memberData.proposedBy,
        engagementScore: 0,
        firstSeenAt: now,
        lastActivityAt: now,
        activityCount: 0
      };
      
      const [newMember] = await db
        .insert(members)
        .values(newMemberData)
        .returning();
      
      logger.info('Member proposed', { email: memberData.email, proposedBy: memberData.proposedBy, name: `${memberData.firstName} ${memberData.lastName}` });
      return { success: true, data: newMember };
    } catch (error) {
      logger.error('Member proposal failed', { email: memberData.email, error });
      return { success: false, error: new DatabaseError("Erreur lors de la proposition du membre") };
    }
  }

  async getMembers(options?: { page?: number; limit?: number }): Promise<Result<{
    data: Member[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const page = Math.max(1, options?.page || 1);
      const limit = Math.min(100, Math.max(1, options?.limit || 20));
      const offset = (page - 1) * limit;

      // Count total
      const [countResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(members);

      // Get paginated results
      const membersList = await db
        .select()
        .from(members)
        .orderBy(desc(members.lastActivityAt))
        .limit(limit)
        .offset(offset);

      return { 
        success: true, 
        data: {
          data: membersList,
          total: countResult.count,
          page,
          limit
        }
      };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des membres: ${error}`) };
    }
  }

  async getMemberByEmail(email: string): Promise<Result<Member | null>> {
    try {
      const [member] = await db
        .select()
        .from(members)
        .where(eq(members.email, email));

      return { success: true, data: member || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération du membre: ${error}`) };
    }
  }

  async getMemberByCjdRole(cjdRole: string): Promise<Result<Member | null>> {
    try {
      const [member] = await db
        .select()
        .from(members)
        .where(and(
          eq(members.cjdRole, cjdRole),
          eq(members.status, 'active')
        ))
        .limit(1);

      return { success: true, data: member || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération du membre par rôle CJD: ${error}`) };
    }
  }

  async updateMember(email: string, data: z.infer<typeof updateMemberSchema>): Promise<Result<Member>> {
    try {
      const [existingMember] = await db
        .select()
        .from(members)
        .where(eq(members.email, email));

      if (!existingMember) {
        return { success: false, error: new NotFoundError("Membre introuvable") };
      }

      const [updatedMember] = await db
        .update(members)
        .set({
          ...data,
          updatedAt: sql`NOW()`
        })
        .where(eq(members.email, email))
        .returning();

      logger.info('Member updated', { email, updates: Object.keys(data) });
      return { success: true, data: updatedMember };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour du membre: ${error}`) };
    }
  }

  async deleteMember(email: string): Promise<Result<void>> {
    try {
      const [member] = await db
        .select()
        .from(members)
        .where(eq(members.email, email));

      if (!member) {
        return { success: false, error: new NotFoundError("Membre introuvable") };
      }

      await db
        .delete(members)
        .where(eq(members.email, email));

      logger.info('Member deleted', { email });
      return { success: true, data: undefined };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la suppression du membre: ${error}`) };
    }
  }

  async trackMemberActivity(activity: InsertMemberActivity): Promise<Result<MemberActivity>> {
    try {
      const result = await db.transaction(async (tx) => {
        const [newActivity] = await tx
          .insert(memberActivities)
          .values(activity)
          .returning();
        
        await tx
          .update(members)
          .set({
            engagementScore: sql`${members.engagementScore} + ${activity.scoreImpact}`,
            lastActivityAt: newActivity.occurredAt,
            activityCount: sql`${members.activityCount} + 1`,
            updatedAt: sql`NOW()`
          })
          .where(eq(members.email, activity.memberEmail));

        logger.info('Member activity tracked', { memberEmail: activity.memberEmail, activityType: activity.activityType, scoreImpact: activity.scoreImpact, entityType: activity.entityType });
        
        return newActivity;
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de l'enregistrement de l'activité: ${error}`) };
    }
  }

  async getMemberActivities(memberEmail: string): Promise<Result<MemberActivity[]>> {
    try {
      const activities = await db
        .select()
        .from(memberActivities)
        .where(eq(memberActivities.memberEmail, memberEmail))
        .orderBy(desc(memberActivities.occurredAt));

      return { success: true, data: activities };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des activités du membre: ${error}`) };
    }
  }

  async getAllActivities(): Promise<Result<MemberActivity[]>> {
    try {
      const activities = await db
        .select()
        .from(memberActivities)
        .orderBy(desc(memberActivities.occurredAt))
        .limit(500);

      return { success: true, data: activities };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération de toutes les activités: ${error}`) };
    }
  }

  async getSubscriptionsByMember(memberEmail: string): Promise<MemberSubscription[]> {
    return await db.query.memberSubscriptions.findMany({
      where: eq(memberSubscriptions.memberEmail, memberEmail),
      orderBy: [desc(memberSubscriptions.startDate)],
    });
  }

  async createSubscription(subscription: InsertMemberSubscription): Promise<MemberSubscription> {
    const [created] = await db.insert(memberSubscriptions)
      .values(subscription)
      .returning();
    return created;
  }

  // Branding configuration methods
  async getBrandingConfig(): Promise<Result<BrandingConfig | null>> {
    try {
      const [config] = await db.select().from(brandingConfig).limit(1);
      return { success: true, data: config || null };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération de la configuration: ${error}`) };
    }
  }

  async updateBrandingConfig(configStr: string, updatedBy: string): Promise<Result<BrandingConfig>> {
    try {
      // Validate JSON format
      try {
        JSON.parse(configStr);
      } catch {
        return { success: false, error: new ValidationError("La configuration doit être un JSON valide") };
      }

      const result = await db.transaction(async (tx) => {
        // Check if config exists
        const [existing] = await tx.select().from(brandingConfig).limit(1);
        
        if (existing) {
          // Update existing config
          const [updated] = await tx
            .update(brandingConfig)
            .set({
              config: configStr,
              updatedBy,
              updatedAt: sql`NOW()`
            })
            .where(eq(brandingConfig.id, existing.id))
            .returning();
          return updated;
        } else {
          // Insert new config
          const [inserted] = await tx
            .insert(brandingConfig)
            .values({
              config: configStr,
              updatedBy
            })
            .returning();
          return inserted;
        }
      });

      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la mise à jour de la configuration: ${error}`) };
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

  async getAdminStats(): Promise<Result<{
    members: { total: number; active: number; proposed: number; recentActivity: number };
    patrons: { total: number; active: number; proposed: number };
    ideas: { total: number; pending: number; approved: number };
    events: { total: number; upcoming: number };
  }>> {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Requêtes SQL consolidées avec COUNT FILTER (12 → 4 requêtes)
      
      // Membres - 1 seule requête avec COUNT FILTER
      const [membersStats] = await db.select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) FILTER (WHERE ${members.status} = 'active')::int`,
        proposed: sql<number>`count(*) FILTER (WHERE ${members.status} = 'proposed')::int`,
        recentActivity: sql<number>`count(*) FILTER (WHERE ${members.lastActivityAt} >= ${thirtyDaysAgo.toISOString()})::int`,
      }).from(members);

      // Mécènes - 1 seule requête avec COUNT FILTER
      const [patronsStats] = await db.select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) FILTER (WHERE ${patrons.status} = 'active')::int`,
        proposed: sql<number>`count(*) FILTER (WHERE ${patrons.status} = 'proposed')::int`,
      }).from(patrons);

      // Idées - 1 seule requête avec COUNT FILTER
      const [ideasStats] = await db.select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) FILTER (WHERE ${ideas.status} = 'pending')::int`,
        approved: sql<number>`count(*) FILTER (WHERE ${ideas.status} = 'approved')::int`,
      }).from(ideas);

      // Événements - 1 seule requête avec COUNT FILTER
      const [eventsStats] = await db.select({
        total: sql<number>`count(*)::int`,
        upcoming: sql<number>`count(*) FILTER (WHERE ${events.status} = 'published' AND ${events.date} >= ${now.toISOString()})::int`,
      }).from(events);

      return {
        success: true,
        data: {
          members: {
            total: membersStats.total,
            active: membersStats.active,
            proposed: membersStats.proposed,
            recentActivity: membersStats.recentActivity,
          },
          patrons: {
            total: patronsStats.total,
            active: patronsStats.active,
            proposed: patronsStats.proposed,
          },
          ideas: {
            total: ideasStats.total,
            pending: ideasStats.pending,
            approved: ideasStats.approved,
          },
          events: {
            total: eventsStats.total,
            upcoming: eventsStats.upcoming,
          },
        },
      };
    } catch (error) {
      return { success: false, error: new DatabaseError(`Erreur lors de la récupération des statistiques admin: ${error}`) };
    }
  }
}

export const storage = new DatabaseStorage();
