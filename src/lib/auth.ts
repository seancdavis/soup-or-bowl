import { createAuthClient } from "@neondatabase/neon-js/auth";
import type { AuthClient } from "@neondatabase/neon-js/auth";
import { eq } from "drizzle-orm";

export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

/**
 * Get the origin from request headers, respecting X-Forwarded-Proto for proxies.
 */
export function getOrigin(request: Request): string {
  const url = new URL(request.url);
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  return `${proto}://${url.host}`;
}

/**
 * Create an auth client for the given origin.
 */
export function createAuthClientForOrigin(origin: string): AuthClient {
  return createAuthClient(`${origin}/neon-auth`);
}

/**
 * Get the current user from the session, or null if not authenticated.
 */
export async function getUser(request: Request): Promise<User | null> {
  const origin = getOrigin(request);
  const authClient = createAuthClientForOrigin(origin);
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

  // Get cookies, fixing for Neon Auth if on localhost
  let cookies = request.headers.get("cookie") || "";
  if (isLocalhost) {
    cookies = fixCookiesForNeonAuth(cookies);
  }

  try {
    const session = await authClient.getSession({
      fetchOptions: {
        headers: { cookie: cookies },
      },
    });

    if (!session?.data?.user) {
      return null;
    }

    const user = session.data.user;
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
    };
  } catch (error) {
    console.error("[AUTH] Error getting session:", error);
    return null;
  }
}

/**
 * Add __Secure- prefix back to cookies for Neon Auth (localhost only).
 */
function fixCookiesForNeonAuth(cookieHeader: string): string {
  const neonCookies = ["neon-auth.session_token", "neon-auth.session_challange"];

  let fixed = cookieHeader;
  for (const name of neonCookies) {
    const regex = new RegExp(`(^|;\\s*)${name}=`, "g");
    fixed = fixed.replace(regex, `$1__Secure-${name}=`);
  }

  return fixed;
}

/**
 * Check if a user is in the approved_users table.
 */
export async function isUserApproved(email: string): Promise<boolean> {
  const { db, approvedUsers } = await import("../db");

  const [approvedUser] = await db
    .select()
    .from(approvedUsers)
    .where(eq(approvedUsers.email, email))
    .limit(1);

  return !!approvedUser;
}

/**
 * Get user and approval status. Returns null if not authenticated.
 */
export async function getUserWithApproval(
  request: Request
): Promise<{ user: User; isApproved: boolean } | null> {
  const user = await getUser(request);
  if (!user) return null;

  const isApproved = await isUserApproved(user.email);
  return { user, isApproved };
}
