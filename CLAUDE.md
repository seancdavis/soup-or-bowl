# Claude Code Instructions

This is the Soup or Bowl 2026 application - a Super Bowl party app with a soup competition.

## Project Overview

- **Framework**: Astro (SSR mode) with React components
- **Styling**: Tailwind CSS v4 with custom theme
- **Database**: Netlify DB (Neon PostgreSQL) with Drizzle ORM
- **Auth**: NeonAuth (Better Auth) with server-side OAuth flow
- **Icons**: Lucide React
- **Hosting**: Netlify

## Architecture Principles

### 1. CSS in Tailwind Utilities Only

Never write inline CSS in React components. If you need custom styles:
1. Add them as Tailwind utilities in `src/styles/global.css` under `@layer utilities`
2. Use the utility class in your components

**Bad:**
```tsx
<div style={{ background: "radial-gradient(...)" }}>
```

**Good:**
```css
/* In global.css */
@layer utilities {
  .bg-stadium-lights {
    background: radial-gradient(...);
  }
}
```
```tsx
<div className="bg-stadium-lights">
```

### 2. Atomic Design Component Structure

Follow Atomic Design methodology for component organization:

| Layer | Location | Examples |
|-------|----------|----------|
| **Atoms** | `src/components/ui/` | Button, Card, Badge, Avatar, Icon, Logo |
| **Molecules** | `src/components/ui/` | EventBadge, Divider, PageBackground |
| **Organisms** | `src/components/layout/`, `src/components/home/` | Header, Footer, Hero, SaveTheDate |
| **Pages** | `src/components/pages/` | HomePage, LoginPage, UnauthorizedPage |

- Prefer creating reusable components over duplicating markup
- Extract repeated patterns into shared components
- Use barrel exports (`index.ts`) for cleaner imports

### 3. React for All Markup, Astro for Routing

All components are React components. Astro pages act as thin controllers:

**Astro pages should:**
- Handle authentication/authorization logic
- Fetch data and check permissions
- Redirect as needed
- Render a single React page component

**Astro pages should NOT:**
- Contain significant markup
- Have complex JSX structures
- Use `client:load` on entire page components (defeats Astro's purpose)

**Pattern:**
```astro
---
import Layout from "../layouts/Layout.astro";
import { SomePage } from "../components/pages";
import { getUserWithApproval } from "../lib/auth";

// Auth logic
const auth = await getUserWithApproval(Astro.request);
if (!auth) return Astro.redirect("/login");
if (!auth.isApproved) return Astro.redirect("/unauthorized");

const { user } = auth;
---

<Layout title="Page Title">
  <SomePage user={user} />
</Layout>
```

### 4. Minimal Client-Side JavaScript

Prefer CSS-only solutions over JavaScript where possible:
- Use `<details>`/`<summary>` for dropdowns instead of React state
- Use CSS `:hover`, `:focus-within` for interactive states
- Only use `client:load` on specific islands that truly need interactivity

## Key Architecture Decisions

### Authentication (Server-Side NeonAuth)

All auth is server-side. No client-side auth SDK.

**Key Files:**
- `netlify.toml` - Configures `/neon-auth/*` proxy to Neon Auth service
- `src/pages/api/auth/signin.ts` - Initiates OAuth, redirects to Google
- `src/pages/api/auth/callback.ts` - Handles OAuth callback, finalizes session
- `src/pages/api/auth/signout.ts` - Signs out user, clears cookies
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

**Sign out:** Link to `/api/auth/signout` (no client-side JS needed)

**Important:** The `getUser` function uses direct fetch with `disableCookieCache=true` to bypass Neon Auth's session caching. This ensures sign-out works correctly.

**Localhost Cookie Handling:**
NeonAuth uses `__Secure-` cookies which require HTTPS. For localhost development, the auth routes automatically handle cookie prefix conversion.

**Deploy Preview Configuration:**
Each Netlify deploy preview URL must be added to NeonAuth's trusted origins. The callback URL must match exactly - including trailing slashes. Configure origins without trailing slash (e.g., `https://deploy-preview-1--soup-or-bowl.netlify.app`).

**Sign Out Implementation:**
Sign out requires two things:
1. Call NeonAuth's sign-out endpoint: `POST ${origin}/neon-auth/sign-out` with the session cookie
2. Clear cookies with matching attributes - production cookies use `Partitioned`, so clearing must include `Partitioned` too

### Database
- Use Drizzle ORM for all database operations
- Schema defined in `db/schema.ts`
- Database client in `src/db/index.ts` (lazy-loaded)
- Run `npm run db:generate` then `npm run db:migrate` for schema changes

### Logging

Use the logger utility (`src/lib/logger.ts`) for all server-side logging:

```typescript
import { logger } from "../lib/logger";

// Direct usage with scope
logger.debug("AUTH", "Checking session...");
logger.info("DB", "Connected to database");
logger.warn("CACHE", "Cache miss");
logger.error("API", "Request failed:", error);

// Or create a scoped logger
const log = logger.scope("AUTH");
log.debug("Checking session...");
log.info("User authenticated:", user.email);
```

**Log Levels** (controlled via `LOG_LEVEL` env var):
- `debug` - Most verbose, shows everything
- `info` - General information (default)
- `warn` - Warnings and errors only
- `error` - Errors only
- `silent` - No output

**Colors:** Disable with `LOG_COLORS=false`

## Design System

### Theme Variables (`src/styles/global.css`)
- `--color-primary-*`: Deep blue palette (50-950)
- `--color-gold-*`: Championship gold accents (300-600)
- `--font-family-display`: Impact-style bold font for headers
- `--font-family-body`: Inter for body text

### Custom CSS Utilities
- **Backgrounds:** `bg-stadium-lights`, `bg-diagonal-stripes`, `bg-yard-lines`, `bg-noise`, `bg-vignette`, `bg-vignette-subtle`
- **Text shadows:** `text-shadow-title`, `text-shadow-title-sm`, `text-shadow-gold-glow`, `text-shadow-year`, `text-shadow-heading`, `text-shadow-subtle`
- **Animations:** `animate-fade-in`, `animate-fade-in-up`, `animate-fade-in-down`
- **Animation delays:** `animation-delay-200`, `animation-delay-400`, `animation-delay-500`, `animation-delay-600`
- **Typography:** `font-display` (Impact-style display font)

### Component Library

| Component | Location | Purpose |
|-----------|----------|---------|
| `Button` | `ui/` | Primary, secondary, ghost variants |
| `Card` | `ui/` | Default, bordered variants |
| `Container` | `ui/` | Responsive max-width container |
| `Avatar` | `ui/` | User avatar with fallback initial |
| `Badge` | `ui/` | Default, outlined, pill variants |
| `Divider` | `ui/` | Horizontal divider with optional center content |
| `Icon` | `ui/` | SVG icons (trophy, warning, football) |
| `Logo` | `ui/` | Soup or Bowl logo in multiple sizes |
| `EventBadge` | `ui/` | "Super Bowl LX" badge with decorative lines |
| `PageBackground` | `ui/` | Hero, simple, minimal background variants (use `pointer-events-none`) |

### Icons

Use [Lucide React](https://lucide.dev) for icons:

```tsx
import { LogOut, User, Settings } from "lucide-react";

<LogOut className="w-4 h-4" />
```

## File Conventions

### Pages (`src/pages/`)
| Route | File | Auth | Description |
|-------|------|------|-------------|
| `/` | `index.astro` | Required + Approved | Home page |
| `/login` | `login.astro` | None (redirects if logged in) | Login page |
| `/unauthorized` | `unauthorized.astro` | Required (redirects if approved) | Unapproved users |
| `/entries` | `entries/index.astro` | Required + Approved | All entries list |
| `/entries/admin` | `entries/admin.astro` | Required + Approved + Admin | Admin entries view |
| `/vote` | `vote/index.astro` | Required + Approved | Voting page |
| `/vote/admin` | `vote/admin.astro` | Required + Approved + Admin | Admin voting controls |
| `/api/auth/signin` | `api/auth/signin.ts` | None | Start OAuth |
| `/api/auth/callback` | `api/auth/callback.ts` | None | OAuth callback |
| `/api/auth/signout` | `api/auth/signout.ts` | None | Sign out |
| `/api/votes` | `api/votes.ts` | Required + Approved | Submit/update vote |
| `/api/admin/settings` | `api/admin/settings.ts` | Required + Approved + Admin | Toggle app settings |

### Voting System

The voting system allows users to rank their top 3 choices from competition entries.

**Admin Settings (controlled via `/vote/admin`):**
- `voting_active` - When enabled, voting page is accessible
- `voting_locked` - When enabled (with voting active), users can view but not edit votes
- `reveal_results` - When enabled, winner is displayed on the entries page

**Scoring:**
- 1st Place: 3 points
- 2nd Place: 2 points
- 3rd Place: 1 point

**Key Files:**
- `src/lib/votes.ts` - Vote CRUD and score calculation
- `src/lib/settings.ts` - Settings get/set functions
- `db/schema.ts` - Votes table definition

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NETLIFY_DATABASE_URL` | Neon PostgreSQL connection string (auto-set by Netlify DB for dev/preview) |
| `NETLIFY_PRODUCTION_DATABASE_URL` | Production database URL (for `db:migrate:prod` script, set locally) |
| `NEON_AUTH_URL` | NeonAuth endpoint (hard-coded in `netlify.toml`) |
| `LOG_LEVEL` | Logger level: `debug`, `info`, `warn`, `error`, `silent` (default: `info`) |
| `LOG_COLORS` | Enable/disable colored logs: `true`/`false` (default: `true`) |

## Commands

```bash
npm run dev                    # Start dev server (netlify dev)
npm run build                  # Production build
npm run db:generate            # Generate migrations
npm run db:migrate             # Apply migrations (dev/preview database)
npm run db:migrate:prod        # Apply migrations (PRODUCTION - requires confirmation)
npm run db:studio              # Open Drizzle Studio

# With logging options
LOG_LEVEL=debug npm run dev    # Verbose logging
LOG_LEVEL=silent npm run dev   # No logging
```

### Production Database Migrations

The `db:migrate:prod` script has safeguards to prevent accidental production changes:

1. Requires the `NETLIFY_PRODUCTION_DATABASE_URL` environment variable
2. Requires typing "PRODUCTION" to confirm

To get the production database URL:
```bash
netlify env:get NETLIFY_DATABASE_URL --context production
```

Then set it locally (don't commit this):
```bash
export NETLIFY_PRODUCTION_DATABASE_URL="postgres://..."
npm run db:migrate:prod
```
