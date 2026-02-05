import { eq } from "drizzle-orm";
import { db, appSettings, SETTING_KEYS } from "../db";

/**
 * Get a setting value by key. Returns null if not found.
 */
export async function getSetting(key: string): Promise<string | null> {
  const [setting] = await db
    .select()
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);

  return setting?.value ?? null;
}

/**
 * Set a setting value. Creates or updates the setting.
 */
export async function setSetting(key: string, value: string): Promise<void> {
  await db
    .insert(appSettings)
    .values({
      key,
      value,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: {
        value,
        updatedAt: new Date(),
      },
    });
}

/**
 * Get the reveal_entries setting. Defaults to false if not set.
 */
export async function getRevealEntriesSetting(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.REVEAL_ENTRIES);
  return value === "true";
}

/**
 * Set the reveal_entries setting.
 */
export async function setRevealEntriesSetting(reveal: boolean): Promise<void> {
  await setSetting(SETTING_KEYS.REVEAL_ENTRIES, reveal ? "true" : "false");
}

/**
 * Get the voting_active setting. Defaults to false if not set.
 */
export async function getVotingActiveSetting(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.VOTING_ACTIVE);
  return value === "true";
}

/**
 * Set the voting_active setting.
 */
export async function setVotingActiveSetting(active: boolean): Promise<void> {
  await setSetting(SETTING_KEYS.VOTING_ACTIVE, active ? "true" : "false");
}

/**
 * Get the voting_locked setting. Defaults to false if not set.
 */
export async function getVotingLockedSetting(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.VOTING_LOCKED);
  return value === "true";
}

/**
 * Set the voting_locked setting.
 */
export async function setVotingLockedSetting(locked: boolean): Promise<void> {
  await setSetting(SETTING_KEYS.VOTING_LOCKED, locked ? "true" : "false");
}

/**
 * Get the reveal_results setting. Defaults to false if not set.
 */
export async function getRevealResultsSetting(): Promise<boolean> {
  const value = await getSetting(SETTING_KEYS.REVEAL_RESULTS);
  return value === "true";
}

/**
 * Set the reveal_results setting.
 */
export async function setRevealResultsSetting(reveal: boolean): Promise<void> {
  await setSetting(SETTING_KEYS.REVEAL_RESULTS, reveal ? "true" : "false");
}

/**
 * Get all voting-related settings at once.
 */
export async function getVotingSettings(): Promise<{
  votingActive: boolean;
  votingLocked: boolean;
  revealResults: boolean;
}> {
  const [votingActive, votingLocked, revealResults] = await Promise.all([
    getVotingActiveSetting(),
    getVotingLockedSetting(),
    getRevealResultsSetting(),
  ]);
  return { votingActive, votingLocked, revealResults };
}
