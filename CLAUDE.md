# Claude Code Instructions

This is the Soup or Bowl 2026 application - a Super Bowl party app with a soup competition.

## Current Status

🚧 **Authentication In Progress** - The NeonAuth proxy is configured and requests are reaching Neon Auth, but the full OAuth flow needs debugging. Focus areas:
1. Verify the response from Neon Auth contains the expected redirect URL
2. Ensure cookies are being set correctly on the callback
3. Test the full Google OAuth round-trip

## Project Overview

- **Framework**: Astro with React islands
- **Styling**: Tailwind CSS v4 with custom theme
- **Database**: Netlify DB (Neon PostgreSQL) with Drizzle ORM
- **Auth**: NeonAuth (Better Auth) with custom Astro proxy
- **Hosting**: Netlify with edge middleware for auth

## Key Architecture Decisions

### Authentication (NeonAuth + Custom Proxy)

NeonAuth is built on Better Auth and doesn't have a native Astro adapter. We use a custom proxy pattern:

**Key Files:**
- `src/pages/api/auth/[...all].ts` - Proxies all `/api/auth/*` requests to Neon Auth service
- `src/components/auth/LoginButton.tsx` - Triggers Google OAuth via POST
- `src/lib/auth.ts` - NeonAuth client (lazy-loaded to avoid build-time issues)

**OAuth Flow:**
1. User clicks "Sign in with Google" button
2. `LoginButton` sends `POST /api/auth/sign-in/social` with `{ provider: "google", callbackURL: "/" }`
3. Auth proxy forwards to Neon Auth: `POST {NEON_AUTH_URL}/sign-in/social`
4. Neon Auth returns `{ url: "https://accounts.google.com/..." }`
5. Browser redirects to Google OAuth
6. Google redirects back to `/api/auth/callback/google`
7. Auth proxy forwards callback, receives Set-Cookie headers
8. User is authenticated, session cookie is set

**Auth Protection:**
- All pages are protected except `/login` and `/api/auth/*`
- Edge middleware (`src/middleware.ts`) handles all auth checks
- Users must be in the `approved_users` database table to access protected content
- The middleware sets `Astro.locals.user` and `Astro.locals.isApproved`

### Rendering Strategy
- Pages are static by default (pre-rendered at build time)
- Netlify edge middleware protects static pages at runtime
- API routes use `export const prerender = false` for SSR
- React components render statically unless using `client:load` directive

### Database
- Use Drizzle ORM for all database operations
- Schema defined in `db/schema.ts` (root level, per Netlify DB convention)
- Database client in `src/db/index.ts` - **lazy-loaded** to avoid build-time connection errors
- Run `npm run db:generate` to create migrations
- Run `npm run db:migrate` to apply migrations
- Never write raw SQL outside of Drizzle

### Lazy Loading Pattern

Both the database client (`src/db/index.ts`) and auth client (`src/lib/auth.ts`) use lazy loading with a Proxy pattern. This is critical because:
1. Astro pre-renders pages at build time
2. Environment variables may not be available at build time
3. Database connections would fail during `npm run build`

```typescript
// Pattern used in src/db/index.ts
let _db: NeonHttpDatabase<typeof schema> | null = null;
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(neon(import.meta.env.NETLIFY_DATABASE_URL), { schema });
  }
  return _db;
}
// Proxy for convenient access
export const db = new Proxy({} as NeonHttpDatabase<typeof schema>, {
  get(_, prop) { return (getDb() as any)[prop]; },
});
```

## Design System

### Theme Variables (defined in `src/styles/global.css`)
- `--color-primary-*`: Deep blue palette (50-950)
- `--color-gold-*`: Championship gold accents (300-600)
- `--font-family-display`: Impact-style bold font for headers
- `--font-family-body`: Inter for body text

### Component Patterns
- All UI components are React (in `src/components/`)
- Components are organized by purpose: `ui/`, `layout/`, `auth/`, `home/`
- Export components via index.ts barrel files
- Use the existing Button, Card, Container primitives
- Static by default, add `client:load` only when JS interactivity is needed

### Styling Guidelines
- Use Tailwind utility classes
- Reference theme variables: `text-gold-500`, `bg-primary-900`
- Use the custom utilities: `text-shadow-bold`, `text-shadow-glow`
- Bold, sports-themed aesthetic - think championship/Super Bowl

## File Conventions

### Pages (`src/pages/`)
- `.astro` files for pages
- Use `Layout.astro` as the wrapper
- Protected pages can assume `Astro.locals.user` exists (middleware enforces)

**Current Pages:**
| Route | File | Protected | Description |
|-------|------|-----------|-------------|
| `/` | `index.astro` | Yes | Home page with Hero and SaveTheDate |
| `/login` | `login.astro` | No | Public login page (entry point) |
| `/api/auth/*` | `api/auth/[...all].ts` | No | Auth proxy to Neon Auth |

### API Routes (`src/pages/api/`)
- Must include `export const prerender = false`
- Access user via context if needed (middleware sets locals)

### Components (`src/components/`)
- React `.tsx` files
- Group by feature: `ui/`, `layout/`, `auth/`, `home/`
- Create index.ts for exports

## Common Tasks

### Adding a new page
1. Create `src/pages/your-page.astro`
2. Import and use `Layout` from `../layouts/Layout.astro`
3. Access user via `Astro.locals.user` (guaranteed by middleware)

### Adding a new component
1. Create in appropriate `src/components/{category}/` folder
2. Export from the category's `index.ts`
3. Use existing UI primitives (Button, Card, Container)

### Adding a database table
1. Define schema in `db/schema.ts`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply
4. Import from `src/db` to query

### Adding an API route
1. Create `src/pages/api/your-route.ts`
2. Add `export const prerender = false`
3. Export handlers: `GET`, `POST`, etc.

## Environment Variables

Required in production:
- `NETLIFY_DATABASE_URL` - Neon PostgreSQL connection string (auto-provisioned by Netlify DB)
- `NEON_AUTH_URL` - NeonAuth endpoint URL (from Neon Console > Auth tab, e.g., `https://auth.neon.tech/project/xxx`)

`NETLIFY_DATABASE_URL` is automatically set after running `netlify db init`.

## Debugging Auth

The auth proxy logs useful information:
```
[AUTH PROXY] Request: POST sign-in/social
[AUTH PROXY] Base URL: https://auth.neon.tech/project/xxx
[AUTH PROXY] Forwarding to: https://auth.neon.tech/project/xxx/sign-in/social
[AUTH PROXY] Response status: 200
```

**Common Issues:**
1. **404 on sign-in**: Make sure you're using POST to `/sign-in/social` with `{ provider: "google" }` body, not GET to `/sign-in/google`
2. **No redirect URL in response**: Check Neon Console > Auth tab - Google provider must be enabled and domains configured
3. **Cookies not being set**: The proxy must forward Set-Cookie headers from the response
4. **Session not persisting**: Check that cookies include correct domain/path attributes

**NeonAuth Console Settings (Required):**
- Auth enabled for your project
- Google OAuth provider configured with client ID/secret
- Trusted domains: `localhost:8888` (dev), your production domain

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio
```
