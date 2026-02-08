import {
  boolean,
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  uniqueIndex,
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
 * SoupOrBowl competition entries - each user can have one entry.
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

// Known setting keys (game-scoped settings like lock/maxSquares are now on the games table)
export const SETTING_KEYS = {
  REVEAL_ENTRIES: "reveal_entries",
  VOTING_ACTIVE: "voting_active",
  VOTING_LOCKED: "voting_locked",
  REVEAL_RESULTS: "reveal_results",
  FINAL_SEAHAWKS_SCORE: "final_seahawks_score",
  FINAL_PATRIOTS_SCORE: "final_patriots_score",
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
 * Games table - defines each independent Squares game.
 */
export const games = pgTable("games", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: varchar({ length: 100 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  isLocked: boolean("is_locked").notNull().default(false),
  maxSquaresPerUser: integer("max_squares_per_user").notNull().default(5),
  createdAt: timestamp("created_at").defaultNow(),
});

// Type inference for games
export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

/**
 * Game access - maps users to games with roles.
 */
export const gameAccess = pgTable(
  "game_access",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id),
    userEmail: varchar("user_email", { length: 255 }).notNull(),
    role: varchar({ length: 20 }).notNull().default("player"), // "admin" | "player"
    addedAt: timestamp("added_at").defaultNow(),
    addedBy: varchar("added_by", { length: 255 }),
  },
  (table) => [
    uniqueIndex("game_access_game_user_idx").on(table.gameId, table.userEmail),
  ]
);

// Type inference for game access
export type GameAccess = typeof gameAccess.$inferSelect;
export type NewGameAccess = typeof gameAccess.$inferInsert;

/**
 * Squares game - 10x10 grid for Super Bowl betting.
 * Each square is identified by row (0-9) and col (0-9) within a game.
 */
export const squares = pgTable(
  "squares",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id),
    row: integer().notNull(), // 0-9
    col: integer().notNull(), // 0-9
    userEmail: varchar("user_email", { length: 255 }).notNull(),
    userName: varchar("user_name", { length: 255 }),
    userImage: varchar("user_image", { length: 255 }),
    claimedAt: timestamp("claimed_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("squares_game_row_col_idx").on(
      table.gameId,
      table.row,
      table.col
    ),
  ]
);

// Type inference for squares
export type Square = typeof squares.$inferSelect;
export type NewSquare = typeof squares.$inferInsert;

/**
 * Squares axis numbers - stores the randomly generated 0-9 numbers for each axis.
 * Generated when admin locks the game.
 */
export const squaresAxisNumbers = pgTable("squares_axis_numbers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  gameId: integer("game_id")
    .notNull()
    .references(() => games.id),
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
 * Shared across all games (same real Super Bowl).
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

/**
 * Score predictions - players guess the final score of the game.
 * Winner is the person with the lowest combined score difference.
 * Supports proxy predictions for non-registered users.
 */
export const scorePredictions = pgTable(
  "score_predictions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    gameId: integer("game_id")
      .notNull()
      .references(() => games.id),
    userEmail: varchar("user_email", { length: 255 }).notNull(),
    userName: varchar("user_name", { length: 255 }),
    seahawksScore: integer("seahawks_score").notNull(),
    patriotsScore: integer("patriots_score").notNull(),
    isProxy: boolean("is_proxy").notNull().default(false),
    createdBy: varchar("created_by", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("score_predictions_game_user_idx").on(
      table.gameId,
      table.userEmail
    ),
  ]
);

// Type inference for score predictions
export type ScorePrediction = typeof scorePredictions.$inferSelect;
export type NewScorePrediction = typeof scorePredictions.$inferInsert;
