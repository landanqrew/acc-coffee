"use client";

import { useActionState } from "react";
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
      <div className="rounded-lg bg-green-50 px-4 py-6 text-center">
        <p className="text-lg font-medium text-green-800">Thank you!</p>
        <p className="mt-1 text-sm text-green-700">
          Your feedback helps the coffee team serve you better.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Which service did you attend?</legend>
        <div className="space-y-2">
          {services.map((s, i) => (
            <label
              key={s.id}
              className="flex items-center gap-3 rounded-lg border border-neutral-300 px-4 py-3"
            >
              <input
                type="radio"
                name="serviceId"
                value={s.id}
                required
                defaultChecked={services.length === 1 && i === 0}
                className="h-4 w-4"
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
                className="flex flex-1 cursor-pointer flex-col items-center gap-1 rounded-lg border border-neutral-300 py-2 text-sm has-[:checked]:border-neutral-900 has-[:checked]:bg-neutral-900 has-[:checked]:text-white"
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
        <label htmlFor="comment" className="text-sm font-medium">
          Anything else? (optional)
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}
