import type { APIRoute } from "astro";
import { getOrigin } from "../../../lib/auth";
import { logger } from "../../../lib/logger";

const log = logger.scope("SIGNIN");

/**
 * Initiates Google OAuth sign-in.
 * Redirects the browser to Google's OAuth consent screen.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const origin = getOrigin(request);
  const callbackURL = `/api/auth/callback?redirect=/`;

  try {
    const response = await fetch(`${origin}/neon-auth/sign-in/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
      },
      body: JSON.stringify({
        provider: "google",
        callbackURL,
      }),
    });

    const data = await response.json();

    if (data.url) {
      const redirectResponse = redirect(data.url, 302);

      // Forward challenge cookie from Neon Auth, fixing for localhost if needed
      const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");
      const setCookies = response.headers.getSetCookie();
      log.debug("Cookies from Neon Auth:", setCookies.length);

      for (const cookie of setCookies) {
        let fixedCookie = isLocalhost ? fixCookieForLocalhost(cookie) : fixCookieForSafari(cookie);
        log.debug("Original cookie:", cookie.substring(0, 80));
        log.debug("Fixed cookie:", fixedCookie.substring(0, 80));
        redirectResponse.headers.append("Set-Cookie", fixedCookie);
      }

      log.info("Redirecting to OAuth provider");
      return redirectResponse;
    }

    log.error("No redirect URL in response:", data);
    return redirect("/login?error=oauth_failed", 302);
  } catch (error) {
    log.error("Error:", error);
    return redirect("/login?error=oauth_failed", 302);
  }
};

/**
 * Fix cookies for Safari compatibility.
 * Safari (especially mobile) blocks Partitioned cookies with SameSite=None
 * due to ITP. We change to SameSite=Lax and remove Partitioned. The __Secure-
 * prefix is kept because the /neon-auth/* proxy forwards cookies to Neon Auth
 * which expects the __Secure- prefix on cookie names.
 */
function fixCookieForSafari(cookie: string): string {
  return cookie
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
