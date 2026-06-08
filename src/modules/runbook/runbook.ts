import { db } from "@/db";
import { runbookSections } from "@/db/schema";
import { assertLead, type Role } from "@/modules/auth/roles";
import {
  parseSectionId,
  RUNBOOK_SECTIONS,
  validateContent,
  type RunbookSectionId,
} from "./runbook-rules";

export { RUNBOOK_SECTIONS, RunbookValidationError } from "./runbook-rules";
export type { RunbookSectionId } from "./runbook-rules";

/** One Runbook section's stored content plus when it was last edited. */
export type RunbookSection = {
  id: RunbookSectionId;
  content: string;
  updatedAt: Date | null;
};

/**
 * Reads all three Runbook sections in display order. A section that has never
 * been edited comes back with empty content and a null timestamp.
 */
export async function getRunbook(): Promise<RunbookSection[]> {
  const rows = await db.query.runbookSections.findMany();
  const byId = new Map(rows.map((r) => [r.section, r]));
  return RUNBOOK_SECTIONS.map((s) => {
    const row = byId.get(s.id);
    return {
      id: s.id,
      content: row?.content ?? "",
      updatedAt: row?.updatedAt ?? null,
    };
  });
}

/**
 * Upserts one Runbook section's content. Lead-only. Returns the stored content.
 */
export async function setRunbookSection(
  actorRole: Role | null | undefined,
  actorId: string,
  rawSection: string,
  rawContent: string,
): Promise<string> {
  assertLead(actorRole);
  const section = parseSectionId(rawSection);
  const content = validateContent(rawContent);
  await db
    .insert(runbookSections)
    .values({ section, content, updatedByUserId: actorId, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: runbookSections.section,
      set: { content, updatedByUserId: actorId, updatedAt: new Date() },
    });
  return content;
}
