import type { ReportAnswers } from "@/modules/reports/report-rules";

/**
 * Planned amounts of coffee to brew for a Service, in pots. Pots (not carafes)
 * to match the Service Report's unit, so a Lead can compare what they planned to
 * brew against what past Reports recorded as brewed and left over.
 */
export type BrewQuantities = {
  regularPots: number;
  decafPots: number;
};

/** The Service fields brew defaults and leftover history reason about. */
export type ServiceIdentity = {
  id: string;
  name: string;
  date: string;
  kind: "recurring" | "ad_hoc";
  scheduleId: string | null;
};

/** A caller-facing problem with brew quantities (e.g. a negative or fractional pot count). */
export class BrewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrewValidationError";
  }
}

function parsePots(value: unknown, label: string): number {
  // Trim first so a blank field is rejected instead of coercing "" to 0.
  const text = typeof value === "number" ? String(value) : String(value ?? "").trim();
  if (text === "") {
    throw new BrewValidationError(`${label} is required.`);
  }
  const n = Number(text);
  if (!Number.isInteger(n) || n < 0) {
    throw new BrewValidationError(`${label} must be a whole number of zero or more.`);
  }
  return n;
}

/** Validates planned brew quantities: regular and decaf each whole and zero-or-more. */
export function validateBrewQuantities(raw: {
  regularPots: unknown;
  decafPots: unknown;
}): BrewQuantities {
  return {
    regularPots: parsePots(raw.regularPots, "Regular coffee (pots)"),
    decafPots: parsePots(raw.decafPots, "Decaf (pots)"),
  };
}

/**
 * Groups the Services that count as "the same Service" for brew defaults and
 * leftover history. Recurring Services match by their schedule (the 9am every
 * week); ad-hoc Services match other ad-hoc Services with the same name,
 * case-insensitively. A recurring Service with no schedule (shouldn't happen, but
 * the column is nullable) falls back to its name like an ad-hoc one.
 */
export function comparableKey(
  service: Pick<ServiceIdentity, "kind" | "scheduleId" | "name">,
): string {
  if (service.kind === "recurring" && service.scheduleId) {
    return `schedule:${service.scheduleId}`;
  }
  return `adhoc:${service.name.trim().toLowerCase()}`;
}

/** A past Service that already has brew quantities set, used to seed a new one. */
export type PriorQuantities = {
  service: ServiceIdentity;
  quantities: BrewQuantities;
};

/** A filed Report paired with its Service, for building leftover history. */
export type ReportRow = {
  service: ServiceIdentity;
  answers: ReportAnswers;
};

/** One row of the recent leftover history shown while setting quantities. */
export type LeftoverEntry = {
  serviceId: string;
  serviceName: string;
  date: string;
  regularPots: number | null;
  decafPots: number | null;
  leftoverPots: number | null;
};

function readNumber(answers: ReportAnswers, key: string): number | null {
  const v = answers[key];
  return typeof v === "number" ? v : null;
}

/** Sorts service-bearing rows newest first, breaking date ties by id for determinism. */
function byDateDescThenId<T extends { service: ServiceIdentity }>(a: T, b: T): number {
  if (a.service.date !== b.service.date) return a.service.date < b.service.date ? 1 : -1;
  return a.service.id < b.service.id ? 1 : -1;
}

/** Whether a candidate Service is a strictly-past, comparable peer of the target. */
function isComparablePast(target: ServiceIdentity, candidate: ServiceIdentity): boolean {
  return (
    comparableKey(candidate) === comparableKey(target) && candidate.date < target.date
  );
}

/**
 * Picks the brew quantities to default a Service to: those of the most recent
 * comparable past Service that already had quantities set. Null when there's no
 * comparable history to inherit from, so the caller can fall back to an empty form.
 */
export function selectDefaultQuantities(
  target: ServiceIdentity,
  priors: readonly PriorQuantities[],
): BrewQuantities | null {
  const matches = priors
    .filter((p) => isComparablePast(target, p.service))
    .sort(byDateDescThenId);
  return matches.length > 0 ? matches[0].quantities : null;
}

/**
 * Builds the recent leftover history a Lead sees while setting quantities: the
 * most recent comparable past Services' brewed and leftover numbers, newest
 * first, capped at `limit`. Shown for context — never auto-applied.
 */
export function buildLeftoverHistory(
  target: ServiceIdentity,
  reports: readonly ReportRow[],
  limit = 4,
): LeftoverEntry[] {
  return reports
    .filter((r) => isComparablePast(target, r.service))
    .sort(byDateDescThenId)
    .slice(0, limit)
    .map((r) => ({
      serviceId: r.service.id,
      serviceName: r.service.name,
      date: r.service.date,
      regularPots: readNumber(r.answers, "regularPots"),
      decafPots: readNumber(r.answers, "decafPots"),
      leftoverPots: readNumber(r.answers, "leftoverPots"),
    }));
}
