import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { brewQuantities, reports, services } from "@/db/schema";
import { assertLead, type Role } from "@/modules/auth/roles";
import {
  buildLeftoverHistory,
  selectDefaultQuantities,
  validateBrewQuantities,
  type BrewQuantities,
  type LeftoverEntry,
  type PriorQuantities,
  type ReportRow,
  type ServiceIdentity,
} from "./brew-rules";

export { BrewValidationError } from "./brew-rules";
export type { BrewQuantities, LeftoverEntry } from "./brew-rules";

/** The brew quantities set for a Service, or null if a Lead hasn't set any yet. */
export async function getBrewQuantities(
  serviceId: string,
): Promise<BrewQuantities | null> {
  const row = await db.query.brewQuantities.findFirst({
    where: eq(brewQuantities.serviceId, serviceId),
    columns: { mediumPots: true, darkPots: true },
  });
  return row ? { mediumPots: row.mediumPots, darkPots: row.darkPots } : null;
}

/**
 * Sets (or updates) a Service's brew quantities. Lead-only — Volunteers see the
 * numbers but never change them. Last write wins (one row per Service).
 */
export async function setBrewQuantities(
  actorRole: Role | null | undefined,
  input: {
    serviceId: string;
    mediumPots: unknown;
    darkPots: unknown;
    updatedByUserId?: string | null;
  },
): Promise<BrewQuantities> {
  assertLead(actorRole);
  const q = validateBrewQuantities({
    mediumPots: input.mediumPots,
    darkPots: input.darkPots,
  });
  await db
    .insert(brewQuantities)
    .values({
      serviceId: input.serviceId,
      mediumPots: q.mediumPots,
      darkPots: q.darkPots,
      updatedByUserId: input.updatedByUserId ?? null,
    })
    .onConflictDoUpdate({
      target: brewQuantities.serviceId,
      set: {
        mediumPots: q.mediumPots,
        darkPots: q.darkPots,
        updatedByUserId: input.updatedByUserId ?? null,
        // Stamp from the DB clock, matching the INSERT path's default now().
        updatedAt: sql`now()`,
      },
    });
  return q;
}

/** Brew quantities for several Services at once, keyed by Service id (for list views). */
export async function getBrewQuantitiesByService(
  serviceIds: readonly string[],
): Promise<Map<string, BrewQuantities>> {
  if (serviceIds.length === 0) return new Map();
  const rows = await db.query.brewQuantities.findMany({
    where: inArray(brewQuantities.serviceId, [...serviceIds]),
    columns: { serviceId: true, mediumPots: true, darkPots: true },
  });
  return new Map(
    rows.map((r) => [r.serviceId, { mediumPots: r.mediumPots, darkPots: r.darkPots }]),
  );
}

/** Past Services comparable to the target (same schedule, or same ad-hoc name). */
async function getComparablePastServices(
  target: ServiceIdentity,
): Promise<ServiceIdentity[]> {
  const where =
    target.kind === "recurring" && target.scheduleId
      ? and(
          eq(services.scheduleId, target.scheduleId),
          lt(services.date, target.date),
        )
      : and(
          eq(services.kind, "ad_hoc"),
          // Match comparableKey's case-insensitive name comparison so the pure
          // layer actually sees casing variants rather than the SQL silently
          // dropping them.
          sql`lower(${services.name}) = lower(${target.name})`,
          lt(services.date, target.date),
        );
  return db.query.services.findMany({
    where,
    columns: { id: true, name: true, date: true, kind: true, scheduleId: true },
  });
}

/** What a Lead needs to set quantities: the current value, an inherited default, and leftover history. */
export type BrewEditContext = {
  /** Quantities already set for this Service, or null. */
  current: BrewQuantities | null;
  /** Quantities to prefill from the previous comparable Service when none are set yet. */
  default: BrewQuantities | null;
  /** Recent comparable Reports' brewed/leftover numbers, shown for context. */
  history: LeftoverEntry[];
};

/**
 * Assembles everything the brew-quantities editor shows: the Service's current
 * quantities, the default to inherit from the previous comparable Service (only
 * when none are set), and the recent leftover history to inform the decision.
 */
export async function getBrewEditContext(
  service: ServiceIdentity,
): Promise<BrewEditContext> {
  const [current, past] = await Promise.all([
    getBrewQuantities(service.id),
    getComparablePastServices(service),
  ]);
  if (past.length === 0) {
    return { current, default: null, history: [] };
  }

  const ids = past.map((s) => s.id);
  const [quantityRows, reportRows] = await Promise.all([
    db.query.brewQuantities.findMany({
      where: inArray(brewQuantities.serviceId, ids),
      columns: { serviceId: true, mediumPots: true, darkPots: true },
    }),
    db.query.reports.findMany({
      where: inArray(reports.serviceId, ids),
      columns: { serviceId: true, answers: true },
    }),
  ]);

  const byId = new Map(past.map((s) => [s.id, s]));
  const priors: PriorQuantities[] = quantityRows.flatMap((r) => {
    const svc = byId.get(r.serviceId);
    return svc
      ? [{ service: svc, quantities: { mediumPots: r.mediumPots, darkPots: r.darkPots } }]
      : [];
  });
  const rows: ReportRow[] = reportRows.flatMap((r) => {
    const svc = byId.get(r.serviceId);
    return svc ? [{ service: svc, answers: r.answers }] : [];
  });

  return {
    current,
    default: current ? null : selectDefaultQuantities(service, priors),
    history: buildLeftoverHistory(service, rows),
  };
}
