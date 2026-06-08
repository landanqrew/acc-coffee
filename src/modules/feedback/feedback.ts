import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { feedback } from "@/db/schema";
import { getTodaysServices } from "@/modules/services/service";
import {
  aggregateFeedback,
  validateFeedback,
  type FeedbackSummary,
} from "./feedback-rules";

export { FeedbackValidationError } from "./feedback-rules";
export { FEEDBACK_RATINGS, RATING_MIN, RATING_MAX } from "./feedback-rules";
export type { FeedbackSummary } from "./feedback-rules";

/**
 * Persists an anonymous Feedback Survey response. Validates the submission
 * against today's Services first — so attribution is always to a real Service
 * happening today, and submissions are declined when there are none. No auth:
 * this is the congregant-facing path.
 */
export async function submitFeedback(input: {
  serviceId: unknown;
  ratings: Record<string, unknown>;
  comment?: unknown;
}): Promise<void> {
  const todays = await getTodaysServices();
  const v = validateFeedback({
    serviceId: input.serviceId,
    ratings: input.ratings,
    comment: input.comment,
    todaysServiceIds: todays.map((s) => s.id),
  });
  await db.insert(feedback).values({
    serviceId: v.serviceId,
    taste: v.taste,
    temperature: v.temperature,
    variety: v.variety,
    comment: v.comment,
  });
}

/** The aggregated Feedback for a Service (averages, count, comments) for the team view. */
export async function getFeedbackSummary(serviceId: string): Promise<FeedbackSummary> {
  const rows = await db.query.feedback.findMany({
    where: eq(feedback.serviceId, serviceId),
    columns: { taste: true, temperature: true, variety: true, comment: true },
    orderBy: [asc(feedback.createdAt)],
  });
  return aggregateFeedback(rows);
}
