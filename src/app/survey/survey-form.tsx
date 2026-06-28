"use client";

import { useActionState } from "react";
import { Button, Card, fieldInputVariants } from "@/components/ui";
import { submitFeedbackAction, type SurveyFormState } from "./actions";

type SurveyService = { id: string; name: string; time: string };
type Rating = { id: string; label: string };

const SCALE = [1, 2, 3, 4, 5];

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

export function SurveyForm({
  services,
  ratings,
}: {
  services: SurveyService[];
  ratings: Rating[];
}) {
  const [state, action, pending] = useActionState<SurveyFormState, FormData>(
    submitFeedbackAction,
    undefined,
  );

  if (state?.ok) {
    return (
      <Card elevation="lift" className="bg-ok-bg text-center">
        <p className="text-lg font-semibold text-ok">Thank you!</p>
        <p className="mt-1 text-sm text-ok">
          Your feedback helps the coffee team serve you better.
        </p>
      </Card>
    );
  }

  return (
    <Card elevation="lift">
      <form action={action} className="space-y-6">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            Which service did you attend?
          </legend>
          <div className="space-y-2">
            {services.map((s, i) => (
              <label
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 transition-colors has-[:checked]:border-primary has-[:checked]:bg-accent"
              >
                <input
                  type="radio"
                  name="serviceId"
                  value={s.id}
                  required
                  defaultChecked={services.length === 1 && i === 0}
                  className="h-4 w-4 accent-primary"
                />
                <span className="text-sm">
                  {s.name} · {formatTime(s.time)}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {ratings.map((r) => (
          <fieldset key={r.id} className="space-y-2">
            <legend className="text-sm font-medium">{r.label}</legend>
            <div className="flex gap-2">
              {SCALE.map((n) => (
                <label
                  key={n}
                  className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border border-border py-2 text-sm transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground"
                >
                  <input
                    type="radio"
                    name={r.id}
                    value={n}
                    required
                    className="sr-only"
                    aria-label={`${r.label} ${n} of 5`}
                  />
                  {n}
                </label>
              ))}
            </div>
          </fieldset>
        ))}

        <div className="space-y-1">
          <label
            htmlFor="comment"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Anything else? (optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            rows={3}
            className={fieldInputVariants()}
          />
        </div>

        {state?.error && (
          <p className="text-sm text-danger" role="alert">
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Sending…" : "Send feedback"}
        </Button>
      </form>
    </Card>
  );
}
