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

  log.info("Signing out user");
  log.info("Origin:", origin);
  log.info("Cookies present:", request.headers.get("cookie")?.substring(0, 100) || "(none)");

  // Call NeonAuth signout to invalidate session server-side
  try {
    const signoutResponse = await fetch(`${origin}/neon-auth/sign-out`, {
      method: "POST",
      headers: {
        cookie: request.headers.get("cookie") || "",
        Origin: origin,
      },
    });
    log.info("NeonAuth signout response:", signoutResponse.status);

    // Forward any Set-Cookie headers from NeonAuth
    const setCookies = signoutResponse.headers.getSetCookie();
    log.info("NeonAuth returned", setCookies.length, "Set-Cookie headers");
    for (const cookie of setCookies) {
      log.debug("NeonAuth cookie:", cookie.substring(0, 80));
    }
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

  log.info("Cookies cleared, redirecting to /login");
  return redirectResponse;
};
