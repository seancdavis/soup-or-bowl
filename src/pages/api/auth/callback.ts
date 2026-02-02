import type { APIRoute } from "astro";
import { getOrigin } from "../../../lib/auth";
import { logger } from "../../../lib/logger";

const log = logger.scope("CALLBACK");

/**
 * OAuth callback handler.
 * Finalizes the session by exchanging the verifier with Neon Auth,
 * then redirects to the destination with session cookies set.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const verifier = url.searchParams.get("neon_auth_session_verifier");
  const destination = url.searchParams.get("redirect") || "/";
  const origin = getOrigin(request);
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

  if (!verifier) {
    log.warn("No verifier in callback, redirecting to login");
    return redirect("/login", 302);
  }

  try {
    // Get cookies from request - may need to add __Secure- prefix back for Neon Auth
    let cookies = request.headers.get("cookie") || "";
    log.debug("Original cookies:", cookies.substring(0, 100) || "(none)");

    if (isLocalhost) {
      cookies = fixCookiesForNeonAuth(cookies);
      log.debug("Fixed cookies:", cookies.substring(0, 100));
    }

    // Call Neon Auth to finalize the session
    const sessionResponse = await fetch(
      `${origin}/neon-auth/get-session?neon_auth_session_verifier=${verifier}`,
      {
        method: "GET",
        headers: {
          cookie: cookies,
          Origin: origin,
        },
      }
    );

    if (!sessionResponse.ok) {
      const error = await sessionResponse.text();
      log.error("Session error:", error);
      return redirect("/login?error=session_failed", 302);
    }

    // Create redirect response with session cookies and success message
    const finalDestination = destination.includes("?")
      ? `${destination}&message=signed_in`
      : `${destination}?message=signed_in`;
    const response = redirect(finalDestination, 302);

    // Forward cookies, fixing for localhost if needed
    const setCookies = sessionResponse.headers.getSetCookie();
    log.debug("Setting", setCookies.length, "cookies");

    for (const cookie of setCookies) {
      const fixedCookie = isLocalhost ? fixCookieForLocalhost(cookie) : cookie;
      response.headers.append("Set-Cookie", fixedCookie);
    }

    log.info("Session established, redirecting to", finalDestination);
    return response;
  } catch (error) {
    log.error("Error:", error);
    return redirect("/login?error=callback_failed", 302);
  }
};

/**
 * Fix cookies for localhost by removing __Secure- prefix, Secure flag, and Partitioned.
 * Partitioned cookies require Secure, so we must remove both.
 */
function fixCookieForLocalhost(cookie: string): string {
  return cookie
    .replace(/^__Secure-/i, "")
    .replace(/;\s*Secure/gi, "")
    .replace(/;\s*Partitioned/gi, "")
    .replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
}

/**
 * Add __Secure- prefix back to cookies for Neon Auth.
 */
function fixCookiesForNeonAuth(cookieHeader: string): string {
  const neonCookies = ["neon-auth.session_token", "neon-auth.session_challange"];

  let fixed = cookieHeader;
  for (const name of neonCookies) {
    // Add prefix if cookie exists without it
    const regex = new RegExp(`(^|;\\s*)${name}=`, "g");
    fixed = fixed.replace(regex, `$1__Secure-${name}=`);
  }

  return fixed;
}
