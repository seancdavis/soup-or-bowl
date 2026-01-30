import { createAuthClient } from "@neondatabase/neon-js/auth";
import type { AuthClient } from "@neondatabase/neon-js/auth";

/**
 * Get the auth URL - always use same-domain proxy.
 * The proxy is configured in netlify.toml for both dev and prod.
 */
function getAuthUrl(): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}/neon-auth`;
  }
  throw new Error("Use createAuthClientForServer for server-side usage");
}

// Lazy auth client for client-side use
let _authClient: AuthClient | null = null;

function getAuthClient(): AuthClient {
  if (!_authClient) {
    const authUrl = getAuthUrl();
    console.log("[AUTH CLIENT] Creating client with URL:", authUrl);
    _authClient = createAuthClient(authUrl);
  }
  return _authClient;
}

/**
 * Create an auth client for server-side use with the request origin.
 */
export function createAuthClientForServer(origin: string): AuthClient {
  const authUrl = `${origin}/neon-auth`;
  console.log("[AUTH CLIENT] Creating server client with URL:", authUrl);
  return createAuthClient(authUrl);
}

/**
 * NeonAuth client for client-side use.
 */
export const authClient = new Proxy({} as AuthClient, {
  get(_, prop) {
    return (getAuthClient() as Record<string | symbol, unknown>)[prop];
  },
});

export type { Session, User } from "@neondatabase/neon-js/auth/types";
