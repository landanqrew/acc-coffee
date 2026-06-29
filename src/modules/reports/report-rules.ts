import {
  validateStockCount,
  StockCountValidationError,
} from "@/modules/inventory/stock-rules";

/**
 * The fixed v1 operational question set for a Service Report. Defined in code,
 * not Lead-editable (per PRD). These number answers are whole counts of pots;
 * `issues` is optional free text. (The per-Supply Stock Counts are validated
 * separately by `validateReportCounts` and may be fractional.)
 */
export type ReportQuestion = {
  id: string;
  label: string;
  kind: "number" | "text";
  required: boolean;
};

export const REPORT_QUESTIONS: readonly ReportQuestion[] = [
  { id: "mediumPots", label: "Medium roast brewed (pots)", kind: "number", required: true },
  { id: "darkPots", label: "Dark roast brewed (pots)", kind: "number", required: true },
  { id: "leftoverPots", label: "Left over at the end (pots)", kind: "number", required: true },
  { id: "issues", label: "Anything to flag? (optional)", kind: "text", required: false },
];

/** A filed-out answer set, keyed by question id. */
export type ReportAnswers = Record<string, number | string>;

/** A caller-facing problem with a Report submission. */
export class ReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReportValidationError";
  }
}

/**
 * Normalizes and validates the operational answers against the fixed question
 * set. Required numbers must be whole and zero-or-more; optional free text is
 * trimmed and omitted when blank. Unknown keys are ignored.
 */
export function validateAnswers(raw: Record<string, unknown>): ReportAnswers {
  const answers: ReportAnswers = {};
  for (const q of REPORT_QUESTIONS) {
    const value = raw[q.id];
    if (q.kind === "number") {
      const text = typeof value === "number" ? String(value) : String(value ?? "").trim();
      if (text === "") {
        throw new ReportValidationError(`"${q.label}" is required.`);
      }
      const n = Number(text);
      if (!Number.isInteger(n) || n < 0) {
        throw new ReportValidationError(`"${q.label}" must be a whole number of zero or more.`);
      }
      answers[q.id] = n;
    } else {
      const text = String(value ?? "").trim();
      if (q.required && text === "") {
        throw new ReportValidationError(`"${q.label}" is required.`);
      }
      if (text !== "") answers[q.id] = text;
    }
  }
  return answers;
}

/**
 * Validates that every designated Supply has a valid count and returns them as
 * an ordered list. The Report is the counting vehicle, so a missing count for
 * any designated Supply rejects the whole submission.
 */
export function validateReportCounts(
  designatedSupplyIds: readonly string[],
  rawCounts: Record<string, unknown>,
): { supplyId: string; count: number }[] {
  return designatedSupplyIds.map((supplyId) => {
    const raw = rawCounts[supplyId];
    if (raw === undefined || raw === null || String(raw).trim() === "") {
      throw new ReportValidationError("Every designated supply must be counted.");
    }
    const n = typeof raw === "number" ? raw : Number(String(raw).trim());
    try {
      return { supplyId, count: validateStockCount(n) };
    } catch (err) {
      if (err instanceof StockCountValidationError) {
        throw new ReportValidationError("Every count must be zero or more.");
      }
      throw err;
    }
  });
}

/** A validated, ready-to-persist Report: its answers plus the counts to record. */
export type ReportPlan = {
  answers: ReportAnswers;
  counts: { supplyId: string; count: number }[];
};

/**
 * Pure decision for filing a Report. Enforces the at-most-one-per-Service rule
 * and the "every designated Supply counted" rule, returning the persistable
 * plan. The DB glue executes it; keeping it pure makes the rules unit-testable.
 */
export function planReport(input: {
  existingReport: { id: string } | null;
  designatedSupplyIds: readonly string[];
  answers: Record<string, unknown>;
  counts: Record<string, unknown>;
}): ReportPlan {
  if (input.existingReport !== null) {
    throw new ReportValidationError("This service already has a report.");
  }
  const answers = validateAnswers(input.answers);
  const counts = validateReportCounts(input.designatedSupplyIds, input.counts);
  return { answers, counts };
}
