import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { getRunbook, RUNBOOK_SECTIONS } from "@/modules/runbook/runbook";
import { cardVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
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
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Runbook</h1>
        <p className="text-sm text-muted-foreground">
          Everything you need to run a service day
          {lead ? " — yours to keep current." : "."}
        </p>
      </div>

      {sections.map((s) => {
        const info = meta.get(s.id)!;
        return (
          // A section is a self-contained article, so we keep the <article>
          // element and lift it with cardVariants rather than swapping in the
          // <Card> div — semantics win over reaching for the component here.
          <article key={s.id} className={cn(cardVariants(), "space-y-3")}>
            <div>
              <h2 className="text-lg font-semibold">{info.label}</h2>
              <p className="text-sm text-muted-foreground">{info.description}</p>
            </div>

            {s.content ? (
              <div className="space-y-2">
                <Markdown>{s.content}</Markdown>
                {s.updatedAt && (
                  <p className="text-xs text-subtle">
                    Updated {formatUpdated(s.updatedAt)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-subtle">
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
