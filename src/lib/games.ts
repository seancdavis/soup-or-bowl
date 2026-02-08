import { eq, and } from "drizzle-orm";
import { db, games, gameAccess, type Game, type GameAccess } from "../db";

/**
 * Get a game by its URL slug.
 */
export async function getGameBySlug(slug: string): Promise<Game | null> {
  const [game] = await db
    .select()
    .from(games)
    .where(eq(games.slug, slug))
    .limit(1);

  return game || null;
}

/**
 * Get all games a user has access to, with their role.
 */
export async function getUserGames(
  email: string
): Promise<Array<Game & { role: string }>> {
  const rows = await db
    .select({
      id: games.id,
      slug: games.slug,
      name: games.name,
      isLocked: games.isLocked,
      maxSquaresPerUser: games.maxSquaresPerUser,
      createdAt: games.createdAt,
      role: gameAccess.role,
    })
    .from(gameAccess)
    .innerJoin(games, eq(gameAccess.gameId, games.id))
    .where(eq(gameAccess.userEmail, email));

  return rows;
}

/**
 * Get a user's access record for a specific game.
 */
export async function getUserGameAccess(
  email: string,
  gameId: number
): Promise<GameAccess | null> {
  const [access] = await db
    .select()
    .from(gameAccess)
    .where(and(eq(gameAccess.gameId, gameId), eq(gameAccess.userEmail, email)))
    .limit(1);

  return access || null;
}

/**
 * Check if a user is an admin for a specific game.
 */
export async function isGameAdmin(
  email: string,
  gameId: number
): Promise<boolean> {
  const access = await getUserGameAccess(email, gameId);
  return access?.role === "admin";
}

/**
 * Get games where the user is an admin (slug + name only, for nav).
 */
export async function getUserAdminGames(
  email: string
): Promise<Array<{ slug: string; name: string }>> {
  const rows = await db
    .select({ slug: games.slug, name: games.name })
    .from(gameAccess)
    .innerJoin(games, eq(gameAccess.gameId, games.id))
    .where(and(eq(gameAccess.userEmail, email), eq(gameAccess.role, "admin")));

  return rows;
}

/**
 * Set the locked state of a game.
 */
export async function setGameLocked(
  gameId: number,
  locked: boolean
): Promise<void> {
  await db.update(games).set({ isLocked: locked }).where(eq(games.id, gameId));
}

/**
 * Set the max squares per user for a game.
 */
export async function setGameMaxSquares(
  gameId: number,
  max: number
): Promise<void> {
  await db
    .update(games)
    .set({ maxSquaresPerUser: max })
    .where(eq(games.id, gameId));
}
