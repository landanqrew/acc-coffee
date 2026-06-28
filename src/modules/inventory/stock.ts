import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { stockCounts, supplies } from "@/db/schema";
import { sendRestockAlert } from "@/lib/email";
import { getChurchAdminEmail } from "@/modules/settings/settings";
import {
  buildStockLevels,
  StockCountValidationError,
  validateStockCount,
  type StockCount,
  type StockCountSource,
  type StockLevel,
} from "./stock-rules";
import { decideRestockAlert, type RestockAlert } from "./restock-rules";

export type { StockCount, StockLevel, StockStatus } from "./stock-rules";
export { StockCountValidationError, stockStatus } from "./stock-rules";

export type RecordStockCountInput = {
  supplyId: string;
  count: number;
  recordedByUserId?: string | null;
  source?: StockCountSource;
  reportId?: string | null;
};

/**
 * Emails the configured Church Admin a Restock Alert. Best-effort: a missing
 * address or a send failure must never fail the underlying count, which is the
 * source of truth.
 */
async function dispatchRestockAlert(alert: RestockAlert): Promise<void> {
  try {
    const to = await getChurchAdminEmail();
    if (!to) return;
    await sendRestockAlert(to, alert);
  } catch (err) {
    console.error("Failed to send restock alert:", err);
  }
}

/**
 * Records an observed Stock Count for an active Supply. Any team member may do
 * this. Counts are append-only — recording a new one simply makes it the
 * current level (last-count-wins). Rejects counts against an unknown or retired
 * Supply.
 */
export async function recordStockCount(
  input: RecordStockCountInput,
): Promise<StockCount> {
  const count = validateStockCount(input.count);

  const supply = await db.query.supplies.findFirst({
    where: and(eq(supplies.id, input.supplyId), isNull(supplies.retiredAt)),
    columns: { id: true, name: true, minimumLevel: true },
  });
  if (!supply) {
    throw new StockCountValidationError("That supply isn't available to count.");
  }

  // The level before this count, to detect a fresh crossing below the minimum.
  const prev = await db.query.stockCounts.findFirst({
    where: eq(stockCounts.supplyId, input.supplyId),
    columns: { count: true },
    orderBy: [desc(stockCounts.countedAt), desc(stockCounts.id)],
  });
  const previousCount = prev?.count ?? null;

  const [row] = await db
    .insert(stockCounts)
    .values({
      supplyId: input.supplyId,
      count,
      source: input.source ?? "ad_hoc",
      recordedByUserId: input.recordedByUserId ?? null,
      reportId: input.reportId ?? null,
    })
    .returning();

  const alert = decideRestockAlert({ supply, previousCount, newCount: count });
  if (alert) await dispatchRestockAlert(alert);

  return row;
}

/**
 * The current stock picture for every active Supply — last-count-wins level,
 * low-stock flag, and when each was last counted.
 */
export async function getStockLevels(): Promise<StockLevel[]> {
  const activeSupplies = await db.query.supplies.findMany({
    where: isNull(supplies.retiredAt),
  });
  if (activeSupplies.length === 0) return [];

  const counts = await db.query.stockCounts.findMany({
    columns: { id: true, supplyId: true, count: true, countedAt: true },
    where: inArray(
      stockCounts.supplyId,
      activeSupplies.map((s) => s.id),
    ),
  });
  return buildStockLevels(activeSupplies, counts);
}
