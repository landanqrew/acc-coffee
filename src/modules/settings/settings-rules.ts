/** The settings key holding the Church Admin's Restock Alert email address. */
export const CHURCH_ADMIN_EMAIL_KEY = "church_admin_email";

/** A caller-facing problem with a settings value (e.g. a malformed email). */
export class SettingsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettingsValidationError";
  }
}

// Deliberately permissive: a single "@" with a dotted domain and no spaces. The
// real check is whether the address actually receives the alert.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Normalizes and validates the Church Admin email address. */
export function validateChurchAdminEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!email) {
    throw new SettingsValidationError("An email address is required.");
  }
  if (!EMAIL_RE.test(email)) {
    throw new SettingsValidationError("Enter a valid email address.");
  }
  return email;
}
