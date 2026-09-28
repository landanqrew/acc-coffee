import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { stockCounts, supplies } from "@/db/schema";
import { sendRestockAlert } from "@/lib/email";
import { getChurchAdminEmail } from "@/modules/settings/settings";
import {
  buildStockLevels,
  latestCount,
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
export async function dispatchRestockAlert(alert: RestockAlert): Promise<void> {
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
 * Each Supply's current (last-count-wins) count, keyed by Supply id. Supplies
 * that have never been counted are absent.
 */
export async function getCurrentCounts(
  supplyIds: readonly string[],
): Promise<Map<string, number>> {
  if (supplyIds.length === 0) return new Map();
  const counts = await db.query.stockCounts.findMany({
    columns: { id: true, supplyId: true, count: true, countedAt: true },
    where: inArray(stockCounts.supplyId, [...supplyIds]),
  });
  const current = new Map<string, number>();
  for (const supplyId of supplyIds) {
    const latest = latestCount(counts.filter((c) => c.supplyId === supplyId));
    if (latest) current.set(supplyId, latest.count);
  }
  return current;
}

/** A Service Report's Stock Count corrected in place (see ADR-0001's amendment). */
export type CountCorrection = {
  countId: string;
  supplyId: string;
  previousCount: number;
  newCount: number;
};

/**
 * Sends Restock Alerts for Report count corrections once they have committed.
 * A correction alerts only when its row is still the Supply's current level
 * (a later count wins) and it newly crosses below an active Supply's minimum.
 */
export async function alertOnCorrectedCounts(
  corrections: readonly CountCorrection[],
): Promise<void> {
  if (corrections.length === 0) return;
  const supplyIds = corrections.map((c) => c.supplyId);
  const [counts, supplyRows] = await Promise.all([
    db.query.stockCounts.findMany({
      columns: { id: true, supplyId: true, count: true, countedAt: true },
      where: inArray(stockCounts.supplyId, supplyIds),
    }),
    db.query.supplies.findMany({
      columns: { id: true, name: true, minimumLevel: true },
      where: and(inArray(supplies.id, supplyIds), isNull(supplies.retiredAt)),
    }),
  ]);
  const supplyById = new Map(supplyRows.map((s) => [s.id, s]));

  const alerts = corrections.flatMap((c) => {
    const supply = supplyById.get(c.supplyId);
    const latest = latestCount(counts.filter((x) => x.supplyId === c.supplyId));
    if (!supply || latest?.id !== c.countId) return [];
    const alert = decideRestockAlert({
      supply,
      previousCount: c.previousCount,
      newCount: c.newCount,
    });
    return alert ? [alert] : [];
  });
  await Promise.all(alerts.map(dispatchRestockAlert));
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
