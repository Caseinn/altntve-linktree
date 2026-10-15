# ALTNTVE

A single-site link hub: one public page, one admin dashboard, one Supabase
project behind both.

## Stack

- **Next.js 16** (App Router, `cacheComponents`, Turbopack) on React 19
- **Postgres** via **Drizzle ORM**
- **Supabase** for auth and for the two public-read Storage buckets
- **Tailwind v4** + shadcn primitives, **Phosphor** icons
- **Zod** for every form that crosses the server boundary

## Setup

```bash
pnpm install
pnpm prepare   # installs the git hook that runs `pnpm check`
```

### 1. Environment

```bash
cp .env.example .env.local
```

| Variable                               | Required          | Purpose                                                                       |
| -------------------------------------- | ----------------- | ----------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | yes               | Supabase project URL                                                          |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes               | Supabase publishable key                                                      |
| `NEXT_PUBLIC_SITE_URL`                 | yes in production | Canonical origin for metadata, `rel=canonical`, and the sitemap               |
| `DATABASE_URL`                         | yes               | Postgres **direct** connection (port 5432), not the transaction pooler (6543) |
| `ADMIN_EMAILS`                         | yes               | Comma-separated. Only these addresses may reach `/dashboard`                  |
| `DATABASE_POOL_MAX`                    | no                | Connection pool ceiling, default 10                                           |
| `DATABASE_IDLE_TIMEOUT_MS`             | no                | Pool idle timeout, default 30000                                              |

`NEXT_PUBLIC_SITE_URL` is deliberately **not** defaulted to localhost outside
development: a production build that is missing it fails immediately rather than
quietly publishing canonical URLs and share previews that point at
`http://localhost:3000`.

### 2. Database

There are no committed migration files; the schema in `src/db/schema.ts` is the
source of truth and is applied directly.

```bash
pnpm db:push
```

`db:push` talks to the URL in `DATABASE_URL`, so point it at your development
database first.

### 3. Supabase Storage

Two **public-read** buckets are required:

| Bucket       | Keys                                           | Written by              |
| ------------ | ---------------------------------------------- | ----------------------- |
| `avatar`     | `site.webp`, `site-icon.png`, `site-apple.png` | `src/lib/avatar.ts`     |
| `background` | `background.avif`, `background.webp`           | `src/lib/background.ts` |

Keys are fixed, so every upload overwrites the last one. Both pipelines append a
`?v=<timestamp>` query to the stored URL to defeat CDN caching.

### 4. First admin

Create a user in Supabase (Authentication → Users), then list its address in
`ADMIN_EMAILS`. Sign-in succeeds only for a listed address, and every mutation
action re-checks the address server-side — the proxy redirect is UX, not the
security boundary.

## Commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # serve the production build
pnpm check        # format:check + lint + typecheck
pnpm db:studio    # browse the database
```

### A note on `pnpm start`

Cookie `Secure` flags are derived from the incoming request, not from
`NODE_ENV`. A production build served over plain HTTP therefore signs in
normally. Behind a TLS-terminating load balancer, `x-forwarded-proto` is what
decides, so the cookies stay `Secure` in production.

## Layout

```
src/
  app/          routes, server actions, metadata
  components/   UI; ui/ holds vendored shadcn primitives
  config/       brand constants and link taxonomy
  db/           Drizzle schema and pool
  lib/          queries, schemas, auth, storage pipelines
  proxy.ts      Supabase session refresh and route guards
```

`src/lib/schemas.ts` is the single validation boundary for every Server Action.
`src/lib/upload.ts` holds the shared image-upload rules; the avatar and
background pipelines in `src/lib/avatar.ts` and `src/lib/background.ts` supply
only their own encoding and keys.
