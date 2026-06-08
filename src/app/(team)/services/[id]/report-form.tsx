"use client";

import { useActionState } from "react";
import type { ReportQuestion } from "@/modules/reports/report";
import type { Supply } from "@/modules/inventory/supply";
import { fileReportAction, type ReportFormState } from "./actions";

const fieldClass =
  "w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900";

export function ReportForm({
  serviceId,
  questions,
  designated,
}: {
  serviceId: string;
  questions: readonly ReportQuestion[];
  designated: Supply[];
}) {
  const [state, action, pending] = useActionState<ReportFormState, FormData>(
    fileReportAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="serviceId" value={serviceId} />

      <div className="space-y-3">
        <h2 className="text-lg font-medium">How did it go?</h2>
        {questions.map((q) => (
          <div key={q.id} className="space-y-1">
            <label htmlFor={`q-${q.id}`} className="text-sm font-medium">
              {q.label}
            </label>
            {q.kind === "number" ? (
              <input
                id={`q-${q.id}`}
                name={q.id}
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                required={q.required}
                defaultValue="0"
                className={fieldClass}
              />
            ) : (
              <textarea
                id={`q-${q.id}`}
                name={q.id}
                rows={2}
                required={q.required}
                className={fieldClass}
              />
            )}
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Count the supplies</h2>
        {designated.length > 0 ? (
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {designated.map((supply) => (
              <li
                key={supply.id}
                className="flex items-center justify-between gap-3 px-4 py-3"
              >
                <label htmlFor={`count-${supply.id}`} className="text-sm font-medium">
                  {supply.name}
                </label>
                <input
                  id={`count-${supply.id}`}
                  name={`count_${supply.id}`}
                  type="number"
                  min="0"
                  step="1"
                  inputMode="numeric"
                  required
                  aria-label={`${supply.name} count`}
                  className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">
            No supplies are designated for counting yet.
          </p>
        )}
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
        {pending ? "Filing…" : "File report"}
      </button>
    </form>
  );
}
