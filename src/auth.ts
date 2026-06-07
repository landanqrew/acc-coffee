import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { requireEnv } from "@/lib/env";
import { sendMagicLink } from "@/lib/email";
import {
  applyInitialRoleForNewUser,
  evaluateSignIn,
} from "@/modules/auth/invites";
import type { Role } from "@/modules/auth/roles";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  session: { strategy: "database" },
  pages: {
    signIn: "/signin",
    verifyRequest: "/signin/check-email",
    error: "/signin",
  },
  providers: [
    Resend({
      apiKey: requireEnv("RESEND_API_KEY"),
      from: requireEnv("EMAIL_FROM"),
      // Route magic links through our email module, and refuse to deliver a
      // working link to an address that isn't invited (defense in depth — the
      // sign-in action also gates, and `signIn` below denies access on click).
      async sendVerificationRequest({ identifier, url }) {
        const { allowed } = await evaluateSignIn(identifier);
        if (!allowed) return;
        await sendMagicLink(identifier, url);
      },
    }),
  ],
  callbacks: {
    // Invite-only gate: only invited, bootstrap, or existing emails get in.
    async signIn({ user }) {
      if (!user.email) return false;
      const { allowed } = await evaluateSignIn(user.email);
      return allowed;
    },
    // Expose the team role on the session for authorization checks.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as { role?: Role }).role ?? "volunteer";
      }
      return session;
    },
  },
  events: {
    // First sign-in: stamp the user's role from their invite / bootstrap config.
    async createUser({ user }) {
      if (user.id && user.email) {
        await applyInitialRoleForNewUser(user.id, user.email);
      }
    },
  },
});
