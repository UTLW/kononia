# KONONIA Architecture

## Project Overview

**KONONIA** (ⲔⲞⲚⲞⲚⲒⲀ) - Orthodox Christian Family Fasting Companion
- PWA + Mobile App (iOS/Android)
- Turborepo monorepo

## Package Responsibilities

| Package | Path | Responsibility |
|---------|------|----------------|
| `@kononia/db` | `packages/db` | Drizzle ORM + SQLite. All database schema, migrations, seed data |
| `@kononia/api` | `packages/api` | tRPC types, routers, public/protected procedures |
| `@kononia/auth` | `packages/auth` | Better-Auth + Polar payments configuration |
| `@kononia/env` | `packages/env` | Environment variables (web, server, native exports) |
| `@kononia/ui` | `packages/ui` | Tailwind v4, shadcn/ui components, global styles |
| `@kononia/config` | `packages/config` | TypeScript config base |
| `apps/server` | `apps/server` | Express server on port 3000. `/api/auth`, `/trpc` endpoints |
| `apps/web` | `apps/web` | Next.js 15. App Router, PWA, shadcn/ui |
| `apps/native` | `apps/native` | Expo + Uniwind. Drawer/tab navigation |

## Import Patterns

```typescript
// Database schema
import { users, sessions, accounts } from "@kononia/db/schema/auth";
import { seasons, fastDays } from "@kononia/db/schema";

// tRPC
import { publicProcedure, protectedProcedure, router } from "@kononia/api";
import { appRouter } from "@kononia/api/routers/index";

// Auth
import { auth } from "@kononia/auth";

// Environment
import { env } from "@kononia/env/server"; // server-side
import { env } from "@kononia/env/web";   // client-side web
import { env } from "@kononia/env/native"; // React Native
```

## Database Conventions

- All tables use `text` for primary keys (UUIDs)
- Use `integer` for timestamps when appropriate
- JSON fields stored as `text` with JSON serialization
- Foreign keys use `text` referencing parent table PK
- Naming: snake_case for columns, PascalCase for tables

## tRPC Router Structure

```typescript
// Public procedures - no auth required
publicProcedure
  .input(z.object({ ... }))
  .query(async ({ input }) => { ... });

// Protected procedures - session required
protectedProcedure
  .input(z.object({ ... }))
  .mutation(async ({ ctx, input }) => { ... });
```

## Code Style Rules

- **TypeScript**: Strict mode, no `any`
- **React Components**: Server Components by default, client when needed (`"use client"`)
- **Tailwind**: Use CSS variables from globals.css (fast-strict, fast-regular, fast-feast)
- **No comments** unless explicitly requested
- **Tests**: Inline for simple functions, separate file for complex

## Design System - "Feast & Fast"

| Role | Color | Hex |
|------|-------|-----|
| Primary (Church) | Burgundy Wine | `#722F37` |
| Secondary (Fast) | Forest Green | `#4A7C59` |
| Background | Warm Cream | `#FDF8F3` |
| Text | Dark Roast | `#2D1F14` |
| Accent | Harvest Gold | `#C9A96E` |
| Card BG | Soft Ivory | `#FAF5ED` |
| Fast Strict | Green | `#4A7C59` |
| Fast Regular | Burgundy | `#722F37` |
| Fast Feast | Gold | `#C9A96E` |

**Fonts:**
- Headings: `Lora` (serif)
- Body: `DM Sans` (sans-serif)
- Accent: `Cormorant Garamond` (serif)

## Fasting Types

- `strict` - No meat, dairy, oil, wine (green in calendar)
- `regular` - No meat, dairy (burgundy in calendar)
- `feast` - Fast-free day (gold in calendar)

## PWA Requirements

- Service worker for offline fasting rules
- Manifest at `/favicon/site.webmanifest`
- Theme color: `#722F37`

## File Structure (Web)

```
apps/web/src/app/
├── (main)/           # Authenticated routes
│   ├── page.tsx      # Home dashboard
│   ├── calendar/
│   ├── meals/
│   ├── meal/[id]/
│   ├── snacks/
│   └── settings/
├── (auth)/           # Auth routes
│   ├── login/
│   ├── signup/
│   └── reset/
├── layout.tsx        # Root layout with fonts + metadata
└── page.tsx         # Landing/redirect
```

## File Structure (Native)

```
apps/native/app/
├── (drawer)/         # Drawer navigation
│   ├── (tabs)/       # Tab navigation
│   │   ├── index.tsx  # Home
│   │   ├── calendar.tsx
│   │   ├── meals.tsx
│   │   └── settings.tsx
│   └── _layout.tsx
├── meal/[id].tsx     # Meal detail
└── _layout.tsx       # Root layout
```

## Polar Payment Flow

1. User clicks "Upgrade to Annual" ($9.99/year)
2. Redirect to Polar checkout
3. Polar webhook → server updates user `plan` to `"annual"`
4. Frontend checks plan → unlocks features

## Running Commands

```bash
# Database
pnpm --filter @kononia/db db:generate  # Generate migrations
pnpm --filter @kononia/db db:migrate   # Run migrations

# Development
# Server runs on port 3000 (managed by user)
# Web runs on port 3001 (managed by user)
# Native uses Expo (managed by user)
```