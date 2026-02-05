import { eq } from "drizzle-orm";
import { db, votes, entries, type Vote, type Entry } from "../db";

/**
 * Get a vote by voter email. Returns null if not found.
 */
export async function getVoteByEmail(email: string): Promise<Vote | null> {
  const [vote] = await db
    .select()
    .from(votes)
    .where(eq(votes.voterEmail, email))
    .limit(1);

  return vote ?? null;
}

/**
 * Get all votes with voter information.
 */
export async function getAllVotes(): Promise<Vote[]> {
  return db
    .select()
    .from(votes)
    .orderBy(votes.createdAt);
}

/**
 * Create a new vote. Returns the created vote.
 * Throws if voter already has a vote (unique constraint on voter_email).
 */
export async function createVote(data: {
  voterEmail: string;
  voterName?: string | null;
  firstPlaceEntryId: number;
  secondPlaceEntryId: number;
  thirdPlaceEntryId: number;
}): Promise<Vote> {
  const [vote] = await db
    .insert(votes)
    .values({
      voterEmail: data.voterEmail,
      voterName: data.voterName ?? null,
      firstPlaceEntryId: data.firstPlaceEntryId,
      secondPlaceEntryId: data.secondPlaceEntryId,
      thirdPlaceEntryId: data.thirdPlaceEntryId,
    })
    .returning();

  return vote;
}

/**
 * Update an existing vote. Returns the updated vote.
 * Only updates if the vote belongs to the given voter email.
 */
export async function updateVote(
  voterEmail: string,
  data: {
    firstPlaceEntryId: number;
    secondPlaceEntryId: number;
    thirdPlaceEntryId: number;
  }
): Promise<Vote | null> {
  const [vote] = await db
    .update(votes)
    .set({
      firstPlaceEntryId: data.firstPlaceEntryId,
      secondPlaceEntryId: data.secondPlaceEntryId,
      thirdPlaceEntryId: data.thirdPlaceEntryId,
      updatedAt: new Date(),
    })
    .where(eq(votes.voterEmail, voterEmail))
    .returning();

  return vote ?? null;
}

/**
 * Delete a vote by voter email. Returns true if deleted.
 */
export async function deleteVote(voterEmail: string): Promise<boolean> {
  const result = await db
    .delete(votes)
    .where(eq(votes.voterEmail, voterEmail))
    .returning();

  return result.length > 0;
}

/**
 * Create or update a vote (upsert).
 */
export async function upsertVote(data: {
  voterEmail: string;
  voterName?: string | null;
  firstPlaceEntryId: number;
  secondPlaceEntryId: number;
  thirdPlaceEntryId: number;
}): Promise<Vote> {
  const [vote] = await db
    .insert(votes)
    .values({
      voterEmail: data.voterEmail,
      voterName: data.voterName ?? null,
      firstPlaceEntryId: data.firstPlaceEntryId,
      secondPlaceEntryId: data.secondPlaceEntryId,
      thirdPlaceEntryId: data.thirdPlaceEntryId,
    })
    .onConflictDoUpdate({
      target: votes.voterEmail,
      set: {
        firstPlaceEntryId: data.firstPlaceEntryId,
        secondPlaceEntryId: data.secondPlaceEntryId,
        thirdPlaceEntryId: data.thirdPlaceEntryId,
        updatedAt: new Date(),
      },
    })
    .returning();

  return vote;
}

/**
 * Calculate scores for all entries based on votes.
 * Returns entries with their total scores, sorted by score descending.
 * Scoring: 1st = 3 points, 2nd = 2 points, 3rd = 1 point
 */
export async function calculateVoteResults(): Promise<
  Array<{ entry: Entry; score: number }>
> {
  const allEntries = await db.select().from(entries);
  const allVotes = await db.select().from(votes);

  // Calculate scores for each entry
  const scoreMap = new Map<number, number>();

  for (const vote of allVotes) {
    // 1st place = 3 points
    scoreMap.set(
      vote.firstPlaceEntryId,
      (scoreMap.get(vote.firstPlaceEntryId) || 0) + 3
    );
    // 2nd place = 2 points
    scoreMap.set(
      vote.secondPlaceEntryId,
      (scoreMap.get(vote.secondPlaceEntryId) || 0) + 2
    );
    // 3rd place = 1 point
    scoreMap.set(
      vote.thirdPlaceEntryId,
      (scoreMap.get(vote.thirdPlaceEntryId) || 0) + 1
    );
  }

  // Combine entries with scores
  const results = allEntries.map((entry) => ({
    entry,
    score: scoreMap.get(entry.id) || 0,
  }));

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get the winner (entry with highest score).
 * Returns null if no votes exist.
 */
export async function getWinner(): Promise<{ entry: Entry; score: number } | null> {
  const results = await calculateVoteResults();

  if (results.length === 0 || results[0].score === 0) {
    return null;
  }

  return results[0];
}

/**
 * Get votes with entry details for display.
 */
export async function getVotesWithEntries(): Promise<
  Array<{
    vote: Vote;
    firstPlace: Entry | null;
    secondPlace: Entry | null;
    thirdPlace: Entry | null;
  }>
> {
  const allVotes = await getAllVotes();
  const allEntries = await db.select().from(entries);

  const entryMap = new Map<number, Entry>();
  for (const entry of allEntries) {
    entryMap.set(entry.id, entry);
  }

  return allVotes.map((vote) => ({
    vote,
    firstPlace: entryMap.get(vote.firstPlaceEntryId) ?? null,
    secondPlace: entryMap.get(vote.secondPlaceEntryId) ?? null,
    thirdPlace: entryMap.get(vote.thirdPlaceEntryId) ?? null,
  }));
}
