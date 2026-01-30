import type { APIRoute } from "astro";

// API routes must be server-rendered
export const prerender = false;

// Cookie prefix used by Neon Auth
const NEON_AUTH_COOKIE_PREFIX = "__neonauth";

// Headers to forward to upstream
const PROXY_HEADERS = [
  "user-agent",
  "authorization",
  "referer",
  "content-type",
];

/**
 * Extract Neon Auth cookies from request headers
 */
function extractNeonAuthCookies(headers: Headers): string {
  const cookieHeader = headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  const neonCookies = cookies.filter(
    (c) =>
      c.startsWith(NEON_AUTH_COOKIE_PREFIX) ||
      c.startsWith("better-auth") ||
      c.startsWith("__Secure-")
  );
  return neonCookies.join("; ");
}

/**
 * Get origin from request
 */
function getOrigin(request: Request): string {
  const url = new URL(request.url);
  return `${url.protocol}//${url.host}`;
}

/**
 * Prepare headers for upstream request
 */
function prepareRequestHeaders(request: Request): Headers {
  const headers = new Headers();

  for (const header of PROXY_HEADERS) {
    const value = request.headers.get(header);
    if (value) {
      headers.set(header, value);
    }
  }

  headers.set("Origin", getOrigin(request));
  headers.set("Cookie", extractNeonAuthCookies(request.headers));
  headers.set("x-neon-auth-proxy", "astro");

  return headers;
}

/**
 * Parse request body if present
 */
async function parseRequestBody(
  request: Request
): Promise<BodyInit | null | undefined> {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  const contentType = request.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return JSON.stringify(await request.json());
  }

  return request.body;
}

/**
 * Handle the auth request by proxying to Neon Auth
 */
async function handleAuthRequest(
  baseUrl: string,
  request: Request,
  path: string
): Promise<Response> {
  const headers = prepareRequestHeaders(request);
  const body = await parseRequestBody(request);

  try {
    const originalUrl = new URL(request.url);
    const upstreamUrl = new URL(`${baseUrl}/${path}`);
    upstreamUrl.search = originalUrl.search;

    console.log("[AUTH PROXY] Forwarding to:", upstreamUrl.toString());

    const response = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers,
      body,
    });

    console.log("[AUTH PROXY] Response status:", response.status);

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error(`[AUTH PROXY] Error: ${message}`, error);
    return new Response(`[AuthError] ${message}`, { status: 500 });
  }
}

/**
 * Handle auth response - forward headers and body back to client
 */
async function handleAuthResponse(response: Response): Promise<Response> {
  const headers = new Headers();

  // Forward Set-Cookie headers
  response.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      headers.append("Set-Cookie", value);
    } else if (
      key.toLowerCase() !== "content-encoding" &&
      key.toLowerCase() !== "transfer-encoding"
    ) {
      headers.set(key, value);
    }
  });

  const body = await response.text();

  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Catch-all route for NeonAuth API endpoints.
 * Proxies requests to the Neon Auth service.
 */
export const ALL: APIRoute = async (ctx) => {
  const baseUrl = import.meta.env.NEON_AUTH_URL;

  if (!baseUrl) {
    console.error("[AUTH PROXY] NEON_AUTH_URL is not set");
    return new Response("Auth configuration error: NEON_AUTH_URL not set", {
      status: 500,
    });
  }

  // Extract the path after /api/auth/
  const path = ctx.params.all || "";

  console.log("[AUTH PROXY] Request:", ctx.request.method, path);
  console.log("[AUTH PROXY] Base URL:", baseUrl);

  const response = await handleAuthRequest(baseUrl, ctx.request, path);
  return handleAuthResponse(response);
};
