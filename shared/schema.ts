import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Admin users table  
export const admins = pgTable("admins", {
  email: text("email").primaryKey(),
  password: text("password").notNull(),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ideas table
export const ideas = pgTable("ideas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  proposedBy: text("proposed_by").notNull(),
  proposedByEmail: text("proposed_by_email").notNull(),
  status: text("status").default("open").notNull(), // open, closed, realized
  deadline: timestamp("deadline"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
});

// Votes table
export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ideaId: varchar("idea_id").references(() => ideas.id, { onDelete: "cascade" }).notNull(),
  voterName: text("voter_name").notNull(),
  voterEmail: text("voter_email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Events table
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  helloAssoLink: text("hello_asso_link"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: text("updated_by"),
});

// Inscriptions table  
export const inscriptions = pgTable("inscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventId: varchar("event_id").references(() => events.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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

// Security helper functions
const validEmailDomains = ["cjd-amiens.fr", "gmail.com", "outlook.com", "yahoo.com", "hotmail.com"];
const isValidDomain = (email: string) => {
  const domain = email.split('@')[1];
  return validEmailDomains.includes(domain) || domain?.endsWith('.fr') || domain?.endsWith('.com');
};

const sanitizeText = (text: string) => text
  .replace(/[<>]/g, '') // Remove potential HTML
  .replace(/['"]/g, '') // Remove quotes  
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
    .refine(isValidDomain, "Domaine email non autorisé")
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
    .regex(/^[a-zA-Z0-9\s\-_.àâäéèêëïîôöùûüÿñç]+$/, "Titre contient des caractères non autorisés")
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
    .refine(isValidDomain, "Domaine email non autorisé")
    .transform(sanitizeText),
  deadline: z.string().datetime().optional(),
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
    .refine(isValidDomain, "Domaine email non autorisé")
    .transform(sanitizeText),
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  helloAssoLink: true,
}).extend({
  title: z.string()
    .min(3, "Titre trop court (min 3 caractères)")
    .max(200, "Titre trop long")
    .regex(/^[a-zA-Z0-9\s\-_.àâäéèêëïîôöùûüÿñç]+$/, "Titre contient des caractères non autorisés")
    .transform(sanitizeText),
  description: z.string()
    .max(1000, "Description trop longue")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
  date: z.string().datetime("Date invalide"),
  helloAssoLink: z.string()
    .url("URL HelloAsso invalide")
    .refine(url => url.includes('helloasso.com'), "Doit être un lien HelloAsso valide")
    .optional()
    .transform(val => val ? sanitizeText(val) : undefined),
});

export const insertInscriptionSchema = createInsertSchema(inscriptions).pick({
  eventId: true,
  name: true,
  email: true,
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

// Additional validation schemas for API routes
export const updateIdeaStatusSchema = z.object({
  status: z.enum(["open", "closed", "realized"], {
    errorMap: () => ({ message: "Statut invalide (open, closed, realized)" })
  }),
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
