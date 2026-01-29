# Claude Code Instructions

This is the Soup or Bowl 2026 application - a Super Bowl party app with a soup competition.

## Project Overview

- **Framework**: Astro with React islands
- **Styling**: Tailwind CSS v4 with custom theme
- **Database**: Netlify DB (Neon PostgreSQL) with Drizzle ORM
- **Auth**: NeonAuth (Google OAuth) with edge middleware
- **Hosting**: Netlify with edge middleware for auth

## Key Architecture Decisions

### Authentication
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
- Database client in `src/db/index.ts`
- Run `npm run db:generate` to create migrations
- Run `npm run db:migrate` to apply migrations
- Never write raw SQL outside of Drizzle

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
- `NEON_AUTH_URL` - NeonAuth endpoint URL (from Neon Console > Auth tab)

`NETLIFY_DATABASE_URL` is automatically set after running `netlify db init`.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:generate  # Generate migrations from schema
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio
```
