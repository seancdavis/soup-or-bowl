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
  customImage: varchar("custom_image", { length: 255 }),
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
  SQUARES_LOCKED: "squares_locked",
  MAX_SQUARES_PER_USER: "max_squares_per_user",
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

/**
 * Squares game - 10x10 grid for Super Bowl betting.
 * Each square is identified by row (0-9) and col (0-9).
 */
export const squares = pgTable("squares", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  row: integer().notNull(), // 0-9
  col: integer().notNull(), // 0-9
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  userName: varchar("user_name", { length: 255 }),
  userImage: varchar("user_image", { length: 255 }),
  claimedAt: timestamp("claimed_at").defaultNow(),
});

// Type inference for squares
export type Square = typeof squares.$inferSelect;
export type NewSquare = typeof squares.$inferInsert;

/**
 * Squares axis numbers - stores the randomly generated 0-9 numbers for each axis.
 * Generated when admin locks the game.
 */
export const squaresAxisNumbers = pgTable("squares_axis_numbers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  axis: varchar({ length: 10 }).notNull(), // "row" or "col"
  position: integer().notNull(), // 0-9
  value: integer().notNull(), // 0-9 (the randomly assigned number)
  generatedAt: timestamp("generated_at").defaultNow(),
});

// Type inference for axis numbers
export type SquaresAxisNumber = typeof squaresAxisNumbers.$inferSelect;
export type NewSquaresAxisNumber = typeof squaresAxisNumbers.$inferInsert;

/**
 * Squares scores - stores the team scores for each quarter.
 */
export const squaresScores = pgTable("squares_scores", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  quarter: integer().notNull(), // 1-4
  seahawksScore: integer("seahawks_score"),
  patriotsScore: integer("patriots_score"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Type inference for scores
export type SquaresScore = typeof squaresScores.$inferSelect;
export type NewSquaresScore = typeof squaresScores.$inferInsert;
