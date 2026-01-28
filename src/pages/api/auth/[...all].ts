import type { APIRoute } from "astro";
import { authClient } from "../../../lib/auth";

// API routes must be server-rendered
export const prerender = false;

/**
 * Catch-all route for NeonAuth API endpoints.
 * Handles sign-in, sign-out, OAuth callbacks, etc.
 */
export const ALL: APIRoute = async (ctx) => {
  // Forward the request to NeonAuth handler
  return authClient.handler(ctx.request);
};
