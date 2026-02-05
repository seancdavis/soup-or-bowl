import {
  boolean,
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Approved users safelist - users must be in this table to access protected content.
 * Add users via Neon console or Drizzle queries.
 */
export const approvedUsers = pgTable("approved_users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }),
  isAdmin: boolean("is_admin").notNull().default(false),
  addedAt: timestamp("added_at").defaultNow(),
  addedBy: varchar("added_by", { length: 255 }),
  notes: text(),
});

// Type inference for TypeScript
export type ApprovedUser = typeof approvedUsers.$inferSelect;
export type NewApprovedUser = typeof approvedUsers.$inferInsert;

/**
 * Soup or bowl competition entries - each user can have one entry.
 */
export const entries = pgTable("entries", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  needsPower: boolean("needs_power").notNull().default(false),
  notes: text(),
  userEmail: varchar("user_email", { length: 255 }).notNull().unique(),
  userName: varchar("user_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type inference for entries
export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

/**
 * Application settings - global settings for the app.
 * Uses a key-value pattern for flexibility.
 */
export const appSettings = pgTable("app_settings", {
  key: varchar({ length: 255 }).primaryKey(),
  value: text().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type inference for app settings
export type AppSetting = typeof appSettings.$inferSelect;
export type NewAppSetting = typeof appSettings.$inferInsert;

// Known setting keys
export const SETTING_KEYS = {
  REVEAL_ENTRIES: "reveal_entries",
  VOTING_ACTIVE: "voting_active",
  VOTING_LOCKED: "voting_locked",
  REVEAL_RESULTS: "reveal_results",
} as const;

/**
 * Votes table - stores each user's ranked votes for entries.
 * Each user can vote once, selecting their top 3 choices.
 */
export const votes = pgTable("votes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  voterEmail: varchar("voter_email", { length: 255 }).notNull().unique(),
  voterName: varchar("voter_name", { length: 255 }),
  firstPlaceEntryId: integer("first_place_entry_id").notNull(),
  secondPlaceEntryId: integer("second_place_entry_id").notNull(),
  thirdPlaceEntryId: integer("third_place_entry_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type inference for votes
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
