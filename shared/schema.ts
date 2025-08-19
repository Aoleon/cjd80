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

// Insert schemas
export const insertAdminSchema = createInsertSchema(admins).pick({
  email: true,
  password: true,
  addedBy: true,
});

export const insertIdeaSchema = createInsertSchema(ideas).pick({
  title: true,
  description: true,
  proposedBy: true,
  proposedByEmail: true,
  deadline: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  ideaId: true,
  voterName: true,
  voterEmail: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  date: true,
  helloAssoLink: true,
});

export const insertInscriptionSchema = createInsertSchema(inscriptions).pick({
  eventId: true,
  name: true,
  email: true,
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

// Legacy compatibility
export type AdminUser = Admin;
export type InsertAdminUser = InsertAdmin;
export type EventRegistration = Inscription;
export type InsertEventRegistration = InsertInscription;
export const adminUsers = admins;
export const insertAdminUserSchema = insertAdminSchema;
export const eventRegistrations = inscriptions;
export const insertEventRegistrationSchema = insertInscriptionSchema;
