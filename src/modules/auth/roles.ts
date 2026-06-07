/**
 * The two team roles. A Lead manages Supplies, brew quantities, and the Runbook;
 * a Volunteer files Service Reports and Stock Counts. See CONTEXT.md.
 */
export type Role = "lead" | "volunteer";

export const ROLES: readonly Role[] = ["lead", "volunteer"] as const;

export function isRole(value: unknown): value is Role {
  return value === "lead" || value === "volunteer";
}

export function isLead(role: Role | null | undefined): boolean {
  return role === "lead";
}

/** Thrown when a caller attempts an action their role does not permit. */
export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Guards a Lead-only action; throws {@link ForbiddenError} for anyone else. */
export function assertLead(role: Role | null | undefined): void {
  if (!isLead(role)) {
    throw new ForbiddenError("This action requires a Lead.");
  }
}
