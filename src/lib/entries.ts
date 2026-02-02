import { eq } from "drizzle-orm";
import { db, entries, type Entry, type NewEntry } from "../db";

/**
 * Get an entry by user email. Returns null if not found.
 */
export async function getEntryByEmail(email: string): Promise<Entry | null> {
  const [entry] = await db
    .select()
    .from(entries)
    .where(eq(entries.userEmail, email))
    .limit(1);

  return entry ?? null;
}

/**
 * Get all entries, ordered by creation date (newest first).
 */
export async function getAllEntries(): Promise<Entry[]> {
  return db
    .select()
    .from(entries)
    .orderBy(entries.createdAt);
}

/**
 * Create a new entry. Returns the created entry.
 * Throws if user already has an entry (unique constraint on user_email).
 */
export async function createEntry(data: {
  title: string;
  description: string;
  needsPower: boolean;
  notes?: string | null;
  userEmail: string;
  userName?: string | null;
}): Promise<Entry> {
  const [entry] = await db
    .insert(entries)
    .values({
      title: data.title,
      description: data.description,
      needsPower: data.needsPower,
      notes: data.notes ?? null,
      userEmail: data.userEmail,
      userName: data.userName ?? null,
    })
    .returning();

  return entry;
}

/**
 * Update an existing entry. Returns the updated entry.
 * Only updates if the entry belongs to the given user email.
 */
export async function updateEntry(
  id: number,
  userEmail: string,
  data: {
    title: string;
    description: string;
    needsPower: boolean;
    notes?: string | null;
  }
): Promise<Entry | null> {
  const [entry] = await db
    .update(entries)
    .set({
      title: data.title,
      description: data.description,
      needsPower: data.needsPower,
      notes: data.notes ?? null,
      updatedAt: new Date(),
    })
    .where(eq(entries.id, id))
    .returning();

  // Verify ownership
  if (entry && entry.userEmail !== userEmail) {
    return null;
  }

  return entry ?? null;
}

/**
 * Delete an entry. Returns true if deleted, false if not found.
 * Only deletes if the entry belongs to the given user email.
 */
export async function deleteEntry(id: number, userEmail: string): Promise<boolean> {
  // First verify ownership
  const [existing] = await db
    .select()
    .from(entries)
    .where(eq(entries.id, id))
    .limit(1);

  if (!existing || existing.userEmail !== userEmail) {
    return false;
  }

  await db.delete(entries).where(eq(entries.id, id));
  return true;
}
