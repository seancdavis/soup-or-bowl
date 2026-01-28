import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Lazy database connection - only connects when first used
let _db: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Get the database instance. Creates connection on first call.
 * Throws if DATABASE_URL is not set.
 */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    const databaseUrl = import.meta.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error("DATABASE_URL environment variable is not set");
    }
    const sql: NeonQueryFunction<false, false> = neon(databaseUrl);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

// For convenience, export a proxy that calls getDb()
// This allows `db.select()` syntax while still being lazy
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) {
    return (getDb() as Record<string | symbol, unknown>)[prop];
  },
});

// Re-export schema for convenience
export * from "./schema";
