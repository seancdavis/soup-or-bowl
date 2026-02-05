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

  // Profile actions
  profile_updated: { type: "success", text: "Your profile has been updated." },
  name_required: { type: "error", text: "Please enter a display name." },
  name_too_long: { type: "error", text: "Display name is too long." },
  update_failed: { type: "error", text: "Failed to update profile. Please try again." },

  // Voting actions
  vote_saved: { type: "success", text: "Your vote has been recorded!" },
  voting_inactive: { type: "error", text: "Voting is not currently open." },
  voting_locked: { type: "error", text: "Voting is locked. No changes allowed." },
  incomplete_vote: { type: "error", text: "Please select all three choices." },
  duplicate_selections: { type: "error", text: "You must select three different entries." },
  invalid_entry: { type: "error", text: "One or more selected entries are invalid." },
  cannot_vote_self: { type: "error", text: "You cannot vote for your own entry." },
  vote_error: { type: "error", text: "Failed to save vote. Please try again." },

  // General
  unauthorized: { type: "error", text: "You don't have permission to do that." },
} as const;

export type MessageKey = keyof typeof MESSAGES;
export type MessageType = (typeof MESSAGES)[MessageKey]["type"];
