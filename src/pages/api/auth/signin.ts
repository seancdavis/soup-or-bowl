import type { APIRoute } from "astro";
import { getOrigin } from "../../../lib/auth";

/**
 * Initiates Google OAuth sign-in.
 * Redirects the browser to Google's OAuth consent screen.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const origin = getOrigin(request);
  const callbackURL = `${origin}/api/auth/callback?redirect=/`;

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
      console.log("[SIGNIN] Cookies from Neon Auth:", setCookies.length);

      for (const cookie of setCookies) {
        const fixedCookie = isLocalhost ? fixCookieForLocalhost(cookie) : cookie;
        console.log("[SIGNIN] Original cookie:", cookie);
        console.log("[SIGNIN] Fixed cookie:", fixedCookie);
        redirectResponse.headers.append("Set-Cookie", fixedCookie);
      }

      return redirectResponse;
    }

    console.error("[SIGNIN] No redirect URL in response:", data);
    return redirect("/login?error=oauth_failed", 302);
  } catch (error) {
    console.error("[SIGNIN] Error:", error);
    return redirect("/login?error=oauth_failed", 302);
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
