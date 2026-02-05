import { eq } from "drizzle-orm";
import { db, approvedUsers, entries, type ApprovedUser } from "../db";

/**
 * Get user profile from approved_users table.
 */
export async function getUserProfile(email: string): Promise<ApprovedUser | null> {
  const [user] = await db
    .select()
    .from(approvedUsers)
    .where(eq(approvedUsers.email, email))
    .limit(1);

  return user ?? null;
}

/**
 * Update user's display name in approved_users table.
 * Also updates the userName on any existing entries for this user.
 */
export async function updateUserDisplayName(
  email: string,
  name: string
): Promise<ApprovedUser | null> {
  // Update the approved_users record
  const [updatedUser] = await db
    .update(approvedUsers)
    .set({ name })
    .where(eq(approvedUsers.email, email))
    .returning();

  if (!updatedUser) {
    return null;
  }

  // Also update any existing entries for this user to reflect the new name
  await db
    .update(entries)
    .set({ userName: name, updatedAt: new Date() })
    .where(eq(entries.userEmail, email));

  return updatedUser;
}

/**
 * Update user's custom profile image key in approved_users table.
 */
export async function updateUserCustomImage(
  email: string,
  imageKey: string
): Promise<ApprovedUser | null> {
  const [updatedUser] = await db
    .update(approvedUsers)
    .set({ customImage: imageKey })
    .where(eq(approvedUsers.email, email))
    .returning();

  return updatedUser ?? null;
}
