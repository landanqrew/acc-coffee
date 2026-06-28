import type { Supply } from "./supply-rules";

/** An observed count for a Supply. The latest by `countedAt` is current. */
export type StockCount = {
  id: string;
  supplyId: string;
  count: number;
  countedAt: Date;
};

export type StockCountSource = "ad_hoc" | "service_report";

/** A caller-facing problem with a Stock Count (e.g. a negative number). */
export class StockCountValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StockCountValidationError";
  }
}

/** Validates an observed count: a whole number of zero or more. */
export function validateStockCount(count: number): number {
  if (!Number.isInteger(count) || count < 0) {
    throw new StockCountValidationError(
      "A stock count must be a whole number of zero or more.",
    );
  }
  return count;
}

/**
 * The current count for a Supply: the most recent observation wins (ADR-0001).
 * Returns null when the Supply has never been counted. Ties on `countedAt` are
 * broken by id so the result is deterministic.
 */
export function latestCount(counts: readonly StockCount[]): StockCount | null {
  let latest: StockCount | null = null;
  for (const c of counts) {
    if (
      latest === null ||
      c.countedAt > latest.countedAt ||
      (c.countedAt.getTime() === latest.countedAt.getTime() && c.id > latest.id)
    ) {
      latest = c;
    }
  }
  return latest;
}

/**
 * Whether a Supply is running low: its current count is at or below its minimum.
 * No minimum or no count means not low (nothing to compare against).
 */
export function isLow(
  currentCount: number | null,
  minimumLevel: number | null,
): boolean {
  if (currentCount === null || minimumLevel === null) return false;
  return currentCount <= minimumLevel;
}

/** The current stock picture for one Supply, ready to render on the dashboard. */
export type StockLevel = {
  supply: Supply;
  currentCount: number | null;
  lastCountedAt: Date | null;
  isLow: boolean;
};

/** A Supply's at-a-glance stock state, or null when it has never been counted. */
export type StockStatus = "ok" | "low" | "out";

/**
 * Reduces a stock level to a single display status. Out beats low: nothing on
 * hand is "out" regardless of whether a minimum is set. At/below a minimum
 * (with some still on hand) is "low"; anything else is "ok". An uncounted
 * Supply has no status (null) — there is nothing to colour yet.
 */
export function stockStatus(
  level: Pick<StockLevel, "currentCount" | "isLow">,
): StockStatus | null {
  if (level.currentCount === null) return null;
  if (level.currentCount === 0) return "out";
  if (level.isLow) return "low";
  return "ok";
}

/**
 * Builds the current stock level for each Supply from its observed counts —
 * last-count-wins resolution plus low-stock detection, in one pure pass.
 */
export function buildStockLevels(
  supplies: readonly Supply[],
  counts: readonly StockCount[],
): StockLevel[] {
  const bySupply = new Map<string, StockCount[]>();
  for (const c of counts) {
    const list = bySupply.get(c.supplyId);
    if (list) list.push(c);
    else bySupply.set(c.supplyId, [c]);
  }

  return supplies.map((supply) => {
    const latest = latestCount(bySupply.get(supply.id) ?? []);
    const currentCount = latest?.count ?? null;
    return {
      supply,
      currentCount,
      lastCountedAt: latest?.countedAt ?? null,
      isLow: isLow(currentCount, supply.minimumLevel),
    };
  });
}
