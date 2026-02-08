import type { APIRoute } from "astro";
import { getOrigin } from "../../../lib/auth";
import { logger } from "../../../lib/logger";

const log = logger.scope("SIGNOUT");

/**
 * Signs out the user by calling NeonAuth signout and clearing session cookies.
 * Redirects to /login after sign-out.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const origin = getOrigin(request);
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

  log.debug("Signing out user");

  // Call NeonAuth signout to invalidate session server-side
  try {
    await fetch(`${origin}/neon-auth/sign-out`, {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") || "",
        Origin: origin,
      },
    });
  } catch (error) {
    log.error("NeonAuth signout error:", error);
  }

  // Redirect to login with message and clear session cookies
  const redirectResponse = redirect("/login?message=signed_out", 302);

  if (isLocalhost) {
    // Localhost cookies (no Secure flag, SameSite=Lax)
    redirectResponse.headers.append(
      "Set-Cookie",
      "neon-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    redirectResponse.headers.append(
      "Set-Cookie",
      "neon-auth.session_challange=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
  } else {
    // Session token: stored without __Secure- prefix, SameSite=Lax
    redirectResponse.headers.append(
      "Set-Cookie",
      "neon-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax"
    );
    // Challenge cookie: stored with __Secure- prefix, SameSite=None
    // (needs cross-site access for OAuth redirect chain)
    redirectResponse.headers.append(
      "Set-Cookie",
      "__Secure-neon-auth.session_challange=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None"
    );
    // Also clear old cookie variants from previous sessions
    redirectResponse.headers.append(
      "Set-Cookie",
      "__Secure-neon-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None; Partitioned"
    );
    redirectResponse.headers.append(
      "Set-Cookie",
      "neon-auth.session_challange=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax"
    );
  }

  log.info("User signed out");
  return redirectResponse;
};
