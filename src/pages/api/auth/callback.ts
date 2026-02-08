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
    // Get cookies from request - add __Secure- prefix back for Neon Auth
    // Since we strip the prefix when setting cookies (for Safari compatibility
    // in production, and for localhost), we always need to re-add it.
    let cookies = request.headers.get("cookie") || "";
    log.debug("Original cookies:", cookies.substring(0, 100) || "(none)");

    cookies = fixCookiesForNeonAuth(cookies);
    log.debug("Fixed cookies:", cookies.substring(0, 100));

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
      const fixedCookie = isLocalhost ? fixCookieForLocalhost(cookie) : fixCookieForSafari(cookie);
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
 * Fix cookies for Safari compatibility.
 * Safari (especially mobile) does not reliably send Partitioned cookies with
 * SameSite=None during cross-site OAuth redirect chains. Since these cookies
 * are first-party (same domain), SameSite=Lax is correct and works across
 * all browsers. We also remove the Partitioned attribute and __Secure- prefix
 * since SameSite=Lax doesn't require them.
 */
function fixCookieForSafari(cookie: string): string {
  return cookie
    .replace(/^__Secure-/i, "")
    .replace(/;\s*Partitioned/gi, "")
    .replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
}

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
 * We strip the prefix when setting cookies for Safari compatibility,
 * but Neon Auth expects them with the prefix.
 */
function fixCookiesForNeonAuth(cookieHeader: string): string {
  const neonCookies = ["neon-auth.session_token", "neon-auth.session_challange"];

  let fixed = cookieHeader;
  for (const name of neonCookies) {
    // Match cookie name NOT already preceded by __Secure-
    const regex = new RegExp(`(^|;\\s*)(?!__Secure-)${name}=`, "g");
    fixed = fixed.replace(regex, `$1__Secure-${name}=`);
  }

  return fixed;
}
