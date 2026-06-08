/**
 * Runbook content rules — the pure, DB-free core of the Runbook module. The
 * section set is fixed in code (a shallow CRUD module, per the PRD: no
 * Lead-defined sections, no workflow). Keep this file free of `@/db` imports so
 * it stays unit-testable without a database.
 */

/** A Runbook section id. The three sections are fixed in code. */
export type RunbookSectionId = "checklist" | "equipment" | "supply_locations";

/**
 * The three Runbook sections, in display order, with the reader-facing label and
 * a short hint shown to the editing Lead. UI copy uses these — see CONTEXT.md.
 */
export const RUNBOOK_SECTIONS: readonly {
  id: RunbookSectionId;
  label: string;
  description: string;
  placeholder: string;
}[] = [
  {
    id: "checklist",
    label: "Setup & teardown checklist",
    description: "The step-by-step list for opening and closing a service day.",
    placeholder: "1. Unlock the supply closet\n2. Start the first batch of regular\n3. …",
  },
  {
    id: "equipment",
    label: "Equipment reference",
    description: "How to run each machine, and what to do when one acts up.",
    placeholder: "## Brewer\nTo start a batch…\n\n**If it won't heat:** check…",
  },
  {
    id: "supply_locations",
    label: "Supply locations",
    description: "Where everything lives in the building.",
    placeholder: "- Backup filters: top shelf of the supply closet\n- Decaf: …",
  },
];

const SECTION_IDS = new Set<string>(RUNBOOK_SECTIONS.map((s) => s.id));

/** Largest section we accept; mirrors the database CHECK constraint. */
export const CONTENT_MAX = 20_000;

/** A caller-facing problem with Runbook input (unknown section or oversized content). */
export class RunbookValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RunbookValidationError";
  }
}

/** Narrows an arbitrary value to a known Runbook section id. */
export function isRunbookSectionId(value: unknown): value is RunbookSectionId {
  return typeof value === "string" && SECTION_IDS.has(value);
}

/** Validates a section id, throwing {@link RunbookValidationError} when unknown. */
export function parseSectionId(value: unknown): RunbookSectionId {
  if (!isRunbookSectionId(value)) {
    throw new RunbookValidationError("Unknown Runbook section.");
  }
  return value;
}

/**
 * Normalizes section content for storage: collapses CRLF and lone CR to LF and
 * trims trailing whitespace so an emptied editor stores as "". Empty content is
 * allowed — a blank section is valid. Rejects content past {@link CONTENT_MAX}.
 */
export function validateContent(raw: string): string {
  const content = raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\s+$/, "");
  if (content.length > CONTENT_MAX) {
    throw new RunbookValidationError(
      `Keep each section under ${CONTENT_MAX.toLocaleString()} characters.`,
    );
  }
  return content;
}
