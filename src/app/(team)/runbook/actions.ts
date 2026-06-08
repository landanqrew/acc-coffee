"use server";

import { revalidatePath } from "next/cache";
import { requireLead } from "@/lib/dal";
import {
  RunbookValidationError,
  setRunbookSection,
} from "@/modules/runbook/runbook";

export type RunbookFormState = { error?: string; ok?: string } | undefined;

export async function saveRunbookSectionAction(
  _prev: RunbookFormState,
  formData: FormData,
): Promise<RunbookFormState> {
  const lead = await requireLead();
  try {
    await setRunbookSection(
      lead.role,
      lead.id,
      String(formData.get("section") ?? ""),
      String(formData.get("content") ?? ""),
    );
    revalidatePath("/runbook");
    return { ok: "Saved." };
  } catch (err) {
    if (err instanceof RunbookValidationError) return { error: err.message };
    console.error("Failed to save Runbook section:", err);
    return { error: "Couldn't save. Please try again." };
  }
}
