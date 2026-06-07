import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import type { AdapterUser } from "next-auth/adapters";
import { db } from "@/db";
import { accounts, sessions, users, verificationTokens } from "@/db/schema";
import { sendMagicLink } from "@/lib/email";
import {
  applyInitialRoleForNewUser,
  evaluateSignIn,
} from "@/modules/auth/invites";

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
      // apiKey / from are read lazily inside sendMagicLink (via the email
      // module), so importing this config never forces RESEND_API_KEY to be set
      // — only actually sending a link does.
      //
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
    // Expose the team role on the session for authorization checks. With the
    // database session strategy, `user` is the adapter user (augmented with
    // `role`), so no fallback is needed — the column is NOT NULL.
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = (user as AdapterUser).role;
      }
      return session;
    },
  },
  events: {
    // First sign-in: stamp the user's role from their invite / bootstrap config.
    // Events are fire-and-forget, so a failure here must not block sign-in — log
    // it (the role defaults to Volunteer) rather than letting it propagate.
    async createUser({ user }) {
      if (user.id && user.email) {
        try {
          await applyInitialRoleForNewUser(user.id, user.email);
        } catch (err) {
          console.error(
            `Failed to apply initial role for new user ${user.id} (${user.email}):`,
            err,
          );
        }
      }
    },
  },
});
