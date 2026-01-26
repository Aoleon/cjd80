"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memberSubscriptionsRelations = exports.memberActivitiesRelations = exports.membersRelations = exports.eventSponsorshipsRelations = exports.ideaPatronProposalsRelations = exports.patronUpdatesRelations = exports.patronDonationsRelations = exports.patronsRelations = exports.unsubscriptionsRelations = exports.inscriptionsRelations = exports.eventsRelations = exports.votesRelations = exports.ideasRelations = exports.emailConfig = exports.featureConfig = exports.brandingConfig = exports.trackingAlerts = exports.trackingMetrics = exports.eventSponsorships = exports.SPONSORSHIP_STATUS = exports.SPONSORSHIP_LEVEL_LABELS = exports.SPONSORSHIP_LEVEL = exports.memberRelations = exports.memberTasks = exports.memberTagAssignments = exports.memberTags = exports.memberSubscriptions = exports.memberActivities = exports.members = exports.CJD_ROLE_LABELS = exports.CJD_ROLES = exports.ideaPatronProposals = exports.patronUpdates = exports.patronDonations = exports.patrons = exports.developmentRequests = exports.pushSubscriptions = exports.unsubscriptions = exports.inscriptions = exports.loanItems = exports.events = exports.votes = exports.ideas = exports.LOAN_STATUS = exports.EVENT_STATUS = exports.IDEA_STATUS = exports.passwordResetTokens = exports.admins = exports.ADMIN_STATUS = exports.ADMIN_ROLES = void 0;
exports.insertDevelopmentRequestSchema = exports.getRolePermissions = exports.getRoleDisplayName = exports.hasPermission = exports.NotFoundError = exports.DatabaseError = exports.DuplicateError = exports.ValidationError = exports.updateEventSchema = exports.updateEventStatusSchema = exports.insertUserSchema = exports.users = exports.updateTrackingAlertSchema = exports.insertTrackingAlertSchema = exports.insertTrackingMetricSchema = exports.insertMemberRelationSchema = exports.updateMemberTaskSchema = exports.insertMemberTaskSchema = exports.assignMemberTagSchema = exports.updateMemberTagSchema = exports.insertMemberTagSchema = exports.proposeMemberSchema = exports.updateMemberSchema = exports.insertMemberActivitySchema = exports.insertMemberSchema = exports.updateEventSponsorshipSchema = exports.insertEventSponsorshipSchema = exports.updateIdeaPatronProposalSchema = exports.updatePatronSchema = exports.insertIdeaPatronProposalSchema = exports.updatePatronUpdateSchema = exports.insertPatronUpdateSchema = exports.insertPatronDonationSchema = exports.insertPatronSchema = exports.updateLoanItemStatusSchema = exports.updateLoanItemSchema = exports.insertLoanItemSchema = exports.insertUnsubscriptionSchema = exports.createEventWithInscriptionsSchema = exports.initialInscriptionSchema = exports.insertInscriptionSchema = exports.insertEventSchema = exports.insertVoteSchema = exports.updateIdeaSchema = exports.updateIdeaStatusSchema = exports.insertIdeaSchema = exports.updateAdminPasswordSchema = exports.updateAdminInfoSchema = exports.updateAdminSchema = exports.insertAdminSchema = void 0;
exports.frontendErrorSchema = exports.statusResponseSchema = exports.statusCheckSchema = exports.insertEventRegistrationSchema = exports.eventRegistrations = exports.insertAdminUserSchema = exports.adminUsers = exports.updateFinancialForecastSchema = exports.insertFinancialForecastSchema = exports.updateFinancialExpenseSchema = exports.insertFinancialExpenseSchema = exports.updateFinancialBudgetSchema = exports.insertFinancialBudgetSchema = exports.updateFinancialCategorySchema = exports.insertFinancialCategorySchema = exports.insertFeatureConfigSchema = exports.insertEmailConfigSchema = exports.insertBrandingConfigSchema = exports.financialForecastsRelations = exports.financialExpensesRelations = exports.financialBudgetsRelations = exports.financialCategoriesRelations = exports.financialForecasts = exports.financialExpenses = exports.financialBudgets = exports.financialCategories = exports.FORECAST_BASED_ON = exports.FORECAST_CONFIDENCE = exports.FINANCIAL_CATEGORY_TYPE = exports.FINANCIAL_PERIOD = exports.insertMemberSubscriptionSchema = exports.updateDevelopmentRequestStatusSchema = exports.updateDevelopmentRequestSchema = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// Admin roles definition
exports.ADMIN_ROLES = {
    SUPER_ADMIN: "super_admin",
    IDEAS_READER: "ideas_reader",
    IDEAS_MANAGER: "ideas_manager",
    EVENTS_READER: "events_reader",
    EVENTS_MANAGER: "events_manager"
};
// Admin status definition
exports.ADMIN_STATUS = {
    PENDING: "pending", // En attente de validation
    ACTIVE: "active", // Compte validé et actif
    INACTIVE: "inactive" // Compte désactivé
};
// Admin users table  
exports.admins = (0, pg_core_1.pgTable)("admins", {
    email: (0, pg_core_1.text)("email").primaryKey(),
    firstName: (0, pg_core_1.text)("first_name").default("Admin").notNull(),
    lastName: (0, pg_core_1.text)("last_name").default("User").notNull(),
    password: (0, pg_core_1.text)("password"), // Nullable car géré par Authentik pour les nouveaux utilisateurs
    addedBy: (0, pg_core_1.text)("added_by"),
    role: (0, pg_core_1.text)("role").default(exports.ADMIN_ROLES.IDEAS_READER).notNull(), // Rôle par défaut : consultation des idées
    status: (0, pg_core_1.text)("status").default(exports.ADMIN_STATUS.PENDING).notNull(), // Statut par défaut : en attente
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(), // Permet de désactiver un admin sans le supprimer
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    roleIdx: (0, pg_core_1.index)("admins_role_idx").on(table.role),
    statusIdx: (0, pg_core_1.index)("admins_status_idx").on(table.status),
    activeIdx: (0, pg_core_1.index)("admins_active_idx").on(table.isActive),
}));
// Password reset tokens table - Tokens pour la réinitialisation de mot de passe
exports.passwordResetTokens = (0, pg_core_1.pgTable)("password_reset_tokens", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    email: (0, pg_core_1.text)("email").notNull().references(() => exports.admins.email, { onDelete: "cascade" }),
    token: (0, pg_core_1.text)("token").notNull().unique(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    usedAt: (0, pg_core_1.timestamp)("used_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    emailIdx: (0, pg_core_1.index)("password_reset_tokens_email_idx").on(table.email),
    tokenIdx: (0, pg_core_1.index)("password_reset_tokens_token_idx").on(table.token),
    expiresAtIdx: (0, pg_core_1.index)("password_reset_tokens_expires_at_idx").on(table.expiresAt),
}));
// Status constants for ideas and events
exports.IDEA_STATUS = {
    PENDING: "pending",
    APPROVED: "approved",
    REJECTED: "rejected",
    UNDER_REVIEW: "under_review",
    POSTPONED: "postponed",
    COMPLETED: "completed"
};
exports.EVENT_STATUS = {
    DRAFT: "draft",
    PUBLISHED: "published",
    CANCELLED: "cancelled",
    POSTPONED: "postponed",
    COMPLETED: "completed"
};
exports.LOAN_STATUS = {
    PENDING: "pending",
    AVAILABLE: "available",
    BORROWED: "borrowed",
    UNAVAILABLE: "unavailable"
};
// Ideas table - Flexible status workflow management
exports.ideas = (0, pg_core_1.pgTable)("ideas", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    proposedBy: (0, pg_core_1.text)("proposed_by").notNull(),
    proposedByEmail: (0, pg_core_1.text)("proposed_by_email").notNull(),
    status: (0, pg_core_1.text)("status").default(exports.IDEA_STATUS.PENDING).notNull(), // pending, approved, rejected, under_review, postponed, completed
    featured: (0, pg_core_1.boolean)("featured").default(false).notNull(), // Mise en avant de l'idée
    deadline: (0, pg_core_1.timestamp)("deadline"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    updatedBy: (0, pg_core_1.text)("updated_by"),
}, (table) => ({
    statusIdx: (0, pg_core_1.index)("ideas_status_idx").on(table.status),
    emailIdx: (0, pg_core_1.index)("ideas_email_idx").on(table.proposedByEmail),
    featuredIdx: (0, pg_core_1.index)("ideas_featured_idx").on(table.featured),
    createdAtIdx: (0, pg_core_1.index)("ideas_created_at_idx").on(table.createdAt),
}));
// Votes table
exports.votes = (0, pg_core_1.pgTable)("votes", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ideaId: (0, pg_core_1.varchar)("idea_id").references(() => exports.ideas.id, { onDelete: "cascade" }).notNull(),
    voterName: (0, pg_core_1.text)("voter_name").notNull(),
    voterEmail: (0, pg_core_1.text)("voter_email").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    // Contrainte unique: un email ne peut voter qu'une seule fois par idée
    uniqueVotePerEmail: (0, pg_core_1.unique)().on(table.ideaId, table.voterEmail),
    ideaIdIdx: (0, pg_core_1.index)("votes_idea_id_idx").on(table.ideaId),
}));
// Events table - Flexible status workflow management  
exports.events = (0, pg_core_1.pgTable)("events", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    date: (0, pg_core_1.timestamp)("date").notNull(),
    location: (0, pg_core_1.text)("location"), // Lieu de l'événement
    maxParticipants: (0, pg_core_1.integer)("max_participants"), // Limite de participants (optionnel)
    helloAssoLink: (0, pg_core_1.text)("hello_asso_link"),
    enableExternalRedirect: (0, pg_core_1.boolean)("enable_external_redirect").default(false).notNull(), // Active la redirection externe après inscription
    externalRedirectUrl: (0, pg_core_1.text)("external_redirect_url"), // URL de redirection externe (HelloAsso, etc.)
    showInscriptionsCount: (0, pg_core_1.boolean)("show_inscriptions_count").default(true).notNull(), // Afficher le nombre d'inscrits
    showAvailableSeats: (0, pg_core_1.boolean)("show_available_seats").default(true).notNull(), // Afficher le nombre de places disponibles
    allowUnsubscribe: (0, pg_core_1.boolean)("allow_unsubscribe").default(false).notNull(), // Permet la désinscription (utile pour les plénières)
    redUnsubscribeButton: (0, pg_core_1.boolean)("red_unsubscribe_button").default(false).notNull(), // Bouton de désinscription rouge (pour les plénières)
    buttonMode: (0, pg_core_1.text)("button_mode").default("subscribe").notNull(), // "subscribe", "unsubscribe", "both", ou "custom"
    customButtonText: (0, pg_core_1.text)("custom_button_text"), // Texte personnalisé pour le bouton quand buttonMode est "custom"
    status: (0, pg_core_1.text)("status").default(exports.EVENT_STATUS.PUBLISHED).notNull(), // draft, published, cancelled, postponed, completed
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    updatedBy: (0, pg_core_1.text)("updated_by"),
}, (table) => ({
    statusIdx: (0, pg_core_1.index)("events_status_idx").on(table.status),
    dateIdx: (0, pg_core_1.index)("events_date_idx").on(table.date),
    statusDateIdx: (0, pg_core_1.index)("events_status_date_idx").on(table.status, table.date),
}));
// Loan items table - Matériel disponible au prêt
exports.loanItems = (0, pg_core_1.pgTable)("loan_items", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description"),
    lenderName: (0, pg_core_1.text)("lender_name").notNull(), // Nom du JD qui prête (texte libre)
    photoUrl: (0, pg_core_1.text)("photo_url"), // URL de la photo uploadée
    status: (0, pg_core_1.text)("status").default(exports.LOAN_STATUS.PENDING).notNull(), // pending, available, borrowed, unavailable
    proposedBy: (0, pg_core_1.text)("proposed_by").notNull(), // Nom de la personne qui propose
    proposedByEmail: (0, pg_core_1.text)("proposed_by_email").notNull(), // Email de la personne qui propose
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    updatedBy: (0, pg_core_1.text)("updated_by"), // Email de l'admin qui a modifié
}, (table) => ({
    statusIdx: (0, pg_core_1.index)("loan_items_status_idx").on(table.status),
    createdAtIdx: (0, pg_core_1.index)("loan_items_created_at_idx").on(table.createdAt),
    // Index pour optimiser les recherches textuelles (GIN index pour ILIKE)
    titleSearchIdx: (0, pg_core_1.index)("loan_items_title_search_idx").on(table.title),
    // Index composite pour les requêtes fréquentes (status + createdAt)
    statusCreatedIdx: (0, pg_core_1.index)("loan_items_status_created_idx").on(table.status, table.createdAt),
}));
// Inscriptions table  
exports.inscriptions = (0, pg_core_1.pgTable)("inscriptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    eventId: (0, pg_core_1.varchar)("event_id").references(() => exports.events.id, { onDelete: "cascade" }).notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    company: (0, pg_core_1.text)("company"), // Société (optionnel)
    phone: (0, pg_core_1.text)("phone"), // Téléphone (optionnel)
    comments: (0, pg_core_1.text)("comments"), // Commentaires lors de l'inscription (accompagnants, régime alimentaire, etc.)
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    // Contrainte unique: un email ne peut s'inscrire qu'une seule fois par événement
    uniqueRegistrationPerEmail: (0, pg_core_1.unique)().on(table.eventId, table.email),
    eventIdIdx: (0, pg_core_1.index)("inscriptions_event_id_idx").on(table.eventId),
}));
// Unsubscriptions table - for people declaring they cannot attend an event
exports.unsubscriptions = (0, pg_core_1.pgTable)("unsubscriptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    eventId: (0, pg_core_1.varchar)("event_id").references(() => exports.events.id, { onDelete: "cascade" }).notNull(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull(),
    comments: (0, pg_core_1.text)("comments"), // Raison de l'absence, commentaires, etc.
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    // Contrainte unique: un email ne peut se désinscrire qu'une seule fois par événement
    uniqueUnsubscriptionPerEmail: (0, pg_core_1.unique)().on(table.eventId, table.email),
}));
// Push subscriptions table for PWA notifications
exports.pushSubscriptions = (0, pg_core_1.pgTable)("push_subscriptions", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    endpoint: (0, pg_core_1.text)("endpoint").notNull().unique(),
    p256dh: (0, pg_core_1.text)("p256dh").notNull(),
    auth: (0, pg_core_1.text)("auth").notNull(),
    userEmail: (0, pg_core_1.text)("user_email"), // Optional: link to user if logged in
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    endpointIdx: (0, pg_core_1.index)("push_subscriptions_endpoint_idx").on(table.endpoint),
    emailIdx: (0, pg_core_1.index)("push_subscriptions_email_idx").on(table.userEmail),
}));
// Development requests table - For GitHub issues integration
exports.developmentRequests = (0, pg_core_1.pgTable)("development_requests", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    title: (0, pg_core_1.text)("title").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // "bug" or "feature"
    priority: (0, pg_core_1.text)("priority").default("medium").notNull(), // "low", "medium", "high", "critical"
    requestedBy: (0, pg_core_1.text)("requested_by").notNull(), // Email du super admin qui a fait la demande
    requestedByName: (0, pg_core_1.text)("requested_by_name").notNull(), // Nom du demandeur
    githubIssueNumber: (0, pg_core_1.integer)("github_issue_number"), // Numéro de l'issue GitHub créée
    githubIssueUrl: (0, pg_core_1.text)("github_issue_url"), // URL complète de l'issue GitHub
    status: (0, pg_core_1.text)("status").default("open").notNull(), // "open", "in_progress", "closed", "cancelled"
    githubStatus: (0, pg_core_1.text)("github_status").default("open").notNull(), // Statut depuis GitHub: "open", "closed"
    adminComment: (0, pg_core_1.text)("admin_comment"), // Commentaire du super administrateur
    lastStatusChangeBy: (0, pg_core_1.text)("last_status_change_by"), // Email de la personne qui a modifié le statut en dernier
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    lastSyncedAt: (0, pg_core_1.timestamp)("last_synced_at"), // Dernière synchronisation avec GitHub
}, (table) => ({
    typeIdx: (0, pg_core_1.index)("dev_requests_type_idx").on(table.type),
    statusIdx: (0, pg_core_1.index)("dev_requests_status_idx").on(table.status),
    requestedByIdx: (0, pg_core_1.index)("dev_requests_requested_by_idx").on(table.requestedBy),
    githubIssueIdx: (0, pg_core_1.index)("dev_requests_github_issue_idx").on(table.githubIssueNumber),
}));
// Patrons table - CRM pour la gestion des mécènes
exports.patrons = (0, pg_core_1.pgTable)("patrons", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    firstName: (0, pg_core_1.text)("first_name").notNull(),
    lastName: (0, pg_core_1.text)("last_name").notNull(),
    role: (0, pg_core_1.text)("role"), // Fonction du mécène
    company: (0, pg_core_1.text)("company"), // Société
    phone: (0, pg_core_1.text)("phone"), // Téléphone
    email: (0, pg_core_1.text)("email").notNull().unique(), // Email unique pour éviter les doublons
    notes: (0, pg_core_1.text)("notes"), // Informations complémentaires
    status: (0, pg_core_1.text)("status").notNull().default("active"), // 'active' | 'proposed'
    referrerId: (0, pg_core_1.varchar)("referrer_id").references(() => exports.members.id, { onDelete: "set null" }), // Prescripteur (membre qui a apporté ce mécène)
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
    createdBy: (0, pg_core_1.text)("created_by"), // Email admin qui a ajouté le mécène
}, (table) => ({
    emailIdx: (0, pg_core_1.index)("patrons_email_idx").on(table.email),
    createdByIdx: (0, pg_core_1.index)("patrons_created_by_idx").on(table.createdBy),
    createdAtIdx: (0, pg_core_1.index)("patrons_created_at_idx").on(table.createdAt),
    referrerIdIdx: (0, pg_core_1.index)("patrons_referrer_id_idx").on(table.referrerId),
}));
// Patron donations table - Historique des dons
exports.patronDonations = (0, pg_core_1.pgTable)("patron_donations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    patronId: (0, pg_core_1.varchar)("patron_id").references(() => exports.patrons.id, { onDelete: "cascade" }).notNull(),
    donatedAt: (0, pg_core_1.timestamp)("donated_at").notNull(), // Date du don
    amount: (0, pg_core_1.integer)("amount").notNull(), // Montant en centimes
    occasion: (0, pg_core_1.text)("occasion").notNull(), // À quelle occasion : événement, projet, etc.
    recordedBy: (0, pg_core_1.text)("recorded_by").notNull(), // Email admin qui enregistre
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    patronIdIdx: (0, pg_core_1.index)("patron_donations_patron_id_idx").on(table.patronId),
    donatedAtIdx: (0, pg_core_1.index)("patron_donations_donated_at_idx").on(table.donatedAt.desc()),
}));
// Patron updates table - Actualités et contacts avec les mécènes
exports.patronUpdates = (0, pg_core_1.pgTable)("patron_updates", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    patronId: (0, pg_core_1.varchar)("patron_id").references(() => exports.patrons.id, { onDelete: "cascade" }).notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'meeting', 'email', 'call', 'lunch', 'event'
    subject: (0, pg_core_1.text)("subject").notNull(), // Titre/sujet de l'actualité
    date: (0, pg_core_1.date)("date").notNull(), // Date du contact (format YYYY-MM-DD)
    startTime: (0, pg_core_1.text)("start_time"), // Heure de début (format HH:MM, optionnel)
    duration: (0, pg_core_1.integer)("duration"), // Durée en minutes (optionnel)
    description: (0, pg_core_1.text)("description").notNull(), // Description détaillée
    notes: (0, pg_core_1.text)("notes"), // Notes additionnelles (optionnel)
    createdBy: (0, pg_core_1.text)("created_by").notNull(), // Email de l'admin qui a créé
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    patronIdIdx: (0, pg_core_1.index)("patron_updates_patron_id_idx").on(table.patronId),
    typeIdx: (0, pg_core_1.index)("patron_updates_type_idx").on(table.type),
    dateIdx: (0, pg_core_1.index)("patron_updates_date_idx").on(table.date.desc()),
    createdAtIdx: (0, pg_core_1.index)("patron_updates_created_at_idx").on(table.createdAt.desc()),
}));
// Idea patron proposals table - Propositions mécènes-idées
exports.ideaPatronProposals = (0, pg_core_1.pgTable)("idea_patron_proposals", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    ideaId: (0, pg_core_1.varchar)("idea_id").references(() => exports.ideas.id, { onDelete: "cascade" }).notNull(),
    patronId: (0, pg_core_1.varchar)("patron_id").references(() => exports.patrons.id, { onDelete: "cascade" }).notNull(),
    proposedByAdminEmail: (0, pg_core_1.text)("proposed_by_admin_email").notNull(), // Email du membre qui propose
    proposedAt: (0, pg_core_1.timestamp)("proposed_at").defaultNow().notNull(),
    status: (0, pg_core_1.text)("status").default("proposed").notNull(), // 'proposed', 'contacted', 'declined', 'converted'
    comments: (0, pg_core_1.text)("comments"), // Notes de suivi
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    uniqueIdeaPatron: (0, pg_core_1.unique)().on(table.ideaId, table.patronId),
    ideaIdIdx: (0, pg_core_1.index)("idea_patron_proposals_idea_id_idx").on(table.ideaId),
    patronIdIdx: (0, pg_core_1.index)("idea_patron_proposals_patron_id_idx").on(table.patronId),
    statusIdx: (0, pg_core_1.index)("idea_patron_proposals_status_idx").on(table.status),
}));
// CJD Roles definition - Rôles organisationnels CJD
exports.CJD_ROLES = {
    PRESIDENT: "president",
    CO_PRESIDENT: "co_president",
    TRESORIER: "tresorier",
    SECRETAIRE: "secretaire",
    RESPONSABLE_RECRUTEMENT: "responsable_recrutement",
    RESPONSABLE_JEUNESSE: "responsable_jeunesse",
    RESPONSABLE_PLENIERES: "responsable_plenieres",
    RESPONSABLE_MECENES: "responsable_mecenes",
};
// Helper to get role label
exports.CJD_ROLE_LABELS = {
    [exports.CJD_ROLES.PRESIDENT]: "Président",
    [exports.CJD_ROLES.CO_PRESIDENT]: "Co-Président",
    [exports.CJD_ROLES.TRESORIER]: "Trésorier",
    [exports.CJD_ROLES.SECRETAIRE]: "Secrétaire",
    [exports.CJD_ROLES.RESPONSABLE_RECRUTEMENT]: "Responsable recrutement",
    [exports.CJD_ROLES.RESPONSABLE_JEUNESSE]: "Responsable jeunesse",
    [exports.CJD_ROLES.RESPONSABLE_PLENIERES]: "Responsable plénières",
    [exports.CJD_ROLES.RESPONSABLE_MECENES]: "Responsable mécènes",
};
// Members table - CRM pour la gestion des membres
exports.members = (0, pg_core_1.pgTable)("members", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    firstName: (0, pg_core_1.text)("first_name").notNull(),
    lastName: (0, pg_core_1.text)("last_name").notNull(),
    company: (0, pg_core_1.text)("company"),
    phone: (0, pg_core_1.text)("phone"),
    role: (0, pg_core_1.text)("role"), // Rôle professionnel/métier
    cjdRole: (0, pg_core_1.text)("cjd_role"), // Rôle organisationnel CJD (président, trésorier, etc.)
    notes: (0, pg_core_1.text)("notes"),
    status: (0, pg_core_1.text)("status").default("active").notNull(),
    proposedBy: (0, pg_core_1.text)("proposed_by"),
    engagementScore: (0, pg_core_1.integer)("engagement_score").default(0).notNull(),
    firstSeenAt: (0, pg_core_1.timestamp)("first_seen_at").notNull(),
    lastActivityAt: (0, pg_core_1.timestamp)("last_activity_at").notNull(),
    activityCount: (0, pg_core_1.integer)("activity_count").default(0).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    emailIdx: (0, pg_core_1.index)("members_email_idx").on(table.email),
    lastActivityAtIdx: (0, pg_core_1.index)("members_last_activity_at_idx").on(table.lastActivityAt.desc()),
    engagementScoreIdx: (0, pg_core_1.index)("members_engagement_score_idx").on(table.engagementScore.desc()),
    statusIdx: (0, pg_core_1.index)("members_status_idx").on(table.status),
    cjdRoleIdx: (0, pg_core_1.index)("members_cjd_role_idx").on(table.cjdRole),
}));
// Member activities table - Journal d'activité des membres
exports.memberActivities = (0, pg_core_1.pgTable)("member_activities", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    memberEmail: (0, pg_core_1.text)("member_email").references(() => exports.members.email, { onDelete: "cascade" }).notNull(),
    activityType: (0, pg_core_1.text)("activity_type").notNull(), // 'idea_proposed', 'vote_cast', 'event_registered', 'event_unregistered', 'patron_suggested'
    entityType: (0, pg_core_1.text)("entity_type").notNull(), // 'idea', 'vote', 'event', 'patron'
    entityId: (0, pg_core_1.varchar)("entity_id"),
    entityTitle: (0, pg_core_1.text)("entity_title"),
    metadata: (0, pg_core_1.text)("metadata"),
    scoreImpact: (0, pg_core_1.integer)("score_impact").notNull(),
    occurredAt: (0, pg_core_1.timestamp)("occurred_at").defaultNow().notNull(),
}, (table) => ({
    memberEmailIdx: (0, pg_core_1.index)("member_activities_member_email_idx").on(table.memberEmail),
    occurredAtIdx: (0, pg_core_1.index)("member_activities_occurred_at_idx").on(table.occurredAt.desc()),
    activityTypeIdx: (0, pg_core_1.index)("member_activities_activity_type_idx").on(table.activityType),
}));
// Member subscriptions table - Historique des souscriptions des membres
exports.memberSubscriptions = (0, pg_core_1.pgTable)("member_subscriptions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    memberEmail: (0, pg_core_1.varchar)("member_email", { length: 255 }).notNull().references(() => exports.members.email),
    amountInCents: (0, pg_core_1.integer)("amount_in_cents").notNull(), // Stocké en centimes comme pour les donations
    startDate: (0, pg_core_1.date)("start_date").notNull(), // Format YYYY-MM-DD
    endDate: (0, pg_core_1.date)("end_date").notNull(), // Format YYYY-MM-DD
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    memberEmailIdx: (0, pg_core_1.index)("member_subscriptions_member_email_idx").on(table.memberEmail),
    startDateIdx: (0, pg_core_1.index)("member_subscriptions_start_date_idx").on(table.startDate.desc()),
}));
// Member tags table - Tags personnalisables pour les membres
exports.memberTags = (0, pg_core_1.pgTable)("member_tags", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.text)("name").notNull().unique(), // Nom du tag (ex: "VIP", "Ambassadeur")
    color: (0, pg_core_1.text)("color").default("#3b82f6").notNull(), // Couleur du tag en hex
    description: (0, pg_core_1.text)("description"), // Description optionnelle
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    nameIdx: (0, pg_core_1.index)("member_tags_name_idx").on(table.name),
}));
// Member tag assignments table - Association membres <-> tags
exports.memberTagAssignments = (0, pg_core_1.pgTable)("member_tag_assignments", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    memberEmail: (0, pg_core_1.text)("member_email").references(() => exports.members.email, { onDelete: "cascade" }).notNull(),
    tagId: (0, pg_core_1.varchar)("tag_id").references(() => exports.memberTags.id, { onDelete: "cascade" }).notNull(),
    assignedBy: (0, pg_core_1.text)("assigned_by"), // Email de l'admin qui a assigné le tag
    assignedAt: (0, pg_core_1.timestamp)("assigned_at").defaultNow().notNull(),
}, (table) => ({
    memberTagIdx: (0, pg_core_1.index)("member_tag_assignments_member_tag_idx").on(table.memberEmail, table.tagId),
    memberEmailIdx: (0, pg_core_1.index)("member_tag_assignments_member_email_idx").on(table.memberEmail),
    tagIdIdx: (0, pg_core_1.index)("member_tag_assignments_tag_id_idx").on(table.tagId),
}));
// Member tasks table - Tâches de suivi pour les membres
exports.memberTasks = (0, pg_core_1.pgTable)("member_tasks", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    memberEmail: (0, pg_core_1.text)("member_email").references(() => exports.members.email, { onDelete: "cascade" }).notNull(),
    title: (0, pg_core_1.text)("title").notNull(), // Titre de la tâche
    description: (0, pg_core_1.text)("description"), // Description détaillée
    taskType: (0, pg_core_1.text)("task_type").notNull(), // 'call', 'email', 'meeting', 'custom'
    status: (0, pg_core_1.text)("status").default("todo").notNull(), // 'todo', 'in_progress', 'completed', 'cancelled'
    dueDate: (0, pg_core_1.timestamp)("due_date"), // Date d'échéance
    completedAt: (0, pg_core_1.timestamp)("completed_at"), // Date de complétion
    completedBy: (0, pg_core_1.text)("completed_by"), // Email de l'admin qui a complété
    assignedTo: (0, pg_core_1.text)("assigned_to"), // Email de l'admin assigné à la tâche
    createdBy: (0, pg_core_1.text)("created_by").notNull(), // Email de l'admin créateur
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    memberEmailIdx: (0, pg_core_1.index)("member_tasks_member_email_idx").on(table.memberEmail),
    statusIdx: (0, pg_core_1.index)("member_tasks_status_idx").on(table.status),
    dueDateIdx: (0, pg_core_1.index)("member_tasks_due_date_idx").on(table.dueDate),
    createdByIdx: (0, pg_core_1.index)("member_tasks_created_by_idx").on(table.createdBy),
}));
// Member relations table - Relations entre membres (parrainage, équipe)
exports.memberRelations = (0, pg_core_1.pgTable)("member_relations", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    memberEmail: (0, pg_core_1.text)("member_email").references(() => exports.members.email, { onDelete: "cascade" }).notNull(),
    relatedMemberEmail: (0, pg_core_1.text)("related_member_email").references(() => exports.members.email, { onDelete: "cascade" }).notNull(),
    relationType: (0, pg_core_1.text)("relation_type").notNull(), // 'sponsor' (parrainage), 'team' (équipe), 'custom'
    description: (0, pg_core_1.text)("description"), // Description de la relation
    createdBy: (0, pg_core_1.text)("created_by"), // Email de l'admin créateur
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
}, (table) => ({
    memberRelationIdx: (0, pg_core_1.index)("member_relations_member_relation_idx").on(table.memberEmail, table.relatedMemberEmail),
    memberEmailIdx: (0, pg_core_1.index)("member_relations_member_email_idx").on(table.memberEmail),
    relatedMemberEmailIdx: (0, pg_core_1.index)("member_relations_related_member_email_idx").on(table.relatedMemberEmail),
    relationTypeIdx: (0, pg_core_1.index)("member_relations_relation_type_idx").on(table.relationType),
}));
// Event sponsorship levels definition
exports.SPONSORSHIP_LEVEL = {
    PLATINUM: "platinum",
    GOLD: "gold",
    SILVER: "silver",
    BRONZE: "bronze",
    PARTNER: "partner"
};
// Sponsorship level labels
exports.SPONSORSHIP_LEVEL_LABELS = {
    [exports.SPONSORSHIP_LEVEL.PLATINUM]: "Platine",
    [exports.SPONSORSHIP_LEVEL.GOLD]: "Or",
    [exports.SPONSORSHIP_LEVEL.SILVER]: "Argent",
    [exports.SPONSORSHIP_LEVEL.BRONZE]: "Bronze",
    [exports.SPONSORSHIP_LEVEL.PARTNER]: "Partenaire",
};
// Event sponsorship status definition
exports.SPONSORSHIP_STATUS = {
    PROPOSED: "proposed", // Proposé au mécène
    CONFIRMED: "confirmed", // Confirmé par le mécène
    COMPLETED: "completed", // Réalisé (événement passé)
    CANCELLED: "cancelled" // Annulé
};
// Event sponsorships table - Sponsoring d'événements par les mécènes
exports.eventSponsorships = (0, pg_core_1.pgTable)("event_sponsorships", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    eventId: (0, pg_core_1.varchar)("event_id").references(() => exports.events.id, { onDelete: "cascade" }).notNull(),
    patronId: (0, pg_core_1.varchar)("patron_id").references(() => exports.patrons.id, { onDelete: "cascade" }).notNull(),
    level: (0, pg_core_1.text)("level").notNull(), // platinum, gold, silver, bronze, partner
    amount: (0, pg_core_1.integer)("amount").notNull(), // Montant en centimes
    benefits: (0, pg_core_1.text)("benefits"), // Contreparties offertes (texte libre)
    isPubliclyVisible: (0, pg_core_1.boolean)("is_publicly_visible").default(true).notNull(), // Affichage public
    status: (0, pg_core_1.text)("status").default(exports.SPONSORSHIP_STATUS.PROPOSED).notNull(), // proposed, confirmed, completed, cancelled
    logoUrl: (0, pg_core_1.text)("logo_url"), // URL du logo du sponsor (optionnel)
    websiteUrl: (0, pg_core_1.text)("website_url"), // URL du site web du sponsor (optionnel)
    proposedByAdminEmail: (0, pg_core_1.text)("proposed_by_admin_email").notNull(), // Email de l'admin qui propose
    confirmedAt: (0, pg_core_1.timestamp)("confirmed_at"), // Date de confirmation
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    uniqueEventPatron: (0, pg_core_1.unique)().on(table.eventId, table.patronId),
    eventIdIdx: (0, pg_core_1.index)("event_sponsorships_event_id_idx").on(table.eventId),
    patronIdIdx: (0, pg_core_1.index)("event_sponsorships_patron_id_idx").on(table.patronId),
    statusIdx: (0, pg_core_1.index)("event_sponsorships_status_idx").on(table.status),
    levelIdx: (0, pg_core_1.index)("event_sponsorships_level_idx").on(table.level),
}));
// Tracking transversal - Suivi des membres potentiels et mécènes
exports.trackingMetrics = (0, pg_core_1.pgTable)("tracking_metrics", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.text)("entity_type").notNull(), // 'member' | 'patron'
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(), // ID du membre ou mécène
    entityEmail: (0, pg_core_1.text)("entity_email").notNull(), // Email pour faciliter les recherches
    metricType: (0, pg_core_1.text)("metric_type").notNull(), // 'status_change', 'engagement', 'contact', 'conversion', 'activity'
    metricValue: (0, pg_core_1.integer)("metric_value"), // Valeur numérique de la métrique
    metricData: (0, pg_core_1.text)("metric_data"), // Données JSON supplémentaires
    description: (0, pg_core_1.text)("description"), // Description de la métrique
    recordedBy: (0, pg_core_1.text)("recorded_by"), // Email de l'admin qui a enregistré
    recordedAt: (0, pg_core_1.timestamp)("recorded_at").defaultNow().notNull(),
}, (table) => ({
    entityTypeIdx: (0, pg_core_1.index)("tracking_metrics_entity_type_idx").on(table.entityType),
    entityIdIdx: (0, pg_core_1.index)("tracking_metrics_entity_id_idx").on(table.entityId),
    entityEmailIdx: (0, pg_core_1.index)("tracking_metrics_entity_email_idx").on(table.entityEmail),
    metricTypeIdx: (0, pg_core_1.index)("tracking_metrics_metric_type_idx").on(table.metricType),
    recordedAtIdx: (0, pg_core_1.index)("tracking_metrics_recorded_at_idx").on(table.recordedAt.desc()),
}));
// Tracking alerts - Alertes pour le suivi
exports.trackingAlerts = (0, pg_core_1.pgTable)("tracking_alerts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    entityType: (0, pg_core_1.text)("entity_type").notNull(), // 'member' | 'patron'
    entityId: (0, pg_core_1.varchar)("entity_id").notNull(),
    entityEmail: (0, pg_core_1.text)("entity_email").notNull(),
    alertType: (0, pg_core_1.text)("alert_type").notNull(), // 'stale', 'high_potential', 'needs_followup', 'conversion_opportunity'
    severity: (0, pg_core_1.text)("severity").notNull().default("medium"), // 'low', 'medium', 'high', 'critical'
    title: (0, pg_core_1.text)("title").notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    isRead: (0, pg_core_1.boolean)("is_read").default(false).notNull(),
    isResolved: (0, pg_core_1.boolean)("is_resolved").default(false).notNull(),
    resolvedBy: (0, pg_core_1.text)("resolved_by"), // Email de l'admin qui a résolu
    resolvedAt: (0, pg_core_1.timestamp)("resolved_at"),
    createdBy: (0, pg_core_1.text)("created_by"), // Email de l'admin qui a créé (ou système)
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at"), // Date d'expiration de l'alerte
}, (table) => ({
    entityTypeIdx: (0, pg_core_1.index)("tracking_alerts_entity_type_idx").on(table.entityType),
    entityIdIdx: (0, pg_core_1.index)("tracking_alerts_entity_id_idx").on(table.entityId),
    entityEmailIdx: (0, pg_core_1.index)("tracking_alerts_entity_email_idx").on(table.entityEmail),
    alertTypeIdx: (0, pg_core_1.index)("tracking_alerts_alert_type_idx").on(table.alertType),
    severityIdx: (0, pg_core_1.index)("tracking_alerts_severity_idx").on(table.severity),
    isReadIdx: (0, pg_core_1.index)("tracking_alerts_is_read_idx").on(table.isRead),
    isResolvedIdx: (0, pg_core_1.index)("tracking_alerts_is_resolved_idx").on(table.isResolved),
    createdAtIdx: (0, pg_core_1.index)("tracking_alerts_created_at_idx").on(table.createdAt.desc()),
}));
// Branding configuration table - For customizable branding settings
exports.brandingConfig = (0, pg_core_1.pgTable)("branding_config", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    config: (0, pg_core_1.text)("config").notNull(),
    updatedBy: (0, pg_core_1.text)("updated_by"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Feature configuration table - For enabling/disabling features
exports.featureConfig = (0, pg_core_1.pgTable)("feature_config", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    featureKey: (0, pg_core_1.text)("feature_key").notNull().unique(),
    enabled: (0, pg_core_1.boolean)("enabled").default(true).notNull(),
    updatedBy: (0, pg_core_1.text)("updated_by"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    featureKeyIdx: (0, pg_core_1.index)("feature_config_key_idx").on(table.featureKey),
}));
// Email configuration table - For SMTP settings
exports.emailConfig = (0, pg_core_1.pgTable)("email_config", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    provider: (0, pg_core_1.varchar)("provider", { length: 50 }).notNull().default('ovh'), // ovh, gmail, smtp, etc.
    host: (0, pg_core_1.varchar)("host", { length: 255 }).notNull(),
    port: (0, pg_core_1.integer)("port").notNull().default(465),
    secure: (0, pg_core_1.boolean)("secure").notNull().default(true),
    fromName: (0, pg_core_1.varchar)("from_name", { length: 255 }),
    fromEmail: (0, pg_core_1.varchar)("from_email", { length: 255 }).notNull(),
    updatedBy: (0, pg_core_1.text)("updated_by"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
// Relations
exports.ideasRelations = (0, drizzle_orm_1.relations)(exports.ideas, ({ many }) => ({
    votes: many(exports.votes),
    patronProposals: many(exports.ideaPatronProposals),
}));
exports.votesRelations = (0, drizzle_orm_1.relations)(exports.votes, ({ one }) => ({
    idea: one(exports.ideas, {
        fields: [exports.votes.ideaId],
        references: [exports.ideas.id],
    }),
}));
exports.eventsRelations = (0, drizzle_orm_1.relations)(exports.events, ({ many }) => ({
    inscriptions: many(exports.inscriptions),
    unsubscriptions: many(exports.unsubscriptions),
    sponsorships: many(exports.eventSponsorships),
}));
exports.inscriptionsRelations = (0, drizzle_orm_1.relations)(exports.inscriptions, ({ one }) => ({
    event: one(exports.events, {
        fields: [exports.inscriptions.eventId],
        references: [exports.events.id],
    }),
}));
exports.unsubscriptionsRelations = (0, drizzle_orm_1.relations)(exports.unsubscriptions, ({ one }) => ({
    event: one(exports.events, {
        fields: [exports.unsubscriptions.eventId],
        references: [exports.events.id],
    }),
}));
exports.patronsRelations = (0, drizzle_orm_1.relations)(exports.patrons, ({ many }) => ({
    donations: many(exports.patronDonations),
    proposals: many(exports.ideaPatronProposals),
    updates: many(exports.patronUpdates),
    sponsorships: many(exports.eventSponsorships),
}));
exports.patronDonationsRelations = (0, drizzle_orm_1.relations)(exports.patronDonations, ({ one }) => ({
    patron: one(exports.patrons, {
        fields: [exports.patronDonations.patronId],
        references: [exports.patrons.id],
    }),
}));
exports.patronUpdatesRelations = (0, drizzle_orm_1.relations)(exports.patronUpdates, ({ one }) => ({
    patron: one(exports.patrons, {
        fields: [exports.patronUpdates.patronId],
        references: [exports.patrons.id],
    }),
}));
exports.ideaPatronProposalsRelations = (0, drizzle_orm_1.relations)(exports.ideaPatronProposals, ({ one }) => ({
    idea: one(exports.ideas, {
        fields: [exports.ideaPatronProposals.ideaId],
        references: [exports.ideas.id],
    }),
    patron: one(exports.patrons, {
        fields: [exports.ideaPatronProposals.patronId],
        references: [exports.patrons.id],
    }),
}));
exports.eventSponsorshipsRelations = (0, drizzle_orm_1.relations)(exports.eventSponsorships, ({ one }) => ({
    event: one(exports.events, {
        fields: [exports.eventSponsorships.eventId],
        references: [exports.events.id],
    }),
    patron: one(exports.patrons, {
        fields: [exports.eventSponsorships.patronId],
        references: [exports.patrons.id],
    }),
}));
exports.membersRelations = (0, drizzle_orm_1.relations)(exports.members, ({ many }) => ({
    activities: many(exports.memberActivities),
    subscriptions: many(exports.memberSubscriptions),
}));
exports.memberActivitiesRelations = (0, drizzle_orm_1.relations)(exports.memberActivities, ({ one }) => ({
    member: one(exports.members, {
        fields: [exports.memberActivities.memberEmail],
        references: [exports.members.email],
    }),
}));
exports.memberSubscriptionsRelations = (0, drizzle_orm_1.relations)(exports.memberSubscriptions, ({ one }) => ({
    member: one(exports.members, {
        fields: [exports.memberSubscriptions.memberEmail],
        references: [exports.members.email],
    }),
}));
// Security helper functions - Plus permissif pour permettre plus de domaines
const isValidDomain = (email) => {
    const domain = email.split('@')[1];
    // Accepte la plupart des domaines courants
    return domain && (domain.includes('.') &&
        !domain.includes('<') &&
        !domain.includes('>') &&
        domain.length >= 3);
};
const sanitizeText = (text) => text
    .replace(/[<>]/g, '') // Remove potential HTML
    .trim()
    .slice(0, 5000); // Limit length
// Ultra-secure insert schemas with validation - Pure Zod v4 schema (avoiding drizzle-zod type recursion)
exports.insertAdminSchema = zod_1.z.object({
    email: zod_1.z.string()
        .email("Email invalide")
        .min(5, "Email trop court")
        .max(100, "Email trop long")
        .transform(sanitizeText),
    firstName: zod_1.z.string()
        .min(1, "Le prénom est obligatoire")
        .max(50, "Le prénom ne peut pas dépasser 50 caractères")
        .transform(sanitizeText),
    lastName: zod_1.z.string()
        .min(1, "Le nom de famille est obligatoire")
        .max(50, "Le nom de famille ne peut pas dépasser 50 caractères")
        .transform(sanitizeText),
    password: zod_1.z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins : 1 majuscule (A-Z), 1 minuscule (a-z) et 1 chiffre (0-9)")
        .optional()
        .nullable(), // Optionnel car géré par Authentik
    addedBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
    role: zod_1.z.enum([
        exports.ADMIN_ROLES.SUPER_ADMIN,
        exports.ADMIN_ROLES.IDEAS_READER,
        exports.ADMIN_ROLES.IDEAS_MANAGER,
        exports.ADMIN_ROLES.EVENTS_READER,
        exports.ADMIN_ROLES.EVENTS_MANAGER
    ]).default(exports.ADMIN_ROLES.IDEAS_READER),
});
exports.updateAdminSchema = zod_1.z.object({
    role: zod_1.z.enum([
        exports.ADMIN_ROLES.SUPER_ADMIN,
        exports.ADMIN_ROLES.IDEAS_READER,
        exports.ADMIN_ROLES.IDEAS_MANAGER,
        exports.ADMIN_ROLES.EVENTS_READER,
        exports.ADMIN_ROLES.EVENTS_MANAGER
    ]).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateAdminInfoSchema = zod_1.z.object({
    firstName: zod_1.z.string()
        .min(1, "Le prénom est obligatoire")
        .max(50, "Le prénom ne peut pas dépasser 50 caractères")
        .transform(sanitizeText),
    lastName: zod_1.z.string()
        .min(1, "Le nom de famille est obligatoire")
        .max(50, "Le nom de famille ne peut pas dépasser 50 caractères")
        .transform(sanitizeText),
});
exports.updateAdminPasswordSchema = zod_1.z.object({
    password: zod_1.z.string()
        .min(8, "Le mot de passe doit contenir au moins 8 caractères")
        .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins : 1 majuscule (A-Z), 1 minuscule (a-z) et 1 chiffre (0-9)"),
});
// Pure Zod v4 schema (avoiding drizzle-zod type recursion)
exports.insertIdeaSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, "Le titre doit contenir au moins 3 caractères")
        .max(200, "Le titre est trop long (maximum 200 caractères). Raccourcissez votre titre ou utilisez la description pour plus de détails.")
        .transform(sanitizeText),
    description: zod_1.z.string()
        .max(5000, "Description trop longue (max 5000 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    proposedBy: zod_1.z.string()
        .min(2, "Votre nom doit contenir au moins 2 caractères")
        .max(100, "Votre nom est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    proposedByEmail: zod_1.z.string()
        .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
        .transform(sanitizeText),
    company: zod_1.z.string()
        .max(100, "Le nom de la société est trop long (maximum 100 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    phone: zod_1.z.string()
        .max(20, "Le numéro de téléphone est trop long (maximum 20 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    deadline: zod_1.z.string().datetime().optional(),
});
exports.updateIdeaStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        exports.IDEA_STATUS.PENDING,
        exports.IDEA_STATUS.APPROVED,
        exports.IDEA_STATUS.REJECTED,
        exports.IDEA_STATUS.UNDER_REVIEW,
        exports.IDEA_STATUS.POSTPONED,
        exports.IDEA_STATUS.COMPLETED
    ]),
});
exports.updateIdeaSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(1, "Le titre est requis")
        .max(255, "Le titre est trop long (maximum 255 caractères). Raccourcissez votre titre."),
    description: zod_1.z.string().nullable().optional(),
    proposedBy: zod_1.z.string()
        .min(2, "Votre nom doit contenir au moins 2 caractères")
        .max(100, "Votre nom est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    proposedByEmail: zod_1.z.string()
        .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
        .transform(sanitizeText),
    createdAt: zod_1.z.string().datetime("La date de publication n'est pas valide").optional(),
});
// Pure Zod v4 schema
exports.insertVoteSchema = zod_1.z.object({
    ideaId: zod_1.z.string()
        .min(1, "ID d'idée requis")
        .refine((id) => {
        // Accepter les UUIDs standard (36 caractères) ou les IDs existants (20 caractères alphanumériques)
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
        const isLegacyId = /^[a-zA-Z0-9]{20}$/.test(id);
        return isUuid || isLegacyId;
    }, "ID d'idée invalide")
        .transform(sanitizeText),
    voterName: zod_1.z.string()
        .min(2, "Votre nom doit contenir au moins 2 caractères")
        .max(100, "Votre nom est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    voterEmail: zod_1.z.string()
        .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
        .transform(sanitizeText),
});
// Pure Zod v4 schema
exports.insertEventSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, "Le titre doit contenir au moins 3 caractères")
        .max(200, "Le titre est trop long (maximum 200 caractères). Raccourcissez votre titre ou utilisez la description pour plus de détails.")
        .transform(sanitizeText),
    description: zod_1.z.string()
        .max(5000, "La description est trop longue (maximum 5000 caractères). Raccourcissez votre texte.")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    date: zod_1.z.string().datetime("La date n'est pas valide. Veuillez sélectionner une date et heure correctes."),
    location: zod_1.z.string()
        .max(200, "Le nom du lieu est trop long (maximum 200 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    maxParticipants: zod_1.z.number()
        .min(1, "Le nombre maximum de participants doit être d'au moins 1 personne")
        .max(1000, "Le nombre maximum de participants ne peut pas dépasser 1000 personnes")
        .optional(),
    helloAssoLink: zod_1.z.string()
        .optional()
        .refine(url => !url || url.includes('helloasso.com'), "L'adresse doit être un lien HelloAsso valide (contenant 'helloasso.com')")
        .refine(url => !url || zod_1.z.string().url().safeParse(url).success, "L'adresse web n'est pas valide. Veuillez saisir une URL complète (ex: https://exemple.com)")
        .transform(val => val ? sanitizeText(val) : undefined),
    enableExternalRedirect: zod_1.z.boolean().optional(),
    externalRedirectUrl: zod_1.z.string()
        .optional()
        .refine(url => !url || zod_1.z.string().url().safeParse(url).success, "L'adresse web de redirection n'est pas valide. Veuillez saisir une URL complète (ex: https://exemple.com)")
        .transform(val => val ? sanitizeText(val) : undefined),
    showInscriptionsCount: zod_1.z.boolean().optional(),
    showAvailableSeats: zod_1.z.boolean().optional(),
    allowUnsubscribe: zod_1.z.boolean().optional(),
    redUnsubscribeButton: zod_1.z.boolean().optional(),
    buttonMode: zod_1.z.enum(["subscribe", "unsubscribe", "both", "custom"]).optional(),
    customButtonText: zod_1.z.string()
        .max(50, "Le texte du bouton personnalisé est trop long (maximum 50 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    status: zod_1.z.enum(["draft", "published", "cancelled", "archived", "postponed", "completed"]).optional(),
});
// Pure Zod v4 schema
exports.insertInscriptionSchema = zod_1.z.object({
    eventId: zod_1.z.string()
        .uuid("L'identifiant de l'événement n'est pas valide")
        .transform(sanitizeText),
    name: zod_1.z.string()
        .min(2, "Votre nom doit contenir au moins 2 caractères")
        .max(100, "Votre nom est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    email: zod_1.z.string()
        .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
        .refine(isValidDomain, "Le domaine de votre adresse email n'est pas autorisé")
        .transform(sanitizeText),
    company: zod_1.z.string()
        .max(100, "Le nom de la société est trop long (maximum 100 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    phone: zod_1.z.string()
        .max(20, "Le numéro de téléphone est trop long (maximum 20 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    comments: zod_1.z.string()
        .max(500, "Vos commentaires sont trop longs (maximum 500 caractères). Raccourcissez votre message.")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
});
// Schema for initial inscription (without eventId since it will be auto-generated)
exports.initialInscriptionSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(2, "Votre nom doit contenir au moins 2 caractères")
        .max(100, "Votre nom est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    email: zod_1.z.string()
        .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
        .refine(isValidDomain, "Le domaine de votre adresse email n'est pas autorisé")
        .transform(sanitizeText),
    company: zod_1.z.string()
        .max(100, "Le nom de la société est trop long (maximum 100 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    phone: zod_1.z.string()
        .max(20, "Le numéro de téléphone est trop long (maximum 20 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    comments: zod_1.z.string()
        .max(500, "Vos commentaires sont trop longs (maximum 500 caractères). Raccourcissez votre message.")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
});
// Schema for creating event with initial inscriptions
exports.createEventWithInscriptionsSchema = zod_1.z.object({
    event: exports.insertEventSchema,
    initialInscriptions: zod_1.z.array(exports.initialInscriptionSchema).default([])
});
// Pure Zod v4 schema
exports.insertUnsubscriptionSchema = zod_1.z.object({
    eventId: zod_1.z.string()
        .uuid("L'identifiant de l'événement n'est pas valide")
        .transform(sanitizeText),
    name: zod_1.z.string()
        .min(2, "Votre nom doit contenir au moins 2 caractères")
        .max(100, "Votre nom est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    email: zod_1.z.string()
        .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
        .refine(isValidDomain, "Le domaine de votre adresse email n'est pas autorisé")
        .transform(sanitizeText),
    comments: zod_1.z.string()
        .max(500, "Votre raison d'absence est trop longue (maximum 500 caractères). Raccourcissez votre message.")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
});
// Loan items schemas - Pure Zod v4 schema
exports.insertLoanItemSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, "Le titre doit contenir au moins 3 caractères")
        .max(200, "Le titre est trop long (maximum 200 caractères)")
        .transform(sanitizeText),
    description: zod_1.z.string()
        .max(5000, "La description est trop longue (maximum 5000 caractères)")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    lenderName: zod_1.z.string()
        .min(2, "Le nom du JD qui prête doit contenir au moins 2 caractères")
        .max(100, "Le nom du JD est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    photoUrl: zod_1.z.string()
        .url("L'URL de la photo n'est pas valide")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    proposedBy: zod_1.z.string()
        .min(2, "Votre nom doit contenir au moins 2 caractères")
        .max(100, "Votre nom est trop long (maximum 100 caractères)")
        .transform(sanitizeText),
    proposedByEmail: zod_1.z.string()
        .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
        .transform(sanitizeText),
    status: zod_1.z.enum(["available", "borrowed", "reserved", "unavailable"]).optional(),
});
exports.updateLoanItemSchema = zod_1.z.object({
    title: zod_1.z.string()
        .min(3, "Le titre doit contenir au moins 3 caractères")
        .max(200, "Le titre est trop long (maximum 200 caractères)")
        .optional(),
    description: zod_1.z.string()
        .max(5000, "La description est trop longue (maximum 5000 caractères)")
        .optional()
        .nullable(),
    lenderName: zod_1.z.string()
        .min(2, "Le nom du JD qui prête doit contenir au moins 2 caractères")
        .max(100, "Le nom du JD est trop long (maximum 100 caractères)")
        .optional(),
    photoUrl: zod_1.z.string()
        .url("L'URL de la photo n'est pas valide")
        .optional()
        .nullable(),
});
exports.updateLoanItemStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        exports.LOAN_STATUS.PENDING,
        exports.LOAN_STATUS.AVAILABLE,
        exports.LOAN_STATUS.BORROWED,
        exports.LOAN_STATUS.UNAVAILABLE
    ]),
});
// Pure Zod v4 schema
exports.insertPatronSchema = zod_1.z.object({
    firstName: zod_1.z.string()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .max(100, "Le prénom ne peut pas dépasser 100 caractères")
        .transform(sanitizeText),
    lastName: zod_1.z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères")
        .transform(sanitizeText),
    role: zod_1.z.string()
        .max(100, "La fonction ne peut pas dépasser 100 caractères")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    company: zod_1.z.string()
        .max(200, "Le nom de la société ne peut pas dépasser 200 caractères")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    phone: zod_1.z.string()
        .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    email: zod_1.z.string()
        .email("Adresse email invalide")
        .transform(sanitizeText),
    notes: zod_1.z.string()
        .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    referrerId: zod_1.z.string()
        .optional()
        .transform(val => {
        if (!val || val.trim() === "")
            return undefined;
        return sanitizeText(val);
    })
        .refine(val => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: "L'identifiant du prescripteur n'est pas valide"
    }),
    createdBy: zod_1.z.string()
        .email("Email de l'administrateur invalide")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
});
// Pure Zod v4 schema
exports.insertPatronDonationSchema = zod_1.z.object({
    patronId: zod_1.z.string()
        .uuid("L'identifiant du mécène n'est pas valide")
        .transform(sanitizeText),
    donatedAt: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD")
        .transform((val) => new Date(val + 'T00:00:00.000Z')),
    amount: zod_1.z.number()
        .int("Le montant doit être un nombre entier")
        .min(0, "Le montant ne peut pas être négatif"),
    occasion: zod_1.z.string()
        .min(3, "L'occasion doit contenir au moins 3 caractères")
        .max(200, "L'occasion ne peut pas dépasser 200 caractères")
        .transform(sanitizeText),
    recordedBy: zod_1.z.string()
        .email("Email de l'administrateur invalide")
        .transform(sanitizeText),
});
// Pure Zod v4 schema
exports.insertPatronUpdateSchema = zod_1.z.object({
    patronId: zod_1.z.string()
        .uuid("L'identifiant du mécène n'est pas valide")
        .transform(sanitizeText),
    type: zod_1.z.enum(["meeting", "email", "call", "lunch", "event"], {
        message: "Le type doit être 'meeting', 'email', 'call', 'lunch' ou 'event'"
    }),
    subject: zod_1.z.string()
        .min(3, "Le sujet doit contenir au moins 3 caractères")
        .max(200, "Le sujet ne peut pas dépasser 200 caractères")
        .transform(sanitizeText),
    date: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD"),
    startTime: zod_1.z.string()
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    duration: zod_1.z.number()
        .int("La durée doit être un nombre entier")
        .min(0, "La durée ne peut pas être négative")
        .optional(),
    description: zod_1.z.string()
        .min(1, "La description est obligatoire")
        .max(3000, "La description ne peut pas dépasser 3000 caractères")
        .transform(sanitizeText),
    notes: zod_1.z.string()
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    createdBy: zod_1.z.string()
        .email("Email de l'administrateur invalide")
        .transform(sanitizeText),
});
exports.updatePatronUpdateSchema = zod_1.z.object({
    type: zod_1.z.enum(["meeting", "email", "call", "lunch", "event"]).optional(),
    subject: zod_1.z.string()
        .min(3, "Le sujet doit contenir au moins 3 caractères")
        .max(200, "Le sujet ne peut pas dépasser 200 caractères")
        .transform(sanitizeText)
        .optional(),
    date: zod_1.z.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD")
        .optional(),
    startTime: zod_1.z.string()
        .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "L'heure doit être au format HH:MM")
        .transform(val => sanitizeText(val))
        .optional(),
    duration: zod_1.z.number()
        .int("La durée doit être un nombre entier")
        .min(0, "La durée ne peut pas être négative")
        .optional(),
    description: zod_1.z.string()
        .min(1, "La description est obligatoire")
        .max(3000, "La description ne peut pas dépasser 3000 caractères")
        .transform(sanitizeText)
        .optional(),
    notes: zod_1.z.string()
        .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères")
        .transform(val => sanitizeText(val))
        .optional(),
});
// Pure Zod v4 schema
exports.insertIdeaPatronProposalSchema = zod_1.z.object({
    ideaId: zod_1.z.string()
        .uuid("L'identifiant de l'idée n'est pas valide")
        .transform(sanitizeText),
    patronId: zod_1.z.string()
        .uuid("L'identifiant du mécène n'est pas valide")
        .transform(sanitizeText),
    proposedByAdminEmail: zod_1.z.string()
        .email("Email de l'administrateur invalide")
        .transform(sanitizeText),
    status: zod_1.z.enum(["proposed", "contacted", "declined", "converted"]).default("proposed"),
    comments: zod_1.z.string()
        .max(1000, "Les commentaires ne peuvent pas dépasser 1000 caractères")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
});
exports.updatePatronSchema = zod_1.z.object({
    firstName: zod_1.z.string()
        .min(2, "Le prénom doit contenir au moins 2 caractères")
        .max(100, "Le prénom ne peut pas dépasser 100 caractères")
        .transform(sanitizeText)
        .optional(),
    lastName: zod_1.z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères")
        .transform(sanitizeText)
        .optional(),
    role: zod_1.z.string()
        .max(100, "La fonction ne peut pas dépasser 100 caractères")
        .transform(val => sanitizeText(val))
        .optional(),
    company: zod_1.z.string()
        .max(200, "Le nom de la société ne peut pas dépasser 200 caractères")
        .transform(val => sanitizeText(val))
        .optional(),
    phone: zod_1.z.string()
        .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
        .transform(val => sanitizeText(val))
        .optional(),
    email: zod_1.z.string()
        .email("Adresse email invalide")
        .transform(sanitizeText)
        .optional(),
    notes: zod_1.z.string()
        .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères")
        .transform(val => sanitizeText(val))
        .optional(),
    referrerId: zod_1.z.string()
        .optional()
        .nullable()
        .transform(val => {
        if (!val || val.trim() === "")
            return null;
        return sanitizeText(val);
    })
        .refine(val => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
        message: "L'identifiant du prescripteur n'est pas valide"
    }),
});
exports.updateIdeaPatronProposalSchema = zod_1.z.object({
    status: zod_1.z.enum(["proposed", "contacted", "declined", "converted"]).optional(),
    comments: zod_1.z.string()
        .max(1000, "Les commentaires ne peuvent pas dépasser 1000 caractères")
        .transform(val => sanitizeText(val))
        .optional(),
});
// Pure Zod v4 schema
exports.insertEventSponsorshipSchema = zod_1.z.object({
    eventId: zod_1.z.string()
        .uuid("L'identifiant de l'événement n'est pas valide")
        .transform(sanitizeText),
    patronId: zod_1.z.string()
        .uuid("L'identifiant du mécène n'est pas valide")
        .transform(sanitizeText),
    level: zod_1.z.enum(["platinum", "gold", "silver", "bronze", "partner"], {
        message: "Niveau de sponsoring invalide"
    }),
    amount: zod_1.z.number()
        .int("Le montant doit être un nombre entier")
        .min(0, "Le montant ne peut pas être négatif"),
    benefits: zod_1.z.string()
        .max(2000, "Les contreparties ne peuvent pas dépasser 2000 caractères")
        .transform(val => val ? sanitizeText(val) : undefined)
        .optional(),
    isPubliclyVisible: zod_1.z.boolean().default(true),
    status: zod_1.z.enum(["proposed", "confirmed", "completed", "cancelled"]).default("proposed"),
    logoUrl: zod_1.z.string()
        .url("URL du logo invalide")
        .max(500, "L'URL du logo est trop longue")
        .transform(val => val ? sanitizeText(val) : undefined)
        .optional(),
    websiteUrl: zod_1.z.string()
        .url("URL du site web invalide")
        .max(500, "L'URL du site web est trop longue")
        .transform(val => val ? sanitizeText(val) : undefined)
        .optional(),
    proposedByAdminEmail: zod_1.z.string()
        .email("Email de l'administrateur invalide")
        .transform(sanitizeText),
    confirmedAt: zod_1.z.string()
        .optional()
        .nullable()
        .transform(val => {
        if (!val)
            return null;
        return val;
    }),
});
exports.updateEventSponsorshipSchema = zod_1.z.object({
    level: zod_1.z.enum(["platinum", "gold", "silver", "bronze", "partner"]).optional(),
    amount: zod_1.z.number().int().min(0).optional(),
    benefits: zod_1.z.string()
        .max(2000, "Les contreparties ne peuvent pas dépasser 2000 caractères")
        .transform(val => sanitizeText(val))
        .optional(),
    isPubliclyVisible: zod_1.z.boolean().optional(),
    status: zod_1.z.enum(["proposed", "confirmed", "completed", "cancelled"]).optional(),
    logoUrl: zod_1.z.string()
        .url("URL du logo invalide")
        .max(500)
        .transform(val => sanitizeText(val))
        .optional(),
    websiteUrl: zod_1.z.string()
        .url("URL du site web invalide")
        .max(500)
        .transform(val => sanitizeText(val))
        .optional(),
    confirmedAt: zod_1.z.string().optional().nullable(),
});
// Pure Zod v4 schema
exports.insertMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email().transform(sanitizeText),
    firstName: zod_1.z.string().min(2).max(100).transform(sanitizeText),
    lastName: zod_1.z.string().min(2).max(100).transform(sanitizeText),
    company: zod_1.z.string().max(200).optional().transform(val => val ? sanitizeText(val) : undefined),
    phone: zod_1.z.string().max(20).optional().transform(val => val ? sanitizeText(val) : undefined),
    role: zod_1.z.string().max(100).optional().transform(val => val ? sanitizeText(val) : undefined),
    notes: zod_1.z.string().max(2000).optional().transform(val => val ? sanitizeText(val) : undefined),
    status: zod_1.z.enum(['active', 'proposed']).default('active'),
    proposedBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
});
// Pure Zod v4 schema
exports.insertMemberActivitySchema = zod_1.z.object({
    memberEmail: zod_1.z.string().email().transform(sanitizeText),
    activityType: zod_1.z.enum(['idea_proposed', 'vote_cast', 'event_registered', 'event_unregistered', 'patron_suggested']),
    entityType: zod_1.z.enum(['idea', 'vote', 'event', 'patron']),
    entityId: zod_1.z.string().uuid().optional(),
    entityTitle: zod_1.z.string().max(500).optional().transform(val => val ? sanitizeText(val) : undefined),
    metadata: zod_1.z.string().optional(),
    scoreImpact: zod_1.z.number().int(),
});
exports.updateMemberSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(2).max(100).transform(sanitizeText).optional(),
    lastName: zod_1.z.string().min(2).max(100).transform(sanitizeText).optional(),
    company: zod_1.z.string().max(200).transform(sanitizeText).optional(),
    phone: zod_1.z.string().max(20).transform(sanitizeText).optional(),
    role: zod_1.z.string().max(100).transform(sanitizeText).optional(),
    notes: zod_1.z.string().max(2000).transform(sanitizeText).optional(),
});
exports.proposeMemberSchema = zod_1.z.object({
    email: zod_1.z.string().email("Adresse email invalide").transform(sanitizeText),
    firstName: zod_1.z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(100).transform(sanitizeText),
    lastName: zod_1.z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100).transform(sanitizeText),
    company: zod_1.z.string().max(200).optional().transform(val => val ? sanitizeText(val) : undefined),
    phone: zod_1.z.string().max(20).optional().transform(val => val ? sanitizeText(val) : undefined),
    role: zod_1.z.string().max(100).optional().transform(val => val ? sanitizeText(val) : undefined),
    notes: zod_1.z.string().max(2000).optional().transform(val => val ? sanitizeText(val) : undefined),
    proposedBy: zod_1.z.string().email("Email du proposeur invalide").transform(sanitizeText),
});
// Schemas for member tags
exports.insertMemberTagSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Le nom du tag est requis").max(50).transform(sanitizeText),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/, "La couleur doit être au format hex (#RRGGBB)").default("#3b82f6"),
    description: zod_1.z.string().max(500).optional().transform(val => val ? sanitizeText(val) : undefined),
});
exports.updateMemberTagSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(50).transform(sanitizeText).optional(),
    color: zod_1.z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    description: zod_1.z.string().max(500).optional().transform(val => val ? sanitizeText(val) : undefined),
});
exports.assignMemberTagSchema = zod_1.z.object({
    memberEmail: zod_1.z.string().email().transform(sanitizeText),
    tagId: zod_1.z.string().uuid(),
    assignedBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
});
// Schemas for member tasks
exports.insertMemberTaskSchema = zod_1.z.object({
    memberEmail: zod_1.z.string().email().transform(sanitizeText),
    title: zod_1.z.string().min(1, "Le titre est requis").max(200).transform(sanitizeText),
    description: zod_1.z.string().max(2000).optional().transform(val => val ? sanitizeText(val) : undefined),
    taskType: zod_1.z.enum(['call', 'email', 'meeting', 'custom']),
    status: zod_1.z.enum(['todo', 'in_progress', 'completed', 'cancelled']).default('todo'),
    dueDate: zod_1.z.string().datetime().optional(),
    assignedTo: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
    createdBy: zod_1.z.string().email().transform(sanitizeText),
});
exports.updateMemberTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200).transform(sanitizeText).optional(),
    description: zod_1.z.string().max(2000).optional().transform(val => val ? sanitizeText(val) : undefined),
    taskType: zod_1.z.enum(['call', 'email', 'meeting', 'custom']).optional(),
    status: zod_1.z.enum(['todo', 'in_progress', 'completed', 'cancelled']).optional(),
    dueDate: zod_1.z.string().datetime().optional().nullable(),
    assignedTo: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
    completedBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
});
// Schemas for member relations
exports.insertMemberRelationSchema = zod_1.z.object({
    memberEmail: zod_1.z.string().email().transform(sanitizeText),
    relatedMemberEmail: zod_1.z.string().email().transform(sanitizeText),
    relationType: zod_1.z.enum(['sponsor', 'team', 'custom']),
    description: zod_1.z.string().max(500).optional().transform(val => val ? sanitizeText(val) : undefined),
    createdBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
});
// Schemas for tracking metrics
exports.insertTrackingMetricSchema = zod_1.z.object({
    entityType: zod_1.z.enum(['member', 'patron']),
    entityId: zod_1.z.string().min(1),
    entityEmail: zod_1.z.string().email().transform(sanitizeText),
    metricType: zod_1.z.enum(['status_change', 'engagement', 'contact', 'conversion', 'activity']),
    metricValue: zod_1.z.number().optional(),
    metricData: zod_1.z.string().optional().transform(val => val ? sanitizeText(val) : undefined),
    description: zod_1.z.string().max(1000).optional().transform(val => val ? sanitizeText(val) : undefined),
    recordedBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
});
// Schemas for tracking alerts
exports.insertTrackingAlertSchema = zod_1.z.object({
    entityType: zod_1.z.enum(['member', 'patron']),
    entityId: zod_1.z.string().min(1),
    entityEmail: zod_1.z.string().email().transform(sanitizeText),
    alertType: zod_1.z.enum(['stale', 'high_potential', 'needs_followup', 'conversion_opportunity']),
    severity: zod_1.z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
    title: zod_1.z.string().min(1).max(200).transform(sanitizeText),
    message: zod_1.z.string().min(1).max(2000).transform(sanitizeText),
    createdBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
    expiresAt: zod_1.z.string().datetime().optional(),
});
exports.updateTrackingAlertSchema = zod_1.z.object({
    isRead: zod_1.z.boolean().optional(),
    isResolved: zod_1.z.boolean().optional(),
    resolvedBy: zod_1.z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
});
// For compatibility with existing auth system
exports.users = exports.admins;
exports.insertUserSchema = exports.insertAdminSchema;
// Additional validation schemas for API routes - using new status system
exports.updateEventStatusSchema = zod_1.z.object({
    status: zod_1.z.enum([
        exports.EVENT_STATUS.DRAFT,
        exports.EVENT_STATUS.PUBLISHED,
        exports.EVENT_STATUS.CANCELLED,
        exports.EVENT_STATUS.POSTPONED,
        exports.EVENT_STATUS.COMPLETED
    ]),
});
exports.updateEventSchema = exports.insertEventSchema.partial();
// Custom error types for better error handling
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
class DuplicateError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DuplicateError';
    }
}
exports.DuplicateError = DuplicateError;
class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.name = 'DatabaseError';
    }
}
exports.DatabaseError = DatabaseError;
class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = 'NotFoundError';
    }
}
exports.NotFoundError = NotFoundError;
// Type guard for validating admin roles
function isValidAdminRole(role) {
    return typeof role === 'string' && Object.values(exports.ADMIN_ROLES).includes(role);
}
// Permission helper functions
const hasPermission = (userRole, permission) => {
    // Validate role is a valid AdminRole
    if (!isValidAdminRole(userRole)) {
        console.warn(`Invalid admin role: ${userRole}`);
        return false;
    }
    // Super admin a tous les droits
    if (userRole === exports.ADMIN_ROLES.SUPER_ADMIN)
        return true;
    switch (permission) {
        case 'ideas.read':
            return [exports.ADMIN_ROLES.IDEAS_READER, exports.ADMIN_ROLES.IDEAS_MANAGER].includes(userRole);
        case 'ideas.write':
        case 'ideas.delete':
        case 'ideas.manage':
            return userRole === exports.ADMIN_ROLES.IDEAS_MANAGER;
        case 'events.read':
            return [exports.ADMIN_ROLES.EVENTS_READER, exports.ADMIN_ROLES.EVENTS_MANAGER].includes(userRole);
        case 'events.write':
        case 'events.delete':
        case 'events.manage':
            return userRole === exports.ADMIN_ROLES.EVENTS_MANAGER;
        case 'admin.view':
            // Tous les admins peuvent voir les membres
            return true;
        case 'admin.edit':
            // Les gestionnaires et super admins peuvent éditer les données (inscriptions, votes, etc.)
            // Note: SUPER_ADMIN already returns true above
            return [exports.ADMIN_ROLES.IDEAS_MANAGER, exports.ADMIN_ROLES.EVENTS_MANAGER].includes(userRole);
        case 'admin.manage':
            // Only SUPER_ADMIN can manage admins (already returns true above)
            return false;
        default:
            return false;
    }
};
exports.hasPermission = hasPermission;
const getRoleDisplayName = (role) => {
    switch (role) {
        case exports.ADMIN_ROLES.SUPER_ADMIN:
            return "Super Administrateur";
        case exports.ADMIN_ROLES.IDEAS_READER:
            return "Consultation des idées";
        case exports.ADMIN_ROLES.IDEAS_MANAGER:
            return "Gestion des idées";
        case exports.ADMIN_ROLES.EVENTS_READER:
            return "Consultation des événements";
        case exports.ADMIN_ROLES.EVENTS_MANAGER:
            return "Gestion des événements";
        default:
            return "Rôle inconnu";
    }
};
exports.getRoleDisplayName = getRoleDisplayName;
const getRolePermissions = (role) => {
    switch (role) {
        case exports.ADMIN_ROLES.SUPER_ADMIN:
            return ['Toutes les permissions', 'Gestion des administrateurs'];
        case exports.ADMIN_ROLES.IDEAS_READER:
            return ['Consultation des idées'];
        case exports.ADMIN_ROLES.IDEAS_MANAGER:
            return ['Consultation des idées', 'Modification des idées', 'Suppression des idées', 'Gestion des votes'];
        case exports.ADMIN_ROLES.EVENTS_READER:
            return ['Consultation des événements'];
        case exports.ADMIN_ROLES.EVENTS_MANAGER:
            return ['Consultation des événements', 'Modification des événements', 'Suppression des événements', 'Gestion des inscriptions et absences'];
        default:
            return [];
    }
};
exports.getRolePermissions = getRolePermissions;
// Development requests validation schemas
exports.insertDevelopmentRequestSchema = (0, drizzle_zod_1.createInsertSchema)(exports.developmentRequests).pick({
    title: true,
    description: true,
    type: true,
    priority: true,
    requestedBy: true,
    requestedByName: true,
}).extend({
    title: zod_1.z.string()
        .min(5, "Le titre doit contenir au moins 5 caractères")
        .max(200, "Le titre ne peut pas dépasser 200 caractères")
        .transform(sanitizeText),
    description: zod_1.z.string()
        .min(20, "La description doit contenir au moins 20 caractères")
        .max(3000, "La description ne peut pas dépasser 3000 caractères")
        .transform(sanitizeText),
    type: zod_1.z.enum(["bug", "feature"], {
        message: "Le type doit être 'bug' ou 'feature'"
    }),
    priority: zod_1.z.enum(["low", "medium", "high", "critical"]).default("medium"),
    requestedBy: zod_1.z.string().email("Email invalide").transform(sanitizeText),
    requestedByName: zod_1.z.string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(100, "Le nom ne peut pas dépasser 100 caractères")
        .transform(sanitizeText),
});
exports.updateDevelopmentRequestSchema = zod_1.z.object({
    status: zod_1.z.enum(["open", "in_progress", "closed", "cancelled"]).optional(),
    githubStatus: zod_1.z.enum(["open", "closed"]).optional(),
    githubIssueNumber: zod_1.z.number().int().positive().optional(),
    githubIssueUrl: zod_1.z.string().url().optional(),
    lastSyncedAt: zod_1.z.date().optional(),
});
// Schéma spécial pour les mises à jour de statut par le super administrateur
exports.updateDevelopmentRequestStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(["open", "in_progress", "closed", "cancelled"]),
    adminComment: zod_1.z.string()
        .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères")
        .optional()
        .transform(val => val ? sanitizeText(val) : undefined),
    lastStatusChangeBy: zod_1.z.string().email("Email invalide").transform(sanitizeText),
});
// Member subscriptions schemas
exports.insertMemberSubscriptionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.memberSubscriptions).omit({
    id: true,
    createdAt: true,
});
// Financial planning constants
exports.FINANCIAL_PERIOD = {
    MONTH: "month",
    QUARTER: "quarter",
    YEAR: "year"
};
exports.FINANCIAL_CATEGORY_TYPE = {
    INCOME: "income",
    EXPENSE: "expense"
};
exports.FORECAST_CONFIDENCE = {
    HIGH: "high",
    MEDIUM: "medium",
    LOW: "low"
};
exports.FORECAST_BASED_ON = {
    HISTORICAL: "historical",
    ESTIMATE: "estimate"
};
// Financial categories table - Catégories budgétaires
exports.financialCategories = (0, pg_core_1.pgTable)("financial_categories", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // income or expense
    parentId: (0, pg_core_1.varchar)("parent_id"), // Catégorie parente (hiérarchie) - référence ajoutée via relation
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    typeIdx: (0, pg_core_1.index)("financial_categories_type_idx").on(table.type),
    parentIdIdx: (0, pg_core_1.index)("financial_categories_parent_id_idx").on(table.parentId),
    nameIdx: (0, pg_core_1.index)("financial_categories_name_idx").on(table.name),
}));
// Financial budgets table - Budgets prévisionnels
exports.financialBudgets = (0, pg_core_1.pgTable)("financial_budgets", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    name: (0, pg_core_1.text)("name").notNull(),
    category: (0, pg_core_1.varchar)("category").references(() => exports.financialCategories.id, { onDelete: "restrict" }).notNull(),
    period: (0, pg_core_1.text)("period").notNull(), // month, quarter, year
    year: (0, pg_core_1.integer)("year").notNull(),
    month: (0, pg_core_1.integer)("month"), // 1-12 si period = month
    quarter: (0, pg_core_1.integer)("quarter"), // 1-4 si period = quarter
    amountInCents: (0, pg_core_1.integer)("amount_in_cents").notNull(), // Montant en centimes
    description: (0, pg_core_1.text)("description"),
    createdBy: (0, pg_core_1.text)("created_by").notNull(), // Email admin
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    categoryIdx: (0, pg_core_1.index)("financial_budgets_category_idx").on(table.category),
    periodIdx: (0, pg_core_1.index)("financial_budgets_period_idx").on(table.period),
    yearIdx: (0, pg_core_1.index)("financial_budgets_year_idx").on(table.year),
    periodYearIdx: (0, pg_core_1.index)("financial_budgets_period_year_idx").on(table.period, table.year),
}));
// Financial expenses table - Dépenses réelles
exports.financialExpenses = (0, pg_core_1.pgTable)("financial_expenses", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    category: (0, pg_core_1.varchar)("category").references(() => exports.financialCategories.id, { onDelete: "restrict" }).notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    amountInCents: (0, pg_core_1.integer)("amount_in_cents").notNull(), // Montant en centimes
    expenseDate: (0, pg_core_1.date)("expense_date").notNull(), // Date de la dépense (format YYYY-MM-DD)
    paymentMethod: (0, pg_core_1.text)("payment_method"), // cash, card, transfer, check, etc.
    vendor: (0, pg_core_1.text)("vendor"), // Fournisseur/prestataire
    budgetId: (0, pg_core_1.varchar)("budget_id").references(() => exports.financialBudgets.id, { onDelete: "set null" }), // Budget associé (optionnel)
    receiptUrl: (0, pg_core_1.text)("receipt_url"), // URL du justificatif (upload)
    createdBy: (0, pg_core_1.text)("created_by").notNull(), // Email admin
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    categoryIdx: (0, pg_core_1.index)("financial_expenses_category_idx").on(table.category),
    expenseDateIdx: (0, pg_core_1.index)("financial_expenses_expense_date_idx").on(table.expenseDate.desc()),
    budgetIdIdx: (0, pg_core_1.index)("financial_expenses_budget_id_idx").on(table.budgetId),
    createdByIdx: (0, pg_core_1.index)("financial_expenses_created_by_idx").on(table.createdBy),
}));
// Financial forecasts table - Prévisions de revenus
exports.financialForecasts = (0, pg_core_1.pgTable)("financial_forecasts", {
    id: (0, pg_core_1.varchar)("id").primaryKey().default((0, drizzle_orm_1.sql) `gen_random_uuid()`),
    category: (0, pg_core_1.varchar)("category").references(() => exports.financialCategories.id, { onDelete: "restrict" }).notNull(),
    period: (0, pg_core_1.text)("period").notNull(), // month, quarter, year
    year: (0, pg_core_1.integer)("year").notNull(),
    month: (0, pg_core_1.integer)("month"), // 1-12 si period = month
    quarter: (0, pg_core_1.integer)("quarter"), // 1-4 si period = quarter
    forecastedAmountInCents: (0, pg_core_1.integer)("forecasted_amount_in_cents").notNull(), // Montant prévu en centimes
    confidence: (0, pg_core_1.text)("confidence").default(exports.FORECAST_CONFIDENCE.MEDIUM).notNull(), // high, medium, low
    basedOn: (0, pg_core_1.text)("based_on").default(exports.FORECAST_BASED_ON.HISTORICAL).notNull(), // historical, estimate
    notes: (0, pg_core_1.text)("notes"), // Notes sur la prévision
    createdBy: (0, pg_core_1.text)("created_by").notNull(), // Email admin
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (table) => ({
    categoryIdx: (0, pg_core_1.index)("financial_forecasts_category_idx").on(table.category),
    periodIdx: (0, pg_core_1.index)("financial_forecasts_period_idx").on(table.period),
    yearIdx: (0, pg_core_1.index)("financial_forecasts_year_idx").on(table.year),
    periodYearIdx: (0, pg_core_1.index)("financial_forecasts_period_year_idx").on(table.period, table.year),
}));
// Financial categories relations
exports.financialCategoriesRelations = (0, drizzle_orm_1.relations)(exports.financialCategories, ({ one, many }) => ({
    parent: one(exports.financialCategories, {
        fields: [exports.financialCategories.parentId],
        references: [exports.financialCategories.id],
        relationName: "categoryParent",
    }),
    children: many(exports.financialCategories, {
        relationName: "categoryParent",
    }),
    budgets: many(exports.financialBudgets),
    expenses: many(exports.financialExpenses),
    forecasts: many(exports.financialForecasts),
}));
// Financial budgets relations
exports.financialBudgetsRelations = (0, drizzle_orm_1.relations)(exports.financialBudgets, ({ one, many }) => ({
    category: one(exports.financialCategories, {
        fields: [exports.financialBudgets.category],
        references: [exports.financialCategories.id],
    }),
    expenses: many(exports.financialExpenses),
}));
// Financial expenses relations
exports.financialExpensesRelations = (0, drizzle_orm_1.relations)(exports.financialExpenses, ({ one }) => ({
    category: one(exports.financialCategories, {
        fields: [exports.financialExpenses.category],
        references: [exports.financialCategories.id],
    }),
    budget: one(exports.financialBudgets, {
        fields: [exports.financialExpenses.budgetId],
        references: [exports.financialBudgets.id],
    }),
}));
// Financial forecasts relations
exports.financialForecastsRelations = (0, drizzle_orm_1.relations)(exports.financialForecasts, ({ one }) => ({
    category: one(exports.financialCategories, {
        fields: [exports.financialForecasts.category],
        references: [exports.financialCategories.id],
    }),
}));
// Branding configuration schemas - Pure Zod v4 schema
exports.insertBrandingConfigSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, "Key requis"),
    config: zod_1.z.string().refine((val) => {
        try {
            JSON.parse(val);
            return true;
        }
        catch {
            return false;
        }
    }, { message: "Config must be valid JSON" }),
    createdAt: zod_1.z.date().optional(),
});
// Email config schemas - Pure Zod v4 schema
exports.insertEmailConfigSchema = zod_1.z.object({
    host: zod_1.z.string().min(1, "Host requis"),
    port: zod_1.z.number().min(1).max(65535, "Port invalide"),
    secure: zod_1.z.boolean(),
    username: zod_1.z.string().optional(),
    password: zod_1.z.string().optional(),
    fromEmail: zod_1.z.string().email("Email invalide"),
    fromName: zod_1.z.string().optional(),
    provider: zod_1.z.enum(['ovh', 'gmail', 'outlook', 'smtp', 'other']).optional().default('smtp'),
    createdAt: zod_1.z.date().optional(),
});
// Feature configuration schemas - Pure Zod v4 schema
exports.insertFeatureConfigSchema = zod_1.z.object({
    featureKey: zod_1.z.string().min(1).max(50),
    enabled: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date().optional(),
});
// Financial categories schemas - Manual Zod v4 schemas
exports.insertFinancialCategorySchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Le nom est requis"),
    type: zod_1.z.enum(["income", "expense"]),
    parentId: zod_1.z.string().uuid().optional().nullable(),
    description: zod_1.z.string().optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
});
exports.updateFinancialCategorySchema = exports.insertFinancialCategorySchema.partial();
// Financial budgets schemas - Manual Zod v4 schemas
exports.insertFinancialBudgetSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, "Le nom est requis"),
    category: zod_1.z.string().uuid("L'identifiant de la catégorie n'est pas valide"),
    period: zod_1.z.enum(["month", "quarter", "year"]),
    year: zod_1.z.number().int().min(2000).max(2100),
    month: zod_1.z.number().int().min(1).max(12).optional().nullable(),
    quarter: zod_1.z.number().int().min(1).max(4).optional().nullable(),
    amountInCents: zod_1.z.number().int().min(0, "Le montant doit être positif"),
    description: zod_1.z.string().optional().nullable(),
    createdBy: zod_1.z.string().email("Email de l'administrateur invalide"),
});
exports.updateFinancialBudgetSchema = exports.insertFinancialBudgetSchema.partial();
// Financial expenses schemas - Manual Zod v4 schemas
exports.insertFinancialExpenseSchema = zod_1.z.object({
    category: zod_1.z.string().uuid("L'identifiant de la catégorie n'est pas valide"),
    description: zod_1.z.string().min(1, "La description est requise"),
    amountInCents: zod_1.z.number().int().min(0, "Le montant doit être positif"),
    expenseDate: zod_1.z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD"),
    paymentMethod: zod_1.z.string().optional().nullable(),
    vendor: zod_1.z.string().optional().nullable(),
    budgetId: zod_1.z.string().uuid().optional().nullable(),
    receiptUrl: zod_1.z.string().url().optional().nullable(),
    createdBy: zod_1.z.string().email("Email de l'administrateur invalide"),
});
exports.updateFinancialExpenseSchema = exports.insertFinancialExpenseSchema.partial();
// Financial forecasts schemas - Manual Zod v4 schemas
exports.insertFinancialForecastSchema = zod_1.z.object({
    category: zod_1.z.string().uuid("L'identifiant de la catégorie n'est pas valide"),
    period: zod_1.z.enum(["month", "quarter", "year"]),
    year: zod_1.z.number().int().min(2000).max(2100),
    month: zod_1.z.number().int().min(1).max(12).optional().nullable(),
    quarter: zod_1.z.number().int().min(1).max(4).optional().nullable(),
    forecastedAmountInCents: zod_1.z.number().int(),
    confidence: zod_1.z.enum(["low", "medium", "high"]).default("medium"),
    basedOn: zod_1.z.enum(["historical", "estimate"]).default("estimate"),
    notes: zod_1.z.string().optional().nullable(),
    createdBy: zod_1.z.string().email("Email de l'administrateur invalide"),
});
exports.updateFinancialForecastSchema = exports.insertFinancialForecastSchema.partial();
exports.adminUsers = exports.admins;
exports.insertAdminUserSchema = exports.insertAdminSchema;
exports.eventRegistrations = exports.inscriptions;
exports.insertEventRegistrationSchema = exports.insertInscriptionSchema;
// ===================================
// System Status / Health Check Types
// ===================================
// Note: These are runtime/operational types, not persistent database tables
exports.statusCheckSchema = zod_1.z.object({
    name: zod_1.z.string(),
    status: zod_1.z.enum(['healthy', 'warning', 'unhealthy', 'unknown']),
    message: zod_1.z.string(),
    responseTime: zod_1.z.number().optional(),
    details: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    error: zod_1.z.string().optional(),
});
exports.statusResponseSchema = zod_1.z.object({
    timestamp: zod_1.z.string(),
    uptime: zod_1.z.number(),
    environment: zod_1.z.string(),
    overallStatus: zod_1.z.enum(['healthy', 'warning', 'unhealthy', 'error']),
    checks: zod_1.z.object({
        application: exports.statusCheckSchema.optional(),
        database: exports.statusCheckSchema.optional(),
        databasePool: exports.statusCheckSchema.optional(),
        memory: exports.statusCheckSchema.optional(),
        email: exports.statusCheckSchema.optional(),
        pushNotifications: exports.statusCheckSchema.optional(),
        minio: exports.statusCheckSchema.optional(),
    }),
});
// Frontend error logging schema
exports.frontendErrorSchema = zod_1.z.object({
    message: zod_1.z.string().min(1).max(1000),
    stack: zod_1.z.string().optional(),
    componentStack: zod_1.z.string().optional(),
    url: zod_1.z.string().url().max(500),
    userAgent: zod_1.z.string().max(500),
    timestamp: zod_1.z.string().datetime()
});
