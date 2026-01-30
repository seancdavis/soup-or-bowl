# Soup or Bowl 2026

A Super Bowl party application that doubles as a soup competition (like a chili cookoff). Built for Super Bowl LX on February 8, 2026.

## Features

- **Save the Date** - Landing page for authenticated users
- **User Authentication** - Google OAuth via NeonAuth (custom proxy for Astro)
- **Approved User Safelist** - Only pre-approved participants can access
- **Coming Soon**: Soup submission, voting, and Super Bowl Squares

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Astro](https://astro.build) | Framework (static pages + SSR API routes) |
| [React](https://react.dev) | UI components (islands architecture) |
| [Tailwind CSS v4](https://tailwindcss.com) | Styling |
| [Netlify](https://netlify.com) | Hosting with edge middleware |
| [Netlify DB](https://docs.netlify.com/database/) | PostgreSQL database (Neon) |
| [NeonAuth](https://neon.tech/docs/auth) | Authentication (Better Auth backend) |
| [Drizzle ORM](https://orm.drizzle.team) | Database schema and queries |

## Current Status

🚧 **Authentication In Progress** - The NeonAuth proxy is configured and connecting to Neon Auth, but the full OAuth flow needs debugging. The proxy pattern is working (requests reach Neon Auth), but there may be issues with the response handling or callback flow.

## Getting Started

### Prerequisites

- Node.js 18+
- A Netlify account
- A Neon account (via Netlify DB)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup

1. Deploy to Netlify first (database requires a deployed site)
2. Initialize the database:
   ```bash
   npx netlify db init
   ```
3. Generate and run migrations:
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
4. Add approved users via Neon Console or Drizzle

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Database (auto-provisioned by Netlify DB)
NETLIFY_DATABASE_URL=postgresql://...

# NeonAuth (from Neon Console > Auth tab)
NEON_AUTH_URL=https://your-project.auth.neon.tech
```

### NeonAuth Setup

1. Go to your Neon project in the console
2. Navigate to the **Auth** tab
3. Enable Auth and configure Google OAuth
4. Add your domain to the trusted domains list
5. Copy the Auth URL to your environment variables

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Apply migrations to database |
| `npm run db:studio` | Open Drizzle Studio |

## Project Structure

```
├── db/
│   └── schema.ts      # Drizzle schema (approved_users table)
├── migrations/        # Generated Drizzle migrations
├── src/
│   ├── components/
│   │   ├── ui/        # Base UI primitives (Button, Card, Container)
│   │   ├── layout/    # Layout components (Header, Footer)
│   │   ├── auth/      # Auth components (LoginButton, UserMenu)
│   │   └── home/      # Home page components (Hero, SaveTheDate)
│   ├── db/
│   │   └── index.ts   # Database client
│   ├── lib/
│   │   └── auth.ts    # NeonAuth client
│   ├── layouts/
│   │   └── Layout.astro # Base HTML layout
│   ├── pages/
│   │   ├── index.astro  # Home page (protected)
│   │   ├── login.astro  # Login page (public)
│   │   └── api/auth/    # Auth API routes
│   ├── styles/
│   │   └── global.css   # Tailwind + custom theme
│   └── middleware.ts    # Auth middleware (edge)
```

## Authentication Flow

### Overview
1. User visits any page → Edge middleware intercepts
2. Check NeonAuth session
3. No session → Redirect to `/login`
4. Has session → Check `approved_users` table
5. Not approved → Redirect to `/unauthorized`
6. Approved → Serve the page

### NeonAuth Integration (Custom Proxy)

NeonAuth doesn't have a native Astro adapter, so we use a custom proxy pattern:

```
LoginButton (React)
    → POST /api/auth/sign-in/social { provider: "google", callbackURL: "/" }
    → Auth Proxy ([...all].ts)
    → Neon Auth service (NEON_AUTH_URL)
    → Returns { url: "https://accounts.google.com/..." }
    → Redirect to Google OAuth
    → Google callback → Neon Auth → /api/auth/callback/google
    → Auth Proxy forwards response with Set-Cookie headers
    → User authenticated
```

Key files:
- `src/pages/api/auth/[...all].ts` - Proxies all `/api/auth/*` requests to Neon Auth
- `src/components/auth/LoginButton.tsx` - Triggers OAuth via POST to `/sign-in/social`
- `src/lib/auth.ts` - NeonAuth client for session management

## Design System

The app uses a bold, sports-themed design:

- **Colors**: Deep blues (`--color-primary-*`) and championship gold (`--color-gold-*`)
- **Typography**: Impact-style display font for headers
- **Components**: React components rendered statically by default, hydrated with `client:load` when interactive

## License

Private - All rights reserved
