import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/db";
import { services, serviceSchedules } from "@/db/schema";
import { assertLead, type Role } from "@/modules/auth/roles";
import {
  planRecurringServices,
  validateAdHocService,
  validateScheduleEntry,
  type ScheduleEntry,
} from "./schedule";

export { ServiceValidationError } from "./schedule";

export type Service = {
  id: string;
  name: string;
  date: string;
  time: string;
  kind: "recurring" | "ad_hoc";
  scheduleId: string | null;
};

// How far back / ahead to keep recurring Services materialized on each read.
const PAST_DAYS = 28;
const FUTURE_DAYS = 56;

/** Today's date (YYYY-MM-DD) in the church's local timezone. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
  }).format(new Date());
}

function shift(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// --- Recurring schedule (Lead-configured) ---

export async function listSchedule(): Promise<ScheduleEntry[]> {
  const rows = await db.query.serviceSchedules.findMany({
    where: eq(serviceSchedules.active, true),
    orderBy: [asc(serviceSchedules.weekday), asc(serviceSchedules.time)],
  });
  return rows.map((r) => ({ id: r.id, name: r.name, weekday: r.weekday, time: r.time }));
}

export async function addScheduleEntry(
  actorRole: Role | null | undefined,
  input: { name: string; weekday: number; time: string },
): Promise<ScheduleEntry> {
  assertLead(actorRole);
  const v = validateScheduleEntry(input);
  const [row] = await db.insert(serviceSchedules).values(v).returning();
  return { id: row.id, name: row.name, weekday: row.weekday, time: row.time };
}

/**
 * Retires a recurring gathering: it stops materializing future Services and any
 * already-materialized current/future occurrences are removed so they no longer
 * appear on the calendar. Past Services stay as history. (neon-http has no
 * transactions, so this is two statements — deactivate first, then purge.)
 */
export async function removeScheduleEntry(
  actorRole: Role | null | undefined,
  id: string,
): Promise<void> {
  assertLead(actorRole);
  await db
    .update(serviceSchedules)
    .set({ active: false })
    .where(eq(serviceSchedules.id, id));
  await db
    .delete(services)
    .where(
      and(
        eq(services.scheduleId, id),
        eq(services.kind, "recurring"),
        gte(services.date, today()),
      ),
    );
}

// --- Services ---

/** Creates a one-off ad-hoc Service (special event). Lead-only. */
export async function createAdHocService(
  actorRole: Role | null | undefined,
  input: { name: string; date: string; time: string },
): Promise<Service> {
  assertLead(actorRole);
  const v = validateAdHocService(input);
  const [row] = await db
    .insert(services)
    .values({ ...v, kind: "ad_hoc" })
    .returning();
  return toService(row);
}

/**
 * Ensures recurring Services exist for every active schedule across the rolling
 * window, so the calendar always shows them without manual creation. Idempotent:
 * re-running never duplicates (unique on (scheduleId, date)).
 */
export async function materializeWindow(from: string, to: string): Promise<void> {
  const schedule = await listSchedule();
  if (schedule.length === 0) return;
  const planned = planRecurringServices(schedule, from, to);
  if (planned.length === 0) return;

  await db
    .insert(services)
    .values(
      planned.map((p) => ({
        name: p.name,
        date: p.date,
        time: p.time,
        kind: "recurring" as const,
        scheduleId: p.scheduleId,
      })),
    )
    .onConflictDoNothing({ target: [services.scheduleId, services.date] });
}

function windowAround(t: string): { from: string; to: string } {
  return { from: shift(t, -PAST_DAYS), to: shift(t, FUTURE_DAYS) };
}

/**
 * Upcoming and past Services across the rolling window, newest-first for past.
 * Returns the `today` boundary it used so callers split the same way without
 * recomputing (which could diverge across a midnight rollover).
 */
export async function listServices(): Promise<{
  upcoming: Service[];
  past: Service[];
  today: string;
}> {
  const t = today();
  const { from, to } = windowAround(t);
  await materializeWindow(from, to);
  const rows = await db.query.services.findMany({
    where: and(gte(services.date, from), lte(services.date, to)),
    orderBy: [asc(services.date), asc(services.time)],
  });
  const all = rows.map(toService);
  return {
    today: t,
    upcoming: all.filter((s) => s.date >= t),
    past: all.filter((s) => s.date < t).reverse(),
  };
}

/** A single Service by id, or null. */
export async function getService(id: string): Promise<Service | null> {
  const row = await db.query.services.findFirst({ where: eq(services.id, id) });
  return row ? toService(row) : null;
}

/**
 * Every Service happening today (recurring + ad-hoc). Used by the Feedback
 * Survey and Service Report flows.
 */
export async function getTodaysServices(): Promise<Service[]> {
  const t = today();
  const { from, to } = windowAround(t);
  await materializeWindow(from, to);
  const rows = await db.query.services.findMany({
    where: eq(services.date, t),
    orderBy: [asc(services.time)],
  });
  return rows.map(toService);
}

function toService(row: {
  id: string;
  name: string;
  date: string;
  time: string;
  kind: "recurring" | "ad_hoc";
  scheduleId: string | null;
}): Service {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    time: row.time,
    kind: row.kind,
    scheduleId: row.scheduleId,
  };
}
