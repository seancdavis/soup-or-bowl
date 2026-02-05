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

  // Clear session cookies - must match how they were set (including Partitioned for production)
  if (isLocalhost) {
    // Localhost cookies (no __Secure- prefix, no Secure flag, SameSite=Lax)
    redirectResponse.headers.append(
      "Set-Cookie",
      "neon-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
    redirectResponse.headers.append(
      "Set-Cookie",
      "neon-auth.session_challange=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax"
    );
  } else {
    // Production cookies (with __Secure- prefix, Secure flag, SameSite=None, Partitioned)
    redirectResponse.headers.append(
      "Set-Cookie",
      "__Secure-neon-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None; Partitioned"
    );
    redirectResponse.headers.append(
      "Set-Cookie",
      "__Secure-neon-auth.session_challange=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None; Partitioned"
    );
  }

  log.info("User signed out");
  return redirectResponse;
};
