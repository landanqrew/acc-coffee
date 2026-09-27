import { and, asc, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db";
import { reports, services, stockCounts, supplies } from "@/db/schema";
import { dispatchRestockAlert, getCurrentCounts } from "@/modules/inventory/stock";
import { decideRestockAlert } from "@/modules/inventory/restock-rules";
import type { Supply } from "@/modules/inventory/supply";
import {
  isUniqueViolation,
  planReport,
  ReportValidationError,
  type ReportAnswers,
} from "./report-rules";

export { ReportValidationError } from "./report-rules";
export { REPORT_QUESTIONS, answerText } from "./report-rules";
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
 * the Report and its counts into inventory (source `service_report`,
 * last-count-wins) linked back to the Report.
 *
 * The Report and its counts are written in one atomic batch, so a failure never
 * leaves a Report with missing counts. Restock Alerts go out only after that
 * write commits, in parallel and best-effort.
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

  // The levels before this Report, to detect fresh crossings below a minimum.
  const previousCounts = await getCurrentCounts(plan.counts.map((c) => c.supplyId));

  const reportId = crypto.randomUUID();
  const filedByUserId = input.filedByUserId ?? null;
  const insertReport = db
    .insert(reports)
    .values({ id: reportId, serviceId: input.serviceId, filedByUserId, answers: plan.answers })
    .returning();

  let report: Report;
  try {
    const [[inserted]] =
      plan.counts.length === 0
        ? await db.batch([insertReport])
        : await db.batch([
            insertReport,
            db.insert(stockCounts).values(
              plan.counts.map((c) => ({
                supplyId: c.supplyId,
                count: c.count,
                source: "service_report" as const,
                recordedByUserId: filedByUserId,
                reportId,
              })),
            ),
          ]);
    report = inserted;
  } catch (err) {
    // A concurrent submission can slip past the app-level check above and lose
    // the race to the unique(serviceId) constraint — translate that to the same
    // friendly message rather than a generic 500.
    if (isUniqueViolation(err)) {
      throw new ReportValidationError("This service already has a report.");
    }
    throw err;
  }

  const supplyById = new Map(designated.map((s) => [s.id, s]));
  const alerts = plan.counts.flatMap((c) => {
    const alert = decideRestockAlert({
      supply: supplyById.get(c.supplyId)!,
      previousCount: previousCounts.get(c.supplyId) ?? null,
      newCount: c.count,
    });
    return alert ? [alert] : [];
  });
  await Promise.all(alerts.map(dispatchRestockAlert));

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
