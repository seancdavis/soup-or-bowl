/**
 * Central mapping of query param values to user-friendly messages.
 * Used by the Toast component to display feedback after actions.
 */
export const MESSAGES = {
  // Entry actions
  entry_created: { type: "success", text: "Your entry has been submitted!" },
  entry_updated: { type: "success", text: "Your entry has been updated." },
  entry_deleted: { type: "success", text: "Your entry has been deleted." },
  entry_exists: { type: "error", text: "You already have an entry." },

  // Auth actions
  signed_in: { type: "success", text: "Welcome! You've signed in successfully." },
  signed_out: { type: "success", text: "You've been signed out." },
  auth_error: { type: "error", text: "Authentication failed. Please try again." },

  // General
  unauthorized: { type: "error", text: "You don't have permission to do that." },
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type MessageType = (typeof MESSAGES)[MessageKey]["type"];
