import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { assertLead, type Role } from "@/modules/auth/roles";
import {
  CHURCH_ADMIN_EMAIL_KEY,
  validateChurchAdminEmail,
} from "./settings-rules";

export { SettingsValidationError } from "./settings-rules";

/** Reads a raw setting value by key, or null when unset. */
async function getSetting(key: string): Promise<string | null> {
  const row = await db.query.settings.findFirst({ where: eq(settings.key, key) });
  return row?.value ?? null;
}

/** Upserts a setting value by key. */
async function putSetting(key: string, value: string): Promise<void> {
  await db
    .insert(settings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: settings.key,
      set: { value, updatedAt: new Date() },
    });
}

/** The Church Admin email Restock Alerts are sent to, or null if unconfigured. */
export async function getChurchAdminEmail(): Promise<string | null> {
  return getSetting(CHURCH_ADMIN_EMAIL_KEY);
}

/** Sets the Church Admin email address. Lead-only. */
export async function setChurchAdminEmail(
  actorRole: Role | null | undefined,
  email: string,
): Promise<string> {
  assertLead(actorRole);
  const normalized = validateChurchAdminEmail(email);
  await putSetting(CHURCH_ADMIN_EMAIL_KEY, normalized);
  return normalized;
}
