"use client";

import { useActionState } from "react";
import type { BrewQuantities, LeftoverEntry } from "@/modules/services/brew";
import { setBrewQuantitiesAction, type BrewFormState } from "./actions";

const fieldClass =
  "w-24 rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900";

function formatShortDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function BrewForm({
  serviceId,
  current,
  default: inherited,
  history,
}: {
  serviceId: string;
  current: BrewQuantities | null;
  default: BrewQuantities | null;
  history: LeftoverEntry[];
}) {
  const [state, action, pending] = useActionState<BrewFormState, FormData>(
    setBrewQuantitiesAction,
    undefined,
  );
  // Prefill from the current value, or inherit the previous comparable Service's
  // numbers as a starting point — shown, never auto-saved (the Lead confirms).
  const initial = current ?? inherited;

  return (
    <div className="space-y-4">
      {history.length > 0 && (
        <div className="space-y-2 rounded-lg border border-neutral-200 p-4">
          <h3 className="text-sm font-medium">Recent leftovers</h3>
          <p className="text-xs text-neutral-500">
            What past comparable Services brewed and had left over — for reference.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-neutral-500">
                <th className="py-1 font-medium">Date</th>
                <th className="py-1 text-right font-medium">Regular</th>
                <th className="py-1 text-right font-medium">Decaf</th>
                <th className="py-1 text-right font-medium">Left over</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.serviceId} className="border-t border-neutral-100">
                  <td className="py-1">{formatShortDate(h.date)}</td>
                  <td className="py-1 text-right">{h.regularPots ?? "—"}</td>
                  <td className="py-1 text-right">{h.decafPots ?? "—"}</td>
                  <td className="py-1 text-right font-medium">{h.leftoverPots ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form action={action} className="space-y-4">
        <input type="hidden" name="serviceId" value={serviceId} />
        {!current && inherited && (
          <p className="text-xs text-neutral-500">
            Starting from the previous comparable Service — adjust as needed.
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          <div className="space-y-1">
            <label htmlFor="regularPots" className="text-sm font-medium">
              Regular (pots)
            </label>
            <input
              id="regularPots"
              name="regularPots"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              required
              defaultValue={initial?.regularPots ?? ""}
              className={fieldClass}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="decafPots" className="text-sm font-medium">
              Decaf (pots)
            </label>
            <input
              id="decafPots"
              name="decafPots"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              required
              defaultValue={initial?.decafPots ?? ""}
              className={fieldClass}
            />
          </div>
        </div>
        {state?.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}
        {state?.ok && (
          <p className="text-sm text-green-700" role="status">
            {state.ok}
          </p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save brew quantities"}
        </button>
      </form>
    </div>
  );
}
