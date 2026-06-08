"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/dal";
import {
  fileReport,
  REPORT_QUESTIONS,
  ReportValidationError,
} from "@/modules/reports/report";

export type ReportFormState = { error?: string; ok?: string } | undefined;

export async function fileReportAction(
  _prev: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const user = await requireSession();
  const serviceId = String(formData.get("serviceId") ?? "");

  const answers: Record<string, unknown> = {};
  for (const q of REPORT_QUESTIONS) {
    answers[q.id] = formData.get(q.id);
  }

  // Counts arrive as count_<supplyId> fields; key them by supply id. fileReport
  // loads the designated Supplies and rejects any that are missing here.
  const counts: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("count_")) counts[key.slice("count_".length)] = value;
  }

  try {
    await fileReport({
      serviceId,
      filedByUserId: user.id,
      answers,
      counts,
    });
    revalidatePath(`/services/${serviceId}`);
    revalidatePath("/services");
    revalidatePath("/stock");
    return { ok: "Report filed." };
  } catch (err) {
    if (err instanceof ReportValidationError) return { error: err.message };
    console.error("Failed to file report:", err);
    return { error: "Couldn't file the report. Please try again." };
  }
}
