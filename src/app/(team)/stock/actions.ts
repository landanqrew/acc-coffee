"use server";

import { revalidatePath } from "next/cache";
import { requireLead, requireSession } from "@/lib/dal";
import { failureMessage } from "@/lib/db-errors";
import { recordStockCount, StockCountValidationError } from "@/modules/inventory/stock";
import { setMinimumLevel, SupplyValidationError } from "@/modules/inventory/supply";

export type CountState = { error?: string; ok?: string } | undefined;

/** Records an ad-hoc Stock Count. Any signed-in team member may do this. */
export async function recordCountAction(
  _prev: CountState,
  formData: FormData,
): Promise<CountState> {
  const user = await requireSession();
  const supplyId = String(formData.get("supplyId") ?? "");
  if (!supplyId) return { error: "Pick a supply to count." };
  const raw = String(formData.get("count") ?? "").trim();
  if (raw === "") return { error: "Enter a count." };

  try {
    await recordStockCount({
      supplyId,
      count: Number(raw),
      recordedByUserId: user.id,
    });
    revalidatePath("/stock");
    return { ok: "Count recorded." };
  } catch (err) {
    if (err instanceof StockCountValidationError) return { error: err.message };
    console.error("Failed to record stock count:", err);
    return { error: failureMessage(err, "Couldn't record the count") };
  }
}

export type MinimumState = { error?: string; ok?: string } | undefined;

/** Sets a Supply's minimum level (Restock Alert threshold). Lead-only; blank clears it. */
export async function setMinimumLevelAction(
  _prev: MinimumState,
  formData: FormData,
): Promise<MinimumState> {
  const lead = await requireLead();
  const supplyId = String(formData.get("supplyId") ?? "");
  if (!supplyId) return { error: "Pick a supply." };
  const raw = String(formData.get("minimumLevel") ?? "").trim();

  try {
    await setMinimumLevel(lead.role, supplyId, raw === "" ? null : Number(raw));
    revalidatePath("/stock");
    revalidatePath("/supplies");
    return { ok: "Minimum saved." };
  } catch (err) {
    if (err instanceof SupplyValidationError) return { error: err.message };
    console.error("Failed to set minimum level:", err);
    return { error: failureMessage(err, "Couldn't save the minimum") };
  }
}
