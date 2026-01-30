import type { APIRoute } from "astro";

export const prerender = false;

/**
 * OAuth callback handler.
 * Finalizes the session by exchanging the verifier with Neon Auth,
 * then redirects to the destination with session cookies set.
 */
export const GET: APIRoute = async ({ request, redirect }) => {
  const url = new URL(request.url);
  const verifier = url.searchParams.get("neon_auth_session_verifier");
  const destination = url.searchParams.get("redirect") || "/";

  console.log("[AUTH CALLBACK] Verifier present:", !!verifier);
  console.log("[AUTH CALLBACK] Destination:", destination);

  if (!verifier) {
    console.log("[AUTH CALLBACK] No verifier, redirecting to login");
    return redirect("/login", 302);
  }

  // Check X-Forwarded-Proto for tunnels/proxies that terminate SSL
  const proto = request.headers.get("x-forwarded-proto") || url.protocol.replace(":", "");
  const origin = `${proto}://${url.host}`;

  try {
    const cookies = request.headers.get("cookie") || "";
    console.log("[AUTH CALLBACK] Request cookies:", cookies || "(none)");

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

    console.log("[AUTH CALLBACK] Session response status:", sessionResponse.status);

    // Log response body for debugging
    const responseText = await sessionResponse.text();
    console.log("[AUTH CALLBACK] Session response body:", responseText);

    // Get the Set-Cookie headers from Neon Auth
    const setCookies = sessionResponse.headers.getSetCookie();
    console.log("[AUTH CALLBACK] Set-Cookie count:", setCookies.length);

    // Create redirect response with cookies
    const response = redirect(destination, 302);

    for (const cookie of setCookies) {
      response.headers.append("Set-Cookie", cookie);
    }

    console.log("[AUTH CALLBACK] Redirecting to:", destination);
    return response;
  } catch (error) {
    console.error("[AUTH CALLBACK] Error:", error);
    return redirect("/login", 302);
  }
};
