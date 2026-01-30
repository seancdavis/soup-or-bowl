# Claude Code Instructions

This is the Soup or Bowl 2026 application - a Super Bowl party app with a soup competition.

## Current Status

✅ **Authentication Working** - Server-side OAuth flow with NeonAuth is complete. Users can sign in with Google and are checked against the approved_users table.

## Project Overview

- **Framework**: Astro with React islands
- **Styling**: Tailwind CSS v4 with custom theme
- **Database**: Netlify DB (Neon PostgreSQL) with Drizzle ORM
- **Auth**: NeonAuth (Better Auth) with server-side OAuth flow
- **Hosting**: Netlify with middleware for auth

## Key Architecture Decisions

### Authentication (Server-Side NeonAuth)

NeonAuth is proxied through Netlify redirects for first-party cookies. The entire OAuth flow is server-side with no client JavaScript required.

**Key Files:**
- `netlify.toml` - Configures `/neon-auth/*` proxy to Neon Auth service
- `src/pages/api/auth/signin.ts` - Initiates OAuth, redirects to Google
- `src/pages/api/auth/callback.ts` - Handles OAuth callback, finalizes session
- `src/middleware.ts` - Validates session, redirects unauthenticated users
- `src/lib/auth.ts` - NeonAuth client factory

**OAuth Flow (all server-side):**
1. User clicks "Sign in with Google" link → GET `/api/auth/signin`
2. Server calls Neon Auth, gets OAuth URL, forwards challenge cookie
3. Server redirects browser to Google OAuth
4. User authenticates with Google
5. Google redirects to Neon Auth callback
6. Neon Auth redirects to `/api/auth/callback?neon_auth_session_verifier=...`
7. Server calls Neon Auth to finalize session, gets session cookies
8. Server redirects to `/` with session cookies set
9. Middleware validates session on subsequent requests

**Auth Protection:**
- All pages are protected except `/login`, `/neon-auth/*`, and `/api/auth/*`
- Middleware (`src/middleware.ts`) validates sessions and sets `Astro.locals.user`
- Users must be in the `approved_users` database table to access protected content
- Unapproved users are redirected to `/unauthorized`

**Important:** Protected pages must use `export const prerender = false` so the middleware can access request headers.

### Rendering Strategy
- Protected pages must be server-rendered (`prerender = false`)
- Public pages can be static
- API routes always use `export const prerender = false`
- React components render statically unless using `client:load` directive

### Database
- Use Drizzle ORM for all database operations
- Schema defined in `db/schema.ts` (root level, per Netlify DB convention)
- Database client in `src/db/index.ts` - **lazy-loaded** to avoid build-time connection errors
- Run `npm run db:generate` to create migrations
- Run `npm run db:migrate` to apply migrations
- Never write raw SQL outside of Drizzle

### Lazy Loading Pattern

Both the database client (`src/db/index.ts`) and auth client (`src/lib/auth.ts`) use lazy loading. This is critical because:
1. Astro pre-renders pages at build time
2. Environment variables may not be available at build time
3. Database connections would fail during `npm run build`

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
- Protected pages must include `export const prerender = false`
- Protected pages can assume `Astro.locals.user` exists (middleware enforces)

**Current Pages:**
| Route | File | Protected | Description |
|-------|------|-----------|-------------|
| `/` | `index.astro` | Yes | Home page with Hero and SaveTheDate |
| `/login` | `login.astro` | No | Public login page (entry point) |
| `/unauthorized` | `unauthorized.astro` | Auth only | Shown to unapproved users |
| `/api/auth/signin` | `api/auth/signin.ts` | No | Initiates Google OAuth |
| `/api/auth/callback` | `api/auth/callback.ts` | No | Handles OAuth callback |

### API Routes (`src/pages/api/`)
- Must include `export const prerender = false`
- Access user via context if needed (middleware sets locals)

### Components (`src/components/`)
- React `.tsx` files
- Group by feature: `ui/`, `layout/`, `auth/`, `home/`
- Create index.ts for exports

## Common Tasks

### Adding a new protected page
1. Create `src/pages/your-page.astro`
2. Add `export const prerender = false` in frontmatter
3. Import and use `Layout` from `../layouts/Layout.astro`
4. Access user via `Astro.locals.user` (guaranteed by middleware)

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
- `NEON_AUTH_URL` - NeonAuth endpoint URL (from Neon Console > Auth tab)

`NETLIFY_DATABASE_URL` is automatically set after running `netlify db init`.

**Note:** The `NEON_AUTH_URL` is currently hard-coded in `netlify.toml` for the redirect proxy. For production, use the `scripts/generate-redirects.js` script to generate the `_redirects` file at build time with the correct URL.

## Development

### Local HTTPS (Required for Auth)
NeonAuth uses `__Secure-` cookies which require HTTPS. For local development:
1. Use a tunnel service (e.g., localtunnel, loclx, ngrok)
2. Add the tunnel domain to `vite.server.allowedHosts` in `astro.config.mjs`
3. Add the tunnel domain to Neon Auth trusted domains in the Neon Console

### Commands

```bash
npm run dev          # Start dev server (via netlify dev)
npm run build        # Production build
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio
```
