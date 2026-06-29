import { FEEDBACK_RATINGS } from "@/modules/feedback/feedback";
import { getTodaysServices } from "@/modules/services/service";
import { SurveyForm } from "./survey-form";

// Always reflect today's Services and the latest data — never statically cached.
export const dynamic = "force-dynamic";

export default async function SurveyPage() {
  const services = await getTodaysServices();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 bg-app px-4 py-10">
      <div className="space-y-1 text-center">
        <h1 className="text-2xl font-semibold">How was the coffee?</h1>
        <p className="text-sm text-muted-foreground">
          A few quick taps — no account needed.
        </p>
      </div>

      {services.length > 0 ? (
        <SurveyForm
          services={services.map((s) => ({ id: s.id, name: s.name, time: s.time }))}
          ratings={FEEDBACK_RATINGS.map((r) => ({ id: r.id, label: r.label }))}
        />
      ) : (
        <p className="rounded-2xl bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          There aren’t any services today, so we’re not collecting feedback right
          now. Thanks for stopping by — please check back on a service day!
        </p>
      )}
    </main>
  );
}
