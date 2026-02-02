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
