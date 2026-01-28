import {
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * Approved users safelist - users must be in this table to access protected content.
 * Add users via Neon console or Drizzle queries.
 */
export const approvedUsers = pgTable("approved_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  addedAt: timestamp("added_at").defaultNow(),
  addedBy: varchar("added_by", { length: 255 }),
  notes: text("notes"),
});

// Type inference for TypeScript
export type ApprovedUser = typeof approvedUsers.$inferSelect;
export type NewApprovedUser = typeof approvedUsers.$inferInsert;
