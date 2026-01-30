# Claude Code Instructions

This is the Soup or Bowl 2026 application - a Super Bowl party app with a soup competition.

## Project Overview

- **Framework**: Astro (SSR mode) with React islands
- **Styling**: Tailwind CSS v4 with custom theme
- **Database**: Netlify DB (Neon PostgreSQL) with Drizzle ORM
- **Auth**: NeonAuth (Better Auth) with server-side OAuth flow
- **Hosting**: Netlify

## Key Architecture Decisions

### Authentication (Server-Side NeonAuth)

All auth is server-side. No middleware - pages handle their own auth using utility functions.

**Key Files:**
- `netlify.toml` - Configures `/neon-auth/*` proxy to Neon Auth service
- `src/pages/api/auth/signin.ts` - Initiates OAuth, redirects to Google
- `src/pages/api/auth/callback.ts` - Handles OAuth callback, finalizes session
- `src/lib/auth.ts` - Auth utilities (`getUser`, `getUserWithApproval`, `isUserApproved`)

**OAuth Flow:**
1. User clicks "Sign in with Google" link → GET `/api/auth/signin`
2. Server calls Neon Auth, gets OAuth URL, sets challenge cookie
3. Server redirects browser to Google OAuth
4. User authenticates with Google
5. Google redirects to Neon Auth callback
6. Neon Auth redirects to `/api/auth/callback?neon_auth_session_verifier=...`
7. Server calls Neon Auth to finalize session, sets session cookies
8. Server redirects to `/`

**Page Auth Pattern:**
```astro
---
import { getUserWithApproval } from "../lib/auth";

const auth = await getUserWithApproval(Astro.request);

if (!auth) {
  return Astro.redirect("/login");
}

if (!auth.isApproved) {
  return Astro.redirect("/unauthorized");
}

const { user } = auth;
---
```

**Localhost Cookie Handling:**
NeonAuth uses `__Secure-` cookies which require HTTPS. For localhost development, the auth routes automatically:
- Strip the `__Secure-` prefix
- Remove the `Secure` and `Partitioned` flags
- Change `SameSite=None` to `SameSite=Lax`
- Re-add the prefix when sending cookies to Neon Auth

### Rendering
- All pages are server-rendered (`output: "server"` in Astro config)
- No middleware - pages handle auth directly
- React components render statically unless using `client:load` directive

### Database
- Use Drizzle ORM for all database operations
- Schema defined in `db/schema.ts`
- Database client in `src/db/index.ts` (lazy-loaded)
- Run `npm run db:generate` then `npm run db:migrate` for schema changes

## Design System

### Theme Variables (`src/styles/global.css`)
- `--color-primary-*`: Deep blue palette (50-950)
- `--color-gold-*`: Championship gold accents (300-600)
- `--font-family-display`: Impact-style bold font for headers
- `--font-family-body`: Inter for body text

### Component Organization
- `src/components/ui/` - Primitives (Button, Card, Container)
- `src/components/layout/` - Header, Footer
- `src/components/auth/` - LoginButton, SignOutButton, UserMenu
- `src/components/home/` - Hero, SaveTheDate

## File Conventions

### Pages (`src/pages/`)
| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/` | `index.astro` | Required + Approved | Home page |
| `/login` | `login.astro` | None | Login page |
| `/unauthorized` | `unauthorized.astro` | Required | Unapproved users |
| `/api/auth/signin` | `api/auth/signin.ts` | None | Start OAuth |
| `/api/auth/callback` | `api/auth/callback.ts` | None | OAuth callback |

### Adding a Protected Page
```astro
---
import Layout from "../layouts/Layout.astro";
import { getUserWithApproval } from "../lib/auth";

const auth = await getUserWithApproval(Astro.request);
if (!auth) return Astro.redirect("/login");
if (!auth.isApproved) return Astro.redirect("/unauthorized");

const { user } = auth;
---

<Layout title="Page Title">
  <!-- Content -->
</Layout>
```

## Environment Variables

- `NETLIFY_DATABASE_URL` - Neon PostgreSQL connection string (auto-set by Netlify DB)
- `NEON_AUTH_URL` - NeonAuth endpoint (currently hard-coded in `netlify.toml`)

## Commands

```bash
npm run dev          # Start dev server (netlify dev)
npm run build        # Production build
npm run db:generate  # Generate migrations
npm run db:migrate   # Apply migrations
npm run db:studio    # Open Drizzle Studio
```
