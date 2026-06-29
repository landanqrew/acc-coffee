import { eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { invites, users } from "@/db/schema";
import { sendInviteEmail } from "@/lib/email";
import {
  decideSignIn,
  normalizeEmail,
  resolveInitialRole,
  type Invite,
  type SignInDecision,
} from "./access";
import { assertLead, isRole, type Role } from "./roles";

/** Validates a role value read from the database rather than trusting it blindly. */
function coerceRole(value: string, context: string): Role {
  if (!isRole(value)) {
    throw new Error(`Invalid role "${value}" in database (${context}).`);
  }
  return value;
}

/** A caller-facing problem with an invite (e.g. the email is already a member). */
export class InviteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InviteError";
  }
}

/** The configured first-Lead email, allowed to sign in before any invite exists. */
function bootstrapEmail(): string | null {
  return process.env.BOOTSTRAP_LEAD_EMAIL ?? null;
}

/** The outstanding (un-accepted) invite for an email, if any. */
export async function getInvite(email: string): Promise<Invite | null> {
  const normalized = normalizeEmail(email);
  const row = await db.query.invites.findFirst({
    where: eq(invites.email, normalized),
  });
  if (!row || row.acceptedAt) return null;
  return { email: row.email, role: row.role };
}

/** Whether an email already belongs to a team member. */
export async function isExistingUser(email: string): Promise<boolean> {
  const normalized = normalizeEmail(email);
  const row = await db.query.users.findFirst({
    where: eq(users.email, normalized),
    columns: { id: true },
  });
  return Boolean(row);
}

/** Resolves invite-only access for an email against the database + bootstrap config. */
export async function evaluateSignIn(email: string): Promise<SignInDecision> {
  const [invite, existing] = await Promise.all([
    getInvite(email),
    isExistingUser(email),
  ]);
  return decideSignIn({
    email,
    invite,
    isExistingUser: existing,
    bootstrapEmail: bootstrapEmail(),
  });
}

export type CreateInviteInput = {
  email: string;
  role: Role;
  /** Role of the caller — must be a Lead. */
  invitedByRole: Role | null | undefined;
  invitedByUserId?: string | null;
  /** Absolute URL of the sign-in page, included in the invitation email. */
  signInUrl: string;
};

/**
 * Invites a team member by email with a role. Lead-only. Re-inviting a pending
 * email replaces the outstanding invite (latest wins). Inviting someone who is
 * already a member is rejected — changing an existing member's role is a
 * separate concern not in this slice.
 *
 * The invitation email is sent before the invite is persisted, so a delivery
 * failure surfaces to the caller and leaves no un-notified pending invite.
 */
export async function createInvite(input: CreateInviteInput): Promise<Invite> {
  assertLead(input.invitedByRole);
  const email = normalizeEmail(input.email);
  if (await isExistingUser(email)) {
    throw new InviteError(`${email} is already a team member.`);
  }
  await sendInviteEmail(email, input.role, input.signInUrl);
  await db
    .insert(invites)
    .values({
      email,
      role: input.role,
      invitedByUserId: input.invitedByUserId ?? null,
    })
    .onConflictDoUpdate({
      target: invites.email,
      set: {
        role: input.role,
        invitedByUserId: input.invitedByUserId ?? null,
        acceptedAt: null,
        // Refresh createdAt so the pending-invite list reflects the latest send.
        createdAt: new Date(),
      },
    });
  return { email, role: input.role };
}

/**
 * Applies the correct role to a freshly-created user (from their invite or the
 * bootstrap config) and marks any matching invite accepted. Called once, on
 * first sign-in.
 */
export async function applyInitialRoleForNewUser(
  userId: string,
  email: string,
): Promise<Role> {
  const invite = await getInvite(email);
  const role = resolveInitialRole({
    email,
    invite,
    bootstrapEmail: bootstrapEmail(),
  });
  await db.update(users).set({ role }).where(eq(users.id, userId));
  await db
    .update(invites)
    .set({ acceptedAt: new Date() })
    .where(eq(invites.email, normalizeEmail(email)));
  return role;
}

export type TeamMember = { id: string; email: string | null; name: string | null; role: Role };

/** All current team members, for the team-management view. */
export async function listMembers(): Promise<TeamMember[]> {
  const rows = await db.query.users.findMany({
    columns: { id: true, email: true, name: true, role: true },
  });
  return rows.map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    role: coerceRole(r.role, `user ${r.id}`),
  }));
}

export type PendingInvite = { email: string; role: Role; createdAt: Date };

/** Outstanding invites that have not yet been accepted. */
export async function listPendingInvites(): Promise<PendingInvite[]> {
  const rows = await db.query.invites.findMany({
    columns: { email: true, role: true, createdAt: true },
    where: isNull(invites.acceptedAt),
  });
  return rows.map((r) => ({
    email: r.email,
    role: coerceRole(r.role, `invite ${r.email}`),
    createdAt: r.createdAt,
  }));
}
