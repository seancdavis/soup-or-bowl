import type { APIRoute } from "astro";

export const prerender = false;

/**
 * Initiates Google OAuth sign-in.
 * Redirects the browser to Google's OAuth consent screen.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  // Check X-Forwarded-Proto for tunnels/proxies that terminate SSL
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const origin = `${proto}://${url.host}`;

  // Where to go after OAuth completes
  const callbackURL = `${origin}/api/auth/callback?redirect=/`;

  console.log("[SIGNIN] Origin:", origin);
  console.log("[SIGNIN] Callback URL:", callbackURL);

  try {
    // Request OAuth URL from Neon Auth
    const response = await fetch(`${origin}/neon-auth/sign-in/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": origin,
      },
      body: JSON.stringify({
        provider: "google",
        callbackURL,
      }),
    });

    const data = await response.json();

    if (data.url) {
      // Create redirect response
      const redirectResponse = redirect(data.url, 302);

      // Forward Set-Cookie headers from Neon Auth (includes challenge cookie)
      const setCookies = response.headers.getSetCookie();
      console.log("[SIGNIN] Set-Cookie count:", setCookies.length);
      for (const cookie of setCookies) {
        redirectResponse.headers.append("Set-Cookie", cookie);
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
