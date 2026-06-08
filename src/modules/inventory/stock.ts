import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { stockCounts, supplies } from "@/db/schema";
import {
  buildStockLevels,
  StockCountValidationError,
  validateStockCount,
  type StockCount,
  type StockCountSource,
  type StockLevel,
} from "./stock-rules";

export type { StockCount, StockLevel } from "./stock-rules";
export { StockCountValidationError } from "./stock-rules";

export type RecordStockCountInput = {
  supplyId: string;
  count: number;
  recordedByUserId?: string | null;
  source?: StockCountSource;
};

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
    columns: { id: true },
  });
  if (!supply) {
    throw new StockCountValidationError("That supply isn't available to count.");
  }

  const [row] = await db
    .insert(stockCounts)
    .values({
      supplyId: input.supplyId,
      count,
      source: input.source ?? "ad_hoc",
      recordedByUserId: input.recordedByUserId ?? null,
    })
    .returning();
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
