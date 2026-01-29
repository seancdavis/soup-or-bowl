import { defineMiddleware } from "astro:middleware";
import { eq } from "drizzle-orm";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/api/auth"];

// Routes that require authentication but not approval (for showing "not approved" message)
const AUTH_ONLY_ROUTES = ["/unauthorized"];

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;

  // During build time, env vars aren't available - skip auth checks
  // Auth will be enforced at runtime via edge middleware
  if (!import.meta.env.NEON_AUTH_URL || !import.meta.env.NETLIFY_DATABASE_URL) {
    context.locals.user = null;
    context.locals.isApproved = false;
    return next();
  }

  // Skip auth for public routes and static assets
  if (
    PUBLIC_ROUTES.some((route) => pathname.startsWith(route)) ||
    pathname.startsWith("/_") ||
    pathname.includes(".")
  ) {
    context.locals.user = null;
    context.locals.isApproved = false;
    return next();
  }

  // Dynamically import auth and db to avoid build-time errors
  const { authClient } = await import("./lib/auth");
  const { db, approvedUsers } = await import("./db");

  // Get session from NeonAuth
  const session = await authClient.getSession({
    fetchOptions: {
      headers: context.request.headers,
    },
  });

  if (!session?.data?.user) {
    // No session - redirect to login
    return context.redirect("/login");
  }

  const user = session.data.user;

  // Check if user is in approved list
  const [approvedUser] = await db
    .select()
    .from(approvedUsers)
    .where(eq(approvedUsers.email, user.email))
    .limit(1);

  const isApproved = !!approvedUser;

  // Set locals for use in pages
  context.locals.user = {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
  };
  context.locals.isApproved = isApproved;

  // If not approved and trying to access a protected route, redirect to unauthorized
  if (!isApproved && !AUTH_ONLY_ROUTES.includes(pathname)) {
    return context.redirect("/unauthorized");
  }

  return next();
});
