/**
 * Pure Service-calendar logic: turning a recurring weekly schedule into the
 * concrete Service occurrences for a date range, plus validation. Dates are
 * `YYYY-MM-DD` strings and times are 24h `HH:MM` strings so the logic is
 * timezone-free and deterministic.
 */

export type ScheduleEntry = {
  id: string;
  name: string;
  /** 0 = Sunday … 6 = Saturday. */
  weekday: number;
  time: string;
};

/** A Service that *should* exist for a given date, derived from the schedule. */
export type PlannedService = {
  scheduleId: string;
  name: string;
  date: string;
  time: string;
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** A caller-facing problem with Service or schedule input. */
export class ServiceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceValidationError";
  }
}

export function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && toDateString(d) === value;
}

export function isValidTime(value: string): boolean {
  return TIME_RE.test(value);
}

/** Day of week for a `YYYY-MM-DD` date (0 = Sunday), computed in UTC. */
export function weekdayOf(date: string): number {
  return new Date(`${date}T00:00:00Z`).getUTCDay();
}

function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return toDateString(d);
}

/** Every date with the given weekday in [from, to] (inclusive). */
export function datesInRange(
  from: string,
  to: string,
  weekday: number,
): string[] {
  const out: string[] = [];
  if (from > to) return out;
  let cursor = from;
  // Jump to the first matching weekday.
  while (weekdayOf(cursor) !== weekday && cursor <= to) {
    cursor = addDays(cursor, 1);
  }
  while (cursor <= to) {
    out.push(cursor);
    cursor = addDays(cursor, 7);
  }
  return out;
}

/**
 * The full set of recurring Services that should exist across [from, to] —
 * every schedule entry produces one Service per matching day in range.
 */
export function planRecurringServices(
  entries: readonly ScheduleEntry[],
  from: string,
  to: string,
): PlannedService[] {
  const out: PlannedService[] = [];
  for (const entry of entries) {
    for (const date of datesInRange(from, to, entry.weekday)) {
      out.push({ scheduleId: entry.id, name: entry.name, date, time: entry.time });
    }
  }
  return out;
}

/** Services occurring on a specific date — used for "today's Services". */
export function servicesOn<T extends { date: string }>(
  services: readonly T[],
  date: string,
): T[] {
  return services.filter((s) => s.date === date);
}

export function validateScheduleEntry(input: {
  name: string;
  weekday: number;
  time: string;
}): { name: string; weekday: number; time: string } {
  const name = input.name?.trim() ?? "";
  if (!name) throw new ServiceValidationError("A gathering needs a name.");
  if (!Number.isInteger(input.weekday) || input.weekday < 0 || input.weekday > 6) {
    throw new ServiceValidationError("Pick a day of the week.");
  }
  if (!isValidTime(input.time)) {
    throw new ServiceValidationError("Enter a time as HH:MM (24-hour).");
  }
  return { name, weekday: input.weekday, time: input.time };
}

export function validateAdHocService(input: {
  name: string;
  date: string;
  time: string;
}): { name: string; date: string; time: string } {
  const name = input.name?.trim() ?? "";
  if (!name) throw new ServiceValidationError("A service needs a name.");
  if (!isValidDate(input.date)) {
    throw new ServiceValidationError("Pick a valid date.");
  }
  if (!isValidTime(input.time)) {
    throw new ServiceValidationError("Enter a time as HH:MM (24-hour).");
  }
  return { name, date: input.date, time: input.time };
}
