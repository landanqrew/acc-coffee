"use client";

import { useActionState } from "react";
import {
  Button,
  Card,
  Field,
  fieldInputVariants,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ReportQuestion } from "@/modules/reports/report";
import type { Supply } from "@/modules/inventory/supply";
import { fileReportAction, type ReportFormState } from "./actions";

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
    <form action={action} className="space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />

      <Card className="space-y-4">
        <h2 className="text-lg font-medium">How did it go?</h2>
        {questions.map((q) =>
          q.kind === "number" ? (
            <Field
              key={q.id}
              id={`q-${q.id}`}
              name={q.id}
              label={q.label}
              type="number"
              min={0}
              step={1}
              inputMode="numeric"
              required={q.required}
              mono
              defaultValue="0"
            />
          ) : (
            <div key={q.id} className="block">
              <label
                htmlFor={`q-${q.id}`}
                className="mb-1 block text-xs font-medium text-muted-foreground"
              >
                {q.label}
              </label>
              <textarea
                id={`q-${q.id}`}
                name={q.id}
                rows={2}
                required={q.required}
                className={cn(fieldInputVariants(), "resize-y")}
              />
            </div>
          ),
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-medium">Count the supplies</h2>
        {designated.length > 0 ? (
          <div className="space-y-4">
            {designated.map((supply) => (
              <Field
                key={supply.id}
                id={`count-${supply.id}`}
                name={`count_${supply.id}`}
                label={supply.name}
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                required
                mono
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-subtle">
            No supplies are designated for counting yet.
          </p>
        )}
      </Card>

      {state?.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Filing…" : "File report"}
      </Button>
    </form>
  );
}
