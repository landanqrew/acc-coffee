"use server";

import { revalidatePath } from "next/cache";
import { requireLead } from "@/lib/dal";
import {
  addScheduleEntry,
  createAdHocService,
  removeScheduleEntry,
  ServiceValidationError,
} from "@/modules/services/service";

export type ServiceFormState = { error?: string; ok?: string } | undefined;

export async function addScheduleAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const lead = await requireLead();
  try {
    const entry = await addScheduleEntry(lead.role, {
      name: String(formData.get("name") ?? ""),
      weekday: Number(formData.get("weekday")),
      time: String(formData.get("time") ?? ""),
    });
    revalidatePath("/services");
    return { ok: `Added ${entry.name}.` };
  } catch (err) {
    if (err instanceof ServiceValidationError) return { error: err.message };
    console.error("Failed to add schedule entry:", err);
    return { error: "Couldn't save the gathering. Please try again." };
  }
}

export async function removeScheduleAction(formData: FormData): Promise<void> {
  const lead = await requireLead();
  try {
    await removeScheduleEntry(lead.role, String(formData.get("id") ?? ""));
  } catch (err) {
    console.error("Failed to remove schedule entry:", err);
  }
  revalidatePath("/services");
}

export async function createAdHocAction(
  _prev: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const lead = await requireLead();
  try {
    const service = await createAdHocService(lead.role, {
      name: String(formData.get("name") ?? ""),
      date: String(formData.get("date") ?? ""),
      time: String(formData.get("time") ?? ""),
    });
    revalidatePath("/services");
    return { ok: `Added ${service.name}.` };
  } catch (err) {
    if (err instanceof ServiceValidationError) return { error: err.message };
    console.error("Failed to create ad-hoc service:", err);
    return { error: "Couldn't create the service. Please try again." };
  }
}
