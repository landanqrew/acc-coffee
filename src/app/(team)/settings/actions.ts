"use server";

import { revalidatePath } from "next/cache";
import { requireLead } from "@/lib/dal";
import {
  setChurchAdminEmail,
  SettingsValidationError,
} from "@/modules/settings/settings";

export type SettingsFormState = { error?: string; ok?: string } | undefined;

export async function setChurchAdminAction(
  _prev: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  const lead = await requireLead();
  try {
    const email = await setChurchAdminEmail(
      lead.role,
      String(formData.get("email") ?? ""),
    );
    revalidatePath("/settings");
    return { ok: `Restock alerts will go to ${email}.` };
  } catch (err) {
    if (err instanceof SettingsValidationError) return { error: err.message };
    console.error("Failed to set church admin email:", err);
    return { error: "Couldn't save the address. Please try again." };
  }
}
