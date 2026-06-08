# acc-coffee

A basic application for managing the coffee-associated processes for Antioch Community Church in CSTAT.

Mobile-first web app for the coffee team: inventory via Stock Counts on Service Reports, a service-day Runbook, brew guidance, and an anonymous congregant Feedback Survey. Domain language lives in [CONTEXT.md](./CONTEXT.md); architectural decisions in [docs/adr/](./docs/adr/).

## Stack

Next.js (TypeScript, App Router) · Neon Postgres via Drizzle · Auth.js magic links · Resend email · Vercel

## Environment variables

Copy `.env.example` to `.env` and fill in every value. **All of these must also be set in Vercel** — a deploy with any of them missing fails at runtime, not at build:

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Neon pooled connection string |
| `RESEND_API_KEY` | Resend API key (magic links + Restock Alerts) |
| `EMAIL_FROM` | From address on a Resend-verified domain |
| `TEST_EMAIL_SECRET` | Shared secret for the walking-skeleton `/api/test-email` route |
| `AUTH_SECRET` | Auth.js signing secret — `openssl rand -base64 32` |
| `BOOTSTRAP_LEAD_EMAIL` | Email allowed to sign in with no invite; becomes the first Lead |
| `AUTH_URL` | Canonical URL for magic-link callbacks. Not needed on Vercel; set it when running a production build elsewhere |

## Development

```sh
pnpm install
pnpm dev          # dev server
pnpm test         # module tests (Vitest)
pnpm typecheck && pnpm lint
```

## Database migrations

Schema lives in `src/db/schema.ts`; migrations in `drizzle/`.

```sh
pnpm db:generate  # generate a migration after editing the schema
pnpm db:migrate   # apply pending migrations to DATABASE_URL
```

`pnpm build` runs pending migrations before building, so Vercel deploys migrate the database automatically.
