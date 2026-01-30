import type { APIRoute } from "astro";
import { getOrigin } from "../../../lib/auth";

/**
 * Signs out the user by calling Neon Auth and clearing cookies.
 * Redirects to /login after sign-out.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const origin = getOrigin(request);
  const isLocalhost = origin.includes("localhost") || origin.includes("127.0.0.1");

  // Get cookies to forward to Neon Auth, fixing for localhost if needed
  let cookies = request.headers.get("cookie") || "";
  if (isLocalhost) {
    cookies = fixCookiesForNeonAuth(cookies);
  }

  try {
    // Call Neon Auth to invalidate the session
    await fetch(`${origin}/neon-auth/sign-out`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Cookie: cookies,
      },
    });
  } catch (error) {
    console.error("[SIGNOUT] Error calling Neon Auth:", error);
    // Continue to clear cookies even if Neon Auth call fails
  }

  // Redirect to login and clear session cookies
  const redirectResponse = redirect("/login", 302);

  // Clear session cookies
  const cookiesToClear = isLocalhost
    ? ["neon-auth.session_token", "neon-auth.session_challange"]
    : ["__Secure-neon-auth.session_token", "__Secure-neon-auth.session_challange"];

  for (const name of cookiesToClear) {
    redirectResponse.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly${isLocalhost ? "" : "; Secure"}`
    );
  }

  return redirectResponse;
};

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
