"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/dal";
import { recordStockCount, StockCountValidationError } from "@/modules/inventory/stock";

export type CountState = { error?: string; ok?: string } | undefined;

/** Records an ad-hoc Stock Count. Any signed-in team member may do this. */
export async function recordCountAction(
  _prev: CountState,
  formData: FormData,
): Promise<CountState> {
  const user = await requireSession();
  const supplyId = String(formData.get("supplyId") ?? "");
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
    return { error: "Couldn't record the count. Please try again." };
  }
}
