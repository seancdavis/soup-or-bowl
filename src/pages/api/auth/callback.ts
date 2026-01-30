import type { APIRoute } from "astro";
import { getOrigin } from "../../../lib/auth";

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
    return redirect("/login", 302);
  }

  try {
    // Get cookies from request - may need to add __Secure- prefix back for Neon Auth
    let cookies = request.headers.get("cookie") || "";
    console.log("[CALLBACK] Original cookies:", cookies.substring(0, 100) || "(none)");

    if (isLocalhost) {
      cookies = fixCookiesForNeonAuth(cookies);
      console.log("[CALLBACK] Fixed cookies:", cookies.substring(0, 100));
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
      console.error("[CALLBACK] Session error:", error);
      return redirect("/login?error=session_failed", 302);
    }

    // Create redirect response with session cookies
    const response = redirect(destination, 302);

    // Forward cookies, fixing for localhost if needed
    for (const cookie of sessionResponse.headers.getSetCookie()) {
      const fixedCookie = isLocalhost ? fixCookieForLocalhost(cookie) : cookie;
      response.headers.append("Set-Cookie", fixedCookie);
    }

    return response;
  } catch (error) {
    console.error("[CALLBACK] Error:", error);
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
