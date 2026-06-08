import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { getService } from "@/modules/services/service";
import {
  getReportDetail,
  listDesignatedSupplies,
  REPORT_QUESTIONS,
} from "@/modules/reports/report";
import { ReportForm } from "./report-form";

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

export default async function ServiceReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;

  const service = await getService(id);
  if (!service) notFound();

  const detail = await getReportDetail(id);
  // Only the filing form needs the designated Supplies; skip the query on the
  // happy read path where a Report already exists.
  const designated = detail ? [] : await listDesignatedSupplies();

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div className="space-y-1">
        <Link
          href="/services"
          className="text-sm text-neutral-500 underline-offset-2 hover:underline"
        >
          ← Services
        </Link>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-sm text-neutral-500">
          {formatDate(service.date)} · {formatTime(service.time)}
        </p>
      </div>

      {detail ? (
        <div className="space-y-6">
          <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
            Report filed{" "}
            {new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
              timeZone: "America/Chicago",
            }).format(detail.report.createdAt)}
            .
          </p>

          <div className="space-y-3">
            <h2 className="text-lg font-medium">How it went</h2>
            <dl className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
              {REPORT_QUESTIONS.map((q) => (
                <div key={q.id} className="flex justify-between gap-4 px-4 py-3 text-sm">
                  <dt className="text-neutral-500">{q.label}</dt>
                  <dd className="text-right font-medium">
                    {detail.report.answers[q.id] ?? "—"}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-medium">Counts recorded</h2>
            {detail.counts.length > 0 ? (
              <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
                {detail.counts.map((c) => (
                  <li
                    key={c.supplyId}
                    className="flex justify-between gap-4 px-4 py-3 text-sm"
                  >
                    <span>{c.supplyName}</span>
                    <span className="font-medium">{c.count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">No counts were recorded.</p>
            )}
          </div>
        </div>
      ) : (
        <ReportForm
          serviceId={service.id}
          questions={REPORT_QUESTIONS}
          designated={designated}
        />
      )}
    </section>
  );
}
