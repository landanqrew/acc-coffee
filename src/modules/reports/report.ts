import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { reports, services, stockCounts, supplies } from "@/db/schema";
import { recordStockCount } from "@/modules/inventory/stock";
import type { Supply } from "@/modules/inventory/supply";
import {
  planReport,
  ReportValidationError,
  type ReportAnswers,
} from "./report-rules";

export { ReportValidationError } from "./report-rules";
export { REPORT_QUESTIONS } from "./report-rules";
export type { ReportAnswers, ReportQuestion } from "./report-rules";

export type Report = {
  id: string;
  serviceId: string;
  filedByUserId: string | null;
  answers: ReportAnswers;
  createdAt: Date;
};

/** The counts captured by a Report, with Supply names for display. */
export type ReportCount = { supplyId: string; supplyName: string; count: number };

/** A Report plus the counts it recorded — the per-Service report view. */
export type ReportDetail = { report: Report; counts: ReportCount[] };

/** Whether a thrown DB error is a Postgres unique-constraint violation (23505). */
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "23505"
  );
}

/** Active Supplies designated for counting on every Service Report, alphabetized. */
export async function listDesignatedSupplies(): Promise<Supply[]> {
  return db.query.supplies.findMany({
    where: and(eq(supplies.designated, true), isNull(supplies.retiredAt)),
    orderBy: [asc(supplies.name)],
  });
}

/** The Report filed against a Service, or null if it hasn't been filed yet. */
export async function getReportForService(serviceId: string): Promise<Report | null> {
  const row = await db.query.reports.findFirst({
    where: eq(reports.serviceId, serviceId),
  });
  return row ?? null;
}

/**
 * Files a Service Report: validates the operational answers and that every
 * designated Supply is counted, enforces one Report per Service, then persists
 * the Report and pushes each count into inventory (source `service_report`,
 * last-count-wins) linked back to the Report.
 *
 * (neon-http has no transactions; answers/counts are fully validated before any
 * write, so a partial failure is the only — narrow — non-atomic window.)
 */
export async function fileReport(input: {
  serviceId: string;
  filedByUserId?: string | null;
  answers: Record<string, unknown>;
  counts: Record<string, unknown>;
}): Promise<Report> {
  const service = await db.query.services.findFirst({
    where: eq(services.id, input.serviceId),
    columns: { id: true },
  });
  if (!service) {
    throw new ReportValidationError("That service doesn't exist.");
  }

  const [existingReport, designated] = await Promise.all([
    getReportForService(input.serviceId),
    listDesignatedSupplies(),
  ]);

  const plan = planReport({
    existingReport: existingReport ? { id: existingReport.id } : null,
    designatedSupplyIds: designated.map((s) => s.id),
    answers: input.answers,
    counts: input.counts,
  });

  let report: Report;
  try {
    [report] = await db
      .insert(reports)
      .values({
        serviceId: input.serviceId,
        filedByUserId: input.filedByUserId ?? null,
        answers: plan.answers,
      })
      .returning();
  } catch (err) {
    // A concurrent submission can slip past the app-level check above and lose
    // the race to the unique(serviceId) constraint — translate that to the same
    // friendly message rather than a generic 500.
    if (isUniqueViolation(err)) {
      throw new ReportValidationError("This service already has a report.");
    }
    throw err;
  }

  // Push each count through the inventory path so it lands as a Stock Count
  // (last-count-wins) and fires a Restock Alert on a fresh crossing, exactly
  // like an ad-hoc count.
  for (const c of plan.counts) {
    await recordStockCount({
      supplyId: c.supplyId,
      count: c.count,
      source: "service_report",
      recordedByUserId: input.filedByUserId ?? null,
      reportId: report.id,
    });
  }

  return report;
}

/** The filed Report for a Service plus the counts it captured, or null. */
export async function getReportDetail(serviceId: string): Promise<ReportDetail | null> {
  const report = await getReportForService(serviceId);
  if (!report) return null;

  const countRows = await db.query.stockCounts.findMany({
    where: eq(stockCounts.reportId, report.id),
    columns: { supplyId: true, count: true },
  });
  if (countRows.length === 0) return { report, counts: [] };

  const supplyRows = await db.query.supplies.findMany({
    columns: { id: true, name: true },
    where: inArray(
      supplies.id,
      countRows.map((c) => c.supplyId),
    ),
  });
  const nameById = new Map(supplyRows.map((s) => [s.id, s.name]));

  const counts: ReportCount[] = countRows
    .map((c) => ({
      supplyId: c.supplyId,
      supplyName: nameById.get(c.supplyId) ?? "(removed supply)",
      count: c.count,
    }))
    .sort((a, b) => a.supplyName.localeCompare(b.supplyName));

  return { report, counts };
}
