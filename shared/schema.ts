import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, unique, index } from "drizzle-orm/pg-core";
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

// Admin users table  
export const admins = pgTable("admins", {
  email: text("email").primaryKey(),
  password: text("password").notNull(),
  addedBy: text("added_by"),
  role: text("role").default(ADMIN_ROLES.IDEAS_READER).notNull(), // Rôle par défaut : consultation des idées
  isActive: boolean("is_active").default(true).notNull(), // Permet de désactiver un admin sans le supprimer
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  roleIdx: index("admins_role_idx").on(table.role),
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
  buttonMode: text("button_mode").default("subscribe").notNull(), // "subscribe", "unsubscribe", ou "both"
  status: text("status").default(EVENT_STATUS.PUBLISHED).notNull(), // draft, published, cancelled, postponed, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
}, (table) => ({
  statusIdx: index("events_status_idx").on(table.status),
  dateIdx: index("events_date_idx").on(table.date),
}));

// Inscriptions table  
export const inscriptions = pgTable("inscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  comments: text("comments"), // Commentaires lors de l'inscription (accompagnants, régime alimentaire, etc.)
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Contrainte unique: un email ne peut s'inscrire qu'une seule fois par événement
  uniqueRegistrationPerEmail: unique().on(table.eventId, table.email),
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

// Relations
export const ideasRelations = relations(ideas, ({ many }) => ({
  votes: many(votes),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  idea: one(ideas, {
    fields: [votes.ideaId],
    references: [ideas.id],
  }),
}));

export const eventsRelations = relations(events, ({ many }) => ({
  inscriptions: many(inscriptions),
}));

export const inscriptionsRelations = relations(inscriptions, ({ one }) => ({
  event: one(events, {
    fields: [inscriptions.eventId],
    references: [events.id],
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
  password: true,
  addedBy: true,
  role: true,
}).extend({
  email: z.string()
    .email("Email invalide")
    .min(5, "Email trop court")
    .max(100, "Email trop long")
    .transform(sanitizeText),
  password: z.string()
    .min(8, "Mot de passe trop court (min 8 caractères)")
    .max(128, "Mot de passe trop long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mot de passe doit contenir au moins: 1 majuscule, 1 minuscule, 1 chiffre"),
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

export const updateAdminPasswordSchema = z.object({
  password: z.string()
    .min(8, "Mot de passe trop court (min 8 caractères)")
    .max(128, "Mot de passe trop long")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Mot de passe doit contenir au moins: 1 majuscule, 1 minuscule, 1 chiffre"),
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
  buttonMode: z.enum(["subscribe", "unsubscribe", "both"]).optional(),
});

export const insertInscriptionSchema = createInsertSchema(inscriptions).pick({
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
    .max(500, "Vos commentaires sont trop longs (maximum 500 caractères). Raccourcissez votre message.")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
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

export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

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

// Permission helper functions
export const hasPermission = (userRole: string, permission: string): boolean => {
  // Super admin a tous les droits
  if (userRole === ADMIN_ROLES.SUPER_ADMIN) return true;
  
  switch (permission) {
    case 'ideas.read':
      return [ADMIN_ROLES.IDEAS_READER, ADMIN_ROLES.IDEAS_MANAGER].includes(userRole as any);
    case 'ideas.write':
    case 'ideas.delete':
    case 'ideas.manage':
      return userRole === ADMIN_ROLES.IDEAS_MANAGER;
    case 'events.read':
      return [ADMIN_ROLES.EVENTS_READER, ADMIN_ROLES.EVENTS_MANAGER].includes(userRole as any);
    case 'events.write':
    case 'events.delete':
    case 'events.manage':
      return userRole === ADMIN_ROLES.EVENTS_MANAGER;
    case 'admin.manage':
      return userRole === ADMIN_ROLES.SUPER_ADMIN;
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
      return ['Consultation des idées', 'Modification des idées', 'Suppression des idées'];
    case ADMIN_ROLES.EVENTS_READER:
      return ['Consultation des événements'];
    case ADMIN_ROLES.EVENTS_MANAGER:
      return ['Consultation des événements', 'Modification des événements', 'Suppression des événements'];
    default:
      return [];
  }
};

// Legacy compatibility
export type AdminUser = Admin;
export type InsertAdminUser = InsertAdmin;
export type EventRegistration = Inscription;
export type InsertEventRegistration = InsertInscription;
export const adminUsers = admins;
export const insertAdminUserSchema = insertAdminSchema;
export const eventRegistrations = inscriptions;
export const insertEventRegistrationSchema = insertInscriptionSchema;
