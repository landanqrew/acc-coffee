import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
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

/**
 * Label + mono value row inside a read Card — digits line up across rows.
 * Renders as a `<dt>`/`<dd>` pair so the surrounding `<dl>` keeps its
 * definition-list semantics for assistive tech.
 */
function ReadRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono tabular-nums font-medium">{value}</dd>
    </div>
  );
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
          className="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          ← Services
        </Link>
        <h1 className="text-2xl font-semibold">{service.name}</h1>
        <p className="text-sm text-muted-foreground">
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
          <Card>
            <dl className="space-y-3">
              <ReadRow label="Regular (pots)" value={brewQuantities.regularPots} />
              <ReadRow label="Decaf (pots)" value={brewQuantities.decafPots} />
            </dl>
          </Card>
        ) : (
          <p className="text-sm text-subtle">
            A Lead hasn&rsquo;t set brew quantities for this Service yet.
          </p>
        )}
      </div>

      {detail ? (
        <div className="space-y-6">
          <p className="rounded-2xl border border-ok-bd bg-ok-bg px-4 py-3 text-sm text-ok">
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
            <Card>
              <dl className="space-y-3">
                {REPORT_QUESTIONS.map((q) => (
                  <ReadRow
                    key={q.id}
                    label={q.label}
                    value={detail.report.answers[q.id] ?? "—"}
                  />
                ))}
              </dl>
            </Card>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-medium">Counts recorded</h2>
            {detail.counts.length > 0 ? (
              <Card>
                <dl className="space-y-3">
                  {detail.counts.map((c) => (
                    <ReadRow key={c.supplyId} label={c.supplyName} value={c.count} />
                  ))}
                </dl>
              </Card>
            ) : (
              <p className="text-sm text-subtle">No counts were recorded.</p>
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
          <span className="text-sm text-muted-foreground">
            {feedback.responseCount === 1
              ? "1 response"
              : `${feedback.responseCount} responses`}
          </span>
        </div>
        {feedback.averages ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {FEEDBACK_RATINGS.map((r) => (
                <Card key={r.id} className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    {r.label}
                  </p>
                  <p className="font-mono tabular-nums text-2xl leading-none">
                    {feedback.averages![r.id].toFixed(1)}
                    <span className="ml-1 text-sm font-sans text-muted-foreground">
                      / 5
                    </span>
                  </p>
                </Card>
              ))}
            </div>
            {feedback.comments.length > 0 && (
              <ul className="space-y-2">
                {feedback.comments.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-2xl bg-muted px-4 py-3 text-sm text-foreground"
                  >
                    “{c}”
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm text-subtle">
            No feedback yet for this service.
          </p>
        )}
      </div>
    </section>
  );
}
