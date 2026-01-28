import { createAuthClient } from "@neondatabase/neon-js/auth";
import type { AuthClient } from "@neondatabase/neon-js/auth";

// Lazy auth client - only created when first used
let _authClient: AuthClient | null = null;

/**
 * Get the NeonAuth client. Creates client on first call.
 * Throws if NEON_AUTH_URL is not set.
 */
function getAuthClient(): AuthClient {
  if (!_authClient) {
    const authUrl = import.meta.env.NEON_AUTH_URL;
    if (!authUrl) {
      throw new Error("NEON_AUTH_URL environment variable is not set");
    }
    _authClient = createAuthClient(authUrl);
  }
  return _authClient;
}

/**
 * NeonAuth client - connects to Neon's managed authentication service.
 * Configure OAuth providers (Google) in the Neon Console.
 */
export const authClient = new Proxy({} as AuthClient, {
  get(_, prop) {
    return (getAuthClient() as Record<string | symbol, unknown>)[prop];
  },
});

// Re-export types for convenience
export type { Session, User } from "@neondatabase/neon-js/auth/types";
