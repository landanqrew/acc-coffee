"use client";

import { useActionState } from "react";
import { Button, Card, Field } from "@/components/ui";
import type { BrewQuantities, LeftoverEntry } from "@/modules/services/brew";
import { setBrewQuantitiesAction, type BrewFormState } from "./actions";

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
        <Card className="space-y-2">
          <h3 className="text-sm font-medium">Recent leftovers</h3>
          <p className="text-xs text-muted-foreground">
            What past comparable Services brewed and had left over — for reference.
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="py-1 font-medium">Date</th>
                <th className="py-1 text-right font-medium">Regular</th>
                <th className="py-1 text-right font-medium">Decaf</th>
                <th className="py-1 text-right font-medium">Left over</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {history.map((h) => (
                <tr key={h.serviceId} className="border-t border-border">
                  <td className="py-1 font-sans">{formatShortDate(h.date)}</td>
                  <td className="py-1 text-right">{h.regularPots ?? "—"}</td>
                  <td className="py-1 text-right">{h.decafPots ?? "—"}</td>
                  <td className="py-1 text-right font-medium">
                    {h.leftoverPots ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Card className="space-y-4">
        <form action={action} className="space-y-4">
          <input type="hidden" name="serviceId" value={serviceId} />
          {!current && inherited && (
            <p className="text-xs text-muted-foreground">
              Starting from the previous comparable Service — adjust as needed.
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <Field
              id="regularPots"
              name="regularPots"
              label="Regular (pots)"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              required
              mono
              defaultValue={initial?.regularPots ?? ""}
              className="w-28"
            />
            <Field
              id="decafPots"
              name="decafPots"
              label="Decaf (pots)"
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              required
              mono
              defaultValue={initial?.decafPots ?? ""}
              className="w-28"
            />
          </div>
          {state?.error && (
            <p className="text-sm text-danger" role="alert">
              {state.error}
            </p>
          )}
          {state?.ok && (
            <p className="text-sm text-ok" role="status">
              {state.ok}
            </p>
          )}
          <Button type="submit" disabled={pending}>
            {pending ? "Saving…" : "Save brew quantities"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
