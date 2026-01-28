import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Create database connection using Neon's serverless driver
const sql = neon(import.meta.env.DATABASE_URL);

// Export Drizzle instance with schema for type-safe queries
export const db = drizzle(sql, { schema });

// Re-export schema for convenience
export * from "./schema";
