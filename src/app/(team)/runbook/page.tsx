import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { getRunbook, RUNBOOK_SECTIONS } from "@/modules/runbook/runbook";
import { Markdown } from "./markdown";
import { SectionEditor } from "./section-editor";

// Content is edited per-request and revalidated on save; render fresh.
export const dynamic = "force-dynamic";

function formatUpdated(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "America/Chicago",
  }).format(date);
}

export default async function RunbookPage() {
  const user = await requireSession();
  const lead = isLead(user.role);
  const sections = await getRunbook();
  const meta = new Map(RUNBOOK_SECTIONS.map((s) => [s.id, s]));

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Runbook</h1>
        <p className="text-sm text-neutral-500">
          Everything you need to run a service day
          {lead ? " — yours to keep current." : "."}
        </p>
      </div>

      {sections.map((s) => {
        const info = meta.get(s.id)!;
        return (
          <article key={s.id} className="space-y-3">
            <div>
              <h2 className="text-lg font-medium">{info.label}</h2>
              <p className="text-sm text-neutral-500">{info.description}</p>
            </div>

            {s.content ? (
              <div className="space-y-2">
                <div className="rounded-lg border border-neutral-200 p-4">
                  <Markdown>{s.content}</Markdown>
                </div>
                {s.updatedAt && (
                  <p className="text-xs text-neutral-400">
                    Updated {formatUpdated(s.updatedAt)}
                  </p>
                )}
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-neutral-300 p-4 text-sm text-neutral-400">
                {lead
                  ? "Nothing here yet — add it below."
                  : "A Lead hasn’t written this section yet."}
              </p>
            )}

            {lead && (
              <SectionEditor
                section={s.id}
                label={info.label}
                placeholder={info.placeholder}
                content={s.content}
              />
            )}
          </article>
        );
      })}
    </section>
  );
}
