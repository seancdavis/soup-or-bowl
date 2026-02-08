import { eq, and, sql } from "drizzle-orm";
import {
  db,
  squares,
  squaresAxisNumbers,
  squaresScores,
  scorePredictions,
  type Square,
  type SquaresAxisNumber,
  type SquaresScore,
  type ScorePrediction,
} from "../db";

/**
 * Get all claimed squares for a game.
 */
export async function getAllSquares(gameId: number): Promise<Square[]> {
  return await db
    .select()
    .from(squares)
    .where(eq(squares.gameId, gameId));
}

/**
 * Get a specific square by row and col within a game.
 */
export async function getSquare(
  gameId: number,
  row: number,
  col: number
): Promise<Square | null> {
  const [square] = await db
    .select()
    .from(squares)
    .where(
      and(
        eq(squares.gameId, gameId),
        eq(squares.row, row),
        eq(squares.col, col)
      )
    )
    .limit(1);

  return square || null;
}

/**
 * Get all squares claimed by a specific user in a game.
 */
export async function getSquaresByUser(
  gameId: number,
  email: string
): Promise<Square[]> {
  return await db
    .select()
    .from(squares)
    .where(and(eq(squares.gameId, gameId), eq(squares.userEmail, email)));
}

/**
 * Count squares claimed by a specific user in a game.
 */
export async function countSquaresByUser(
  gameId: number,
  email: string
): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(squares)
    .where(and(eq(squares.gameId, gameId), eq(squares.userEmail, email)));

  return result?.count || 0;
}

/**
 * Claim a square for a user in a game.
 * Returns the claimed square or null if already taken.
 */
export async function claimSquare(
  gameId: number,
  row: number,
  col: number,
  userEmail: string,
  userName: string | null,
  userImage: string | null
): Promise<Square | null> {
  const existing = await getSquare(gameId, row, col);
  if (existing) {
    return null;
  }

  const [newSquare] = await db
    .insert(squares)
    .values({
      gameId,
      row,
      col,
      userEmail,
      userName,
      userImage,
      claimedAt: new Date(),
    })
    .returning();

  return newSquare;
}

/**
 * Release a square (only the owner can release their own square).
 */
export async function releaseSquare(
  gameId: number,
  row: number,
  col: number,
  userEmail: string
): Promise<boolean> {
  const result = await db
    .delete(squares)
    .where(
      and(
        eq(squares.gameId, gameId),
        eq(squares.row, row),
        eq(squares.col, col),
        eq(squares.userEmail, userEmail)
      )
    )
    .returning();

  return result.length > 0;
}

/**
 * Admin release: release a square regardless of ownership.
 */
export async function adminReleaseSquare(
  gameId: number,
  row: number,
  col: number
): Promise<boolean> {
  const result = await db
    .delete(squares)
    .where(
      and(
        eq(squares.gameId, gameId),
        eq(squares.row, row),
        eq(squares.col, col)
      )
    )
    .returning();

  return result.length > 0;
}

/**
 * Release all squares claimed by a specific user/proxy email in a game.
 */
export async function releaseSquaresByUser(
  gameId: number,
  userEmail: string
): Promise<number> {
  const result = await db
    .delete(squares)
    .where(and(eq(squares.gameId, gameId), eq(squares.userEmail, userEmail)))
    .returning();

  return result.length;
}

/**
 * Get all axis numbers for a game.
 */
export async function getAxisNumbers(
  gameId: number
): Promise<{
  rows: number[];
  cols: number[];
}> {
  const numbers = await db
    .select()
    .from(squaresAxisNumbers)
    .where(eq(squaresAxisNumbers.gameId, gameId));

  const rows = new Array(10).fill(-1);
  const cols = new Array(10).fill(-1);

  for (const n of numbers) {
    if (n.axis === "row" && n.position >= 0 && n.position < 10) {
      rows[n.position] = n.value;
    } else if (n.axis === "col" && n.position >= 0 && n.position < 10) {
      cols[n.position] = n.value;
    }
  }

  return { rows, cols };
}

/**
 * Generate new random axis numbers for a game.
 * Called when admin locks the game.
 */
export async function generateAxisNumbers(
  gameId: number
): Promise<{
  rows: number[];
  cols: number[];
}> {
  const shuffle = (arr: number[]): number[] => {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const baseNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const rows = shuffle(baseNumbers);
  const cols = shuffle(baseNumbers);

  // Clear existing axis numbers for this game
  await db
    .delete(squaresAxisNumbers)
    .where(eq(squaresAxisNumbers.gameId, gameId));

  // Insert new axis numbers
  const now = new Date();
  const insertValues = [
    ...rows.map((value, position) => ({
      gameId,
      axis: "row",
      position,
      value,
      generatedAt: now,
    })),
    ...cols.map((value, position) => ({
      gameId,
      axis: "col",
      position,
      value,
      generatedAt: now,
    })),
  ];

  await db.insert(squaresAxisNumbers).values(insertValues);

  return { rows, cols };
}

/**
 * Get all quarter scores (shared across all games).
 */
export async function getScores(): Promise<SquaresScore[]> {
  return await db
    .select()
    .from(squaresScores)
    .orderBy(squaresScores.quarter);
}

/**
 * Set score for a quarter (shared across all games).
 */
export async function setScore(
  quarter: number,
  seahawksScore: number | null,
  patriotsScore: number | null
): Promise<SquaresScore> {
  const [existing] = await db
    .select()
    .from(squaresScores)
    .where(eq(squaresScores.quarter, quarter))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(squaresScores)
      .set({
        seahawksScore,
        patriotsScore,
        updatedAt: new Date(),
      })
      .where(eq(squaresScores.quarter, quarter))
      .returning();
    return updated;
  }

  const [newScore] = await db
    .insert(squaresScores)
    .values({
      quarter,
      seahawksScore,
      patriotsScore,
      updatedAt: new Date(),
    })
    .returning();

  return newScore;
}

/**
 * Calculate winners for each quarter based on last digit of scores.
 */
export async function calculateWinners(
  gameId: number
): Promise<
  Array<{
    quarter: number;
    seahawksLastDigit: number | null;
    patriotsLastDigit: number | null;
    winningSquare: Square | null;
  }>
> {
  const [allScores, axisNumbers, allSquares] = await Promise.all([
    getScores(),
    getAxisNumbers(gameId),
    getAllSquares(gameId),
  ]);

  const results = [];

  for (let quarter = 1; quarter <= 4; quarter++) {
    const score = allScores.find((s) => s.quarter === quarter);
    if (
      !score ||
      score.seahawksScore === null ||
      score.patriotsScore === null
    ) {
      results.push({
        quarter,
        seahawksLastDigit: null,
        patriotsLastDigit: null,
        winningSquare: null,
      });
      continue;
    }

    const seahawksLastDigit = score.seahawksScore % 10;
    const patriotsLastDigit = score.patriotsScore % 10;

    // Find which row/col corresponds to these last digits
    // Seahawks is on top (cols), Patriots is on side (rows)
    const winningCol = axisNumbers.cols.indexOf(seahawksLastDigit);
    const winningRow = axisNumbers.rows.indexOf(patriotsLastDigit);

    let winningSquare: Square | null = null;
    if (winningRow !== -1 && winningCol !== -1) {
      winningSquare =
        allSquares.find(
          (s) => s.row === winningRow && s.col === winningCol
        ) || null;
    }

    results.push({
      quarter,
      seahawksLastDigit,
      patriotsLastDigit,
      winningSquare,
    });
  }

  return results;
}

/**
 * Build a 10x10 grid structure for display.
 */
export function buildGrid(squares: Square[]): (Square | null)[][] {
  const grid: (Square | null)[][] = Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => null)
  );

  for (const square of squares) {
    if (
      square.row >= 0 &&
      square.row < 10 &&
      square.col >= 0 &&
      square.col < 10
    ) {
      grid[square.row][square.col] = square;
    }
  }

  return grid;
}

/**
 * Clear all squares for a game (admin only, for testing/reset).
 */
export async function clearAllSquares(gameId: number): Promise<void> {
  await db.delete(squares).where(eq(squares.gameId, gameId));
}

/**
 * Clear all scores (admin only, for testing/reset). Shared across games.
 */
export async function clearAllScores(): Promise<void> {
  await db.delete(squaresScores);
}

// Re-export type for convenience
export type { ScorePrediction };

/**
 * Get all score predictions for a game.
 */
export async function getAllPredictions(
  gameId: number
): Promise<ScorePrediction[]> {
  return await db
    .select()
    .from(scorePredictions)
    .where(eq(scorePredictions.gameId, gameId))
    .orderBy(scorePredictions.createdAt);
}

/**
 * Get a prediction by user email within a game.
 */
export async function getPredictionByEmail(
  gameId: number,
  email: string
): Promise<ScorePrediction | null> {
  const [prediction] = await db
    .select()
    .from(scorePredictions)
    .where(
      and(
        eq(scorePredictions.gameId, gameId),
        eq(scorePredictions.userEmail, email)
      )
    )
    .limit(1);

  return prediction || null;
}

/**
 * Create or update a score prediction within a game.
 */
export async function upsertPrediction(
  gameId: number,
  data: {
    userEmail: string;
    userName: string | null;
    seahawksScore: number;
    patriotsScore: number;
    isProxy?: boolean;
    createdBy?: string;
  }
): Promise<ScorePrediction> {
  const existing = await getPredictionByEmail(gameId, data.userEmail);

  if (existing) {
    const [updated] = await db
      .update(scorePredictions)
      .set({
        seahawksScore: data.seahawksScore,
        patriotsScore: data.patriotsScore,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(scorePredictions.gameId, gameId),
          eq(scorePredictions.userEmail, data.userEmail)
        )
      )
      .returning();
    return updated;
  }

  const [newPrediction] = await db
    .insert(scorePredictions)
    .values({
      gameId,
      userEmail: data.userEmail,
      userName: data.userName,
      seahawksScore: data.seahawksScore,
      patriotsScore: data.patriotsScore,
      isProxy: data.isProxy || false,
      createdBy: data.createdBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newPrediction;
}

/**
 * Delete a score prediction by ID.
 */
export async function deletePrediction(id: number): Promise<boolean> {
  const result = await db
    .delete(scorePredictions)
    .where(eq(scorePredictions.id, id))
    .returning();

  return result.length > 0;
}

/**
 * Clear all predictions for a game (admin only, for reset).
 */
export async function clearAllPredictions(gameId: number): Promise<void> {
  await db
    .delete(scorePredictions)
    .where(eq(scorePredictions.gameId, gameId));
}

/**
 * Calculate prediction results.
 * Returns predictions sorted by combined score difference (ascending).
 */
export function calculatePredictionResults(
  predictions: ScorePrediction[],
  actualSeahawks: number | null,
  actualPatriots: number | null
): Array<{ prediction: ScorePrediction; diff: number | null }> {
  if (actualSeahawks === null || actualPatriots === null) {
    return predictions.map((prediction) => ({ prediction, diff: null }));
  }

  const results = predictions.map((prediction) => {
    const seahawksDiff = Math.abs(prediction.seahawksScore - actualSeahawks);
    const patriotsDiff = Math.abs(prediction.patriotsScore - actualPatriots);
    return {
      prediction,
      diff: seahawksDiff + patriotsDiff,
    };
  });

  // Sort by diff ascending (lowest = best)
  results.sort((a, b) => {
    if (a.diff === null && b.diff === null) return 0;
    if (a.diff === null) return 1;
    if (b.diff === null) return -1;
    return a.diff - b.diff;
  });

  return results;
}
