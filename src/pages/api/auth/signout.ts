import type { APIRoute } from "astro";
import { getOrigin } from "../../../lib/auth";
import { logger } from "../../../lib/logger";

const log = logger.scope("SIGNOUT");

/**
 * Signs out the user by clearing session cookies.
 * Redirects to /login after sign-out.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const origin = getOrigin(request);
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

  log.info("Signing out user");
  log.debug("Environment:", isLocalhost ? "localhost" : "production");

  // Redirect to login and clear session cookies
  const redirectResponse = redirect("/login", 302);

  // Clear session cookies - must match how they were set
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
    // Production cookies (with __Secure- prefix, Secure flag, SameSite=None)
    redirectResponse.headers.append(
      "Set-Cookie",
      "__Secure-neon-auth.session_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None"
    );
    redirectResponse.headers.append(
      "Set-Cookie",
      "__Secure-neon-auth.session_challange=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=None"
    );
  }

  log.debug("Cookies cleared, redirecting to /login");
  return redirectResponse;
};
