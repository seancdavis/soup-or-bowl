import { eq, and, sql } from "drizzle-orm";
import {
  db,
  squares,
  squaresAxisNumbers,
  squaresScores,
  type Square,
  type SquaresAxisNumber,
  type SquaresScore,
} from "../db";

/**
 * Get all claimed squares.
 */
export async function getAllSquares(): Promise<Square[]> {
  return await db.select().from(squares);
}

/**
 * Get a specific square by row and col.
 */
export async function getSquare(row: number, col: number): Promise<Square | null> {
  const [square] = await db
    .select()
    .from(squares)
    .where(and(eq(squares.row, row), eq(squares.col, col)))
    .limit(1);

  return square || null;
}

/**
 * Get all squares claimed by a specific user.
 */
export async function getSquaresByUser(email: string): Promise<Square[]> {
  return await db
    .select()
    .from(squares)
    .where(eq(squares.userEmail, email));
}

/**
 * Count squares claimed by a specific user.
 */
export async function countSquaresByUser(email: string): Promise<number> {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(squares)
    .where(eq(squares.userEmail, email));

  return result?.count || 0;
}

/**
 * Claim a square for a user.
 * Returns the claimed square or null if already taken.
 */
export async function claimSquare(
  row: number,
  col: number,
  userEmail: string,
  userName: string | null,
  userImage: string | null
): Promise<Square | null> {
  // Check if already claimed
  const existing = await getSquare(row, col);
  if (existing) {
    return null;
  }

  const [newSquare] = await db
    .insert(squares)
    .values({
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
  row: number,
  col: number,
  userEmail: string
): Promise<boolean> {
  const result = await db
    .delete(squares)
    .where(
      and(
        eq(squares.row, row),
        eq(squares.col, col),
        eq(squares.userEmail, userEmail)
      )
    )
    .returning();

  return result.length > 0;
}

/**
 * Get all axis numbers.
 */
export async function getAxisNumbers(): Promise<{
  rows: number[];
  cols: number[];
}> {
  const numbers = await db.select().from(squaresAxisNumbers);

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
 * Generate new random axis numbers.
 * Called when admin locks the game.
 */
export async function generateAxisNumbers(): Promise<{
  rows: number[];
  cols: number[];
}> {
  // Fisher-Yates shuffle for random permutation
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

  // Clear existing axis numbers
  await db.delete(squaresAxisNumbers);

  // Insert new axis numbers
  const now = new Date();
  const insertValues = [
    ...rows.map((value, position) => ({
      axis: "row",
      position,
      value,
      generatedAt: now,
    })),
    ...cols.map((value, position) => ({
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
 * Get all quarter scores.
 */
export async function getScores(): Promise<SquaresScore[]> {
  return await db
    .select()
    .from(squaresScores)
    .orderBy(squaresScores.quarter);
}

/**
 * Set score for a quarter.
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
export async function calculateWinners(): Promise<
  Array<{
    quarter: number;
    seahawksLastDigit: number | null;
    patriotsLastDigit: number | null;
    winningSquare: Square | null;
  }>
> {
  const [allScores, axisNumbers, allSquares] = await Promise.all([
    getScores(),
    getAxisNumbers(),
    getAllSquares(),
  ]);

  const results = [];

  for (let quarter = 1; quarter <= 4; quarter++) {
    const score = allScores.find((s) => s.quarter === quarter);
    if (!score || score.seahawksScore === null || score.patriotsScore === null) {
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
        allSquares.find((s) => s.row === winningRow && s.col === winningCol) ||
        null;
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
    if (square.row >= 0 && square.row < 10 && square.col >= 0 && square.col < 10) {
      grid[square.row][square.col] = square;
    }
  }

  return grid;
}

/**
 * Clear all squares (admin only, for testing/reset).
 */
export async function clearAllSquares(): Promise<void> {
  await db.delete(squares);
}

/**
 * Clear all scores (admin only, for testing/reset).
 */
export async function clearAllScores(): Promise<void> {
  await db.delete(squaresScores);
}
