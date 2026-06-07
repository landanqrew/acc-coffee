"use server";

import { revalidatePath } from "next/cache";
import { requireLead } from "@/lib/dal";
import {
  createSupply,
  retireSupply,
  SupplyValidationError,
  updateSupply,
} from "@/modules/inventory/supply";

export type SupplyFormState = { error?: string; ok?: string } | undefined;

/** Parses the shared Supply form fields (name, designated checkbox, minimum). */
function readSupplyForm(formData: FormData) {
  const name = String(formData.get("name") ?? "");
  const designated = formData.get("designated") === "on";
  const rawMinimum = String(formData.get("minimumLevel") ?? "").trim();
  const minimumLevel = rawMinimum === "" ? null : Number(rawMinimum);
  return { name, designated, minimumLevel };
}

export async function createSupplyAction(
  _prev: SupplyFormState,
  formData: FormData,
): Promise<SupplyFormState> {
  const lead = await requireLead();
  try {
    const supply = await createSupply(lead.role, readSupplyForm(formData));
    revalidatePath("/supplies");
    return { ok: `Added ${supply.name}.` };
  } catch (err) {
    if (err instanceof SupplyValidationError) return { error: err.message };
    console.error("Failed to create supply:", err);
    return { error: "Couldn't save the supply. Please try again." };
  }
}

export async function updateSupplyAction(
  _prev: SupplyFormState,
  formData: FormData,
): Promise<SupplyFormState> {
  const lead = await requireLead();
  const id = String(formData.get("id") ?? "");
  try {
    const supply = await updateSupply(lead.role, id, readSupplyForm(formData));
    revalidatePath("/supplies");
    return { ok: `Saved ${supply.name}.` };
  } catch (err) {
    if (err instanceof SupplyValidationError) return { error: err.message };
    console.error("Failed to update supply:", err);
    return { error: "Couldn't save the supply. Please try again." };
  }
}

export async function retireSupplyAction(formData: FormData): Promise<void> {
  const lead = await requireLead();
  try {
    await retireSupply(lead.role, String(formData.get("id") ?? ""));
  } catch (err) {
    // A stale retire (already retired / removed) is a no-op; log and move on.
    console.error("Failed to retire supply:", err);
  }
  revalidatePath("/supplies");
}
