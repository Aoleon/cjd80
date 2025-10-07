import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, unique, index, serial, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin roles definition
export const ADMIN_ROLES = {
  SUPER_ADMIN: "super_admin",
  IDEAS_READER: "ideas_reader", 
  IDEAS_MANAGER: "ideas_manager",
  EVENTS_READER: "events_reader",
  EVENTS_MANAGER: "events_manager"
} as const;

// AdminRole type derived from ADMIN_ROLES
export type AdminRole = typeof ADMIN_ROLES[keyof typeof ADMIN_ROLES];

// Admin status definition
export const ADMIN_STATUS = {
  PENDING: "pending",    // En attente de validation
  ACTIVE: "active",      // Compte validé et actif
  INACTIVE: "inactive"   // Compte désactivé
} as const;

// Admin users table  
export const admins = pgTable("admins", {
  email: text("email").primaryKey(),
  firstName: text("first_name").default("Admin").notNull(),
  lastName: text("last_name").default("User").notNull(),
  password: text("password").notNull(),
  addedBy: text("added_by"),
  role: text("role").default(ADMIN_ROLES.IDEAS_READER).notNull(), // Rôle par défaut : consultation des idées
  status: text("status").default(ADMIN_STATUS.PENDING).notNull(), // Statut par défaut : en attente
  isActive: boolean("is_active").default(true).notNull(), // Permet de désactiver un admin sans le supprimer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("admins_role_idx").on(table.role),
  statusIdx: index("admins_status_idx").on(table.status),
  activeIdx: index("admins_active_idx").on(table.isActive),
}));

// Status constants for ideas and events
export const IDEA_STATUS = {
  PENDING: "pending",
  APPROVED: "approved", 
  REJECTED: "rejected",
  UNDER_REVIEW: "under_review",
  POSTPONED: "postponed",
  COMPLETED: "completed"
} as const;

export const EVENT_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
  CANCELLED: "cancelled", 
  POSTPONED: "postponed",
  COMPLETED: "completed"
} as const;

// Ideas table - Flexible status workflow management
export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  proposedBy: text("proposed_by").notNull(),
  proposedByEmail: text("proposed_by_email").notNull(),
  status: text("status").default(IDEA_STATUS.PENDING).notNull(), // pending, approved, rejected, under_review, postponed, completed
  featured: boolean("featured").default(false).notNull(), // Mise en avant de l'idée
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
}, (table) => ({
  statusIdx: index("ideas_status_idx").on(table.status),
  emailIdx: index("ideas_email_idx").on(table.proposedByEmail),
  featuredIdx: index("ideas_featured_idx").on(table.featured),
  createdAtIdx: index("ideas_created_at_idx").on(table.createdAt),
}));

// Votes table
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: "cascade" }).notNull(),
  voterName: text("voter_name").notNull(),
  voterEmail: text("voter_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Contrainte unique: un email ne peut voter qu'une seule fois par idée
  uniqueVotePerEmail: unique().on(table.ideaId, table.voterEmail),
  ideaIdIdx: index("votes_idea_id_idx").on(table.ideaId),
}));

// Events table - Flexible status workflow management  
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  location: text("location"), // Lieu de l'événement
  maxParticipants: integer("max_participants"), // Limite de participants (optionnel)
  helloAssoLink: text("hello_asso_link"),
  enableExternalRedirect: boolean("enable_external_redirect").default(false).notNull(), // Active la redirection externe après inscription
  externalRedirectUrl: text("external_redirect_url"), // URL de redirection externe (HelloAsso, etc.)
  showInscriptionsCount: boolean("show_inscriptions_count").default(true).notNull(), // Afficher le nombre d'inscrits
  showAvailableSeats: boolean("show_available_seats").default(true).notNull(), // Afficher le nombre de places disponibles
  allowUnsubscribe: boolean("allow_unsubscribe").default(false).notNull(), // Permet la désinscription (utile pour les plénières)
  redUnsubscribeButton: boolean("red_unsubscribe_button").default(false).notNull(), // Bouton de désinscription rouge (pour les plénières)
  buttonMode: text("button_mode").default("subscribe").notNull(), // "subscribe", "unsubscribe", "both", ou "custom"
  customButtonText: text("custom_button_text"), // Texte personnalisé pour le bouton quand buttonMode est "custom"
  status: text("status").default(EVENT_STATUS.PUBLISHED).notNull(), // draft, published, cancelled, postponed, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
}, (table) => ({
  statusIdx: index("events_status_idx").on(table.status),
  dateIdx: index("events_date_idx").on(table.date),
  statusDateIdx: index("events_status_date_idx").on(table.status, table.date),
}));

// Inscriptions table  
export const inscriptions = pgTable("inscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"), // Société (optionnel)
  phone: text("phone"), // Téléphone (optionnel)
  comments: text("comments"), // Commentaires lors de l'inscription (accompagnants, régime alimentaire, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Contrainte unique: un email ne peut s'inscrire qu'une seule fois par événement
  uniqueRegistrationPerEmail: unique().on(table.eventId, table.email),
  eventIdIdx: index("inscriptions_event_id_idx").on(table.eventId),
}));

// Unsubscriptions table - for people declaring they cannot attend an event
export const unsubscriptions = pgTable("unsubscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  comments: text("comments"), // Raison de l'absence, commentaires, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Contrainte unique: un email ne peut se désinscrire qu'une seule fois par événement
  uniqueUnsubscriptionPerEmail: unique().on(table.eventId, table.email),
}));

// Push subscriptions table for PWA notifications
export const pushSubscriptions = pgTable("push_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  endpoint: text("endpoint").notNull().unique(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userEmail: text("user_email"), // Optional: link to user if logged in
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  endpointIdx: index("push_subscriptions_endpoint_idx").on(table.endpoint),
  emailIdx: index("push_subscriptions_email_idx").on(table.userEmail),
}));

// Development requests table - For GitHub issues integration
export const developmentRequests = pgTable("development_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // "bug" or "feature"
  priority: text("priority").default("medium").notNull(), // "low", "medium", "high", "critical"
  requestedBy: text("requested_by").notNull(), // Email du super admin qui a fait la demande
  requestedByName: text("requested_by_name").notNull(), // Nom du demandeur
  githubIssueNumber: integer("github_issue_number"), // Numéro de l'issue GitHub créée
  githubIssueUrl: text("github_issue_url"), // URL complète de l'issue GitHub
  status: text("status").default("open").notNull(), // "open", "in_progress", "closed", "cancelled"
  githubStatus: text("github_status").default("open").notNull(), // Statut depuis GitHub: "open", "closed"
  adminComment: text("admin_comment"), // Commentaire du super administrateur
  lastStatusChangeBy: text("last_status_change_by"), // Email de la personne qui a modifié le statut en dernier
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSyncedAt: timestamp("last_synced_at"), // Dernière synchronisation avec GitHub
}, (table) => ({
  typeIdx: index("dev_requests_type_idx").on(table.type),
  statusIdx: index("dev_requests_status_idx").on(table.status),
  requestedByIdx: index("dev_requests_requested_by_idx").on(table.requestedBy),
  githubIssueIdx: index("dev_requests_github_issue_idx").on(table.githubIssueNumber),
}));

// Patrons table - CRM pour la gestion des mécènes
export const patrons = pgTable("patrons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role"), // Fonction du mécène
  company: text("company"), // Société
  phone: text("phone"), // Téléphone
  email: text("email").notNull().unique(), // Email unique pour éviter les doublons
  notes: text("notes"), // Informations complémentaires
  status: text("status").notNull().default("active"), // 'active' | 'proposed'
  referrerId: varchar("referrer_id").references(() => members.id, { onDelete: "set null" }), // Prescripteur (membre qui a apporté ce mécène)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: text("created_by"), // Email admin qui a ajouté le mécène
}, (table) => ({
  emailIdx: index("patrons_email_idx").on(table.email),
  createdByIdx: index("patrons_created_by_idx").on(table.createdBy),
  createdAtIdx: index("patrons_created_at_idx").on(table.createdAt),
  referrerIdIdx: index("patrons_referrer_id_idx").on(table.referrerId),
}));

// Patron donations table - Historique des dons
export const patronDonations = pgTable("patron_donations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patronId: varchar("patron_id").references(() => patrons.id, { onDelete: "cascade" }).notNull(),
  donatedAt: timestamp("donated_at").notNull(), // Date du don
  amount: integer("amount").notNull(), // Montant en centimes
  occasion: text("occasion").notNull(), // À quelle occasion : événement, projet, etc.
  recordedBy: text("recorded_by").notNull(), // Email admin qui enregistre
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  patronIdIdx: index("patron_donations_patron_id_idx").on(table.patronId),
  donatedAtIdx: index("patron_donations_donated_at_idx").on(table.donatedAt.desc()),
}));

// Patron updates table - Actualités et contacts avec les mécènes
export const patronUpdates = pgTable("patron_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patronId: varchar("patron_id").references(() => patrons.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // 'meeting', 'email', 'call', 'lunch', 'event'
  subject: text("subject").notNull(), // Titre/sujet de l'actualité
  date: date("date").notNull(), // Date du contact (format YYYY-MM-DD)
  startTime: text("start_time"), // Heure de début (format HH:MM, optionnel)
  duration: integer("duration"), // Durée en minutes (optionnel)
  description: text("description").notNull(), // Description détaillée
  notes: text("notes"), // Notes additionnelles (optionnel)
  createdBy: text("created_by").notNull(), // Email de l'admin qui a créé
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  patronIdIdx: index("patron_updates_patron_id_idx").on(table.patronId),
  typeIdx: index("patron_updates_type_idx").on(table.type),
  dateIdx: index("patron_updates_date_idx").on(table.date.desc()),
  createdAtIdx: index("patron_updates_created_at_idx").on(table.createdAt.desc()),
}));

// Idea patron proposals table - Propositions mécènes-idées
export const ideaPatronProposals = pgTable("idea_patron_proposals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: "cascade" }).notNull(),
  patronId: varchar("patron_id").references(() => patrons.id, { onDelete: "cascade" }).notNull(),
  proposedByAdminEmail: text("proposed_by_admin_email").notNull(), // Email du membre qui propose
  proposedAt: timestamp("proposed_at").defaultNow().notNull(),
  status: text("status").default("proposed").notNull(), // 'proposed', 'contacted', 'declined', 'converted'
  comments: text("comments"), // Notes de suivi
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  uniqueIdeaPatron: unique().on(table.ideaId, table.patronId),
  ideaIdIdx: index("idea_patron_proposals_idea_id_idx").on(table.ideaId),
  patronIdIdx: index("idea_patron_proposals_patron_id_idx").on(table.patronId),
  statusIdx: index("idea_patron_proposals_status_idx").on(table.status),
}));

// Members table - CRM pour la gestion des membres
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  company: text("company"),
  phone: text("phone"),
  role: text("role"),
  notes: text("notes"),
  status: text("status").default("active").notNull(),
  proposedBy: text("proposed_by"),
  engagementScore: integer("engagement_score").default(0).notNull(),
  firstSeenAt: timestamp("first_seen_at").notNull(),
  lastActivityAt: timestamp("last_activity_at").notNull(),
  activityCount: integer("activity_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("members_email_idx").on(table.email),
  lastActivityAtIdx: index("members_last_activity_at_idx").on(table.lastActivityAt.desc()),
  engagementScoreIdx: index("members_engagement_score_idx").on(table.engagementScore.desc()),
  statusIdx: index("members_status_idx").on(table.status),
}));

// Member activities table - Journal d'activité des membres
export const memberActivities = pgTable("member_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberEmail: text("member_email").references(() => members.email, { onDelete: "cascade" }).notNull(),
  activityType: text("activity_type").notNull(), // 'idea_proposed', 'vote_cast', 'event_registered', 'event_unregistered', 'patron_suggested'
  entityType: text("entity_type").notNull(), // 'idea', 'vote', 'event', 'patron'
  entityId: varchar("entity_id"),
  entityTitle: text("entity_title"),
  metadata: text("metadata"),
  scoreImpact: integer("score_impact").notNull(),
  occurredAt: timestamp("occurred_at").defaultNow().notNull(),
}, (table) => ({
  memberEmailIdx: index("member_activities_member_email_idx").on(table.memberEmail),
  occurredAtIdx: index("member_activities_occurred_at_idx").on(table.occurredAt.desc()),
  activityTypeIdx: index("member_activities_activity_type_idx").on(table.activityType),
}));

// Member subscriptions table - Historique des souscriptions des membres
export const memberSubscriptions = pgTable("member_subscriptions", {
  id: serial("id").primaryKey(),
  memberEmail: varchar("member_email", { length: 255 }).notNull().references(() => members.email),
  amountInCents: integer("amount_in_cents").notNull(), // Stocké en centimes comme pour les donations
  startDate: date("start_date").notNull(), // Format YYYY-MM-DD
  endDate: date("end_date").notNull(), // Format YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  memberEmailIdx: index("member_subscriptions_member_email_idx").on(table.memberEmail),
  startDateIdx: index("member_subscriptions_start_date_idx").on(table.startDate.desc()),
}));

// Relations
export const ideasRelations = relations(ideas, ({ many }) => ({
  votes: many(votes),
  patronProposals: many(ideaPatronProposals),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  idea: one(ideas, {
    fields: [votes.ideaId],
    references: [ideas.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  inscriptions: many(inscriptions),
  unsubscriptions: many(unsubscriptions),
}));

export const inscriptionsRelations = relations(inscriptions, ({ one }) => ({
  event: one(events, {
    fields: [inscriptions.eventId],
    references: [events.id],
  }),
}));

export const unsubscriptionsRelations = relations(unsubscriptions, ({ one }) => ({
  event: one(events, {
    fields: [unsubscriptions.eventId],
    references: [events.id],
  }),
}));

export const patronsRelations = relations(patrons, ({ many }) => ({
  donations: many(patronDonations),
  proposals: many(ideaPatronProposals),
  updates: many(patronUpdates),
}));

export const patronDonationsRelations = relations(patronDonations, ({ one }) => ({
  patron: one(patrons, {
    fields: [patronDonations.patronId],
    references: [patrons.id],
  }),
}));

export const patronUpdatesRelations = relations(patronUpdates, ({ one }) => ({
  patron: one(patrons, {
    fields: [patronUpdates.patronId],
    references: [patrons.id],
  }),
}));

export const ideaPatronProposalsRelations = relations(ideaPatronProposals, ({ one }) => ({
  idea: one(ideas, {
    fields: [ideaPatronProposals.ideaId],
    references: [ideas.id],
  }),
  patron: one(patrons, {
    fields: [ideaPatronProposals.patronId],
    references: [patrons.id],
  }),
}));

export const membersRelations = relations(members, ({ many }) => ({
  activities: many(memberActivities),
  subscriptions: many(memberSubscriptions),
}));

export const memberActivitiesRelations = relations(memberActivities, ({ one }) => ({
  member: one(members, {
    fields: [memberActivities.memberEmail],
    references: [members.email],
  }),
}));

export const memberSubscriptionsRelations = relations(memberSubscriptions, ({ one }) => ({
  member: one(members, {
    fields: [memberSubscriptions.memberEmail],
    references: [members.email],
  }),
}));

// Security helper functions - Plus permissif pour permettre plus de domaines
const isValidDomain = (email: string) => {
  const domain = email.split('@')[1];
  // Accepte la plupart des domaines courants
  return domain && (
    domain.includes('.') && 
    !domain.includes('<') && 
    !domain.includes('>') && 
    domain.length >= 3
  );
};

const sanitizeText = (text: string) => text
  .replace(/[<>]/g, '') // Remove potential HTML
  .trim()
  .slice(0, 5000); // Limit length

// Ultra-secure insert schemas with validation
export const insertAdminSchema = createInsertSchema(admins).pick({
  email: true,
  firstName: true,
  lastName: true,
  password: true,
  addedBy: true,
  role: true,
}).extend({
  email: z.string()
    .email("Email invalide")
    .min(5, "Email trop court")
    .max(100, "Email trop long")
    .transform(sanitizeText),
  firstName: z.string()
    .min(1, "Le prénom est obligatoire")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .transform(sanitizeText),
  lastName: z.string()
    .min(1, "Le nom de famille est obligatoire")
    .max(50, "Le nom de famille ne peut pas dépasser 50 caractères")
    .transform(sanitizeText),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins : 1 majuscule (A-Z), 1 minuscule (a-z) et 1 chiffre (0-9)"),
  addedBy: z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
  role: z.enum([
    ADMIN_ROLES.SUPER_ADMIN,
    ADMIN_ROLES.IDEAS_READER,
    ADMIN_ROLES.IDEAS_MANAGER,
    ADMIN_ROLES.EVENTS_READER,
    ADMIN_ROLES.EVENTS_MANAGER
  ]).default(ADMIN_ROLES.IDEAS_READER),
});

export const updateAdminSchema = z.object({
  role: z.enum([
    ADMIN_ROLES.SUPER_ADMIN,
    ADMIN_ROLES.IDEAS_READER,
    ADMIN_ROLES.IDEAS_MANAGER,
    ADMIN_ROLES.EVENTS_READER,
    ADMIN_ROLES.EVENTS_MANAGER
  ]).optional(),
  isActive: z.boolean().optional(),
});

export const updateAdminInfoSchema = z.object({
  firstName: z.string()
    .min(1, "Le prénom est obligatoire")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères")
    .transform(sanitizeText),
  lastName: z.string()
    .min(1, "Le nom de famille est obligatoire")
    .max(50, "Le nom de famille ne peut pas dépasser 50 caractères")
    .transform(sanitizeText),
});

export const updateAdminPasswordSchema = z.object({
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(128, "Le mot de passe ne peut pas dépasser 128 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins : 1 majuscule (A-Z), 1 minuscule (a-z) et 1 chiffre (0-9)"),
});

export const insertIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
  proposedBy: true,
  proposedByEmail: true,
  deadline: true,
}).extend({
  title: z.string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200, "Le titre est trop long (maximum 200 caractères). Raccourcissez votre titre ou utilisez la description pour plus de détails.")
    .transform(sanitizeText),
  description: z.string()
    .max(5000, "Description trop longue (max 5000 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  proposedBy: z.string()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Votre nom est trop long (maximum 100 caractères)")
    .transform(sanitizeText),
  proposedByEmail: z.string()
    .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
    .transform(sanitizeText),
  company: z.string()
    .max(100, "Le nom de la société est trop long (maximum 100 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  phone: z.string()
    .max(20, "Le numéro de téléphone est trop long (maximum 20 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  deadline: z.string().datetime().optional(),
});

export const updateIdeaStatusSchema = z.object({
  status: z.enum([
    IDEA_STATUS.PENDING,
    IDEA_STATUS.APPROVED,
    IDEA_STATUS.REJECTED,
    IDEA_STATUS.UNDER_REVIEW,
    IDEA_STATUS.POSTPONED,
    IDEA_STATUS.COMPLETED
  ]),
});

export const updateIdeaSchema = z.object({
  title: z.string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre est trop long (maximum 255 caractères). Raccourcissez votre titre."),
  description: z.string().nullable().optional(),
  proposedBy: z.string()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Votre nom est trop long (maximum 100 caractères)")
    .transform(sanitizeText),
  proposedByEmail: z.string()
    .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
    .transform(sanitizeText),
  createdAt: z.string().datetime("La date de publication n'est pas valide").optional(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  ideaId: true,
  voterName: true,
  voterEmail: true,
}).extend({
  ideaId: z.string()
    .min(1, "ID d'idée requis")
    .refine(
      (id) => {
        // Accepter les UUIDs standard (36 caractères) ou les IDs existants (20 caractères alphanumériques)
        const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);
        const isLegacyId = /^[a-zA-Z0-9]{20}$/.test(id);
        return isUuid || isLegacyId;
      },
      "ID d'idée invalide"
    )
    .transform(sanitizeText),
  voterName: z.string()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Votre nom est trop long (maximum 100 caractères)")
    .transform(sanitizeText),
  voterEmail: z.string()
    .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
    .transform(sanitizeText),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  location: true,
  maxParticipants: true,
  helloAssoLink: true,
  enableExternalRedirect: true,
  externalRedirectUrl: true,
  showInscriptionsCount: true,
  showAvailableSeats: true,
}).extend({
  title: z.string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200, "Le titre est trop long (maximum 200 caractères). Raccourcissez votre titre ou utilisez la description pour plus de détails.")
    .transform(sanitizeText),
  description: z.string()
    .max(5000, "La description est trop longue (maximum 5000 caractères). Raccourcissez votre texte.")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  date: z.string().datetime("La date n'est pas valide. Veuillez sélectionner une date et heure correctes."),
  location: z.string()
    .max(200, "Le nom du lieu est trop long (maximum 200 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  maxParticipants: z.number()
    .min(1, "Le nombre maximum de participants doit être d'au moins 1 personne")
    .max(1000, "Le nombre maximum de participants ne peut pas dépasser 1000 personnes")
    .optional(),
  helloAssoLink: z.string()
    .optional()
    .refine(url => !url || url.includes('helloasso.com'), "L'adresse doit être un lien HelloAsso valide (contenant 'helloasso.com')")
    .refine(url => !url || z.string().url().safeParse(url).success, "L'adresse web n'est pas valide. Veuillez saisir une URL complète (ex: https://exemple.com)")
    .transform(val => val ? sanitizeText(val) : undefined),
  enableExternalRedirect: z.boolean().optional(),
  externalRedirectUrl: z.string()
    .optional()
    .refine(url => !url || z.string().url().safeParse(url).success, "L'adresse web de redirection n'est pas valide. Veuillez saisir une URL complète (ex: https://exemple.com)")
    .transform(val => val ? sanitizeText(val) : undefined),
  showInscriptionsCount: z.boolean().optional(),
  showAvailableSeats: z.boolean().optional(),
  allowUnsubscribe: z.boolean().optional(),
  redUnsubscribeButton: z.boolean().optional(),
  buttonMode: z.enum(["subscribe", "unsubscribe", "both", "custom"]).optional(),
  customButtonText: z.string()
    .max(50, "Le texte du bouton personnalisé est trop long (maximum 50 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

export const insertInscriptionSchema = createInsertSchema(inscriptions).pick({
  eventId: true,
  name: true,
  email: true,
  company: true,
  phone: true,
  comments: true,
}).extend({
  eventId: z.string()
    .uuid("L'identifiant de l'événement n'est pas valide")
    .transform(sanitizeText),
  name: z.string()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Votre nom est trop long (maximum 100 caractères)")
    .transform(sanitizeText),
  email: z.string()
    .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
    .refine(isValidDomain, "Le domaine de votre adresse email n'est pas autorisé")
    .transform(sanitizeText),
  company: z.string()
    .max(100, "Le nom de la société est trop long (maximum 100 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  phone: z.string()
    .max(20, "Le numéro de téléphone est trop long (maximum 20 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  comments: z.string()
    .max(500, "Vos commentaires sont trop longs (maximum 500 caractères). Raccourcissez votre message.")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

// Schema for initial inscription (without eventId since it will be auto-generated)
export const initialInscriptionSchema = z.object({
  name: z.string()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Votre nom est trop long (maximum 100 caractères)")
    .transform(sanitizeText),
  email: z.string()
    .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
    .refine(isValidDomain, "Le domaine de votre adresse email n'est pas autorisé")
    .transform(sanitizeText),
  company: z.string()
    .max(100, "Le nom de la société est trop long (maximum 100 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  phone: z.string()
    .max(20, "Le numéro de téléphone est trop long (maximum 20 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  comments: z.string()
    .max(500, "Vos commentaires sont trop longs (maximum 500 caractères). Raccourcissez votre message.")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

// Schema for creating event with initial inscriptions
export const createEventWithInscriptionsSchema = z.object({
  event: insertEventSchema,
  initialInscriptions: z.array(initialInscriptionSchema).default([])
});

export const insertUnsubscriptionSchema = createInsertSchema(unsubscriptions).pick({
  eventId: true,
  name: true,
  email: true,
  comments: true,
}).extend({
  eventId: z.string()
    .uuid("L'identifiant de l'événement n'est pas valide")
    .transform(sanitizeText),
  name: z.string()
    .min(2, "Votre nom doit contenir au moins 2 caractères")
    .max(100, "Votre nom est trop long (maximum 100 caractères)")
    .transform(sanitizeText),
  email: z.string()
    .email("Adresse email invalide. Veuillez saisir une adresse email valide (ex: nom@domaine.fr)")
    .refine(isValidDomain, "Le domaine de votre adresse email n'est pas autorisé")
    .transform(sanitizeText),
  comments: z.string()
    .max(500, "Votre raison d'absence est trop longue (maximum 500 caractères). Raccourcissez votre message.")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

export const insertPatronSchema = createInsertSchema(patrons).pick({
  firstName: true,
  lastName: true,
  role: true,
  company: true,
  phone: true,
  email: true,
  notes: true,
  referrerId: true,
  createdBy: true,
}).extend({
  firstName: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .transform(sanitizeText),
  lastName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .transform(sanitizeText),
  role: z.string()
    .max(100, "La fonction ne peut pas dépasser 100 caractères")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  company: z.string()
    .max(200, "Le nom de la société ne peut pas dépasser 200 caractères")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  phone: z.string()
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  email: z.string()
    .email("Adresse email invalide")
    .transform(sanitizeText),
  notes: z.string()
    .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  referrerId: z.string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === "") return undefined;
      return sanitizeText(val);
    })
    .refine(val => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
      message: "L'identifiant du prescripteur n'est pas valide"
    }),
  createdBy: z.string()
    .email("Email de l'administrateur invalide")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

export const insertPatronDonationSchema = createInsertSchema(patronDonations).pick({
  patronId: true,
  donatedAt: true,
  amount: true,
  occasion: true,
  recordedBy: true,
}).extend({
  patronId: z.string()
    .uuid("L'identifiant du mécène n'est pas valide")
    .transform(sanitizeText),
  donatedAt: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD")
    .transform((val) => new Date(val + 'T00:00:00.000Z')),
  amount: z.number()
    .int("Le montant doit être un nombre entier")
    .min(0, "Le montant ne peut pas être négatif"),
  occasion: z.string()
    .min(3, "L'occasion doit contenir au moins 3 caractères")
    .max(200, "L'occasion ne peut pas dépasser 200 caractères")
    .transform(sanitizeText),
  recordedBy: z.string()
    .email("Email de l'administrateur invalide")
    .transform(sanitizeText),
});

export const insertPatronUpdateSchema = createInsertSchema(patronUpdates).pick({
  patronId: true,
  type: true,
  subject: true,
  date: true,
  startTime: true,
  duration: true,
  description: true,
  notes: true,
  createdBy: true,
}).extend({
  patronId: z.string()
    .uuid("L'identifiant du mécène n'est pas valide")
    .transform(sanitizeText),
  type: z.enum(["meeting", "email", "call", "lunch", "event"], {
    errorMap: () => ({ message: "Le type doit être 'meeting', 'email', 'call', 'lunch' ou 'event'" })
  }),
  subject: z.string()
    .min(3, "Le sujet doit contenir au moins 3 caractères")
    .max(200, "Le sujet ne peut pas dépasser 200 caractères")
    .transform(sanitizeText),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD"),
  startTime: z.string()
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  duration: z.number()
    .int("La durée doit être un nombre entier")
    .min(0, "La durée ne peut pas être négative")
    .optional(),
  description: z.string()
    .min(1, "La description est obligatoire")
    .max(3000, "La description ne peut pas dépasser 3000 caractères")
    .transform(sanitizeText),
  notes: z.string()
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  createdBy: z.string()
    .email("Email de l'administrateur invalide")
    .transform(sanitizeText),
});

export const updatePatronUpdateSchema = z.object({
  type: z.enum(["meeting", "email", "call", "lunch", "event"]).optional(),
  subject: z.string()
    .min(3, "Le sujet doit contenir au moins 3 caractères")
    .max(200, "Le sujet ne peut pas dépasser 200 caractères")
    .transform(sanitizeText)
    .optional(),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La date doit être au format YYYY-MM-DD")
    .optional(),
  startTime: z.string()
    .regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, "L'heure doit être au format HH:MM")
    .transform(val => sanitizeText(val))
    .optional(),
  duration: z.number()
    .int("La durée doit être un nombre entier")
    .min(0, "La durée ne peut pas être négative")
    .optional(),
  description: z.string()
    .min(1, "La description est obligatoire")
    .max(3000, "La description ne peut pas dépasser 3000 caractères")
    .transform(sanitizeText)
    .optional(),
  notes: z.string()
    .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères")
    .transform(val => sanitizeText(val))
    .optional(),
});

export const insertIdeaPatronProposalSchema = createInsertSchema(ideaPatronProposals).pick({
  ideaId: true,
  patronId: true,
  proposedByAdminEmail: true,
  status: true,
  comments: true,
}).extend({
  ideaId: z.string()
    .uuid("L'identifiant de l'idée n'est pas valide")
    .transform(sanitizeText),
  patronId: z.string()
    .uuid("L'identifiant du mécène n'est pas valide")
    .transform(sanitizeText),
  proposedByAdminEmail: z.string()
    .email("Email de l'administrateur invalide")
    .transform(sanitizeText),
  status: z.enum(["proposed", "contacted", "declined", "converted"]).default("proposed"),
  comments: z.string()
    .max(1000, "Les commentaires ne peuvent pas dépasser 1000 caractères")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

export const updatePatronSchema = z.object({
  firstName: z.string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(100, "Le prénom ne peut pas dépasser 100 caractères")
    .transform(sanitizeText)
    .optional(),
  lastName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .transform(sanitizeText)
    .optional(),
  role: z.string()
    .max(100, "La fonction ne peut pas dépasser 100 caractères")
    .transform(val => sanitizeText(val))
    .optional(),
  company: z.string()
    .max(200, "Le nom de la société ne peut pas dépasser 200 caractères")
    .transform(val => sanitizeText(val))
    .optional(),
  phone: z.string()
    .max(20, "Le numéro de téléphone ne peut pas dépasser 20 caractères")
    .transform(val => sanitizeText(val))
    .optional(),
  email: z.string()
    .email("Adresse email invalide")
    .transform(sanitizeText)
    .optional(),
  notes: z.string()
    .max(2000, "Les notes ne peuvent pas dépasser 2000 caractères")
    .transform(val => sanitizeText(val))
    .optional(),
  referrerId: z.string()
    .optional()
    .nullable()
    .transform(val => {
      if (!val || val.trim() === "") return null;
      return sanitizeText(val);
    })
    .refine(val => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val), {
      message: "L'identifiant du prescripteur n'est pas valide"
    }),
});

export const updateIdeaPatronProposalSchema = z.object({
  status: z.enum(["proposed", "contacted", "declined", "converted"]).optional(),
  comments: z.string()
    .max(1000, "Les commentaires ne peuvent pas dépasser 1000 caractères")
    .transform(val => sanitizeText(val))
    .optional(),
});

export const insertMemberSchema = createInsertSchema(members).pick({
  email: true,
  firstName: true,
  lastName: true,
  company: true,
  phone: true,
  role: true,
  notes: true,
  status: true,
  proposedBy: true,
}).extend({
  email: z.string().email().transform(sanitizeText),
  firstName: z.string().min(2).max(100).transform(sanitizeText),
  lastName: z.string().min(2).max(100).transform(sanitizeText),
  company: z.string().max(200).optional().transform(val => val ? sanitizeText(val) : undefined),
  phone: z.string().max(20).optional().transform(val => val ? sanitizeText(val) : undefined),
  role: z.string().max(100).optional().transform(val => val ? sanitizeText(val) : undefined),
  notes: z.string().max(2000).optional().transform(val => val ? sanitizeText(val) : undefined),
  status: z.enum(['active', 'proposed']).default('active'),
  proposedBy: z.string().email().optional().transform(val => val ? sanitizeText(val) : undefined),
});

export const insertMemberActivitySchema = createInsertSchema(memberActivities).pick({
  memberEmail: true,
  activityType: true,
  entityType: true,
  entityId: true,
  entityTitle: true,
  metadata: true,
  scoreImpact: true,
}).extend({
  memberEmail: z.string().email().transform(sanitizeText),
  activityType: z.enum(['idea_proposed', 'vote_cast', 'event_registered', 'event_unregistered', 'patron_suggested']),
  entityType: z.enum(['idea', 'vote', 'event', 'patron']),
  entityId: z.string().uuid().optional(),
  entityTitle: z.string().max(500).optional().transform(val => val ? sanitizeText(val) : undefined),
  metadata: z.string().optional(),
  scoreImpact: z.number().int(),
});

export const updateMemberSchema = z.object({
  firstName: z.string().min(2).max(100).transform(sanitizeText).optional(),
  lastName: z.string().min(2).max(100).transform(sanitizeText).optional(),
  company: z.string().max(200).transform(sanitizeText).optional(),
  phone: z.string().max(20).transform(sanitizeText).optional(),
  role: z.string().max(100).transform(sanitizeText).optional(),
  notes: z.string().max(2000).transform(sanitizeText).optional(),
});

export const proposeMemberSchema = z.object({
  email: z.string().email("Adresse email invalide").transform(sanitizeText),
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(100).transform(sanitizeText),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100).transform(sanitizeText),
  company: z.string().max(200).optional().transform(val => val ? sanitizeText(val) : undefined),
  phone: z.string().max(20).optional().transform(val => val ? sanitizeText(val) : undefined),
  role: z.string().max(100).optional().transform(val => val ? sanitizeText(val) : undefined),
  notes: z.string().max(2000).optional().transform(val => val ? sanitizeText(val) : undefined),
  proposedBy: z.string().email("Email du proposeur invalide").transform(sanitizeText),
});

// Types
export type Admin = typeof admins.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type User = Admin; // For compatibility with auth blueprint

export type Idea = typeof ideas.$inferSelect;
export type InsertIdea = z.infer<typeof insertIdeaSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Inscription = typeof inscriptions.$inferSelect;
export type InsertInscription = z.infer<typeof insertInscriptionSchema>;

export type Unsubscription = typeof unsubscriptions.$inferSelect;
export type InsertUnsubscription = z.infer<typeof insertUnsubscriptionSchema>;

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

export type Patron = typeof patrons.$inferSelect;
export type InsertPatron = z.infer<typeof insertPatronSchema>;

export type PatronDonation = typeof patronDonations.$inferSelect;
export type InsertPatronDonation = z.infer<typeof insertPatronDonationSchema>;

export type PatronUpdate = typeof patronUpdates.$inferSelect;
export type InsertPatronUpdate = z.infer<typeof insertPatronUpdateSchema>;

export type IdeaPatronProposal = typeof ideaPatronProposals.$inferSelect;
export type InsertIdeaPatronProposal = z.infer<typeof insertIdeaPatronProposalSchema>;

export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;

export type MemberActivity = typeof memberActivities.$inferSelect;
export type InsertMemberActivity = z.infer<typeof insertMemberActivitySchema>;

// For compatibility with existing auth system
export const users = admins;
export const insertUserSchema = insertAdminSchema;
export type InsertUser = InsertAdmin;

// Additional validation schemas for API routes - using new status system
export const updateEventStatusSchema = z.object({
  status: z.enum([
    EVENT_STATUS.DRAFT,
    EVENT_STATUS.PUBLISHED,
    EVENT_STATUS.CANCELLED,
    EVENT_STATUS.POSTPONED,
    EVENT_STATUS.COMPLETED
  ]),
});

export const updateEventSchema = insertEventSchema.partial();

// Result pattern for ultra-robust error handling
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

// Custom error types for better error handling
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class DuplicateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DuplicateError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

// Type guard for validating admin roles
function isValidAdminRole(role: unknown): role is AdminRole {
  return typeof role === 'string' && Object.values(ADMIN_ROLES).includes(role as AdminRole);
}

// Permission helper functions
export const hasPermission = (userRole: string, permission: string): boolean => {
  // Validate role is a valid AdminRole
  if (!isValidAdminRole(userRole)) {
    console.warn(`Invalid admin role: ${userRole}`);
    return false;
  }
  
  // Super admin a tous les droits
  if (userRole === ADMIN_ROLES.SUPER_ADMIN) return true;
  
  switch (permission) {
    case 'ideas.read':
      return [ADMIN_ROLES.IDEAS_READER, ADMIN_ROLES.IDEAS_MANAGER].includes(userRole as typeof ADMIN_ROLES.IDEAS_READER | typeof ADMIN_ROLES.IDEAS_MANAGER);
    case 'ideas.write':
    case 'ideas.delete':
    case 'ideas.manage':
      return userRole === ADMIN_ROLES.IDEAS_MANAGER;
    case 'events.read':
      return [ADMIN_ROLES.EVENTS_READER, ADMIN_ROLES.EVENTS_MANAGER].includes(userRole as typeof ADMIN_ROLES.EVENTS_READER | typeof ADMIN_ROLES.EVENTS_MANAGER);
    case 'events.write':
    case 'events.delete':
    case 'events.manage':
      return userRole === ADMIN_ROLES.EVENTS_MANAGER;
    case 'admin.view':
      // Tous les admins peuvent voir les membres
      return true;
    case 'admin.edit':
      // Les gestionnaires et super admins peuvent éditer les données (inscriptions, votes, etc.)
      // Note: SUPER_ADMIN already returns true above
      return [ADMIN_ROLES.IDEAS_MANAGER, ADMIN_ROLES.EVENTS_MANAGER].includes(userRole as typeof ADMIN_ROLES.IDEAS_MANAGER | typeof ADMIN_ROLES.EVENTS_MANAGER);
    case 'admin.manage':
      // Only SUPER_ADMIN can manage admins (already returns true above)
      return false;
    default:
      return false;
  }
};

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return "Super Administrateur";
    case ADMIN_ROLES.IDEAS_READER:
      return "Consultation des idées";
    case ADMIN_ROLES.IDEAS_MANAGER:
      return "Gestion des idées";
    case ADMIN_ROLES.EVENTS_READER:
      return "Consultation des événements";
    case ADMIN_ROLES.EVENTS_MANAGER:
      return "Gestion des événements";
    default:
      return "Rôle inconnu";
  }
};

export const getRolePermissions = (role: string): string[] => {
  switch (role) {
    case ADMIN_ROLES.SUPER_ADMIN:
      return ['Toutes les permissions', 'Gestion des administrateurs'];
    case ADMIN_ROLES.IDEAS_READER:
      return ['Consultation des idées'];
    case ADMIN_ROLES.IDEAS_MANAGER:
      return ['Consultation des idées', 'Modification des idées', 'Suppression des idées', 'Gestion des votes'];
    case ADMIN_ROLES.EVENTS_READER:
      return ['Consultation des événements'];
    case ADMIN_ROLES.EVENTS_MANAGER:
      return ['Consultation des événements', 'Modification des événements', 'Suppression des événements', 'Gestion des inscriptions et absences'];
    default:
      return [];
  }
};

// Development requests validation schemas
export const insertDevelopmentRequestSchema = createInsertSchema(developmentRequests).pick({
  title: true,
  description: true,
  type: true,
  priority: true,
  requestedBy: true,
  requestedByName: true,
}).extend({
  title: z.string()
    .min(5, "Le titre doit contenir au moins 5 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères")
    .transform(sanitizeText),
  description: z.string()
    .min(20, "La description doit contenir au moins 20 caractères")
    .max(3000, "La description ne peut pas dépasser 3000 caractères")
    .transform(sanitizeText),
  type: z.enum(["bug", "feature"], {
    errorMap: () => ({ message: "Le type doit être 'bug' ou 'feature'" })
  }),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  requestedBy: z.string().email("Email invalide").transform(sanitizeText),
  requestedByName: z.string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .transform(sanitizeText),
});

export const updateDevelopmentRequestSchema = z.object({
  status: z.enum(["open", "in_progress", "closed", "cancelled"]).optional(),
  githubStatus: z.enum(["open", "closed"]).optional(),
  githubIssueNumber: z.number().int().positive().optional(),
  githubIssueUrl: z.string().url().optional(),
  lastSyncedAt: z.date().optional(),
});

// Schéma spécial pour les mises à jour de statut par le super administrateur
export const updateDevelopmentRequestStatusSchema = z.object({
  status: z.enum(["open", "in_progress", "closed", "cancelled"]),
  adminComment: z.string()
    .max(1000, "Le commentaire ne peut pas dépasser 1000 caractères")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  lastStatusChangeBy: z.string().email("Email invalide").transform(sanitizeText),
});

// Type definitions
export type DevelopmentRequest = typeof developmentRequests.$inferSelect;
export type InsertDevelopmentRequest = z.infer<typeof insertDevelopmentRequestSchema>;

// Member subscriptions schemas
export const insertMemberSubscriptionSchema = createInsertSchema(memberSubscriptions).omit({
  id: true,
  createdAt: true,
});

export type InsertMemberSubscription = z.infer<typeof insertMemberSubscriptionSchema>;
export type MemberSubscription = typeof memberSubscriptions.$inferSelect;

// Legacy compatibility
export type AdminUser = Admin;
export type InsertAdminUser = InsertAdmin;
export type EventRegistration = Inscription;
export type InsertEventRegistration = InsertInscription;
export const adminUsers = admins;
export const insertAdminUserSchema = insertAdminSchema;
export const eventRegistrations = inscriptions;
export const insertEventRegistrationSchema = insertInscriptionSchema;
