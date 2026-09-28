"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Button,
  Card,
  Field,
  fieldInputVariants,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import type { ReportAnswers, ReportQuestion } from "@/modules/reports/report";
import {
  editReportAction,
  fileReportAction,
  type ReportFormState,
} from "./actions";

/** One Supply to count on the form, pre-filled with its recorded count once filed. */
export type ReportCountRow = {
  supplyId: string;
  name: string;
  unit: string | null;
  count?: number;
};

// Locked fields read as plain values rather than inputs.
const LOCKED_CLS = "read-only:border-transparent read-only:bg-muted read-only:focus:ring-0";

/** A stored answer as an input default; non-scalar legacy values start blank. */
function answerDefault(value: unknown): string {
  return typeof value === "number" || typeof value === "string" ? String(value) : "";
}

/**
 * The Service Report form. Unfiled, it is an open form that files the Report.
 * Filed (`answers` given), it renders the same fields locked with an overlaid
 * Edit button; unlocking lets any team member correct and re-submit it.
 */
export function ReportForm({
  serviceId,
  questions,
  countRows,
  answers,
}: {
  serviceId: string;
  questions: readonly ReportQuestion[];
  countRows: ReportCountRow[];
  answers?: ReportAnswers;
}) {
  const filed = answers !== undefined;
  const [editing, setEditing] = useState(!filed);
  // Bumped on Cancel to remount the form, restoring every field's default.
  const [resetKey, setResetKey] = useState(0);
  // Submitted values echoed back on an error — React resets a form after its
  // action runs, even when it fails — so the fields refill. Cancel drops them.
  const [refill, setRefill] = useState<Record<string, string>>();
  const locked = !editing;

  // `filed` is fixed per mount: the page re-keys the form once a Report lands.
  const [state, action, pending] = useActionState<ReportFormState, FormData>(
    async (prev, formData) => {
      const result = await (filed ? editReportAction : fileReportAction)(prev, formData);
      setRefill(result?.values);
      if (filed && result?.ok) setEditing(false);
      return result;
    },
    undefined,
  );

  function cancelEdit() {
    setEditing(false);
    setRefill(undefined);
    setResetKey((k) => k + 1);
  }

  return (
    <form key={resetKey} action={action} className="relative space-y-4">
      <input type="hidden" name="serviceId" value={serviceId} />

      {locked && (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setEditing(true)}
          className="absolute right-3 top-3 z-10"
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      )}

      <Card className="space-y-4">
        <h2 className="text-lg font-medium">
          {filed ? "How it went" : "How did it go?"}
        </h2>
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
              readOnly={locked}
              mono
              defaultValue={refill?.[q.id] ?? (filed ? answerDefault(answers[q.id]) : "0")}
              help={locked ? undefined : "Whole number"}
              className={LOCKED_CLS}
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
                readOnly={locked}
                defaultValue={refill?.[q.id] ?? (filed ? answerDefault(answers[q.id]) : "")}
                placeholder={locked ? "Nothing flagged" : undefined}
                className={cn(fieldInputVariants(), "resize-y", LOCKED_CLS)}
              />
            </div>
          ),
        )}
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-medium">
          {filed ? "Counts recorded" : "Count the supplies"}
        </h2>
        {countRows.length > 0 ? (
          <div className="space-y-4">
            {countRows.map((row) => (
              <Field
                key={row.supplyId}
                id={`count-${row.supplyId}`}
                name={`count_${row.supplyId}`}
                label={row.name}
                type="number"
                min={0}
                step="any"
                inputMode="decimal"
                required
                readOnly={locked}
                mono
                suffix={row.unit ?? undefined}
                placeholder="0.0"
                defaultValue={refill?.[`count_${row.supplyId}`] ?? row.count ?? ""}
                help={locked ? undefined : "Decimals OK — e.g. 1.5"}
                className={LOCKED_CLS}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-subtle">
            {filed
              ? "No counts were recorded."
              : "No supplies are designated for counting yet."}
          </p>
        )}
      </Card>

      {editing && state?.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      {editing &&
        (filed ? (
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={cancelEdit}
              disabled={pending}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Saving…" : "Re-submit report"}
            </Button>
          </div>
        ) : (
          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Filing…" : "File report"}
          </Button>
        ))}
    </form>
  );
}
