import { createAuthClient } from "@neondatabase/neon-js/auth";
import type { AuthClient } from "@neondatabase/neon-js/auth";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

const log = logger.scope("AUTH");

export type User = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  googleImage?: string | null;
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
 * Uses direct fetch to bypass any client-side caching.
 */
export async function getUser(request: Request): Promise<User | null> {
  const origin = getOrigin(request);
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

  // Get cookies, fixing for Neon Auth if on localhost
  const rawCookies = request.headers.get("cookie") || "";
  let cookies = rawCookies;
  if (isLocalhost) {
    cookies = fixCookiesForNeonAuth(cookies);
  }

  log.debug("getUser called");
  log.debug("Raw cookies:", rawCookies ? rawCookies.substring(0, 100) : "(none)");
  log.debug("Fixed cookies:", cookies ? cookies.substring(0, 100) : "(none)");

  try {
    // Direct fetch to bypass client caching
    const response = await fetch(`${origin}/neon-auth/get-session?disableCookieCache=true`, {
      method: "GET",
      headers: {
        cookie: cookies,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      log.debug("Session response not ok:", response.status);
      return null;
    }

    const data = await response.json();
    log.debug("Session response:", data?.user ? `User: ${data.user.email}` : "No user");

    if (!data?.user) {
      return null;
    }

    const user = data.user;
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      image: user.image ?? null,
    };
  } catch (error) {
    log.error("Error getting session:", error);
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
 * Check if a user is an admin.
 */
export async function isUserAdmin(email: string): Promise<boolean> {
  const { db, approvedUsers } = await import("../db");

  const [approvedUser] = await db
    .select()
    .from(approvedUsers)
    .where(eq(approvedUsers.email, email))
    .limit(1);

  return approvedUser?.isAdmin ?? false;
}

/**
 * Get user and approval status. Returns null if not authenticated.
 * If the user has a custom display name or image in approved_users, it overrides the OAuth values.
 * The original Google image is preserved as googleImage for fallback.
 */
export async function getUserWithApproval(
  request: Request
): Promise<{ user: User; isApproved: boolean; isAdmin: boolean } | null> {
  const user = await getUser(request);
  if (!user) return null;

  const { db, approvedUsers } = await import("../db");

  const [approvedUser] = await db
    .select()
    .from(approvedUsers)
    .where(eq(approvedUsers.email, user.email))
    .limit(1);

  // If there's a custom display name in approved_users, use it
  const displayName = approvedUser?.name ?? user.name;

  // If there's a custom image, use the CDN URL; otherwise fall back to Google image
  const customImageKey = approvedUser?.customImage;
  const displayImage = customImageKey ? `/img/avatar/${customImageKey}` : user.image;

  return {
    user: {
      ...user,
      name: displayName,
      image: displayImage,
      googleImage: user.image,
    },
    isApproved: !!approvedUser,
    isAdmin: approvedUser?.isAdmin ?? false,
  };
}
