# Invite-only magic-link auth with Lead/Volunteer roles

Team sign-in is passwordless: members request a one-time magic link by email
(Auth.js v5 + the Resend provider) and are granted a database-backed session.
Access is invite-only — an email can only sign in if it has an outstanding
invite, already belongs to a member, or matches the bootstrap configuration.

## Decisions

- **Auth.js (NextAuth v5) with the Drizzle adapter and database sessions.** The
  adapter owns `user` / `account` / `session` / `verificationToken`; we add a
  `role` column to `user` and an `invite` table. Database sessions let the
  `session` callback expose the user's role for authorization.
- **Invite-only gate, defense in depth.** The decision is a pure function
  (`decideSignIn`) tested in isolation, then enforced in three places: the
  sign-in action (won't request a link for an uninvited email), the provider's
  `sendVerificationRequest` (won't deliver a link to one), and the `signIn`
  callback (denies the session even if a link is somehow obtained). The
  "check your email" page is shown either way, so invite status never leaks.
- **First Lead bootstrapped by environment, not a seed.** `BOOTSTRAP_LEAD_EMAIL`
  may sign in with no invite and is made a Lead on first sign-in. Chosen over a
  seed script because the app is serverless (Vercel/Neon) with no convenient
  shell against production; an env var is the simplest day-one unlock.
- **Authorization close to the data.** A small DAL (`requireSession`,
  `requireLead`) gates pages and Server Actions, following the Next.js 16
  guidance to check at the data source rather than relying on the proxy
  (formerly middleware). Lead-only mutations (`createInvite`) independently
  assert the caller's role.

## Consequences

- Roles are `lead` | `volunteer` (see CONTEXT.md). New users default to
  Volunteer and are promoted via their invite or the bootstrap email.
- The `auth`, `email`, and Auth.js wiring are shallow glue and are not unit
  tested; the tested surface is the pure access logic (`decideSignIn`,
  `resolveInitialRole`) and the role guard (`assertLead`).
- Schema changes ship as Drizzle migrations under `drizzle/`; apply with
  `pnpm db:migrate`.
