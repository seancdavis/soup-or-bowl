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
