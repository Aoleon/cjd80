"use strict";
// @ts-nocheck
// Ce fichier legacy contient des erreurs TypeScript qui seront corrigées progressivement
// lors de la migration vers les services NestJS
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.DatabaseStorage = void 0;
const schema_1 = require("../shared/schema");
const db_1 = require("./db");
const drizzle_orm_1 = require("drizzle-orm");
const express_session_1 = __importDefault(require("express-session"));
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const db_2 = require("./db");
const logger_1 = require("./lib/logger");
const PostgresSessionStore = (0, connect_pg_simple_1.default)(express_session_1.default);
class DatabaseStorage {
    constructor() {
        // Configuration optimisée du store de sessions
        // PostgresSessionStore nécessite un Pool PostgreSQL standard
        // Si on utilise Neon, on ne peut pas utiliser ce store
        const dbProvider = process.env.DATABASE_URL?.includes('neon.tech') ? 'neon' : 'standard';
        if (dbProvider === 'neon') {
            throw new Error('PostgresSessionStore ne supporte pas Neon. Utilisez un autre store de sessions.');
        }
        this.sessionStore = new PostgresSessionStore({
            pool: db_2.pool,
            createTableIfMissing: false, // Table created manually - avoid async blocking with Bun
            // Optimisations pour les sessions
            tableName: 'user_sessions',
            pruneSessionInterval: 3600, // 1 heure - moins fréquent
            errorLog: (error) => {
                logger_1.logger.error('Session store error', { error });
            },
            // Configuration du schéma
            schemaName: 'public',
            // TTL aligné avec les cookies
            ttl: 24 * 60 * 60 // 24 heures
        });
    }
    // Ultra-robust User methods with Result pattern
    async getUser(email) {
        try {
            const [user] = await db_1.db.select().from(schema_1.admins).where((0, drizzle_orm_1.eq)(schema_1.admins.email, email));
            return { success: true, data: user || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération utilisateur: ${error}`) };
        }
    }
    async getUserByEmail(email) {
        return this.getUser(email); // Delegate to avoid duplication
    }
    async createUser(insertUser) {
        try {
            // Check for duplicate admin
            const existingUser = await this.getUser(insertUser.email);
            if (existingUser.success && existingUser.data) {
                return { success: false, error: new schema_1.DuplicateError("Utilisateur déjà existant") };
            }
            const [user] = await db_1.db
                .insert(schema_1.admins)
                .values(insertUser)
                .returning();
            return { success: true, data: user };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création utilisateur: ${error}`) };
        }
    }
    // Admin management methods
    async getAllAdmins() {
        try {
            const adminsList = await db_1.db
                .select()
                .from(schema_1.admins)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.admins.createdAt));
            return { success: true, data: adminsList };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des administrateurs: ${error}`) };
        }
    }
    async getPendingAdmins() {
        try {
            const pendingAdminsList = await db_1.db
                .select()
                .from(schema_1.admins)
                .where((0, drizzle_orm_1.eq)(schema_1.admins.status, "pending"))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.admins.createdAt));
            return { success: true, data: pendingAdminsList };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des comptes en attente: ${error}`) };
        }
    }
    async approveAdmin(email, role) {
        try {
            const [updatedAdmin] = await db_1.db
                .update(schema_1.admins)
                .set({
                status: "active",
                role,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email))
                .returning();
            if (!updatedAdmin) {
                return { success: false, error: new schema_1.NotFoundError("Administrateur non trouvé") };
            }
            return { success: true, data: updatedAdmin };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de l'approbation du compte: ${error}`) };
        }
    }
    async updateAdminRole(email, role) {
        try {
            const [updatedAdmin] = await db_1.db
                .update(schema_1.admins)
                .set({
                role,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email))
                .returning();
            if (!updatedAdmin) {
                return { success: false, error: new schema_1.NotFoundError("Administrateur non trouvé") };
            }
            return { success: true, data: updatedAdmin };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du rôle: ${error}`) };
        }
    }
    async updateAdminStatus(email, isActive) {
        try {
            const [updatedAdmin] = await db_1.db
                .update(schema_1.admins)
                .set({
                isActive,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email))
                .returning();
            if (!updatedAdmin) {
                return { success: false, error: new schema_1.NotFoundError("Administrateur non trouvé") };
            }
            return { success: true, data: updatedAdmin };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du statut: ${error}`) };
        }
    }
    async updateAdminInfo(email, info) {
        try {
            const [updatedAdmin] = await db_1.db
                .update(schema_1.admins)
                .set({
                firstName: info.firstName,
                lastName: info.lastName,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email))
                .returning();
            if (!updatedAdmin) {
                return { success: false, error: new schema_1.NotFoundError("Administrateur non trouvé") };
            }
            return { success: true, data: updatedAdmin };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour des informations: ${error}`) };
        }
    }
    async updateAdminPassword(email, hashedPassword) {
        try {
            const result = await db_1.db
                .update(schema_1.admins)
                .set({
                password: hashedPassword,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email));
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du mot de passe: ${error}`) };
        }
    }
    async deleteAdmin(email) {
        try {
            const result = await db_1.db
                .delete(schema_1.admins)
                .where((0, drizzle_orm_1.eq)(schema_1.admins.email, email))
                .returning();
            if (result.length === 0) {
                return { success: false, error: new schema_1.NotFoundError("Administrateur introuvable") };
            }
            logger_1.logger.info('Admin deleted', { email });
            return { success: true, data: undefined };
        }
        catch (error) {
            logger_1.logger.error('Admin deletion failed', { email, error });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de l'administrateur: ${error}`) };
        }
    }
    // Ultra-robust Ideas methods with Result pattern and business validation
    async getIdeas(options) {
        try {
            const page = Math.max(1, options?.page || 1);
            const limit = Math.min(100, Math.max(1, options?.limit || 20));
            const offset = (page - 1) * limit;
            // Count total
            const [countResult] = await db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.ideas)
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.ideas.status, 'approved'), (0, drizzle_orm_1.eq)(schema_1.ideas.status, 'completed')));
            // Get paginated results
            const result = await db_1.db
                .select({
                id: schema_1.ideas.id,
                title: schema_1.ideas.title,
                description: schema_1.ideas.description,
                proposedBy: schema_1.ideas.proposedBy,
                proposedByEmail: schema_1.ideas.proposedByEmail,
                status: schema_1.ideas.status,
                featured: schema_1.ideas.featured,
                deadline: schema_1.ideas.deadline,
                createdAt: schema_1.ideas.createdAt,
                updatedAt: schema_1.ideas.updatedAt,
                updatedBy: schema_1.ideas.updatedBy,
                voteCount: (0, drizzle_orm_1.count)(schema_1.votes.id),
            })
                .from(schema_1.ideas)
                .leftJoin(schema_1.votes, (0, drizzle_orm_1.eq)(schema_1.ideas.id, schema_1.votes.ideaId))
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.ideas.status, 'approved'), (0, drizzle_orm_1.eq)(schema_1.ideas.status, 'completed')))
                .groupBy(schema_1.ideas.id)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.ideas.featured), (0, drizzle_orm_1.asc)((0, drizzle_orm_1.sql) `CASE WHEN ${schema_1.ideas.status} = 'approved' THEN 0 WHEN ${schema_1.ideas.status} = 'completed' THEN 1 ELSE 2 END`), (0, drizzle_orm_1.desc)(schema_1.ideas.createdAt))
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
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des idées: ${error}`) };
        }
    }
    async getIdea(id) {
        try {
            const [idea] = await db_1.db.select().from(schema_1.ideas).where((0, drizzle_orm_1.eq)(schema_1.ideas.id, id));
            return { success: true, data: idea || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de l'idée: ${error}`) };
        }
    }
    async isDuplicateIdea(title) {
        try {
            const [existing] = await db_1.db
                .select({ id: schema_1.ideas.id })
                .from(schema_1.ideas)
                .where((0, drizzle_orm_1.eq)(schema_1.ideas.title, title))
                .limit(1);
            return !!existing;
        }
        catch (error) {
            logger_1.logger.error('Duplicate idea check failed', { title, error });
            return false; // Fail safe - allow creation
        }
    }
    async createIdea(idea) {
        try {
            // Business validation: Check for duplicate
            if (await this.isDuplicateIdea(idea.title)) {
                return { success: false, error: new schema_1.DuplicateError("Une idée avec ce titre existe déjà") };
            }
            // Prepare data with proper date conversion
            const ideaData = {
                ...idea,
                deadline: idea.deadline ? new Date(idea.deadline) : undefined
            };
            // Transaction for atomic operation
            const result = await db_1.db.transaction(async (tx) => {
                const [newIdea] = await tx
                    .insert(schema_1.ideas)
                    .values([ideaData])
                    .returning();
                // Log audit trail
                logger_1.logger.info('Idea created', { ideaId: newIdea.id, proposedBy: idea.proposedBy, title: newIdea.title });
                return newIdea;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de l'idée: ${error}`) };
        }
    }
    async deleteIdea(id) {
        try {
            // Check if idea exists
            const ideaResult = await this.getIdea(id);
            if (!ideaResult.success) {
                return { success: false, error: ideaResult.error };
            }
            if (!ideaResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Idée introuvable") };
            }
            // Transaction for atomic deletion (cascade will handle votes)
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.ideas).where((0, drizzle_orm_1.eq)(schema_1.ideas.id, id));
                logger_1.logger.info('Idea deleted', { ideaId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de l'idée: ${error}`) };
        }
    }
    // Ultra-robust Votes methods with Result pattern
    async getVotesByIdea(ideaId) {
        try {
            const votesList = await db_1.db.select().from(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.ideaId, ideaId)).orderBy((0, drizzle_orm_1.desc)(schema_1.votes.createdAt));
            return { success: true, data: votesList };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des votes: ${error}`) };
        }
    }
    async hasUserVoted(ideaId, email) {
        const [existingVote] = await db_1.db
            .select()
            .from(schema_1.votes)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.ideaId, ideaId), (0, drizzle_orm_1.eq)(schema_1.votes.voterEmail, email)));
        return !!existingVote;
    }
    // Ultra-robust Events methods with Result pattern and business validation
    async getEvents(options) {
        try {
            const page = Math.max(1, options?.page || 1);
            const limit = Math.min(100, Math.max(1, options?.limit || 20));
            const offset = (page - 1) * limit;
            // Count total
            const [countResult] = await db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.events)
                .where((0, drizzle_orm_1.sql) `${schema_1.events.date} > NOW()`);
            // Get paginated results
            const result = await db_1.db
                .select({
                id: schema_1.events.id,
                title: schema_1.events.title,
                description: schema_1.events.description,
                date: schema_1.events.date,
                location: schema_1.events.location,
                maxParticipants: schema_1.events.maxParticipants,
                helloAssoLink: schema_1.events.helloAssoLink,
                enableExternalRedirect: schema_1.events.enableExternalRedirect,
                externalRedirectUrl: schema_1.events.externalRedirectUrl,
                showInscriptionsCount: schema_1.events.showInscriptionsCount,
                showAvailableSeats: schema_1.events.showAvailableSeats,
                allowUnsubscribe: schema_1.events.allowUnsubscribe,
                redUnsubscribeButton: schema_1.events.redUnsubscribeButton,
                buttonMode: schema_1.events.buttonMode,
                customButtonText: schema_1.events.customButtonText,
                status: schema_1.events.status,
                createdAt: schema_1.events.createdAt,
                updatedAt: schema_1.events.updatedAt,
                updatedBy: schema_1.events.updatedBy,
                inscriptionCount: (0, drizzle_orm_1.count)(schema_1.inscriptions.id),
            })
                .from(schema_1.events)
                .leftJoin(schema_1.inscriptions, (0, drizzle_orm_1.eq)(schema_1.events.id, schema_1.inscriptions.eventId))
                .where((0, drizzle_orm_1.sql) `${schema_1.events.date} > NOW()`)
                .groupBy(schema_1.events.id)
                .orderBy(schema_1.events.date)
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
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des événements: ${error}`) };
        }
    }
    async getEvent(id) {
        try {
            const [event] = await db_1.db.select().from(schema_1.events).where((0, drizzle_orm_1.eq)(schema_1.events.id, id));
            return { success: true, data: event || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de l'événement: ${error}`) };
        }
    }
    async isDuplicateEvent(title, date) {
        try {
            const [existing] = await db_1.db
                .select({ id: schema_1.events.id })
                .from(schema_1.events)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.events.title, title), (0, drizzle_orm_1.eq)(schema_1.events.date, (0, drizzle_orm_1.sql) `${date.toISOString()}::timestamp`)))
                .limit(1);
            return !!existing;
        }
        catch (error) {
            logger_1.logger.error('Duplicate event check failed', { title, date, error });
            return false; // Fail safe - allow creation
        }
    }
    async createEvent(event) {
        try {
            // Convert date string to Date object
            const eventDate = new Date(event.date);
            // Business validation: Check for duplicate event (same title and date)
            if (await this.isDuplicateEvent(event.title, eventDate)) {
                return { success: false, error: new schema_1.DuplicateError("Un événement avec ce titre et cette date existe déjà") };
            }
            // Validate date is in the future
            if (eventDate <= new Date()) {
                return { success: false, error: new schema_1.ValidationError("La date de l'événement doit être dans le futur") };
            }
            // Prepare data with proper date conversion
            const eventData = {
                ...event,
                date: eventDate
            };
            const result = await db_1.db.transaction(async (tx) => {
                const [newEvent] = await tx
                    .insert(schema_1.events)
                    .values([eventData])
                    .returning();
                logger_1.logger.info('Event created', { eventId: newEvent.id, title: newEvent.title, date: newEvent.date });
                return newEvent;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de l'événement: ${error}`) };
        }
    }
    async createEventWithInscriptions(event, initialInscriptions) {
        try {
            // Convert date string to Date object
            const eventDate = new Date(event.date);
            // Business validation: Check for duplicate event (same title and date)
            if (await this.isDuplicateEvent(event.title, eventDate)) {
                return { success: false, error: new schema_1.DuplicateError("Un événement avec ce titre et cette date existe déjà") };
            }
            // Validate date is in the future
            if (eventDate <= new Date()) {
                return { success: false, error: new schema_1.ValidationError("La date de l'événement doit être dans le futur") };
            }
            // Validate max participants limit if set
            if (event.maxParticipants && initialInscriptions.length > event.maxParticipants) {
                return {
                    success: false,
                    error: new schema_1.ValidationError(`Le nombre d'inscriptions initiales (${initialInscriptions.length}) dépasse la limite de participants (${event.maxParticipants})`)
                };
            }
            // Check for duplicate emails in initial inscriptions
            const emails = initialInscriptions.map(i => i.email.toLowerCase());
            const uniqueEmails = new Set(emails);
            if (emails.length !== uniqueEmails.size) {
                return {
                    success: false,
                    error: new schema_1.ValidationError("Les inscriptions initiales contiennent des emails en double")
                };
            }
            // Prepare data with proper date conversion
            const eventData = {
                ...event,
                date: eventDate
            };
            // Transaction for atomic operation - either all succeeds or all fails
            const result = await db_1.db.transaction(async (tx) => {
                // 1. Create the event
                const [newEvent] = await tx
                    .insert(schema_1.events)
                    .values([eventData])
                    .returning();
                logger_1.logger.info('Event created with transaction', { eventId: newEvent.id, title: newEvent.title });
                // 2. Create all initial inscriptions
                const createdInscriptions = [];
                if (initialInscriptions.length > 0) {
                    // Add eventId to each inscription
                    const inscriptionsWithEventId = initialInscriptions.map(inscription => ({
                        ...inscription,
                        eventId: newEvent.id
                    }));
                    const newInscriptions = await tx
                        .insert(schema_1.inscriptions)
                        .values(inscriptionsWithEventId)
                        .returning();
                    createdInscriptions.push(...newInscriptions);
                    logger_1.logger.info('Initial inscriptions created', {
                        eventId: newEvent.id,
                        count: newInscriptions.length
                    });
                }
                return { event: newEvent, inscriptions: createdInscriptions };
            });
            logger_1.logger.info('Event with inscriptions created successfully', {
                eventId: result.event.id,
                inscriptionsCount: result.inscriptions.length
            });
            return { success: true, data: result };
        }
        catch (error) {
            logger_1.logger.error('Event with inscriptions creation failed', { error });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de l'événement avec inscriptions: ${error}`) };
        }
    }
    async updateEvent(id, eventData) {
        try {
            logger_1.logger.info('UpdateEvent called', { id, eventData });
            // Check if event exists
            const eventResult = await this.getEvent(id);
            if (!eventResult.success) {
                logger_1.logger.error('UpdateEvent: getEvent failed', { error: eventResult.error });
                return { success: false, error: eventResult.error };
            }
            if (!eventResult.data) {
                logger_1.logger.error('UpdateEvent: event not found', { id });
                return { success: false, error: new schema_1.NotFoundError("Événement introuvable") };
            }
            // Validate date if being updated
            if (eventData.date && new Date(eventData.date) <= new Date()) {
                logger_1.logger.error('UpdateEvent: date validation failed', { date: eventData.date });
                return { success: false, error: new schema_1.ValidationError("La date de l'événement doit être dans le futur") };
            }
            const result = await db_1.db.transaction(async (tx) => {
                const formattedData = {
                    ...eventData,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                    updatedBy: "admin" // Could be improved with actual user
                };
                // Convert date string to Date object if present
                if (eventData.date) {
                    formattedData.date = new Date(eventData.date);
                }
                logger_1.logger.info('UpdateEvent: executing update', { id, formattedData });
                const [updatedEvent] = await tx
                    .update(schema_1.events)
                    .set(formattedData)
                    .where((0, drizzle_orm_1.eq)(schema_1.events.id, id))
                    .returning();
                logger_1.logger.info('UpdateEvent: update returned', { updatedEvent });
                if (!updatedEvent) {
                    throw new Error("Aucune ligne mise à jour");
                }
                return updatedEvent;
            });
            logger_1.logger.info('Event updated successfully', { eventId: id, updates: Object.keys(eventData) });
            return { success: true, data: result };
        }
        catch (error) {
            logger_1.logger.error('UpdateEvent failed with exception', { error, message: String(error) });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de l'événement: ${error}`) };
        }
    }
    async deleteEvent(id) {
        try {
            // Check if event exists
            const eventResult = await this.getEvent(id);
            if (!eventResult.success) {
                return { success: false, error: eventResult.error };
            }
            if (!eventResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Événement introuvable") };
            }
            // Transaction for atomic deletion (cascade will handle inscriptions)
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.events).where((0, drizzle_orm_1.eq)(schema_1.events.id, id));
                logger_1.logger.info('Event deleted', { eventId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de l'événement: ${error}`) };
        }
    }
    // Ultra-robust Inscriptions methods with Result pattern
    async getEventInscriptions(eventId) {
        try {
            const inscriptionsList = await db_1.db.select().from(schema_1.inscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.inscriptions.eventId, eventId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.inscriptions.createdAt));
            return { success: true, data: inscriptionsList };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des inscriptions: ${error}`) };
        }
    }
    // Ultra-robust Votes methods with Result pattern
    async getIdeaVotes(ideaId) {
        try {
            const votesList = await db_1.db.select().from(schema_1.votes)
                .where((0, drizzle_orm_1.eq)(schema_1.votes.ideaId, ideaId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.votes.createdAt));
            return { success: true, data: votesList };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des votes: ${error}`) };
        }
    }
    async createInscription(inscription) {
        try {
            // Business validation: Check for duplicate registration
            if (await this.hasUserRegistered(inscription.eventId, inscription.email)) {
                return { success: false, error: new schema_1.DuplicateError("Vous êtes déjà inscrit à cet événement") };
            }
            // Check if event exists
            const eventResult = await this.getEvent(inscription.eventId);
            if (!eventResult.success) {
                return { success: false, error: eventResult.error };
            }
            if (!eventResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Événement introuvable") };
            }
            // Check participant limit if set
            if (eventResult.data.maxParticipants) {
                const currentInscriptionsResult = await this.getEventInscriptions(inscription.eventId);
                if (currentInscriptionsResult.success) {
                    const currentCount = currentInscriptionsResult.data.length;
                    if (currentCount >= eventResult.data.maxParticipants) {
                        return {
                            success: false,
                            error: new schema_1.ValidationError(`L'événement est complet (${eventResult.data.maxParticipants} participants maximum)`)
                        };
                    }
                }
            }
            const result = await db_1.db.transaction(async (tx) => {
                const [newInscription] = await tx
                    .insert(schema_1.inscriptions)
                    .values([inscription])
                    .returning();
                logger_1.logger.info('Event registration created', { inscriptionId: newInscription.id, eventId: inscription.eventId, name: inscription.name });
                return newInscription;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de l'inscription: ${error}`) };
        }
    }
    async hasUserRegistered(eventId, email) {
        const [existingInscription] = await db_1.db
            .select()
            .from(schema_1.inscriptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inscriptions.eventId, eventId), (0, drizzle_orm_1.eq)(schema_1.inscriptions.email, email)));
        return !!existingInscription;
    }
    async unsubscribeFromEvent(eventId, name, email) {
        try {
            // Check if user is registered for this event with exact name and email
            const [inscription] = await db_1.db
                .select()
                .from(schema_1.inscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inscriptions.eventId, eventId), (0, drizzle_orm_1.eq)(schema_1.inscriptions.email, email), (0, drizzle_orm_1.eq)(schema_1.inscriptions.name, name)));
            if (!inscription) {
                return { success: false, error: new schema_1.NotFoundError("Inscription introuvable avec ce nom et cet email") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx
                    .delete(schema_1.inscriptions)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.inscriptions.eventId, eventId), (0, drizzle_orm_1.eq)(schema_1.inscriptions.email, email), (0, drizzle_orm_1.eq)(schema_1.inscriptions.name, name)));
                logger_1.logger.info('Event unregistration', { eventId, name, email });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la désinscription: ${error}`) };
        }
    }
    async deleteInscription(inscriptionId) {
        try {
            // Check if inscription exists
            const [inscription] = await db_1.db
                .select()
                .from(schema_1.inscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.inscriptions.id, inscriptionId));
            if (!inscription) {
                return { success: false, error: new schema_1.NotFoundError("Inscription introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.inscriptions).where((0, drizzle_orm_1.eq)(schema_1.inscriptions.id, inscriptionId));
                logger_1.logger.info('Event registration deleted', { inscriptionId });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de l'inscription: ${error}`) };
        }
    }
    async getEventUnsubscriptions(eventId) {
        try {
            const result = await db_1.db
                .select()
                .from(schema_1.unsubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.unsubscriptions.eventId, eventId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.unsubscriptions.createdAt));
            logger_1.logger.debug('Event unsubscriptions retrieved', { eventId, count: result.length });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des absences: ${error}`) };
        }
    }
    async createUnsubscription(unsubscription) {
        try {
            // Check if user has already declared absence for this event
            const [existingUnsubscription] = await db_1.db
                .select()
                .from(schema_1.unsubscriptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.unsubscriptions.eventId, unsubscription.eventId), (0, drizzle_orm_1.eq)(schema_1.unsubscriptions.email, unsubscription.email)));
            if (existingUnsubscription) {
                return { success: false, error: new schema_1.DuplicateError("Vous avez déjà déclaré votre absence pour cet événement") };
            }
            // Check if event exists
            const eventResult = await this.getEvent(unsubscription.eventId);
            if (!eventResult.success) {
                return { success: false, error: eventResult.error };
            }
            if (!eventResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Événement introuvable") };
            }
            const result = await db_1.db.transaction(async (tx) => {
                const [newUnsubscription] = await tx
                    .insert(schema_1.unsubscriptions)
                    .values([unsubscription])
                    .returning();
                logger_1.logger.info('Event unsubscription created', { unsubscriptionId: newUnsubscription.id, eventId: unsubscription.eventId, name: unsubscription.name });
                return newUnsubscription;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la déclaration d'absence: ${error}`) };
        }
    }
    async deleteUnsubscription(id) {
        try {
            // Check if unsubscription exists
            const [unsubscription] = await db_1.db
                .select()
                .from(schema_1.unsubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.unsubscriptions.id, id));
            if (!unsubscription) {
                return { success: false, error: new schema_1.NotFoundError("Déclaration d'absence introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.unsubscriptions).where((0, drizzle_orm_1.eq)(schema_1.unsubscriptions.id, id));
                logger_1.logger.info('Event unsubscription deleted', { unsubscriptionId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de la déclaration d'absence: ${error}`) };
        }
    }
    async updateUnsubscription(id, data) {
        try {
            // Check if unsubscription exists
            const [existingUnsubscription] = await db_1.db
                .select()
                .from(schema_1.unsubscriptions)
                .where((0, drizzle_orm_1.eq)(schema_1.unsubscriptions.id, id));
            if (!existingUnsubscription) {
                return { success: false, error: new schema_1.NotFoundError("Déclaration d'absence introuvable") };
            }
            const result = await db_1.db.transaction(async (tx) => {
                const [updatedUnsubscription] = await tx
                    .update(schema_1.unsubscriptions)
                    .set(data)
                    .where((0, drizzle_orm_1.eq)(schema_1.unsubscriptions.id, id))
                    .returning();
                logger_1.logger.info('Event unsubscription updated', { unsubscriptionId: id, updates: Object.keys(data) });
                return updatedUnsubscription;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la modification de la déclaration d'absence: ${error}`) };
        }
    }
    async createVote(vote) {
        try {
            // Check for duplicate vote
            const [existingVote] = await db_1.db
                .select()
                .from(schema_1.votes)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.votes.ideaId, vote.ideaId), (0, drizzle_orm_1.eq)(schema_1.votes.voterEmail, vote.voterEmail)));
            if (existingVote) {
                return { success: false, error: new schema_1.DuplicateError("Vous avez déjà voté pour cette idée") };
            }
            // Check if idea exists
            const ideaResult = await this.getIdea(vote.ideaId);
            if (!ideaResult.success) {
                return { success: false, error: ideaResult.error };
            }
            if (!ideaResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Idée introuvable") };
            }
            const result = await db_1.db.transaction(async (tx) => {
                const [newVote] = await tx
                    .insert(schema_1.votes)
                    .values([vote])
                    .returning();
                logger_1.logger.info('Vote created', { voteId: newVote.id, ideaId: vote.ideaId, voterEmail: vote.voterEmail });
                return newVote;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création du vote: ${error}`) };
        }
    }
    async deleteVote(voteId) {
        try {
            // Check if vote exists
            const [vote] = await db_1.db
                .select()
                .from(schema_1.votes)
                .where((0, drizzle_orm_1.eq)(schema_1.votes.id, voteId));
            if (!vote) {
                return { success: false, error: new schema_1.NotFoundError("Vote introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.votes).where((0, drizzle_orm_1.eq)(schema_1.votes.id, voteId));
                logger_1.logger.info('Vote deleted', { voteId });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du vote: ${error}`) };
        }
    }
    // Admin-only methods for complete data access and moderation
    async getAllIdeas(options) {
        try {
            const page = Math.max(1, options?.page || 1);
            const limit = Math.min(100, Math.max(1, options?.limit || 20));
            const offset = (page - 1) * limit;
            // Count total
            const [countResult] = await db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.ideas);
            // Get paginated results
            const result = await db_1.db
                .select({
                id: schema_1.ideas.id,
                title: schema_1.ideas.title,
                description: schema_1.ideas.description,
                proposedBy: schema_1.ideas.proposedBy,
                proposedByEmail: schema_1.ideas.proposedByEmail,
                status: schema_1.ideas.status,
                featured: schema_1.ideas.featured,
                deadline: schema_1.ideas.deadline,
                createdAt: schema_1.ideas.createdAt,
                updatedAt: schema_1.ideas.updatedAt,
                updatedBy: schema_1.ideas.updatedBy,
                voteCount: (0, drizzle_orm_1.count)(schema_1.votes.id),
            })
                .from(schema_1.ideas)
                .leftJoin(schema_1.votes, (0, drizzle_orm_1.eq)(schema_1.ideas.id, schema_1.votes.ideaId))
                .groupBy(schema_1.ideas.id)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.ideas.featured), (0, drizzle_orm_1.desc)(schema_1.ideas.createdAt))
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
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération admin des idées: ${error}`) };
        }
    }
    async getAllEvents(options) {
        try {
            const page = Math.max(1, options?.page || 1);
            const limit = Math.min(100, Math.max(1, options?.limit || 20));
            const offset = (page - 1) * limit;
            // Count total
            const [countResult] = await db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.events);
            // Get paginated results
            const result = await db_1.db
                .select({
                id: schema_1.events.id,
                title: schema_1.events.title,
                description: schema_1.events.description,
                date: schema_1.events.date,
                location: schema_1.events.location,
                maxParticipants: schema_1.events.maxParticipants,
                helloAssoLink: schema_1.events.helloAssoLink,
                enableExternalRedirect: schema_1.events.enableExternalRedirect,
                externalRedirectUrl: schema_1.events.externalRedirectUrl,
                showInscriptionsCount: schema_1.events.showInscriptionsCount,
                showAvailableSeats: schema_1.events.showAvailableSeats,
                allowUnsubscribe: schema_1.events.allowUnsubscribe,
                redUnsubscribeButton: schema_1.events.redUnsubscribeButton,
                buttonMode: schema_1.events.buttonMode,
                customButtonText: schema_1.events.customButtonText,
                status: schema_1.events.status,
                createdAt: schema_1.events.createdAt,
                updatedAt: schema_1.events.updatedAt,
                updatedBy: schema_1.events.updatedBy,
                inscriptionCount: (0, drizzle_orm_1.count)(schema_1.inscriptions.id),
                unsubscriptionCount: (0, drizzle_orm_1.count)(schema_1.unsubscriptions.id),
            })
                .from(schema_1.events)
                .leftJoin(schema_1.inscriptions, (0, drizzle_orm_1.eq)(schema_1.events.id, schema_1.inscriptions.eventId))
                .leftJoin(schema_1.unsubscriptions, (0, drizzle_orm_1.eq)(schema_1.events.id, schema_1.unsubscriptions.eventId))
                .groupBy(schema_1.events.id)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.events.date))
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
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération admin des événements: ${error}`) };
        }
    }
    async updateIdeaStatus(id, status) {
        try {
            // Check if idea exists
            const ideaResult = await this.getIdea(id);
            if (!ideaResult.success) {
                return { success: false, error: ideaResult.error };
            }
            if (!ideaResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Idée introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx
                    .update(schema_1.ideas)
                    .set({
                    status,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                    updatedBy: "admin"
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.ideas.id, id));
                logger_1.logger.info('Idea status updated', { ideaId: id, newStatus: status });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du statut de l'idée: ${error}`) };
        }
    }
    async updateIdea(id, ideaData) {
        try {
            // Check if idea exists
            const ideaResult = await this.getIdea(id);
            if (!ideaResult.success) {
                return { success: false, error: ideaResult.error };
            }
            if (!ideaResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Idée introuvable") };
            }
            // Check for duplicate title if title is being updated
            if (ideaData.title && ideaData.title !== ideaResult.data.title) {
                if (await this.isDuplicateIdea(ideaData.title)) {
                    return { success: false, error: new schema_1.DuplicateError("Une idée avec ce titre existe déjà") };
                }
            }
            const result = await db_1.db.transaction(async (tx) => {
                // Prepare update data with proper date conversion
                const updateData = {
                    ...ideaData,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                    updatedBy: "admin"
                };
                // Convert createdAt string to Date object if provided
                if (ideaData.createdAt) {
                    updateData.createdAt = new Date(ideaData.createdAt);
                }
                const [updatedIdea] = await tx
                    .update(schema_1.ideas)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.ideas.id, id))
                    .returning();
                logger_1.logger.info('Idea updated', { ideaId: id, title: ideaData.title || 'content modified', updates: Object.keys(ideaData) });
                return updatedIdea;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de l'idée: ${error}`) };
        }
    }
    async toggleIdeaFeatured(id) {
        try {
            // Check if idea exists
            const ideaResult = await this.getIdea(id);
            if (!ideaResult.success) {
                return { success: false, error: ideaResult.error };
            }
            if (!ideaResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Idée introuvable") };
            }
            const newFeaturedStatus = !ideaResult.data.featured;
            await db_1.db.transaction(async (tx) => {
                await tx
                    .update(schema_1.ideas)
                    .set({
                    featured: newFeaturedStatus,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                    updatedBy: "admin"
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.ideas.id, id));
                logger_1.logger.info('Idea featured status updated', { ideaId: id, featured: newFeaturedStatus });
            });
            return { success: true, data: newFeaturedStatus };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du featured de l'idée: ${error}`) };
        }
    }
    async transformIdeaToEvent(ideaId) {
        try {
            // Récupérer l'idée source
            const ideaResult = await this.getIdea(ideaId);
            if (!ideaResult.success) {
                return { success: false, error: ideaResult.error };
            }
            if (!ideaResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Idée introuvable") };
            }
            const idea = ideaResult.data;
            // Vérifier que l'idée peut être transformée (approuvée ou réalisée)
            if (idea.status !== schema_1.IDEA_STATUS.APPROVED && idea.status !== schema_1.IDEA_STATUS.COMPLETED) {
                return { success: false, error: new schema_1.ValidationError("Seules les idées approuvées ou réalisées peuvent être transformées en événements") };
            }
            // Créer l'événement dans une transaction
            const result = await db_1.db.transaction(async (tx) => {
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
                    status: schema_1.EVENT_STATUS.DRAFT, // Créer en brouillon pour permettre les modifications
                    updatedBy: "admin"
                };
                const [newEvent] = await tx
                    .insert(schema_1.events)
                    .values([eventData])
                    .returning();
                // Marquer l'idée comme réalisée si elle ne l'est pas déjà
                if (idea.status !== schema_1.IDEA_STATUS.COMPLETED) {
                    await tx
                        .update(schema_1.ideas)
                        .set({
                        status: schema_1.IDEA_STATUS.COMPLETED,
                        updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                        updatedBy: "admin"
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.ideas.id, ideaId));
                }
                logger_1.logger.info('Idea transformed to event', { ideaId, eventId: newEvent.id, title: newEvent.title });
                return newEvent;
            });
            return { success: true, data: result };
        }
        catch (error) {
            logger_1.logger.error('Idea to event transformation failed', { ideaId, error });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la transformation de l'idée en événement: ${error}`) };
        }
    }
    async updateEventStatus(id, status) {
        try {
            // Check if event exists
            const eventResult = await this.getEvent(id);
            if (!eventResult.success) {
                return { success: false, error: eventResult.error };
            }
            if (!eventResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Événement introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx
                    .update(schema_1.events)
                    .set({
                    status,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
                    updatedBy: "admin"
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.events.id, id));
                logger_1.logger.info('Event status updated', { eventId: id, newStatus: status });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du statut de l'événement: ${error}`) };
        }
    }
    // Development requests methods
    async getDevelopmentRequests() {
        try {
            // Utiliser runDbQuery avec profil 'background' - timeout 15s avec retry
            const requests = await (0, db_1.runDbQuery)(async () => db_1.db
                .select()
                .from(schema_1.developmentRequests)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.developmentRequests.createdAt)), 'background');
            logger_1.logger.debug('Development requests retrieved', { count: requests.length });
            return { success: true, data: requests };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des demandes de développement: ${error}`) };
        }
    }
    async createDevelopmentRequest(request) {
        try {
            const result = await db_1.db.transaction(async (tx) => {
                const [newRequest] = await tx
                    .insert(schema_1.developmentRequests)
                    .values(request)
                    .returning();
                logger_1.logger.info('Development request created', { requestId: newRequest.id, title: newRequest.title, requestedBy: request.requestedBy });
                return newRequest;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la demande de développement: ${error}`) };
        }
    }
    async updateDevelopmentRequest(id, data) {
        try {
            // Check if request exists
            const [existingRequest] = await db_1.db
                .select()
                .from(schema_1.developmentRequests)
                .where((0, drizzle_orm_1.eq)(schema_1.developmentRequests.id, id));
            if (!existingRequest) {
                return { success: false, error: new schema_1.NotFoundError("Demande de développement introuvable") };
            }
            const result = await db_1.db.transaction(async (tx) => {
                const [updatedRequest] = await tx
                    .update(schema_1.developmentRequests)
                    .set({ ...data, updatedAt: (0, drizzle_orm_1.sql) `NOW()` })
                    .where((0, drizzle_orm_1.eq)(schema_1.developmentRequests.id, id))
                    .returning();
                logger_1.logger.info('Development request updated', { requestId: id, updates: Object.keys(data) });
                return updatedRequest;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la demande de développement: ${error}`) };
        }
    }
    async updateDevelopmentRequestStatus(id, status, adminComment, updatedBy) {
        try {
            // Check if request exists
            const [existingRequest] = await db_1.db
                .select()
                .from(schema_1.developmentRequests)
                .where((0, drizzle_orm_1.eq)(schema_1.developmentRequests.id, id));
            if (!existingRequest) {
                return { success: false, error: new schema_1.NotFoundError("Demande de développement introuvable") };
            }
            const result = await db_1.db.transaction(async (tx) => {
                const [updatedRequest] = await tx
                    .update(schema_1.developmentRequests)
                    .set({
                    status,
                    adminComment,
                    lastStatusChangeBy: updatedBy,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.developmentRequests.id, id))
                    .returning();
                logger_1.logger.info('Development request status updated', { requestId: id, newStatus: status, updatedBy });
                return updatedRequest;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du statut de la demande de développement: ${error}`) };
        }
    }
    async deleteDevelopmentRequest(id) {
        try {
            // Check if request exists
            const [request] = await db_1.db
                .select()
                .from(schema_1.developmentRequests)
                .where((0, drizzle_orm_1.eq)(schema_1.developmentRequests.id, id));
            if (!request) {
                return { success: false, error: new schema_1.NotFoundError("Demande de développement introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.developmentRequests).where((0, drizzle_orm_1.eq)(schema_1.developmentRequests.id, id));
                logger_1.logger.info('Development request deleted', { requestId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de la demande de développement: ${error}`) };
        }
    }
    async syncDevelopmentRequestWithGithub(id, githubData) {
        try {
            const result = await db_1.db.transaction(async (tx) => {
                const [updatedRequest] = await tx
                    .update(schema_1.developmentRequests)
                    .set({
                    githubIssueNumber: githubData.issueNumber,
                    githubIssueUrl: githubData.issueUrl,
                    githubStatus: githubData.status,
                    lastSyncedAt: (0, drizzle_orm_1.sql) `NOW()`,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.developmentRequests.id, id))
                    .returning();
                logger_1.logger.info('Development request synced with GitHub', { requestId: id, issueNumber: githubData.issueNumber, issueUrl: githubData.issueUrl });
                return updatedRequest;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la synchronisation avec GitHub: ${error}`) };
        }
    }
    // ===== GESTION DES MÉCÈNES (6 méthodes) =====
    async createPatron(patron) {
        try {
            const [newPatron] = await db_1.db
                .insert(schema_1.patrons)
                .values(patron)
                .returning();
            logger_1.logger.info('Patron created', { patronId: newPatron.id, name: `${newPatron.firstName} ${newPatron.lastName}`, email: newPatron.email });
            return { success: true, data: newPatron };
        }
        catch (error) {
            if (error.code === '23505' && error.constraint === 'patrons_email_unique') {
                return { success: false, error: new schema_1.DuplicateError("Un mécène avec cet email existe déjà") };
            }
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création du mécène: ${error}`) };
        }
    }
    async proposePatron(data) {
        try {
            const existing = await db_1.db
                .select()
                .from(schema_1.patrons)
                .where((0, drizzle_orm_1.eq)(schema_1.patrons.email, data.email))
                .limit(1);
            if (existing.length > 0) {
                logger_1.logger.warn('Patron already exists', { email: data.email });
                return {
                    success: false,
                    error: new schema_1.DuplicateError("Un mécène avec cet email existe déjà"),
                };
            }
            const [newPatron] = await db_1.db
                .insert(schema_1.patrons)
                .values({
                ...data,
                status: "proposed",
            })
                .returning();
            logger_1.logger.info('Patron proposed', { patronId: newPatron.id, email: data.email });
            return { success: true, data: newPatron };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la proposition du mécène: ${error}`) };
        }
    }
    async getPatrons(options) {
        try {
            const page = Math.max(1, options?.page || 1);
            const limit = Math.min(100, Math.max(1, options?.limit || 20));
            const offset = (page - 1) * limit;
            // Construire les conditions WHERE
            const conditions = [];
            // Filtre par statut
            if (options?.status && options.status !== 'all') {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.patrons.status, options.status));
            }
            // Filtre de recherche textuelle
            if (options?.search && options.search.trim()) {
                const searchTerm = `%${options.search.toLowerCase()}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.patrons.firstName, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.patrons.lastName, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.patrons.email, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.patrons.company, searchTerm)));
            }
            // Construire la clause WHERE
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            // Count total avec filtres
            const countQuery = db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.patrons);
            const [countResult] = whereClause
                ? await countQuery.where(whereClause)
                : await countQuery;
            logger_1.logger.debug('Patrons retrieved', { limit, offset, page, filters: { status: options?.status, search: options?.search } });
            // Get paginated results with referrer info
            const patronsQuery = db_1.db
                .select({
                id: schema_1.patrons.id,
                firstName: schema_1.patrons.firstName,
                lastName: schema_1.patrons.lastName,
                role: schema_1.patrons.role,
                company: schema_1.patrons.company,
                phone: schema_1.patrons.phone,
                email: schema_1.patrons.email,
                notes: schema_1.patrons.notes,
                status: schema_1.patrons.status,
                referrerId: schema_1.patrons.referrerId,
                createdAt: schema_1.patrons.createdAt,
                updatedAt: schema_1.patrons.updatedAt,
                createdBy: schema_1.patrons.createdBy,
                referrer: {
                    id: schema_1.members.id,
                    firstName: schema_1.members.firstName,
                    lastName: schema_1.members.lastName,
                    email: schema_1.members.email,
                    company: schema_1.members.company,
                }
            })
                .from(schema_1.patrons)
                .leftJoin(schema_1.members, (0, drizzle_orm_1.eq)(schema_1.patrons.referrerId, schema_1.members.id))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.patrons.createdAt))
                .limit(limit)
                .offset(offset);
            const patronsList = whereClause
                ? await patronsQuery.where(whereClause)
                : await patronsQuery;
            return {
                success: true,
                data: {
                    data: patronsList,
                    total: countResult.count,
                    page,
                    limit
                }
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des mécènes: ${error}`) };
        }
    }
    async getPatronById(id) {
        try {
            logger_1.logger.debug('Patron retrieved by ID', { patronId: id });
            const [patron] = await db_1.db
                .select({
                id: schema_1.patrons.id,
                firstName: schema_1.patrons.firstName,
                lastName: schema_1.patrons.lastName,
                role: schema_1.patrons.role,
                company: schema_1.patrons.company,
                phone: schema_1.patrons.phone,
                email: schema_1.patrons.email,
                notes: schema_1.patrons.notes,
                status: schema_1.patrons.status,
                referrerId: schema_1.patrons.referrerId,
                createdAt: schema_1.patrons.createdAt,
                updatedAt: schema_1.patrons.updatedAt,
                createdBy: schema_1.patrons.createdBy,
                referrer: {
                    id: schema_1.members.id,
                    firstName: schema_1.members.firstName,
                    lastName: schema_1.members.lastName,
                    email: schema_1.members.email,
                    company: schema_1.members.company,
                }
            })
                .from(schema_1.patrons)
                .leftJoin(schema_1.members, (0, drizzle_orm_1.eq)(schema_1.patrons.referrerId, schema_1.members.id))
                .where((0, drizzle_orm_1.eq)(schema_1.patrons.id, id));
            return { success: true, data: patron || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération du mécène: ${error}`) };
        }
    }
    async getPatronByEmail(email) {
        try {
            logger_1.logger.debug('Patron retrieved by email', { email });
            const [patron] = await db_1.db
                .select()
                .from(schema_1.patrons)
                .where((0, drizzle_orm_1.sql) `lower(${schema_1.patrons.email}) = lower(${email})`);
            return { success: true, data: patron || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération du mécène par email: ${error}`) };
        }
    }
    async updatePatron(id, data) {
        try {
            const patronResult = await this.getPatronById(id);
            if (!patronResult.success) {
                return { success: false, error: patronResult.error };
            }
            if (!patronResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Mécène introuvable") };
            }
            const [updatedPatron] = await db_1.db
                .update(schema_1.patrons)
                .set({
                ...data,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.patrons.id, id))
                .returning();
            logger_1.logger.info('Patron updated', { patronId: id, updates: Object.keys(data) });
            return { success: true, data: updatedPatron };
        }
        catch (error) {
            if (error.code === '23505' && error.constraint === 'patrons_email_unique') {
                return { success: false, error: new schema_1.DuplicateError("Un mécène avec cet email existe déjà") };
            }
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du mécène: ${error}`) };
        }
    }
    async deletePatron(id) {
        try {
            const patronResult = await this.getPatronById(id);
            if (!patronResult.success) {
                return { success: false, error: patronResult.error };
            }
            if (!patronResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Mécène introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.patrons).where((0, drizzle_orm_1.eq)(schema_1.patrons.id, id));
                logger_1.logger.info('Patron deleted with cascade', { patronId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du mécène: ${error}`) };
        }
    }
    // ===== GESTION DES DONS (5 méthodes) =====
    async createPatronDonation(donation) {
        try {
            const donationData = {
                ...donation,
                donatedAt: new Date(donation.donatedAt)
            };
            const [newDonation] = await db_1.db
                .insert(schema_1.patronDonations)
                .values(donationData)
                .returning();
            logger_1.logger.info('Patron donation created', { donationId: newDonation.id, patronId: newDonation.patronId, amount: newDonation.amount, occasion: newDonation.occasion });
            return { success: true, data: newDonation };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création du don: ${error}`) };
        }
    }
    async getPatronDonations(patronId) {
        try {
            logger_1.logger.debug('Patron donations retrieved', { patronId });
            const donations = await db_1.db
                .select()
                .from(schema_1.patronDonations)
                .where((0, drizzle_orm_1.eq)(schema_1.patronDonations.patronId, patronId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.patronDonations.donatedAt));
            return { success: true, data: donations };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des dons du mécène: ${error}`) };
        }
    }
    async getAllDonations() {
        try {
            logger_1.logger.debug('All donations retrieved');
            const donations = await db_1.db
                .select()
                .from(schema_1.patronDonations)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.patronDonations.donatedAt));
            return { success: true, data: donations };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des dons: ${error}`) };
        }
    }
    async updatePatronDonation(id, data) {
        try {
            const [existingDonation] = await db_1.db
                .select()
                .from(schema_1.patronDonations)
                .where((0, drizzle_orm_1.eq)(schema_1.patronDonations.id, id));
            if (!existingDonation) {
                return { success: false, error: new schema_1.NotFoundError("Don introuvable") };
            }
            const updateData = { ...data };
            if (data.donatedAt) {
                updateData.donatedAt = new Date(data.donatedAt);
            }
            const [updatedDonation] = await db_1.db
                .update(schema_1.patronDonations)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.patronDonations.id, id))
                .returning();
            logger_1.logger.info('Patron donation updated', { donationId: id, updates: Object.keys(data) });
            return { success: true, data: updatedDonation };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du don: ${error}`) };
        }
    }
    async deletePatronDonation(id) {
        try {
            const [donation] = await db_1.db
                .select()
                .from(schema_1.patronDonations)
                .where((0, drizzle_orm_1.eq)(schema_1.patronDonations.id, id));
            if (!donation) {
                return { success: false, error: new schema_1.NotFoundError("Don introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.patronDonations).where((0, drizzle_orm_1.eq)(schema_1.patronDonations.id, id));
                logger_1.logger.info('Patron donation deleted', { donationId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du don: ${error}`) };
        }
    }
    // ===== GESTION DES ACTUALITÉS MÉCÈNES (4 méthodes) =====
    async createPatronUpdate(update) {
        try {
            const [newUpdate] = await db_1.db
                .insert(schema_1.patronUpdates)
                .values(update)
                .returning();
            logger_1.logger.info('Patron update created', { updateId: newUpdate.id, patronId: newUpdate.patronId, type: newUpdate.type, subject: newUpdate.subject });
            return { success: true, data: newUpdate };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de l'actualité: ${error}`) };
        }
    }
    async getPatronUpdates(patronId) {
        try {
            logger_1.logger.debug('Patron updates retrieved', { patronId });
            const updates = await db_1.db
                .select()
                .from(schema_1.patronUpdates)
                .where((0, drizzle_orm_1.eq)(schema_1.patronUpdates.patronId, patronId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.patronUpdates.date), (0, drizzle_orm_1.desc)(schema_1.patronUpdates.createdAt));
            return { success: true, data: updates };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des actualités du mécène: ${error}`) };
        }
    }
    async updatePatronUpdate(id, data) {
        try {
            const [existingUpdate] = await db_1.db
                .select()
                .from(schema_1.patronUpdates)
                .where((0, drizzle_orm_1.eq)(schema_1.patronUpdates.id, id));
            if (!existingUpdate) {
                return { success: false, error: new schema_1.NotFoundError("Actualité introuvable") };
            }
            const [updatedUpdate] = await db_1.db
                .update(schema_1.patronUpdates)
                .set({
                ...data,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.patronUpdates.id, id))
                .returning();
            logger_1.logger.info('Patron update updated', { updateId: id, updates: Object.keys(data) });
            return { success: true, data: updatedUpdate };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de l'actualité: ${error}`) };
        }
    }
    async deletePatronUpdate(id) {
        try {
            const [update] = await db_1.db
                .select()
                .from(schema_1.patronUpdates)
                .where((0, drizzle_orm_1.eq)(schema_1.patronUpdates.id, id));
            if (!update) {
                return { success: false, error: new schema_1.NotFoundError("Actualité introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.patronUpdates).where((0, drizzle_orm_1.eq)(schema_1.patronUpdates.id, id));
                logger_1.logger.info('Patron update deleted', { updateId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de l'actualité: ${error}`) };
        }
    }
    // ===== GESTION DES PROPOSITIONS MÉCÈNE-IDÉE (5 méthodes) =====
    async createIdeaPatronProposal(proposal) {
        try {
            const [newProposal] = await db_1.db
                .insert(schema_1.ideaPatronProposals)
                .values(proposal)
                .returning();
            logger_1.logger.info('Idea-patron proposal created', { proposalId: newProposal.id, ideaId: newProposal.ideaId, patronId: newProposal.patronId });
            return { success: true, data: newProposal };
        }
        catch (error) {
            if (error.code === '23505' && error.constraint === 'idea_patron_proposals_idea_id_patron_id_unique') {
                return { success: false, error: new schema_1.DuplicateError("Une proposition existe déjà pour ce mécène et cette idée") };
            }
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la proposition: ${error}`) };
        }
    }
    async getIdeaPatronProposals(ideaId) {
        try {
            logger_1.logger.debug('Idea patron proposals retrieved', { ideaId });
            const proposals = await db_1.db
                .select()
                .from(schema_1.ideaPatronProposals)
                .where((0, drizzle_orm_1.eq)(schema_1.ideaPatronProposals.ideaId, ideaId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.ideaPatronProposals.proposedAt));
            return { success: true, data: proposals };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des propositions de l'idée: ${error}`) };
        }
    }
    async getPatronProposals(patronId) {
        try {
            logger_1.logger.debug('Patron proposals retrieved', { patronId });
            const proposals = await db_1.db
                .select()
                .from(schema_1.ideaPatronProposals)
                .where((0, drizzle_orm_1.eq)(schema_1.ideaPatronProposals.patronId, patronId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.ideaPatronProposals.proposedAt));
            return { success: true, data: proposals };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des propositions du mécène: ${error}`) };
        }
    }
    async updateIdeaPatronProposal(id, data) {
        try {
            const [existingProposal] = await db_1.db
                .select()
                .from(schema_1.ideaPatronProposals)
                .where((0, drizzle_orm_1.eq)(schema_1.ideaPatronProposals.id, id));
            if (!existingProposal) {
                return { success: false, error: new schema_1.NotFoundError("Proposition introuvable") };
            }
            const [updatedProposal] = await db_1.db
                .update(schema_1.ideaPatronProposals)
                .set({
                ...data,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.ideaPatronProposals.id, id))
                .returning();
            logger_1.logger.info('Idea-patron proposal updated', { proposalId: id, newStatus: data.status || 'unchanged', updates: Object.keys(data) });
            return { success: true, data: updatedProposal };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la proposition: ${error}`) };
        }
    }
    async deleteIdeaPatronProposal(id) {
        try {
            const [proposal] = await db_1.db
                .select()
                .from(schema_1.ideaPatronProposals)
                .where((0, drizzle_orm_1.eq)(schema_1.ideaPatronProposals.id, id));
            if (!proposal) {
                return { success: false, error: new schema_1.NotFoundError("Proposition introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.ideaPatronProposals).where((0, drizzle_orm_1.eq)(schema_1.ideaPatronProposals.id, id));
                logger_1.logger.info('Idea-patron proposal deleted', { proposalId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de la proposition: ${error}`) };
        }
    }
    // ===== GESTION DES SPONSORINGS ÉVÉNEMENTS (7 méthodes) =====
    async createEventSponsorship(sponsorship) {
        try {
            const sponsorshipData = {
                ...sponsorship,
            };
            if (sponsorship.confirmedAt) {
                sponsorshipData.confirmedAt = new Date(sponsorship.confirmedAt);
            }
            const [newSponsorship] = await db_1.db
                .insert(schema_1.eventSponsorships)
                .values(sponsorshipData)
                .returning();
            logger_1.logger.info('Event sponsorship created', {
                sponsorshipId: newSponsorship.id,
                eventId: newSponsorship.eventId,
                patronId: newSponsorship.patronId,
                level: newSponsorship.level,
                amount: newSponsorship.amount
            });
            return { success: true, data: newSponsorship };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création du sponsoring: ${error}`) };
        }
    }
    async getEventSponsorships(eventId) {
        try {
            const sponsorships = await db_1.db
                .select()
                .from(schema_1.eventSponsorships)
                .where((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.eventId, eventId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.eventSponsorships.createdAt));
            logger_1.logger.debug('Event sponsorships retrieved', { eventId, count: sponsorships.length });
            return { success: true, data: sponsorships };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des sponsorings de l'événement: ${error}`) };
        }
    }
    async getPublicEventSponsorships(eventId) {
        try {
            const sponsorships = await db_1.db
                .select({
                id: schema_1.eventSponsorships.id,
                eventId: schema_1.eventSponsorships.eventId,
                patronId: schema_1.eventSponsorships.patronId,
                level: schema_1.eventSponsorships.level,
                amount: schema_1.eventSponsorships.amount,
                benefits: schema_1.eventSponsorships.benefits,
                isPubliclyVisible: schema_1.eventSponsorships.isPubliclyVisible,
                status: schema_1.eventSponsorships.status,
                logoUrl: schema_1.eventSponsorships.logoUrl,
                websiteUrl: schema_1.eventSponsorships.websiteUrl,
                proposedByAdminEmail: schema_1.eventSponsorships.proposedByAdminEmail,
                confirmedAt: schema_1.eventSponsorships.confirmedAt,
                createdAt: schema_1.eventSponsorships.createdAt,
                updatedAt: schema_1.eventSponsorships.updatedAt,
                patronFirstName: schema_1.patrons.firstName,
                patronLastName: schema_1.patrons.lastName,
                patronCompany: schema_1.patrons.company,
            })
                .from(schema_1.eventSponsorships)
                .innerJoin(schema_1.patrons, (0, drizzle_orm_1.eq)(schema_1.eventSponsorships.patronId, schema_1.patrons.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.eventId, eventId), (0, drizzle_orm_1.eq)(schema_1.eventSponsorships.isPubliclyVisible, true), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.status, 'confirmed'), (0, drizzle_orm_1.eq)(schema_1.eventSponsorships.status, 'completed'))))
                .orderBy((0, drizzle_orm_1.sql) `CASE ${schema_1.eventSponsorships.level}
            WHEN 'platinum' THEN 1
            WHEN 'gold' THEN 2
            WHEN 'silver' THEN 3
            WHEN 'bronze' THEN 4
            WHEN 'partner' THEN 5
            ELSE 6
          END`);
            logger_1.logger.debug('Public event sponsorships retrieved', { eventId, count: sponsorships.length });
            return { success: true, data: sponsorships };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des sponsorings publics de l'événement: ${error}`) };
        }
    }
    async getPatronSponsorships(patronId) {
        try {
            const sponsorships = await db_1.db
                .select()
                .from(schema_1.eventSponsorships)
                .where((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.patronId, patronId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.eventSponsorships.createdAt));
            logger_1.logger.debug('Patron sponsorships retrieved', { patronId, count: sponsorships.length });
            return { success: true, data: sponsorships };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des sponsorings du mécène: ${error}`) };
        }
    }
    async getAllSponsorships() {
        try {
            const sponsorships = await db_1.db
                .select()
                .from(schema_1.eventSponsorships)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.eventSponsorships.createdAt));
            logger_1.logger.debug('All sponsorships retrieved', { count: sponsorships.length });
            return { success: true, data: sponsorships };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des sponsorings: ${error}`) };
        }
    }
    async updateEventSponsorship(id, data) {
        try {
            const [existingSponsorship] = await db_1.db
                .select()
                .from(schema_1.eventSponsorships)
                .where((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.id, id));
            if (!existingSponsorship) {
                return { success: false, error: new schema_1.NotFoundError("Sponsoring introuvable") };
            }
            const updateData = { ...data };
            if (data.confirmedAt !== undefined) {
                updateData.confirmedAt = data.confirmedAt ? new Date(data.confirmedAt) : null;
            }
            const [updatedSponsorship] = await db_1.db
                .update(schema_1.eventSponsorships)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.id, id))
                .returning();
            logger_1.logger.info('Event sponsorship updated', { sponsorshipId: id, updates: Object.keys(data) });
            return { success: true, data: updatedSponsorship };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du sponsoring: ${error}`) };
        }
    }
    async deleteEventSponsorship(id) {
        try {
            const [sponsorship] = await db_1.db
                .select()
                .from(schema_1.eventSponsorships)
                .where((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.id, id));
            if (!sponsorship) {
                return { success: false, error: new schema_1.NotFoundError("Sponsoring introuvable") };
            }
            await db_1.db.transaction(async (tx) => {
                await tx.delete(schema_1.eventSponsorships).where((0, drizzle_orm_1.eq)(schema_1.eventSponsorships.id, id));
                logger_1.logger.info('Event sponsorship deleted', { sponsorshipId: id });
            });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du sponsoring: ${error}`) };
        }
    }
    async getSponsorshipStats() {
        try {
            const allSponsorships = await db_1.db
                .select()
                .from(schema_1.eventSponsorships);
            const totalSponsorships = allSponsorships.length;
            const totalAmount = allSponsorships.reduce((sum, s) => sum + s.amount, 0);
            // Group by level
            const levelMap = new Map();
            allSponsorships.forEach(s => {
                const current = levelMap.get(s.level) || { count: 0, totalAmount: 0 };
                levelMap.set(s.level, {
                    count: current.count + 1,
                    totalAmount: current.totalAmount + s.amount
                });
            });
            const sponsorshipsByLevel = Array.from(levelMap.entries()).map(([level, stats]) => ({
                level,
                ...stats
            }));
            // Group by status
            const statusMap = new Map();
            allSponsorships.forEach(s => {
                statusMap.set(s.status, (statusMap.get(s.status) || 0) + 1);
            });
            const sponsorshipsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
                status,
                count
            }));
            logger_1.logger.debug('Sponsorship stats calculated', { totalSponsorships, totalAmount });
            return {
                success: true,
                data: {
                    totalSponsorships,
                    totalAmount,
                    sponsorshipsByLevel,
                    sponsorshipsByStatus
                }
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors du calcul des statistiques de sponsoring: ${error}`) };
        }
    }
    async createOrUpdateMember(memberData) {
        try {
            const [existingMember] = await db_1.db
                .select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.eq)(schema_1.members.email, memberData.email));
            const now = new Date();
            if (existingMember) {
                const updateData = {
                    lastActivityAt: now,
                    updatedAt: now
                };
                if (memberData.firstName !== undefined)
                    updateData.firstName = memberData.firstName;
                if (memberData.lastName !== undefined)
                    updateData.lastName = memberData.lastName;
                if (memberData.company !== undefined)
                    updateData.company = memberData.company;
                if (memberData.phone !== undefined)
                    updateData.phone = memberData.phone;
                if (memberData.role !== undefined)
                    updateData.role = memberData.role;
                const [updatedMember] = await db_1.db
                    .update(schema_1.members)
                    .set(updateData)
                    .where((0, drizzle_orm_1.eq)(schema_1.members.email, memberData.email))
                    .returning();
                logger_1.logger.info('Member updated', { email: memberData.email, updates: Object.keys(memberData) });
                return { success: true, data: updatedMember };
            }
            else {
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
                const [newMember] = await db_1.db
                    .insert(schema_1.members)
                    .values(newMemberData)
                    .returning();
                logger_1.logger.info('Member created', { email: memberData.email, name: `${memberData.firstName} ${memberData.lastName}` });
                return { success: true, data: newMember };
            }
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création/mise à jour du membre: ${error}`) };
        }
    }
    async proposeMember(memberData) {
        try {
            const [existingMember] = await db_1.db
                .select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.eq)(schema_1.members.email, memberData.email));
            if (existingMember) {
                return { success: false, error: new schema_1.DuplicateError("Un membre avec cet email existe déjà") };
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
                status: 'proposed',
                proposedBy: memberData.proposedBy,
                engagementScore: 0,
                firstSeenAt: now,
                lastActivityAt: now,
                activityCount: 0
            };
            const [newMember] = await db_1.db
                .insert(schema_1.members)
                .values(newMemberData)
                .returning();
            logger_1.logger.info('Member proposed', { email: memberData.email, proposedBy: memberData.proposedBy, name: `${memberData.firstName} ${memberData.lastName}` });
            return { success: true, data: newMember };
        }
        catch (error) {
            logger_1.logger.error('Member proposal failed', { email: memberData.email, error });
            return { success: false, error: new schema_1.DatabaseError("Erreur lors de la proposition du membre") };
        }
    }
    async getMembers(options) {
        try {
            const page = Math.max(1, options?.page || 1);
            const limit = Math.min(100, Math.max(1, options?.limit || 20));
            const offset = (page - 1) * limit;
            // Construire les conditions WHERE
            const conditions = [];
            // Filtre par statut
            if (options?.status && options.status !== 'all') {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.members.status, options.status));
            }
            // Filtre de recherche textuelle
            if (options?.search && options.search.trim()) {
                const searchTerm = `%${options.search.toLowerCase()}%`;
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.ilike)(schema_1.members.firstName, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.members.lastName, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.members.email, searchTerm), (0, drizzle_orm_1.ilike)(schema_1.members.company, searchTerm)));
            }
            // Filtre par score d'engagement
            if (options?.score) {
                if (options.score === 'high') {
                    conditions.push((0, drizzle_orm_1.sql) `${schema_1.members.engagementScore} >= 50`);
                }
                else if (options.score === 'medium') {
                    conditions.push((0, drizzle_orm_1.sql) `${schema_1.members.engagementScore} >= 10 AND ${schema_1.members.engagementScore} < 50`);
                }
                else if (options.score === 'low') {
                    conditions.push((0, drizzle_orm_1.sql) `${schema_1.members.engagementScore} < 10`);
                }
            }
            // Filtre par activité récente
            if (options?.activity) {
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                if (options.activity === 'recent') {
                    conditions.push((0, drizzle_orm_1.sql) `${schema_1.members.lastActivityAt} >= ${thirtyDaysAgo.toISOString()}`);
                }
                else if (options.activity === 'inactive') {
                    conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.sql) `${schema_1.members.lastActivityAt} < ${thirtyDaysAgo.toISOString()}`, (0, drizzle_orm_1.sql) `${schema_1.members.lastActivityAt} IS NULL`));
                }
            }
            // Construire la clause WHERE
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            // Count total avec filtres
            const countQuery = db_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)::int` })
                .from(schema_1.members);
            const [countResult] = whereClause
                ? await countQuery.where(whereClause)
                : await countQuery;
            // Get paginated results avec filtres
            const membersQuery = db_1.db
                .select()
                .from(schema_1.members)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.members.lastActivityAt))
                .limit(limit)
                .offset(offset);
            const membersList = whereClause
                ? await membersQuery.where(whereClause)
                : await membersQuery;
            return {
                success: true,
                data: {
                    data: membersList,
                    total: countResult.count,
                    page,
                    limit
                }
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des membres: ${error}`) };
        }
    }
    async getMemberByEmail(email) {
        try {
            const [member] = await db_1.db
                .select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.eq)(schema_1.members.email, email));
            return { success: true, data: member || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération du membre: ${error}`) };
        }
    }
    async getMemberByCjdRole(cjdRole) {
        try {
            const [member] = await db_1.db
                .select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.members.cjdRole, cjdRole), (0, drizzle_orm_1.eq)(schema_1.members.status, 'active')))
                .limit(1);
            return { success: true, data: member || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération du membre par rôle CJD: ${error}`) };
        }
    }
    async getMemberDetails(email) {
        try {
            // Récupérer le membre
            const memberResult = await this.getMemberByEmail(email);
            if (!memberResult.success || !memberResult.data) {
                return { success: false, error: new schema_1.NotFoundError("Membre introuvable") };
            }
            // Récupérer les activités
            const activitiesResult = await this.getMemberActivities(email);
            if (!activitiesResult.success) {
                return { success: false, error: activitiesResult.error };
            }
            // Récupérer les souscriptions
            const subscriptions = await this.getSubscriptionsByMember(email);
            return {
                success: true,
                data: {
                    member: memberResult.data,
                    activities: activitiesResult.data,
                    subscriptions,
                }
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des détails du membre: ${error}`) };
        }
    }
    async updateMember(email, data) {
        try {
            const [existingMember] = await db_1.db
                .select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.eq)(schema_1.members.email, email));
            if (!existingMember) {
                return { success: false, error: new schema_1.NotFoundError("Membre introuvable") };
            }
            const [updatedMember] = await db_1.db
                .update(schema_1.members)
                .set({
                ...data,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.members.email, email))
                .returning();
            logger_1.logger.info('Member updated', { email, updates: Object.keys(data) });
            return { success: true, data: updatedMember };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du membre: ${error}`) };
        }
    }
    async deleteMember(email) {
        try {
            const [member] = await db_1.db
                .select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.eq)(schema_1.members.email, email));
            if (!member) {
                return { success: false, error: new schema_1.NotFoundError("Membre introuvable") };
            }
            await db_1.db
                .delete(schema_1.members)
                .where((0, drizzle_orm_1.eq)(schema_1.members.email, email));
            logger_1.logger.info('Member deleted', { email });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du membre: ${error}`) };
        }
    }
    async trackMemberActivity(activity) {
        try {
            const result = await db_1.db.transaction(async (tx) => {
                const [newActivity] = await tx
                    .insert(schema_1.memberActivities)
                    .values(activity)
                    .returning();
                await tx
                    .update(schema_1.members)
                    .set({
                    engagementScore: (0, drizzle_orm_1.sql) `${schema_1.members.engagementScore} + ${activity.scoreImpact}`,
                    lastActivityAt: newActivity.occurredAt,
                    activityCount: (0, drizzle_orm_1.sql) `${schema_1.members.activityCount} + 1`,
                    updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                })
                    .where((0, drizzle_orm_1.eq)(schema_1.members.email, activity.memberEmail));
                logger_1.logger.info('Member activity tracked', { memberEmail: activity.memberEmail, activityType: activity.activityType, scoreImpact: activity.scoreImpact, entityType: activity.entityType });
                return newActivity;
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de l'enregistrement de l'activité: ${error}`) };
        }
    }
    async getMemberActivities(memberEmail) {
        try {
            const activities = await db_1.db
                .select()
                .from(schema_1.memberActivities)
                .where((0, drizzle_orm_1.eq)(schema_1.memberActivities.memberEmail, memberEmail))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.memberActivities.occurredAt));
            return { success: true, data: activities };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des activités du membre: ${error}`) };
        }
    }
    async getAllActivities() {
        try {
            const activities = await db_1.db
                .select()
                .from(schema_1.memberActivities)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.memberActivities.occurredAt))
                .limit(500);
            return { success: true, data: activities };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de toutes les activités: ${error}`) };
        }
    }
    async getSubscriptionsByMember(memberEmail) {
        return await db_1.db.query.memberSubscriptions.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.memberSubscriptions.memberEmail, memberEmail),
            orderBy: [(0, drizzle_orm_1.desc)(schema_1.memberSubscriptions.startDate)],
        });
    }
    async createSubscription(subscription) {
        const [created] = await db_1.db.insert(schema_1.memberSubscriptions)
            .values(subscription)
            .returning();
        return created;
    }
    // Member Tags implementation
    async getAllTags() {
        try {
            const tags = await db_1.db.select().from(schema_1.memberTags).orderBy((0, drizzle_orm_1.asc)(schema_1.memberTags.name));
            return { success: true, data: tags };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des tags: ${error}`) };
        }
    }
    async createTag(tag) {
        try {
            const [created] = await db_1.db.insert(schema_1.memberTags)
                .values(tag)
                .returning();
            logger_1.logger.info('Tag créé', { tagId: created.id, name: created.name });
            return { success: true, data: created };
        }
        catch (error) {
            if (error instanceof Error && error.message.includes('unique')) {
                return { success: false, error: new schema_1.DuplicateError('Un tag avec ce nom existe déjà') };
            }
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création du tag: ${error}`) };
        }
    }
    async updateTag(tagId, data) {
        try {
            const [updated] = await db_1.db.update(schema_1.memberTags)
                .set(data)
                .where((0, drizzle_orm_1.eq)(schema_1.memberTags.id, tagId))
                .returning();
            if (!updated) {
                return { success: false, error: new schema_1.NotFoundError('Tag non trouvé') };
            }
            logger_1.logger.info('Tag mis à jour', { tagId, updates: Object.keys(data) });
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du tag: ${error}`) };
        }
    }
    async deleteTag(tagId) {
        try {
            await db_1.db.delete(schema_1.memberTags).where((0, drizzle_orm_1.eq)(schema_1.memberTags.id, tagId));
            logger_1.logger.info('Tag supprimé', { tagId });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du tag: ${error}`) };
        }
    }
    async getTagsByMember(memberEmail) {
        try {
            const tags = await db_1.db.select({
                id: schema_1.memberTags.id,
                name: schema_1.memberTags.name,
                color: schema_1.memberTags.color,
                description: schema_1.memberTags.description,
                createdAt: schema_1.memberTags.createdAt,
            })
                .from(schema_1.memberTags)
                .innerJoin(schema_1.memberTagAssignments, (0, drizzle_orm_1.eq)(schema_1.memberTags.id, schema_1.memberTagAssignments.tagId))
                .where((0, drizzle_orm_1.eq)(schema_1.memberTagAssignments.memberEmail, memberEmail))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.memberTags.name));
            return { success: true, data: tags };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des tags du membre: ${error}`) };
        }
    }
    async assignTagToMember(assignment) {
        try {
            // Vérifier si l'association existe déjà
            const existing = await db_1.db.select()
                .from(schema_1.memberTagAssignments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberTagAssignments.memberEmail, assignment.memberEmail), (0, drizzle_orm_1.eq)(schema_1.memberTagAssignments.tagId, assignment.tagId)))
                .limit(1);
            if (existing.length > 0) {
                return { success: true, data: existing[0] };
            }
            const [created] = await db_1.db.insert(schema_1.memberTagAssignments)
                .values(assignment)
                .returning();
            logger_1.logger.info('Tag assigné au membre', { memberEmail: assignment.memberEmail, tagId: assignment.tagId });
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de l'assignation du tag: ${error}`) };
        }
    }
    async removeTagFromMember(memberEmail, tagId) {
        try {
            await db_1.db.delete(schema_1.memberTagAssignments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberTagAssignments.memberEmail, memberEmail), (0, drizzle_orm_1.eq)(schema_1.memberTagAssignments.tagId, tagId)));
            logger_1.logger.info('Tag retiré du membre', { memberEmail, tagId });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du tag: ${error}`) };
        }
    }
    // Member Tasks implementation
    async getTasksByMember(memberEmail) {
        try {
            const tasks = await db_1.db.select()
                .from(schema_1.memberTasks)
                .where((0, drizzle_orm_1.eq)(schema_1.memberTasks.memberEmail, memberEmail))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.memberTasks.createdAt));
            return { success: true, data: tasks };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des tâches: ${error}`) };
        }
    }
    async createTask(task) {
        try {
            const taskData = {
                ...task,
                dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
            };
            const [created] = await db_1.db.insert(schema_1.memberTasks)
                .values(taskData)
                .returning();
            logger_1.logger.info('Tâche créée', { taskId: created.id, memberEmail: task.memberEmail });
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la tâche: ${error}`) };
        }
    }
    async updateTask(taskId, data) {
        try {
            const updateData = {
                ...data,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`,
            };
            if (data.dueDate !== undefined) {
                updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
            }
            if (data.status === 'completed' && !data.completedAt) {
                updateData.completedAt = (0, drizzle_orm_1.sql) `NOW()`;
            }
            else if (data.status !== 'completed' && data.completedAt === null) {
                updateData.completedAt = null;
            }
            const [updated] = await db_1.db.update(schema_1.memberTasks)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.memberTasks.id, taskId))
                .returning();
            if (!updated) {
                return { success: false, error: new schema_1.NotFoundError('Tâche non trouvée') };
            }
            logger_1.logger.info('Tâche mise à jour', { taskId, updates: Object.keys(data) });
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la tâche: ${error}`) };
        }
    }
    async deleteTask(taskId) {
        try {
            await db_1.db.delete(schema_1.memberTasks).where((0, drizzle_orm_1.eq)(schema_1.memberTasks.id, taskId));
            logger_1.logger.info('Tâche supprimée', { taskId });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de la tâche: ${error}`) };
        }
    }
    async getAllTasks(options) {
        try {
            if (options?.status && options?.assignedTo) {
                const tasks = await db_1.db.select()
                    .from(schema_1.memberTasks)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberTasks.status, options.status), (0, drizzle_orm_1.eq)(schema_1.memberTasks.assignedTo, options.assignedTo)))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.memberTasks.dueDate), (0, drizzle_orm_1.desc)(schema_1.memberTasks.createdAt));
                return { success: true, data: tasks };
            }
            else if (options?.status) {
                const tasks = await db_1.db.select()
                    .from(schema_1.memberTasks)
                    .where((0, drizzle_orm_1.eq)(schema_1.memberTasks.status, options.status))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.memberTasks.dueDate), (0, drizzle_orm_1.desc)(schema_1.memberTasks.createdAt));
                return { success: true, data: tasks };
            }
            else if (options?.assignedTo) {
                const tasks = await db_1.db.select()
                    .from(schema_1.memberTasks)
                    .where((0, drizzle_orm_1.eq)(schema_1.memberTasks.assignedTo, options.assignedTo))
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.memberTasks.dueDate), (0, drizzle_orm_1.desc)(schema_1.memberTasks.createdAt));
                return { success: true, data: tasks };
            }
            else {
                const tasks = await db_1.db.select()
                    .from(schema_1.memberTasks)
                    .orderBy((0, drizzle_orm_1.desc)(schema_1.memberTasks.dueDate), (0, drizzle_orm_1.desc)(schema_1.memberTasks.createdAt));
                return { success: true, data: tasks };
            }
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des tâches: ${error}`) };
        }
    }
    // Member Relations implementation
    async getRelationsByMember(memberEmail) {
        try {
            const relations = await db_1.db.select()
                .from(schema_1.memberRelations)
                .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.memberRelations.memberEmail, memberEmail), (0, drizzle_orm_1.eq)(schema_1.memberRelations.relatedMemberEmail, memberEmail)))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.memberRelations.createdAt));
            return { success: true, data: relations };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des relations: ${error}`) };
        }
    }
    async createRelation(relation) {
        try {
            // Vérifier que la relation n'existe pas déjà
            const existing = await db_1.db.select()
                .from(schema_1.memberRelations)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.memberRelations.memberEmail, relation.memberEmail), (0, drizzle_orm_1.eq)(schema_1.memberRelations.relatedMemberEmail, relation.relatedMemberEmail), (0, drizzle_orm_1.eq)(schema_1.memberRelations.relationType, relation.relationType)))
                .limit(1);
            if (existing.length > 0) {
                return { success: true, data: existing[0] };
            }
            const [created] = await db_1.db.insert(schema_1.memberRelations)
                .values(relation)
                .returning();
            logger_1.logger.info('Relation créée', { relationId: created.id, memberEmail: relation.memberEmail });
            return { success: true, data: created };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la relation: ${error}`) };
        }
    }
    async deleteRelation(relationId) {
        try {
            await db_1.db.delete(schema_1.memberRelations).where((0, drizzle_orm_1.eq)(schema_1.memberRelations.id, relationId));
            logger_1.logger.info('Relation supprimée', { relationId });
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de la relation: ${error}`) };
        }
    }
    // Branding configuration methods
    async getBrandingConfig() {
        try {
            // Utiliser runDbQuery avec profil 'quick' - timeout 2s, pas de retry (requête simple)
            const [config] = await (0, db_1.runDbQuery)(async () => db_1.db.select().from(schema_1.brandingConfig).limit(1), 'quick');
            return { success: true, data: config || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de la configuration: ${error}`) };
        }
    }
    async updateBrandingConfig(configStr, updatedBy) {
        try {
            // Validate JSON format
            try {
                JSON.parse(configStr);
            }
            catch {
                return { success: false, error: new schema_1.ValidationError("La configuration doit être un JSON valide") };
            }
            const result = await db_1.db.transaction(async (tx) => {
                // Check if config exists
                const [existing] = await tx.select().from(schema_1.brandingConfig).limit(1);
                if (existing) {
                    // Update existing config
                    const [updated] = await tx
                        .update(schema_1.brandingConfig)
                        .set({
                        config: configStr,
                        updatedBy,
                        updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.brandingConfig.id, existing.id))
                        .returning();
                    return updated;
                }
                else {
                    // Insert new config
                    const [inserted] = await tx
                        .insert(schema_1.brandingConfig)
                        .values({
                        config: configStr,
                        updatedBy
                    })
                        .returning();
                    return inserted;
                }
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la configuration: ${error}`) };
        }
    }
    // ==================== FEATURE CONFIGURATION ====================
    async getFeatureConfig() {
        try {
            const configs = await (0, db_1.runDbQuery)(async () => db_1.db.select().from(schema_1.featureConfig).orderBy(schema_1.featureConfig.featureKey), 'quick');
            return { success: true, data: configs };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de la configuration des fonctionnalités: ${error}`) };
        }
    }
    async getFeatureConfigByKey(featureKey) {
        try {
            const [config] = await (0, db_1.runDbQuery)(async () => db_1.db.select().from(schema_1.featureConfig).where((0, drizzle_orm_1.eq)(schema_1.featureConfig.featureKey, featureKey)).limit(1), 'quick');
            return { success: true, data: config || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de la configuration: ${error}`) };
        }
    }
    async isFeatureEnabled(featureKey) {
        try {
            const result = await this.getFeatureConfigByKey(featureKey);
            if (!result.success) {
                return { success: false, error: result.error };
            }
            // Si la config n'existe pas, la fonctionnalité est activée par défaut
            return { success: true, data: result.data?.enabled ?? true };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la vérification de la fonctionnalité: ${error}`) };
        }
    }
    async updateFeatureConfig(featureKey, enabled, updatedBy) {
        try {
            const result = await db_1.db.transaction(async (tx) => {
                // Check if config exists
                const [existing] = await tx.select().from(schema_1.featureConfig).where((0, drizzle_orm_1.eq)(schema_1.featureConfig.featureKey, featureKey)).limit(1);
                if (existing) {
                    // Update existing config
                    const [updated] = await tx
                        .update(schema_1.featureConfig)
                        .set({
                        enabled,
                        updatedBy,
                        updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.featureConfig.featureKey, featureKey))
                        .returning();
                    return updated;
                }
                else {
                    // Insert new config
                    const [inserted] = await tx
                        .insert(schema_1.featureConfig)
                        .values({
                        featureKey,
                        enabled,
                        updatedBy
                    })
                        .returning();
                    return inserted;
                }
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la configuration: ${error}`) };
        }
    }
    // ==================== LOAN ITEMS ====================
    async getLoanItems(options) {
        try {
            const page = options?.page || 1;
            const limit = options?.limit || 20;
            const offset = (page - 1) * limit;
            const search = options?.search?.trim();
            const status = options?.status;
            // Construire les conditions
            const conditions = [];
            // Si un statut spécifique est demandé, l'utiliser
            // Sinon, exclure les items en pending (afficher tous les items validés)
            if (status) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.loanItems.status, status));
            }
            else {
                conditions.push((0, drizzle_orm_1.ne)(schema_1.loanItems.status, schema_1.LOAN_STATUS.PENDING));
            }
            if (search) {
                // Optimisation: utiliser LOWER pour la recherche insensible à la casse
                // et échapper les caractères spéciaux pour éviter les injections SQL
                const searchTerm = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.sql) `LOWER(${schema_1.loanItems.title}) LIKE LOWER(${`%${searchTerm}%`})`, (0, drizzle_orm_1.sql) `LOWER(${schema_1.loanItems.description}) LIKE LOWER(${`%${searchTerm}%`})`));
            }
            const whereClause = (0, drizzle_orm_1.and)(...conditions);
            // Compter le total
            const [totalResult] = await (0, db_1.runDbQuery)(async () => db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.loanItems).where(whereClause), 'quick');
            const total = totalResult?.count || 0;
            // Récupérer les items
            const items = await (0, db_1.runDbQuery)(async () => db_1.db
                .select()
                .from(schema_1.loanItems)
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.loanItems.createdAt))
                .limit(limit)
                .offset(offset), 'normal');
            // S'assurer que items est toujours un tableau
            const itemsArray = Array.isArray(items) ? items : [];
            return {
                success: true,
                data: {
                    data: itemsArray,
                    total,
                    page,
                    limit
                }
            };
        }
        catch (error) {
            // Si la table n'existe pas, retourner une liste vide plutôt qu'une erreur
            const errorMessage = error?.message || String(error);
            if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('loan_items')) {
                logger_1.logger.warn('Loan items table does not exist yet, returning empty list', { error: errorMessage });
                return {
                    success: true,
                    data: {
                        data: [],
                        total: 0,
                        page: options?.page || 1,
                        limit: options?.limit || 20
                    }
                };
            }
            logger_1.logger.error('Error fetching loan items', { error: errorMessage, stack: error?.stack, options });
            return {
                success: false,
                error: new schema_1.DatabaseError(`Erreur lors de la récupération des fiches prêt: ${errorMessage}`)
            };
        }
    }
    async getLoanItem(id) {
        try {
            const [item] = await (0, db_1.runDbQuery)(async () => db_1.db.select().from(schema_1.loanItems).where((0, drizzle_orm_1.eq)(schema_1.loanItems.id, id)).limit(1), 'quick');
            return { success: true, data: item || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de la fiche prêt: ${error}`) };
        }
    }
    async createLoanItem(item) {
        try {
            const [newItem] = await (0, db_1.runDbQuery)(async () => db_1.db.insert(schema_1.loanItems).values({
                ...item,
                status: schema_1.LOAN_STATUS.PENDING, // Toujours créer en pending
            }).returning(), 'normal');
            if (!newItem) {
                return { success: false, error: new schema_1.DatabaseError('Erreur lors de la création de la fiche prêt') };
            }
            return { success: true, data: newItem };
        }
        catch (error) {
            logger_1.logger.error('Error creating loan item', { error, item });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la fiche prêt: ${error}`) };
        }
    }
    async updateLoanItem(id, itemData) {
        try {
            // Vérifier que l'item existe
            const itemResult = await this.getLoanItem(id);
            if (!itemResult.success) {
                return { success: false, error: itemResult.error };
            }
            if (!itemResult.data) {
                return { success: false, error: new schema_1.NotFoundError('Fiche prêt non trouvée') };
            }
            const [updated] = await (0, db_1.runDbQuery)(async () => db_1.db
                .update(schema_1.loanItems)
                .set({
                ...itemData,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.loanItems.id, id))
                .returning(), 'normal');
            if (!updated) {
                return { success: false, error: new schema_1.DatabaseError('Erreur lors de la mise à jour de la fiche prêt') };
            }
            return { success: true, data: updated };
        }
        catch (error) {
            logger_1.logger.error('Error updating loan item', { error, id, itemData });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la fiche prêt: ${error}`) };
        }
    }
    async updateLoanItemStatus(id, status, updatedBy) {
        try {
            // Vérifier que l'item existe
            const itemResult = await this.getLoanItem(id);
            if (!itemResult.success) {
                return { success: false, error: itemResult.error };
            }
            if (!itemResult.data) {
                return { success: false, error: new schema_1.NotFoundError('Fiche prêt non trouvée') };
            }
            await (0, db_1.runDbQuery)(async () => db_1.db
                .update(schema_1.loanItems)
                .set({
                status,
                updatedBy,
                updatedAt: (0, drizzle_orm_1.sql) `NOW()`
            })
                .where((0, drizzle_orm_1.eq)(schema_1.loanItems.id, id)), 'normal');
            return { success: true, data: undefined };
        }
        catch (error) {
            logger_1.logger.error('Error updating loan item status', { error, id, status });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du statut: ${error}`) };
        }
    }
    async deleteLoanItem(id) {
        try {
            // Vérifier que l'item existe
            const itemResult = await this.getLoanItem(id);
            if (!itemResult.success) {
                return { success: false, error: itemResult.error };
            }
            if (!itemResult.data) {
                return { success: false, error: new schema_1.NotFoundError('Fiche prêt non trouvée') };
            }
            await (0, db_1.runDbQuery)(async () => db_1.db.delete(schema_1.loanItems).where((0, drizzle_orm_1.eq)(schema_1.loanItems.id, id)), 'normal');
            return { success: true, data: undefined };
        }
        catch (error) {
            logger_1.logger.error('Error deleting loan item', { error, id });
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de la fiche prêt: ${error}`) };
        }
    }
    async getAllLoanItems(options) {
        try {
            const page = options?.page || 1;
            const limit = options?.limit || 20;
            const offset = (page - 1) * limit;
            const search = options?.search?.trim();
            // Construire les conditions
            const conditions = [];
            if (search) {
                // Optimisation: utiliser LOWER pour la recherche insensible à la casse
                // et échapper les caractères spéciaux pour éviter les injections SQL
                const searchTerm = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
                conditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.sql) `LOWER(${schema_1.loanItems.title}) LIKE LOWER(${`%${searchTerm}%`})`, (0, drizzle_orm_1.sql) `LOWER(${schema_1.loanItems.description}) LIKE LOWER(${`%${searchTerm}%`})`));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            // Compter le total
            const totalQuery = whereClause
                ? db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.loanItems).where(whereClause)
                : db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.loanItems);
            const [totalResult] = await (0, db_1.runDbQuery)(async () => totalQuery, 'quick');
            const total = totalResult?.count || 0;
            // Récupérer les items
            const itemsQuery = whereClause
                ? db_1.db.select().from(schema_1.loanItems).where(whereClause).orderBy((0, drizzle_orm_1.desc)(schema_1.loanItems.createdAt)).limit(limit).offset(offset)
                : db_1.db.select().from(schema_1.loanItems).orderBy((0, drizzle_orm_1.desc)(schema_1.loanItems.createdAt)).limit(limit).offset(offset);
            const items = await (0, db_1.runDbQuery)(async () => itemsQuery, 'normal');
            // S'assurer que items est toujours un tableau
            const itemsArray = Array.isArray(items) ? items : [];
            return {
                success: true,
                data: {
                    data: itemsArray,
                    total,
                    page,
                    limit
                }
            };
        }
        catch (error) {
            // Si la table n'existe pas, retourner une liste vide plutôt qu'une erreur
            const errorMessage = error?.message || String(error);
            if (errorMessage.includes('does not exist') || errorMessage.includes('relation') || errorMessage.includes('loan_items')) {
                logger_1.logger.warn('Loan items table does not exist yet, returning empty list', { error: errorMessage });
                return {
                    success: true,
                    data: {
                        data: [],
                        total: 0,
                        page: options?.page || 1,
                        limit: options?.limit || 20
                    }
                };
            }
            logger_1.logger.error('Error fetching all loan items', { error: errorMessage, stack: error?.stack, options });
            return {
                success: false,
                error: new schema_1.DatabaseError(`Erreur lors de la récupération des fiches prêt: ${errorMessage}`)
            };
        }
    }
    async getEmailConfig() {
        try {
            // Utiliser runDbQuery avec profil 'quick' - timeout 2s, pas de retry (requête simple)
            const [config] = await (0, db_1.runDbQuery)(async () => db_1.db.select().from(schema_1.emailConfig).limit(1), 'quick');
            return { success: true, data: config || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de la configuration email: ${error}`) };
        }
    }
    async updateEmailConfig(config, updatedBy) {
        try {
            const result = await db_1.db.transaction(async (tx) => {
                // Check if config exists
                const [existing] = await tx.select().from(schema_1.emailConfig).limit(1);
                if (existing) {
                    // Update existing config
                    const [updated] = await tx
                        .update(schema_1.emailConfig)
                        .set({
                        ...config,
                        updatedBy,
                        updatedAt: (0, drizzle_orm_1.sql) `NOW()`
                    })
                        .where((0, drizzle_orm_1.eq)(schema_1.emailConfig.id, existing.id))
                        .returning();
                    return updated;
                }
                else {
                    // Insert new config
                    const [inserted] = await tx
                        .insert(schema_1.emailConfig)
                        .values({
                        ...config,
                        updatedBy
                    })
                        .returning();
                    return inserted;
                }
            });
            return { success: true, data: result };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la configuration email: ${error}`) };
        }
    }
    // ==================== TRACKING TRANSVERSAL ====================
    async createTrackingMetric(metric) {
        try {
            const [newMetric] = await db_1.db.insert(schema_1.trackingMetrics).values({
                entityType: metric.entityType,
                entityId: metric.entityId,
                entityEmail: metric.entityEmail,
                metricType: metric.metricType,
                metricValue: metric.metricValue ?? null,
                metricData: metric.metricData ?? null,
                description: metric.description ?? null,
                recordedBy: metric.recordedBy ?? null,
                recordedAt: new Date(),
            }).returning();
            return { success: true, data: newMetric };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la métrique: ${error}`) };
        }
    }
    async getTrackingMetrics(options) {
        try {
            const conditions = [];
            if (options?.entityType) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingMetrics.entityType, options.entityType));
            }
            if (options?.entityId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingMetrics.entityId, options.entityId));
            }
            if (options?.entityEmail) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingMetrics.entityEmail, options.entityEmail));
            }
            if (options?.metricType) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingMetrics.metricType, options.metricType));
            }
            if (options?.startDate) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.trackingMetrics.recordedAt} >= ${options.startDate}`);
            }
            if (options?.endDate) {
                conditions.push((0, drizzle_orm_1.sql) `${schema_1.trackingMetrics.recordedAt} <= ${options.endDate}`);
            }
            let query = db_1.db.select().from(schema_1.trackingMetrics);
            if (conditions.length > 0) {
                query = query.where((0, drizzle_orm_1.and)(...conditions));
            }
            query = query.orderBy((0, drizzle_orm_1.desc)(schema_1.trackingMetrics.recordedAt));
            if (options?.limit) {
                query = query.limit(options.limit);
            }
            const results = await query;
            return { success: true, data: results };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des métriques: ${error}`) };
        }
    }
    async getTrackingDashboard() {
        try {
            // Statistiques membres
            const allMembers = await db_1.db.select().from(schema_1.members);
            const membersProposed = allMembers.filter(m => m.status === 'proposed');
            const membersActive = allMembers.filter(m => m.status === 'active');
            const membersHighPotential = allMembers.filter(m => m.engagementScore >= 20);
            const staleDate = new Date();
            staleDate.setDate(staleDate.getDate() - 90); // 90 jours sans activité
            const membersStale = allMembers.filter(m => m.lastActivityAt && new Date(m.lastActivityAt) < staleDate);
            // Statistiques mécènes
            const allPatrons = await db_1.db.select().from(schema_1.patrons);
            const patronsProposed = allPatrons.filter(p => p.status === 'proposed');
            const patronsActive = allPatrons.filter(p => p.status === 'active');
            // Mécènes à haut potentiel : proposés récemment (moins de 30 jours)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const patronsHighPotential = allPatrons.filter(p => {
                if (p.status !== 'proposed')
                    return false;
                const createdAt = p.createdAt ? new Date(p.createdAt) : null;
                return createdAt && createdAt >= thirtyDaysAgo;
            });
            const patronsStale = allPatrons.filter(p => {
                const lastUpdate = p.updatedAt;
                return lastUpdate && new Date(lastUpdate) < staleDate;
            });
            // Activité récente (30 derniers jours) - réutiliser thirtyDaysAgo déjà défini
            const recentMetrics = await db_1.db.select()
                .from(schema_1.trackingMetrics)
                .where((0, drizzle_orm_1.sql) `${schema_1.trackingMetrics.recordedAt} >= ${thirtyDaysAgo}`)
                .orderBy((0, drizzle_orm_1.desc)(schema_1.trackingMetrics.recordedAt))
                .limit(20);
            // Taux de conversion (proposed -> active)
            // Calcul basé sur les membres/mécènes qui étaient "proposed" et sont maintenant "active"
            // On considère qu'un membre/mécène a été converti s'il est actif et avait été proposé initialement
            // Pour simplifier, on calcule : (actifs qui étaient proposés) / (total proposés + actifs qui étaient proposés)
            const membersConverted = allMembers.filter(m => {
                // Un membre converti est un membre actif qui a été proposé initialement
                // On peut le détecter par la présence de métriques de conversion ou par firstSeenAt
                return m.status === 'active' && m.firstSeenAt;
            }).length;
            const membersConversionRate = (membersProposed.length + membersConverted) > 0
                ? (membersConverted / (membersProposed.length + membersConverted)) * 100
                : 0;
            const patronsConverted = allPatrons.filter(p => {
                // Un mécène converti est un mécène actif qui a été créé (initialement proposé)
                return p.status === 'active' && p.createdAt;
            }).length;
            const patronsConversionRate = (patronsProposed.length + patronsConverted) > 0
                ? (patronsConverted / (patronsProposed.length + patronsConverted)) * 100
                : 0;
            // Tendances d'engagement (7 derniers jours)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const engagementTrends = [];
            for (let i = 6; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const dayStart = new Date(dateStr);
                const dayEnd = new Date(dateStr);
                dayEnd.setHours(23, 59, 59, 999);
                const dayMetrics = await db_1.db.select()
                    .from(schema_1.trackingMetrics)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${schema_1.trackingMetrics.recordedAt} >= ${dayStart}`, (0, drizzle_orm_1.sql) `${schema_1.trackingMetrics.recordedAt} <= ${dayEnd}`));
                const membersCount = dayMetrics.filter(m => m.entityType === 'member').length;
                const patronsCount = dayMetrics.filter(m => m.entityType === 'patron').length;
                engagementTrends.push({
                    date: dateStr,
                    members: membersCount,
                    patrons: patronsCount,
                });
            }
            return {
                success: true,
                data: {
                    members: {
                        total: allMembers.length,
                        proposed: membersProposed.length,
                        active: membersActive.length,
                        highPotential: membersHighPotential.length,
                        stale: membersStale.length,
                    },
                    patrons: {
                        total: allPatrons.length,
                        proposed: patronsProposed.length,
                        active: patronsActive.length,
                        highPotential: patronsHighPotential.length,
                        stale: patronsStale.length,
                    },
                    recentActivity: recentMetrics,
                    conversionRate: {
                        members: Math.round(membersConversionRate * 100) / 100,
                        patrons: Math.round(patronsConversionRate * 100) / 100,
                    },
                    engagementTrends,
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération du dashboard: ${error}`) };
        }
    }
    async createTrackingAlert(alert) {
        try {
            const [newAlert] = await db_1.db.insert(schema_1.trackingAlerts).values({
                entityType: alert.entityType,
                entityId: alert.entityId,
                entityEmail: alert.entityEmail,
                alertType: alert.alertType,
                severity: alert.severity || 'medium',
                title: alert.title,
                message: alert.message,
                createdBy: alert.createdBy ?? null,
                expiresAt: alert.expiresAt ?? null,
                isRead: false,
                isResolved: false,
                createdAt: new Date(),
            }).returning();
            return { success: true, data: newAlert };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de l'alerte: ${error}`) };
        }
    }
    async getTrackingAlerts(options) {
        try {
            const conditions = [];
            if (options?.entityType) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityType, options.entityType));
            }
            if (options?.entityId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityId, options.entityId));
            }
            if (options?.isRead !== undefined) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.isRead, options.isRead));
            }
            if (options?.isResolved !== undefined) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.isResolved, options.isResolved));
            }
            if (options?.severity) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.severity, options.severity));
            }
            let query = db_1.db.select().from(schema_1.trackingAlerts);
            if (conditions.length > 0) {
                query = query.where((0, drizzle_orm_1.and)(...conditions));
            }
            query = query.orderBy((0, drizzle_orm_1.desc)(schema_1.trackingAlerts.createdAt));
            if (options?.limit) {
                query = query.limit(options.limit);
            }
            const results = await query;
            return { success: true, data: results };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des alertes: ${error}`) };
        }
    }
    async updateTrackingAlert(alertId, data) {
        try {
            const updateData = {};
            if (data.isRead !== undefined)
                updateData.isRead = data.isRead;
            if (data.isResolved !== undefined) {
                updateData.isResolved = data.isResolved;
                if (data.isResolved && data.resolvedBy) {
                    updateData.resolvedBy = data.resolvedBy;
                    updateData.resolvedAt = new Date();
                }
            }
            const [updated] = await db_1.db.update(schema_1.trackingAlerts)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.id, alertId))
                .returning();
            if (!updated) {
                return { success: false, error: new schema_1.NotFoundError('Alerte non trouvée') };
            }
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de l'alerte: ${error}`) };
        }
    }
    async generateTrackingAlerts() {
        try {
            let created = 0;
            let errors = 0;
            // Détecter les membres/mécènes "stale" (inactifs depuis 90 jours)
            const staleDate = new Date();
            staleDate.setDate(staleDate.getDate() - 90);
            const staleMembers = await db_1.db.select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.members.status, 'active'), (0, drizzle_orm_1.sql) `${schema_1.members.lastActivityAt} < ${staleDate}`));
            for (const member of staleMembers) {
                try {
                    // Vérifier si une alerte existe déjà
                    const existingAlerts = await db_1.db.select()
                        .from(schema_1.trackingAlerts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityType, 'member'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityId, member.id), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.alertType, 'stale'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.isResolved, false)));
                    if (existingAlerts.length === 0) {
                        await db_1.db.insert(schema_1.trackingAlerts).values({
                            entityType: 'member',
                            entityId: member.id,
                            entityEmail: member.email,
                            alertType: 'stale',
                            severity: 'medium',
                            title: `Membre inactif depuis 90 jours`,
                            message: `${member.firstName} ${member.lastName} n'a pas eu d'activité depuis 90 jours.`,
                            isRead: false,
                            isResolved: false,
                            createdAt: new Date(),
                        });
                        created++;
                    }
                }
                catch (error) {
                    errors++;
                    logger_1.logger.error('Error creating stale alert for member', { memberId: member.id, error });
                }
            }
            // Détecter les mécènes "stale"
            const stalePatrons = await db_1.db.select()
                .from(schema_1.patrons)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.patrons.status, 'active'), (0, drizzle_orm_1.sql) `${schema_1.patrons.updatedAt} < ${staleDate}`));
            for (const patron of stalePatrons) {
                try {
                    const existingAlerts = await db_1.db.select()
                        .from(schema_1.trackingAlerts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityType, 'patron'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityId, patron.id), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.alertType, 'stale'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.isResolved, false)));
                    if (existingAlerts.length === 0) {
                        await db_1.db.insert(schema_1.trackingAlerts).values({
                            entityType: 'patron',
                            entityId: patron.id,
                            entityEmail: patron.email,
                            alertType: 'stale',
                            severity: 'medium',
                            title: `Mécène inactif depuis 90 jours`,
                            message: `${patron.firstName} ${patron.lastName} n'a pas été contacté depuis 90 jours.`,
                            isRead: false,
                            isResolved: false,
                            createdAt: new Date(),
                        });
                        created++;
                    }
                }
                catch (error) {
                    errors++;
                    logger_1.logger.error('Error creating stale alert for patron', { patronId: patron.id, error });
                }
            }
            // Détecter les membres "high potential"
            const highPotentialMembers = await db_1.db.select()
                .from(schema_1.members)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.members.status, 'proposed'), (0, drizzle_orm_1.sql) `${schema_1.members.engagementScore} >= 15`));
            for (const member of highPotentialMembers) {
                try {
                    const existingAlerts = await db_1.db.select()
                        .from(schema_1.trackingAlerts)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityType, 'member'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityId, member.id), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.alertType, 'high_potential'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.isResolved, false)));
                    if (existingAlerts.length === 0) {
                        await db_1.db.insert(schema_1.trackingAlerts).values({
                            entityType: 'member',
                            entityId: member.id,
                            entityEmail: member.email,
                            alertType: 'high_potential',
                            severity: 'high',
                            title: `Membre potentiel à fort engagement`,
                            message: `${member.firstName} ${member.lastName} a un score d'engagement élevé (${member.engagementScore}).`,
                            isRead: false,
                            isResolved: false,
                            createdAt: new Date(),
                        });
                        created++;
                    }
                }
                catch (error) {
                    errors++;
                    logger_1.logger.error('Error creating high potential alert for member', { memberId: member.id, error });
                }
            }
            // Détecter les mécènes "high potential" (proposés avec activité récente)
            // Un mécène est considéré à haut potentiel s'il a été proposé récemment (moins de 30 jours)
            // et n'a pas encore été converti
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const highPotentialPatrons = await db_1.db.select()
                .from(schema_1.patrons)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.patrons.status, 'proposed'), (0, drizzle_orm_1.sql) `${schema_1.patrons.createdAt} >= ${thirtyDaysAgo}`));
            for (const patron of highPotentialPatrons) {
                try {
                    // Vérifier s'il y a des métriques récentes pour ce mécène
                    const recentMetrics = await db_1.db.select()
                        .from(schema_1.trackingMetrics)
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.trackingMetrics.entityType, 'patron'), (0, drizzle_orm_1.eq)(schema_1.trackingMetrics.entityId, patron.id), (0, drizzle_orm_1.sql) `${schema_1.trackingMetrics.recordedAt} >= ${thirtyDaysAgo}`))
                        .limit(1);
                    // Si le mécène a des métriques récentes ou a été créé récemment, c'est un haut potentiel
                    if (recentMetrics.length > 0 || patron.createdAt >= thirtyDaysAgo) {
                        const existingAlerts = await db_1.db.select()
                            .from(schema_1.trackingAlerts)
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityType, 'patron'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.entityId, patron.id), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.alertType, 'high_potential'), (0, drizzle_orm_1.eq)(schema_1.trackingAlerts.isResolved, false)));
                        if (existingAlerts.length === 0) {
                            await db_1.db.insert(schema_1.trackingAlerts).values({
                                entityType: 'patron',
                                entityId: patron.id,
                                entityEmail: patron.email,
                                alertType: 'high_potential',
                                severity: 'high',
                                title: `Mécène potentiel récent`,
                                message: `${patron.firstName} ${patron.lastName} a été proposé récemment et pourrait être un bon candidat pour conversion.`,
                                isRead: false,
                                isResolved: false,
                                createdAt: new Date(),
                            });
                            created++;
                        }
                    }
                }
                catch (error) {
                    errors++;
                    logger_1.logger.error('Error creating high potential alert for patron', { patronId: patron.id, error });
                }
            }
            return { success: true, data: { created, errors } };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la génération des alertes: ${error}`) };
        }
    }
    // Ultra-robust Stats method with Result pattern
    async getStats() {
        try {
            const [ideaCount] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.ideas);
            const [voteCount] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.votes);
            const [eventCount] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.events);
            const [inscriptionCount] = await db_1.db.select({ count: (0, drizzle_orm_1.count)() }).from(schema_1.inscriptions);
            const stats = {
                totalIdeas: Number(ideaCount.count),
                totalVotes: Number(voteCount.count),
                upcomingEvents: Number(eventCount.count),
                totalInscriptions: Number(inscriptionCount.count),
            };
            return { success: true, data: stats };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des statistiques: ${error}`) };
        }
    }
    async getFinancialKPIs() {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            // Souscriptions
            const allSubscriptions = await db_1.db.select().from(schema_1.memberSubscriptions);
            const activeSubscriptions = allSubscriptions.filter(sub => {
                const start = new Date(sub.startDate);
                const end = new Date(sub.endDate);
                return start <= now && end >= now;
            });
            const monthlySubscriptions = allSubscriptions.filter(sub => {
                const created = new Date(sub.createdAt);
                return created >= thirtyDaysAgo;
            });
            const subscriptionsTotal = allSubscriptions.reduce((sum, sub) => sum + sub.amountInCents, 0);
            const monthlyRevenue = monthlySubscriptions.reduce((sum, sub) => sum + sub.amountInCents, 0);
            const averageSubscription = allSubscriptions.length > 0
                ? Math.round(subscriptionsTotal / allSubscriptions.length)
                : 0;
            // Sponsorings
            const allSponsorships = await db_1.db.select().from(schema_1.eventSponsorships);
            const activeSponsorships = allSponsorships.filter(s => s.status === 'confirmed' || s.status === 'completed');
            const sponsorshipsTotal = allSponsorships.reduce((sum, s) => sum + s.amount, 0);
            const averageSponsorship = allSponsorships.length > 0
                ? Math.round(sponsorshipsTotal / allSponsorships.length)
                : 0;
            // Sponsorings par niveau
            const sponsorshipsByLevel = allSponsorships.reduce((acc, s) => {
                const level = s.level;
                const existing = acc.find(item => item.level === level);
                if (existing) {
                    existing.count++;
                    existing.totalAmount += s.amount;
                }
                else {
                    acc.push({ level, count: 1, totalAmount: s.amount });
                }
                return acc;
            }, []);
            return {
                success: true,
                data: {
                    subscriptions: {
                        totalRevenue: subscriptionsTotal,
                        activeSubscriptions: activeSubscriptions.length,
                        totalSubscriptions: allSubscriptions.length,
                        averageAmount: averageSubscription,
                        monthlyRevenue,
                    },
                    sponsorships: {
                        totalRevenue: sponsorshipsTotal,
                        activeSponsorships: activeSponsorships.length,
                        totalSponsorships: allSponsorships.length,
                        averageAmount: averageSponsorship,
                        byLevel: sponsorshipsByLevel,
                    },
                    totalRevenue: subscriptionsTotal + sponsorshipsTotal,
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors du calcul des KPIs financiers: ${error}`) };
        }
    }
    async getEngagementKPIs() {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            // Membres
            const allMembers = await db_1.db.select().from(schema_1.members);
            const activeMembers = allMembers.filter(m => m.status === 'active');
            const proposedMembers = allMembers.filter(m => m.status === 'proposed');
            const recentActiveMembers = activeMembers.filter(m => {
                const lastActivity = new Date(m.lastActivityAt);
                return lastActivity >= thirtyDaysAgo;
            });
            const staleMembers = activeMembers.filter(m => {
                const lastActivity = new Date(m.lastActivityAt);
                return lastActivity < ninetyDaysAgo;
            });
            const totalScore = allMembers.reduce((sum, m) => sum + m.engagementScore, 0);
            const averageScore = allMembers.length > 0 ? Math.round(totalScore / allMembers.length) : 0;
            const conversionRate = (proposedMembers.length + activeMembers.length) > 0
                ? Math.round((activeMembers.length / (proposedMembers.length + activeMembers.length)) * 100)
                : 0;
            const retentionRate = activeMembers.length > 0
                ? Math.round((recentActiveMembers.length / activeMembers.length) * 100)
                : 0;
            const churnRate = activeMembers.length > 0
                ? Math.round((staleMembers.length / activeMembers.length) * 100)
                : 0;
            // Mécènes
            const allPatrons = await db_1.db.select().from(schema_1.patrons);
            const activePatrons = allPatrons.filter(p => p.status === 'active');
            const proposedPatrons = allPatrons.filter(p => p.status === 'proposed');
            const patronConversionRate = (proposedPatrons.length + activePatrons.length) > 0
                ? Math.round((activePatrons.length / (proposedPatrons.length + activePatrons.length)) * 100)
                : 0;
            // Activités
            const allActivities = await db_1.db.select().from(schema_1.memberActivities);
            const activitiesByType = allActivities.reduce((acc, a) => {
                const type = a.activityType;
                const existing = acc.find(item => item.type === type);
                if (existing) {
                    existing.count++;
                }
                else {
                    acc.push({ type, count: 1 });
                }
                return acc;
            }, []);
            const averageActivitiesPerMember = activeMembers.length > 0
                ? Math.round((allActivities.length / activeMembers.length) * 10) / 10
                : 0;
            return {
                success: true,
                data: {
                    members: {
                        total: allMembers.length,
                        active: activeMembers.length,
                        averageScore,
                        conversionRate,
                        retentionRate,
                        churnRate,
                    },
                    patrons: {
                        total: allPatrons.length,
                        active: activePatrons.length,
                        conversionRate: patronConversionRate,
                    },
                    activities: {
                        total: allActivities.length,
                        averagePerMember: averageActivitiesPerMember,
                        byType: activitiesByType,
                    },
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors du calcul des KPIs d'engagement: ${error}`) };
        }
    }
    async getAdminStats() {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            // Requêtes SQL consolidées avec COUNT FILTER (12 → 4 requêtes)
            // Membres - 1 seule requête avec COUNT FILTER
            const [membersStats] = await db_1.db.select({
                total: (0, drizzle_orm_1.sql) `count(*)::int`,
                active: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.members.status} = 'active')::int`,
                proposed: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.members.status} = 'proposed')::int`,
                recentActivity: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.members.lastActivityAt} >= ${thirtyDaysAgo.toISOString()})::int`,
            }).from(schema_1.members);
            // Mécènes - 1 seule requête avec COUNT FILTER
            const [patronsStats] = await db_1.db.select({
                total: (0, drizzle_orm_1.sql) `count(*)::int`,
                active: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.patrons.status} = 'active')::int`,
                proposed: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.patrons.status} = 'proposed')::int`,
            }).from(schema_1.patrons);
            // Idées - 1 seule requête avec COUNT FILTER
            const [ideasStats] = await db_1.db.select({
                total: (0, drizzle_orm_1.sql) `count(*)::int`,
                pending: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.ideas.status} = 'pending')::int`,
                approved: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.ideas.status} = 'approved')::int`,
            }).from(schema_1.ideas);
            // Événements - 1 seule requête avec COUNT FILTER
            const [eventsStats] = await db_1.db.select({
                total: (0, drizzle_orm_1.sql) `count(*)::int`,
                upcoming: (0, drizzle_orm_1.sql) `count(*) FILTER (WHERE ${schema_1.events.status} = 'published' AND ${schema_1.events.date} >= ${now.toISOString()})::int`,
            }).from(schema_1.events);
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
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des statistiques admin: ${error}`) };
        }
    }
    // Financial budgets implementation
    async createBudget(budget) {
        try {
            const [newBudget] = await db_1.db.insert(schema_1.financialBudgets).values({
                ...budget,
                updatedAt: new Date(),
            }).returning();
            return { success: true, data: newBudget };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création du budget: ${error}`) };
        }
    }
    async getBudgets(options) {
        try {
            const allBudgets = await db_1.db.select().from(schema_1.financialBudgets);
            let filtered = allBudgets;
            if (options?.period) {
                filtered = filtered.filter(b => b.period === options.period);
            }
            if (options?.year) {
                filtered = filtered.filter(b => b.year === options.year);
            }
            if (options?.category) {
                filtered = filtered.filter(b => b.category === options.category);
            }
            filtered.sort((a, b) => {
                if (b.year !== a.year)
                    return b.year - a.year;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return { success: true, data: filtered };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des budgets: ${error}`) };
        }
    }
    async getBudgetById(id) {
        try {
            const budgets = await db_1.db.select().from(schema_1.financialBudgets);
            const budget = budgets.find(b => b.id === id);
            return { success: true, data: budget || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération du budget: ${error}`) };
        }
    }
    async updateBudget(id, data) {
        try {
            const budgets = await db_1.db.select().from(schema_1.financialBudgets);
            const budget = budgets.find(b => b.id === id);
            if (!budget) {
                return { success: false, error: new schema_1.NotFoundError("Budget non trouvé") };
            }
            const [updated] = await db_1.db.update(schema_1.financialBudgets)
                .set({ ...data, updatedAt: new Date() })
                .where((0, drizzle_orm_1.sql) `${schema_1.financialBudgets.id} = ${id}`)
                .returning();
            if (!updated) {
                return { success: false, error: new schema_1.NotFoundError("Budget non trouvé") };
            }
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour du budget: ${error}`) };
        }
    }
    async deleteBudget(id) {
        try {
            await db_1.db.delete(schema_1.financialBudgets).where((0, drizzle_orm_1.sql) `${schema_1.financialBudgets.id} = ${id}`);
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression du budget: ${error}`) };
        }
    }
    async getBudgetStats(period, year) {
        try {
            const allBudgets = await db_1.db.select().from(schema_1.financialBudgets);
            let budgets = allBudgets;
            if (period) {
                budgets = budgets.filter(b => b.period === period);
            }
            if (year) {
                budgets = budgets.filter(b => b.year === year);
            }
            const totalBudgets = budgets.length;
            const totalAmount = budgets.reduce((sum, b) => sum + b.amountInCents, 0);
            const byCategoryMap = new Map();
            const byPeriodMap = new Map();
            for (const budget of budgets) {
                // Par catégorie
                const catKey = budget.category;
                const catData = byCategoryMap.get(catKey) || { count: 0, totalAmount: 0 };
                catData.count++;
                catData.totalAmount += budget.amountInCents;
                byCategoryMap.set(catKey, catData);
                // Par période
                const periodKey = `${budget.period}-${budget.year}`;
                const periodData = byPeriodMap.get(periodKey) || { count: 0, totalAmount: 0 };
                periodData.count++;
                periodData.totalAmount += budget.amountInCents;
                byPeriodMap.set(periodKey, periodData);
            }
            const byCategory = Array.from(byCategoryMap.entries()).map(([category, data]) => ({
                category,
                count: data.count,
                totalAmount: data.totalAmount,
            }));
            const byPeriod = Array.from(byPeriodMap.entries()).map(([period, data]) => ({
                period,
                count: data.count,
                totalAmount: data.totalAmount,
            }));
            return {
                success: true,
                data: {
                    totalBudgets,
                    totalAmount,
                    byCategory,
                    byPeriod,
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors du calcul des statistiques de budgets: ${error}`) };
        }
    }
    // Financial expenses implementation
    async createExpense(expense) {
        try {
            const [newExpense] = await db_1.db.insert(schema_1.financialExpenses).values({
                ...expense,
                updatedAt: new Date(),
            }).returning();
            return { success: true, data: newExpense };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la dépense: ${error}`) };
        }
    }
    async getExpenses(options) {
        try {
            const allExpenses = await db_1.db.select().from(schema_1.financialExpenses);
            let filtered = allExpenses;
            if (options?.startDate) {
                filtered = filtered.filter(e => e.expenseDate >= options.startDate);
            }
            if (options?.endDate) {
                filtered = filtered.filter(e => e.expenseDate <= options.endDate);
            }
            if (options?.category) {
                filtered = filtered.filter(e => e.category === options.category);
            }
            if (options?.budgetId) {
                filtered = filtered.filter(e => e.budgetId === options.budgetId);
            }
            // Filtrage par période et année si spécifié
            if (options?.period || options?.year) {
                filtered = filtered.filter(e => {
                    const expenseDate = new Date(e.expenseDate);
                    const expenseYear = expenseDate.getFullYear();
                    if (options.year && expenseYear !== options.year) {
                        return false;
                    }
                    if (options.period === 'month') {
                        // Pour month, on peut filtrer par mois si nécessaire
                        return true;
                    }
                    else if (options.period === 'quarter') {
                        // Pour quarter, on peut filtrer par trimestre si nécessaire
                        return true;
                    }
                    return true;
                });
            }
            filtered.sort((a, b) => {
                const dateA = new Date(a.expenseDate).getTime();
                const dateB = new Date(b.expenseDate).getTime();
                return dateB - dateA; // Plus récent en premier
            });
            return { success: true, data: filtered };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des dépenses: ${error}`) };
        }
    }
    async getExpenseById(id) {
        try {
            const expenses = await db_1.db.select().from(schema_1.financialExpenses);
            const expense = expenses.find(e => e.id === id);
            return { success: true, data: expense || null };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération de la dépense: ${error}`) };
        }
    }
    async updateExpense(id, data) {
        try {
            const expenses = await db_1.db.select().from(schema_1.financialExpenses);
            const expense = expenses.find(e => e.id === id);
            if (!expense) {
                return { success: false, error: new schema_1.NotFoundError("Dépense non trouvée") };
            }
            const [updated] = await db_1.db.update(schema_1.financialExpenses)
                .set({ ...data, updatedAt: new Date() })
                .where((0, drizzle_orm_1.sql) `${schema_1.financialExpenses.id} = ${id}`)
                .returning();
            if (!updated) {
                return { success: false, error: new schema_1.NotFoundError("Dépense non trouvée") };
            }
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la dépense: ${error}`) };
        }
    }
    async deleteExpense(id) {
        try {
            await db_1.db.delete(schema_1.financialExpenses).where((0, drizzle_orm_1.sql) `${schema_1.financialExpenses.id} = ${id}`);
            return { success: true, data: undefined };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la suppression de la dépense: ${error}`) };
        }
    }
    async getExpenseStats(period, year) {
        try {
            const allExpenses = await db_1.db.select().from(schema_1.financialExpenses);
            let expenses = allExpenses;
            // Filtrage par période et année
            if (year) {
                expenses = expenses.filter(e => {
                    const expenseDate = new Date(e.expenseDate);
                    return expenseDate.getFullYear() === year;
                });
            }
            const totalExpenses = expenses.length;
            const totalAmount = expenses.reduce((sum, e) => sum + e.amountInCents, 0);
            const byCategoryMap = new Map();
            const byPeriodMap = new Map();
            for (const expense of expenses) {
                // Par catégorie
                const catKey = expense.category;
                const catData = byCategoryMap.get(catKey) || { count: 0, totalAmount: 0 };
                catData.count++;
                catData.totalAmount += expense.amountInCents;
                byCategoryMap.set(catKey, catData);
                // Par période (mois)
                const expenseDate = new Date(expense.expenseDate);
                const periodKey = `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}`;
                const periodData = byPeriodMap.get(periodKey) || { count: 0, totalAmount: 0 };
                periodData.count++;
                periodData.totalAmount += expense.amountInCents;
                byPeriodMap.set(periodKey, periodData);
            }
            const byCategory = Array.from(byCategoryMap.entries()).map(([category, data]) => ({
                category,
                count: data.count,
                totalAmount: data.totalAmount,
            }));
            const byPeriod = Array.from(byPeriodMap.entries()).map(([period, data]) => ({
                period,
                count: data.count,
                totalAmount: data.totalAmount,
            }));
            return {
                success: true,
                data: {
                    totalExpenses,
                    totalAmount,
                    byCategory,
                    byPeriod,
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors du calcul des statistiques de dépenses: ${error}`) };
        }
    }
    // Financial categories implementation
    async getFinancialCategories(type) {
        try {
            const allCategories = await db_1.db.select().from(schema_1.financialCategories);
            let filtered = allCategories;
            if (type) {
                filtered = filtered.filter(c => c.type === type);
            }
            filtered.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type.localeCompare(b.type);
                }
                return a.name.localeCompare(b.name);
            });
            return { success: true, data: filtered };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des catégories: ${error}`) };
        }
    }
    async createCategory(category) {
        try {
            const [newCategory] = await db_1.db.insert(schema_1.financialCategories).values({
                ...category,
                updatedAt: new Date(),
            }).returning();
            return { success: true, data: newCategory };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la catégorie: ${error}`) };
        }
    }
    async updateCategory(id, data) {
        try {
            const categories = await db_1.db.select().from(schema_1.financialCategories);
            const category = categories.find(c => c.id === id);
            if (!category) {
                return { success: false, error: new schema_1.NotFoundError("Catégorie non trouvée") };
            }
            const [updated] = await db_1.db.update(schema_1.financialCategories)
                .set({ ...data, updatedAt: new Date() })
                .where((0, drizzle_orm_1.sql) `${schema_1.financialCategories.id} = ${id}`)
                .returning();
            if (!updated) {
                return { success: false, error: new schema_1.NotFoundError("Catégorie non trouvée") };
            }
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la catégorie: ${error}`) };
        }
    }
    // Financial forecasts implementation
    async createForecast(forecast) {
        try {
            const [newForecast] = await db_1.db.insert(schema_1.financialForecasts).values({
                ...forecast,
                updatedAt: new Date(),
            }).returning();
            return { success: true, data: newForecast };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la création de la prévision: ${error}`) };
        }
    }
    async getForecasts(options) {
        try {
            const allForecasts = await db_1.db.select().from(schema_1.financialForecasts);
            let filtered = allForecasts;
            if (options?.period) {
                filtered = filtered.filter(f => f.period === options.period);
            }
            if (options?.year) {
                filtered = filtered.filter(f => f.year === options.year);
            }
            if (options?.category) {
                filtered = filtered.filter(f => f.category === options.category);
            }
            filtered.sort((a, b) => {
                if (b.year !== a.year)
                    return b.year - a.year;
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            return { success: true, data: filtered };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la récupération des prévisions: ${error}`) };
        }
    }
    async updateForecast(id, data) {
        try {
            const forecasts = await db_1.db.select().from(schema_1.financialForecasts);
            const forecast = forecasts.find(f => f.id === id);
            if (!forecast) {
                return { success: false, error: new schema_1.NotFoundError("Prévision non trouvée") };
            }
            const [updated] = await db_1.db.update(schema_1.financialForecasts)
                .set({ ...data, updatedAt: new Date() })
                .where((0, drizzle_orm_1.sql) `${schema_1.financialForecasts.id} = ${id}`)
                .returning();
            if (!updated) {
                return { success: false, error: new schema_1.NotFoundError("Prévision non trouvée") };
            }
            return { success: true, data: updated };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la mise à jour de la prévision: ${error}`) };
        }
    }
    async generateForecasts(period, year) {
        try {
            // Récupérer les revenus historiques (souscriptions et sponsorings)
            const subscriptions = await db_1.db.select().from(schema_1.memberSubscriptions);
            const sponsorships = await db_1.db.select().from(schema_1.eventSponsorships)
                .where((0, drizzle_orm_1.sql) `${schema_1.eventSponsorships.status} IN ('confirmed', 'completed')`);
            // Calculer les moyennes historiques par catégorie
            const incomeCategories = await db_1.db.select().from(schema_1.financialCategories)
                .where((0, drizzle_orm_1.sql) `${schema_1.financialCategories.type} = 'income'`);
            const generatedForecasts = [];
            for (const category of incomeCategories) {
                let historicalAmount = 0;
                let historicalCount = 0;
                // Calculer moyenne historique pour cette catégorie
                if (category.name.includes('Souscriptions') || category.name.includes('souscriptions')) {
                    // Moyenne des souscriptions
                    const relevantSubs = subscriptions.filter(s => {
                        const subDate = new Date(s.createdAt);
                        return subDate.getFullYear() < year; // Données historiques
                    });
                    if (relevantSubs.length > 0) {
                        historicalAmount = relevantSubs.reduce((sum, s) => sum + s.amountInCents, 0);
                        historicalCount = relevantSubs.length;
                    }
                }
                else if (category.name.includes('Sponsoring') || category.name.includes('sponsoring')) {
                    // Moyenne des sponsorings
                    const relevantSponsorships = sponsorships.filter(s => {
                        const spDate = new Date(s.createdAt);
                        return spDate.getFullYear() < year; // Données historiques
                    });
                    if (relevantSponsorships.length > 0) {
                        historicalAmount = relevantSponsorships.reduce((sum, s) => sum + s.amount, 0);
                        historicalCount = relevantSponsorships.length;
                    }
                }
                // Calculer la prévision (moyenne historique ajustée)
                const averageAmount = historicalCount > 0 ? Math.round(historicalAmount / historicalCount) : 0;
                const forecastedAmount = averageAmount; // Peut être ajusté avec facteur de croissance
                // Déterminer le niveau de confiance
                let confidence = 'medium';
                if (historicalCount >= 12) {
                    confidence = 'high';
                }
                else if (historicalCount < 3) {
                    confidence = 'low';
                }
                // Créer la prévision
                const forecast = {
                    category: category.id,
                    period,
                    year,
                    month: period === 'month' ? 1 : undefined,
                    quarter: period === 'quarter' ? 1 : undefined,
                    forecastedAmountInCents: forecastedAmount,
                    confidence,
                    basedOn: 'historical',
                    notes: `Généré automatiquement basé sur ${historicalCount} données historiques`,
                    createdBy: 'system',
                };
                const [newForecast] = await db_1.db.insert(schema_1.financialForecasts).values({
                    ...forecast,
                    updatedAt: new Date(),
                }).returning();
                generatedForecasts.push(newForecast);
            }
            return { success: true, data: generatedForecasts };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la génération des prévisions: ${error}`) };
        }
    }
    // Extended KPIs and Reports
    async getFinancialKPIsExtended(period, year) {
        try {
            const currentYear = year || new Date().getFullYear();
            // Revenus réels (souscriptions + sponsorings)
            const subscriptions = await db_1.db.select().from(schema_1.memberSubscriptions);
            const sponsorships = await db_1.db.select().from(schema_1.eventSponsorships)
                .where((0, drizzle_orm_1.sql) `${schema_1.eventSponsorships.status} IN ('confirmed', 'completed')`);
            let actualRevenues = subscriptions.reduce((sum, s) => sum + s.amountInCents, 0) +
                sponsorships.reduce((sum, s) => sum + s.amount, 0);
            // Filtrer par année si nécessaire
            if (year) {
                const filteredSubs = subscriptions.filter(s => {
                    const subDate = new Date(s.createdAt);
                    return subDate.getFullYear() === year;
                });
                const filteredSponsorships = sponsorships.filter(s => {
                    const spDate = new Date(s.createdAt);
                    return spDate.getFullYear() === year;
                });
                actualRevenues = filteredSubs.reduce((sum, s) => sum + s.amountInCents, 0) +
                    filteredSponsorships.reduce((sum, s) => sum + s.amount, 0);
            }
            // Revenus prévus (prévisions)
            const forecasts = await db_1.db.select().from(schema_1.financialForecasts);
            let forecastedRevenues = forecasts
                .filter(f => f.year === currentYear)
                .reduce((sum, f) => sum + f.forecastedAmountInCents, 0);
            // Dépenses réelles
            const expenses = await db_1.db.select().from(schema_1.financialExpenses);
            let actualExpenses = expenses.reduce((sum, e) => sum + e.amountInCents, 0);
            if (year) {
                const filteredExpenses = expenses.filter(e => {
                    const expDate = new Date(e.expenseDate);
                    return expDate.getFullYear() === year;
                });
                actualExpenses = filteredExpenses.reduce((sum, e) => sum + e.amountInCents, 0);
            }
            // Dépenses budgétées
            const budgets = await db_1.db.select().from(schema_1.financialBudgets);
            let budgetedExpenses = budgets
                .filter(b => b.year === currentYear)
                .reduce((sum, b) => sum + b.amountInCents, 0);
            // Calculs
            const revenueVariance = actualRevenues - forecastedRevenues;
            const revenueVariancePercent = forecastedRevenues > 0
                ? (revenueVariance / forecastedRevenues) * 100
                : 0;
            const expenseVariance = actualExpenses - budgetedExpenses;
            const expenseVariancePercent = budgetedExpenses > 0
                ? (expenseVariance / budgetedExpenses) * 100
                : 0;
            const actualBalance = actualRevenues - actualExpenses;
            const forecastedBalance = forecastedRevenues - budgetedExpenses;
            const balanceVariance = actualBalance - forecastedBalance;
            const realizationRate = forecastedRevenues > 0
                ? (actualRevenues / forecastedRevenues) * 100
                : 0;
            return {
                success: true,
                data: {
                    revenues: {
                        actual: actualRevenues,
                        forecasted: forecastedRevenues,
                        variance: revenueVariance,
                        variancePercent: Math.round(revenueVariancePercent * 100) / 100,
                    },
                    expenses: {
                        actual: actualExpenses,
                        budgeted: budgetedExpenses,
                        variance: expenseVariance,
                        variancePercent: Math.round(expenseVariancePercent * 100) / 100,
                    },
                    balance: {
                        actual: actualBalance,
                        forecasted: forecastedBalance,
                        variance: balanceVariance,
                    },
                    realizationRate: Math.round(realizationRate * 100) / 100,
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors du calcul des KPIs financiers étendus: ${error}`) };
        }
    }
    async getFinancialComparison(period1, period2) {
        try {
            // Calculer les revenus et dépenses pour chaque période
            const calculatePeriodData = async (period, year) => {
                const subscriptions = await db_1.db.select().from(schema_1.memberSubscriptions);
                const sponsorships = await db_1.db.select().from(schema_1.eventSponsorships)
                    .where((0, drizzle_orm_1.sql) `${schema_1.eventSponsorships.status} IN ('confirmed', 'completed')`);
                const expenses = await db_1.db.select().from(schema_1.financialExpenses);
                // Filtrer par année
                const filteredSubs = subscriptions.filter(s => {
                    const subDate = new Date(s.createdAt);
                    return subDate.getFullYear() === year;
                });
                const filteredSponsorships = sponsorships.filter(s => {
                    const spDate = new Date(s.createdAt);
                    return spDate.getFullYear() === year;
                });
                const filteredExpenses = expenses.filter(e => {
                    const expDate = new Date(e.expenseDate);
                    return expDate.getFullYear() === year;
                });
                const revenues = filteredSubs.reduce((sum, s) => sum + s.amountInCents, 0) +
                    filteredSponsorships.reduce((sum, s) => sum + s.amount, 0);
                const expensesAmount = filteredExpenses.reduce((sum, e) => sum + e.amountInCents, 0);
                const balance = revenues - expensesAmount;
                return { revenues, expenses: expensesAmount, balance };
            };
            const data1 = await calculatePeriodData(period1.period, period1.year);
            const data2 = await calculatePeriodData(period2.period, period2.year);
            const revenueChange = data2.revenues - data1.revenues;
            const revenueChangePercent = data1.revenues > 0
                ? (revenueChange / data1.revenues) * 100
                : 0;
            const expenseChange = data2.expenses - data1.expenses;
            const expenseChangePercent = data1.expenses > 0
                ? (expenseChange / data1.expenses) * 100
                : 0;
            const balanceChange = data2.balance - data1.balance;
            const balanceChangePercent = data1.balance !== 0
                ? (balanceChange / Math.abs(data1.balance)) * 100
                : 0;
            return {
                success: true,
                data: {
                    revenues: {
                        period1: data1.revenues,
                        period2: data2.revenues,
                        change: revenueChange,
                        changePercent: Math.round(revenueChangePercent * 100) / 100,
                    },
                    expenses: {
                        period1: data1.expenses,
                        period2: data2.expenses,
                        change: expenseChange,
                        changePercent: Math.round(expenseChangePercent * 100) / 100,
                    },
                    balance: {
                        period1: data1.balance,
                        period2: data2.balance,
                        change: balanceChange,
                        changePercent: Math.round(balanceChangePercent * 100) / 100,
                    },
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la comparaison financière: ${error}`) };
        }
    }
    async getFinancialReport(type, period, year) {
        try {
            // Calculer les revenus
            const subscriptions = await db_1.db.select().from(schema_1.memberSubscriptions);
            const sponsorships = await db_1.db.select().from(schema_1.eventSponsorships)
                .where((0, drizzle_orm_1.sql) `${schema_1.eventSponsorships.status} IN ('confirmed', 'completed')`);
            let periodSubscriptions = 0;
            let periodSponsorships = 0;
            if (type === 'monthly') {
                const filteredSubs = subscriptions.filter(s => {
                    const subDate = new Date(s.createdAt);
                    return subDate.getFullYear() === year && subDate.getMonth() + 1 === period;
                });
                const filteredSponsorships = sponsorships.filter(s => {
                    const spDate = new Date(s.createdAt);
                    return spDate.getFullYear() === year && spDate.getMonth() + 1 === period;
                });
                periodSubscriptions = filteredSubs.reduce((sum, s) => sum + s.amountInCents, 0);
                periodSponsorships = filteredSponsorships.reduce((sum, s) => sum + s.amount, 0);
            }
            else if (type === 'quarterly') {
                const startMonth = (period - 1) * 3 + 1;
                const endMonth = period * 3;
                const filteredSubs = subscriptions.filter(s => {
                    const subDate = new Date(s.createdAt);
                    const month = subDate.getMonth() + 1;
                    return subDate.getFullYear() === year && month >= startMonth && month <= endMonth;
                });
                const filteredSponsorships = sponsorships.filter(s => {
                    const spDate = new Date(s.createdAt);
                    const month = spDate.getMonth() + 1;
                    return spDate.getFullYear() === year && month >= startMonth && month <= endMonth;
                });
                periodSubscriptions = filteredSubs.reduce((sum, s) => sum + s.amountInCents, 0);
                periodSponsorships = filteredSponsorships.reduce((sum, s) => sum + s.amount, 0);
            }
            else {
                const filteredSubs = subscriptions.filter(s => {
                    const subDate = new Date(s.createdAt);
                    return subDate.getFullYear() === year;
                });
                const filteredSponsorships = sponsorships.filter(s => {
                    const spDate = new Date(s.createdAt);
                    return spDate.getFullYear() === year;
                });
                periodSubscriptions = filteredSubs.reduce((sum, s) => sum + s.amountInCents, 0);
                periodSponsorships = filteredSponsorships.reduce((sum, s) => sum + s.amount, 0);
            }
            const totalRevenues = periodSubscriptions + periodSponsorships;
            // Calculer les dépenses par catégorie
            const expenses = await db_1.db.select().from(schema_1.financialExpenses);
            const categories = await db_1.db.select().from(schema_1.financialCategories);
            let periodExpenses = expenses;
            if (type === 'monthly') {
                periodExpenses = expenses.filter(e => {
                    const expDate = new Date(e.expenseDate);
                    return expDate.getFullYear() === year && expDate.getMonth() + 1 === period;
                });
            }
            else if (type === 'quarterly') {
                const startMonth = (period - 1) * 3 + 1;
                const endMonth = period * 3;
                periodExpenses = expenses.filter(e => {
                    const expDate = new Date(e.expenseDate);
                    const month = expDate.getMonth() + 1;
                    return expDate.getFullYear() === year && month >= startMonth && month <= endMonth;
                });
            }
            else {
                periodExpenses = expenses.filter(e => {
                    const expDate = new Date(e.expenseDate);
                    return expDate.getFullYear() === year;
                });
            }
            const expensesByCategoryMap = new Map();
            for (const expense of periodExpenses) {
                const category = categories.find(c => c.id === expense.category);
                const categoryName = category?.name || 'Autre';
                const current = expensesByCategoryMap.get(categoryName) || 0;
                expensesByCategoryMap.set(categoryName, current + expense.amountInCents);
            }
            const expensesByCategory = Array.from(expensesByCategoryMap.entries()).map(([category, amount]) => ({
                category,
                amount,
            }));
            const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amountInCents, 0);
            // Calculer les budgets par catégorie
            const budgets = await db_1.db.select().from(schema_1.financialBudgets);
            let periodBudgets = budgets.filter(b => b.year === year);
            if (type === 'monthly' && periodBudgets[0]?.month) {
                periodBudgets = periodBudgets.filter(b => b.month === period);
            }
            else if (type === 'quarterly' && periodBudgets[0]?.quarter) {
                periodBudgets = periodBudgets.filter(b => b.quarter === period);
            }
            const budgetsByCategoryMap = new Map();
            for (const budget of periodBudgets) {
                const category = categories.find(c => c.id === budget.category);
                const categoryName = category?.name || 'Autre';
                const current = budgetsByCategoryMap.get(categoryName) || 0;
                budgetsByCategoryMap.set(categoryName, current + budget.amountInCents);
            }
            const budgetsByCategory = Array.from(budgetsByCategoryMap.entries()).map(([category, amount]) => ({
                category,
                amount,
            }));
            const totalBudgets = periodBudgets.reduce((sum, b) => sum + b.amountInCents, 0);
            // Récupérer les prévisions
            const forecasts = await db_1.db.select().from(schema_1.financialForecasts);
            // Calculer les écarts
            const revenueForecast = forecasts
                .filter(f => f.year === year)
                .reduce((sum, f) => sum + f.forecastedAmountInCents, 0);
            const revenueVariance = totalRevenues - revenueForecast;
            const expenseVariance = totalExpenses - totalBudgets;
            const balanceVariance = (totalRevenues - totalExpenses) - (revenueForecast - totalBudgets);
            // Prévisions période suivante
            const nextPeriodForecasts = forecasts.filter(f => {
                if (type === 'monthly') {
                    return f.year === year && f.month === (period === 12 ? 1 : period + 1);
                }
                else if (type === 'quarterly') {
                    return f.year === year && f.quarter === (period === 4 ? 1 : period + 1);
                }
                else {
                    return f.year === year + 1;
                }
            });
            const nextPeriodAmount = nextPeriodForecasts.reduce((sum, f) => sum + f.forecastedAmountInCents, 0);
            const avgConfidence = nextPeriodForecasts.length > 0
                ? nextPeriodForecasts.reduce((sum, f) => {
                    const confValue = f.confidence === 'high' ? 3 : f.confidence === 'medium' ? 2 : 1;
                    return sum + confValue;
                }, 0) / nextPeriodForecasts.length
                : 0;
            const confidence = avgConfidence >= 2.5 ? 'high' : avgConfidence >= 1.5 ? 'medium' : 'low';
            const periodLabel = type === 'monthly'
                ? `${year}-${String(period).padStart(2, '0')}`
                : type === 'quarterly'
                    ? `T${period} ${year}`
                    : `${year}`;
            return {
                success: true,
                data: {
                    period: periodLabel,
                    revenues: {
                        subscriptions: periodSubscriptions,
                        sponsorships: periodSponsorships,
                        other: 0, // À implémenter si d'autres sources de revenus
                        total: totalRevenues,
                    },
                    expenses: {
                        byCategory: expensesByCategory,
                        total: totalExpenses,
                    },
                    budgets: {
                        byCategory: budgetsByCategory,
                        total: totalBudgets,
                    },
                    variances: {
                        revenues: revenueVariance,
                        expenses: expenseVariance,
                        balance: balanceVariance,
                    },
                    forecasts: {
                        nextPeriod: nextPeriodAmount,
                        confidence,
                    },
                },
            };
        }
        catch (error) {
            return { success: false, error: new schema_1.DatabaseError(`Erreur lors de la génération du rapport financier: ${error}`) };
        }
    }
}
exports.DatabaseStorage = DatabaseStorage;
exports.storage = new DatabaseStorage();
// Injecter le storage dans emailService pour charger la config email
const email_service_1 = require("./email-service");
email_service_1.emailService.setStorage(exports.storage);
