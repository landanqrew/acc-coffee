/**
 * The fixed Feedback Survey rating set — coffee quality as a congregant
 * experiences it (see CONTEXT.md). Defined in code, not Lead-editable, each
 * scored 1–5. Kept short so the survey takes under a minute.
 */
export type FeedbackRating = { id: "taste" | "temperature" | "variety"; label: string };

export const FEEDBACK_RATINGS: readonly FeedbackRating[] = [
  { id: "taste", label: "Taste" },
  { id: "temperature", label: "Temperature" },
  { id: "variety", label: "Variety" },
];

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/** Longest comment we store — generous for a sentence or two, bounded for safety. */
export const COMMENT_MAX = 1000;

/** A caller-facing problem with a Feedback Survey submission. */
export class FeedbackValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FeedbackValidationError";
  }
}

/** A validated, ready-to-persist Feedback response. */
export type FeedbackInput = {
  serviceId: string;
  taste: number;
  temperature: number;
  variety: number;
  comment: string | null;
};

function parseRating(value: unknown, label: string): number {
  const text = typeof value === "number" ? String(value) : String(value ?? "").trim();
  if (text === "") {
    throw new FeedbackValidationError(`Please rate ${label.toLowerCase()}.`);
  }
  // Plain digits only — rejects decimals, scientific notation, and negatives.
  const n = /^\d+$/.test(text) ? Number(text) : NaN;
  if (!Number.isInteger(n) || n < RATING_MIN || n > RATING_MAX) {
    throw new FeedbackValidationError(
      `${label} must be a rating from ${RATING_MIN} to ${RATING_MAX}.`,
    );
  }
  return n;
}

/**
 * Validates an anonymous Feedback submission. Attribution is by selection (per
 * PRD): the chosen Service must be one of today's, which also means submissions
 * are declined outright when nothing is happening today (empty list). Every
 * rating is required and in range; the comment is optional and trimmed.
 */
export function validateFeedback(input: {
  serviceId: unknown;
  ratings: Record<string, unknown>;
  comment?: unknown;
  todaysServiceIds: readonly string[];
}): FeedbackInput {
  if (input.todaysServiceIds.length === 0) {
    throw new FeedbackValidationError("There are no services today to give feedback on.");
  }
  const serviceId = typeof input.serviceId === "string" ? input.serviceId.trim() : "";
  if (!serviceId) {
    throw new FeedbackValidationError("Please pick which service you attended.");
  }
  if (!input.todaysServiceIds.includes(serviceId)) {
    throw new FeedbackValidationError("Please pick one of today's services.");
  }

  const taste = parseRating(input.ratings.taste, "Taste");
  const temperature = parseRating(input.ratings.temperature, "Temperature");
  const variety = parseRating(input.ratings.variety, "Variety");

  const commentText = String(input.comment ?? "").trim();
  if (commentText.length > COMMENT_MAX) {
    throw new FeedbackValidationError("That comment is too long.");
  }

  return {
    serviceId,
    taste,
    temperature,
    variety,
    comment: commentText === "" ? null : commentText,
  };
}

/** A stored Feedback response, as aggregation sees it. */
export type FeedbackRow = {
  taste: number;
  temperature: number;
  variety: number;
  comment: string | null;
};

/** Average rating per question. Null overall when there are no responses. */
export type FeedbackAverages = { taste: number; temperature: number; variety: number };

/** The team-facing roll-up of a Service's feedback, shown beside its Report. */
export type FeedbackSummary = {
  responseCount: number;
  averages: FeedbackAverages | null;
  comments: string[];
};

function average(values: readonly number[]): number {
  const sum = values.reduce((acc, v) => acc + v, 0);
  // One decimal place — enough resolution without implying false precision.
  return Math.round((sum / values.length) * 10) / 10;
}

/**
 * Rolls up a Service's Feedback responses: per-rating averages, the response
 * count, and the non-empty comments in submission order. Returns an empty
 * summary (null averages) when nothing has been submitted.
 */
export function aggregateFeedback(rows: readonly FeedbackRow[]): FeedbackSummary {
  if (rows.length === 0) {
    return { responseCount: 0, averages: null, comments: [] };
  }
  return {
    responseCount: rows.length,
    averages: {
      taste: average(rows.map((r) => r.taste)),
      temperature: average(rows.map((r) => r.temperature)),
      variety: average(rows.map((r) => r.variety)),
    },
    comments: rows
      .map((r) => r.comment)
      .filter((c): c is string => c !== null && c.trim() !== ""),
  };
}
