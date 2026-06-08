import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { getService } from "@/modules/services/service";
import { getBrewEditContext, getBrewQuantities } from "@/modules/services/brew";
import { FEEDBACK_RATINGS, getFeedbackSummary } from "@/modules/feedback/feedback";
import {
  getReportDetail,
  listDesignatedSupplies,
  REPORT_QUESTIONS,
} from "@/modules/reports/report";
import { BrewForm } from "./brew-form";
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
  const user = await requireSession();
  const { id } = await params;

  const service = await getService(id);
  if (!service) notFound();

  const lead = isLead(user.role);
  // Leads get the editor (current value, inherited default, leftover history);
  // Volunteers only need the set quantities to read.
  const brew = lead ? await getBrewEditContext(service) : null;
  const brewQuantities = lead ? brew!.current : await getBrewQuantities(service.id);

  const detail = await getReportDetail(id);
  const feedback = await getFeedbackSummary(id);
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

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Brew quantities</h2>
        {lead ? (
          <BrewForm
            serviceId={service.id}
            current={brew!.current}
            default={brew!.default}
            history={brew!.history}
          />
        ) : brewQuantities ? (
          <dl className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            <div className="flex justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-neutral-500">Regular (pots)</dt>
              <dd className="text-right font-medium">{brewQuantities.regularPots}</dd>
            </div>
            <div className="flex justify-between gap-4 px-4 py-3 text-sm">
              <dt className="text-neutral-500">Decaf (pots)</dt>
              <dd className="text-right font-medium">{brewQuantities.decafPots}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-neutral-400">
            A Lead hasn&rsquo;t set brew quantities for this Service yet.
          </p>
        )}
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

      <div className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-medium">Congregant feedback</h2>
          <span className="text-sm text-neutral-500">
            {feedback.responseCount === 1
              ? "1 response"
              : `${feedback.responseCount} responses`}
          </span>
        </div>
        {feedback.averages ? (
          <div className="space-y-4">
            <dl className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
              {FEEDBACK_RATINGS.map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between gap-4 px-4 py-3 text-sm"
                >
                  <dt className="text-neutral-500">{r.label}</dt>
                  <dd className="text-right font-medium">
                    {feedback.averages![r.id].toFixed(1)}{" "}
                    <span className="text-neutral-400">/ 5</span>
                  </dd>
                </div>
              ))}
            </dl>
            {feedback.comments.length > 0 && (
              <ul className="space-y-2">
                {feedback.comments.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
                  >
                    “{c}”
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm text-neutral-400">
            No feedback yet for this service.
          </p>
        )}
      </div>
    </section>
  );
}
