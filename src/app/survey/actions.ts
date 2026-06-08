"use server";

import {
  FEEDBACK_RATINGS,
  FeedbackValidationError,
  submitFeedback,
} from "@/modules/feedback/feedback";

export type SurveyFormState = { error?: string; ok?: boolean } | undefined;

/**
 * Public, unauthenticated handler for the congregant Feedback Survey. Attribution
 * and "no service today" rules live in submitFeedback / the pure validator.
 */
export async function submitFeedbackAction(
  _prev: SurveyFormState,
  formData: FormData,
): Promise<SurveyFormState> {
  const ratings: Record<string, unknown> = {};
  for (const r of FEEDBACK_RATINGS) ratings[r.id] = formData.get(r.id);

  try {
    await submitFeedback({
      serviceId: formData.get("serviceId"),
      ratings,
      comment: formData.get("comment"),
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof FeedbackValidationError) return { error: err.message };
    console.error("Failed to submit feedback:", err);
    return { error: "Sorry, something went wrong. Please try again." };
  }
}
