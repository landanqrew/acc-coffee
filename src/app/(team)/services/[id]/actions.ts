"use server";

import { revalidatePath } from "next/cache";
import { requireLead, requireSession } from "@/lib/dal";
import {
  fileReport,
  REPORT_QUESTIONS,
  ReportValidationError,
} from "@/modules/reports/report";
import { BrewValidationError, setBrewQuantities } from "@/modules/services/brew";

export type BrewFormState = { error?: string; ok?: string } | undefined;

export async function setBrewQuantitiesAction(
  _prev: BrewFormState,
  formData: FormData,
): Promise<BrewFormState> {
  const lead = await requireLead();
  const rawServiceId = formData.get("serviceId");
  const serviceId = typeof rawServiceId === "string" ? rawServiceId.trim() : "";
  if (!serviceId) return { error: "Invalid service." };
  try {
    await setBrewQuantities(lead.role, {
      serviceId,
      mediumPots: formData.get("mediumPots"),
      darkPots: formData.get("darkPots"),
      updatedByUserId: lead.id,
    });
    revalidatePath(`/services/${serviceId}`);
    // Services is the home now and surfaces today's brew quantities, so refresh
    // it (the old /dashboard route is retired).
    revalidatePath("/services");
    return { ok: "Brew quantities saved." };
  } catch (err) {
    if (err instanceof BrewValidationError) return { error: err.message };
    console.error("Failed to set brew quantities:", err);
    return { error: "Couldn't save the quantities. Please try again." };
  }
}

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
