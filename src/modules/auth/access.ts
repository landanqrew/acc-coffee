import type { Role } from "./roles";

/** Canonical form for comparing email addresses (case- and whitespace-insensitive). */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export type Invite = { email: string; role: Role };

export type SignInContext = {
  email: string;
  /** An outstanding invite matching this email, if any. */
  invite: Invite | null;
  /** Whether this email already belongs to a team member. */
  isExistingUser: boolean;
  /** The configured first-Lead email, allowed to sign in with no invite. */
  bootstrapEmail?: string | null;
};

export type SignInDecision = { allowed: boolean; role?: Role };

export function isBootstrapEmail(email: string, bootstrapEmail?: string | null): boolean {
  if (!bootstrapEmail) return false;
  return normalizeEmail(email) === normalizeEmail(bootstrapEmail);
}

/**
 * Decides whether an email may sign in (invite-only access). Existing members
 * always may; the configured first Lead bootstraps with no invite; everyone
 * else needs an outstanding invite. Uninvited strangers are denied.
 */
export function decideSignIn(ctx: SignInContext): SignInDecision {
  if (ctx.isExistingUser) {
    return { allowed: true };
  }
  if (isBootstrapEmail(ctx.email, ctx.bootstrapEmail)) {
    return { allowed: true, role: "lead" };
  }
  if (ctx.invite) {
    return { allowed: true, role: ctx.invite.role };
  }
  return { allowed: false };
}

/** The role a brand-new user should be created with on their first sign-in. */
export function resolveInitialRole(ctx: {
  email: string;
  invite: Invite | null;
  bootstrapEmail?: string | null;
}): Role {
  if (isBootstrapEmail(ctx.email, ctx.bootstrapEmail)) {
    return "lead";
  }
  if (ctx.invite) {
    return ctx.invite.role;
  }
  return "volunteer";
}
