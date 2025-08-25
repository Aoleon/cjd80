import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, unique, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table  
export const admins = pgTable("admins", {
  email: text("email").primaryKey(),
  password: text("password").notNull(),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  .slice(0, 1000); // Limit length

// Ultra-secure insert schemas with validation
export const insertAdminSchema = createInsertSchema(admins).pick({
  email: true,
  password: true,
  addedBy: true,
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
});

export const insertIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
  proposedBy: true,
  proposedByEmail: true,
  deadline: true,
}).extend({
  title: z.string()
    .min(3, "Titre trop court (min 3 caractères)")
    .max(200, "Titre trop long (max 200 caractères)")
    .regex(/^[a-zA-Z0-9\s\-_.&():!?,:àâäéèêëïîôöùûüÿñç]+$/, "Titre contient des caractères non autorisés")
    .transform(sanitizeText),
  description: z.string()
    .max(1000, "Description trop longue (max 1000 caractères)")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  proposedBy: z.string()
    .min(2, "Nom trop court (min 2 caractères)")
    .max(100, "Nom trop long")
    .regex(/^[a-zA-Z\s\-'.àâäéèêëïîôöùûüÿñç]+$/, "Nom contient des caractères non autorisés")
    .transform(sanitizeText),
  proposedByEmail: z.string()
    .email("Email invalide")
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
  title: z.string().min(1, "Le titre est requis").max(255, "Titre trop long"),
  description: z.string().nullable().optional(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  ideaId: true,
  voterName: true,
  voterEmail: true,
}).extend({
  ideaId: z.string()
    .uuid("ID d'idée invalide")
    .transform(sanitizeText),
  voterName: z.string()
    .min(2, "Nom trop court (min 2 caractères)")
    .max(100, "Nom trop long")
    .regex(/^[a-zA-Z\s\-'.àâäéèêëïîôöùûüÿñç]+$/, "Nom contient des caractères non autorisés")
    .transform(sanitizeText),
  voterEmail: z.string()
    .email("Email invalide")
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
}).extend({
  title: z.string()
    .min(3, "Titre trop court (min 3 caractères)")
    .max(200, "Titre trop long")
    .regex(/^[a-zA-Z0-9\s\-_.&():!?,:àâäéèêëïîôöùûüÿñç]+$/, "Titre contient des caractères non autorisés")
    .transform(sanitizeText),
  description: z.string()
    .max(1000, "Description trop longue")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  date: z.string().datetime("Date invalide"),
  location: z.string()
    .max(200, "Lieu trop long")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  maxParticipants: z.number()
    .min(1, "Le nombre de participants doit être positif")
    .max(1000, "Nombre de participants trop élevé")
    .optional(),
  helloAssoLink: z.string()
    .url("URL HelloAsso invalide")
    .refine(url => url.includes('helloasso.com'), "Doit être un lien HelloAsso valide")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  enableExternalRedirect: z.boolean().optional().default(false),
  externalRedirectUrl: z.string()
    .url("URL de redirection invalide")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

export const insertInscriptionSchema = createInsertSchema(inscriptions).pick({
  eventId: true,
  name: true,
  email: true,
  comments: true,
}).extend({
  eventId: z.string()
    .uuid("ID d'événement invalide")
    .transform(sanitizeText),
  name: z.string()
    .min(2, "Nom trop court (min 2 caractères)")
    .max(100, "Nom trop long")
    .regex(/^[a-zA-Z\s\-'.àâäéèêëïîôöùûüÿñç]+$/, "Nom contient des caractères non autorisés")
    .transform(sanitizeText),
  email: z.string()
    .email("Email invalide")
    .refine(isValidDomain, "Domaine email non autorisé")
    .transform(sanitizeText),
  comments: z.string()
    .max(500, "Commentaires trop longs (max 500 caractères)")
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

// Legacy compatibility
export type AdminUser = Admin;
export type InsertAdminUser = InsertAdmin;
export type EventRegistration = Inscription;
export type InsertEventRegistration = InsertInscription;
export const adminUsers = admins;
export const insertAdminUserSchema = insertAdminSchema;
export const eventRegistrations = inscriptions;
export const insertEventRegistrationSchema = insertInscriptionSchema;
