"use client";

import { useActionState } from "react";
import { Button, fieldInputVariants } from "@/components/ui";
import type { RunbookSectionId } from "@/modules/runbook/runbook";
import { saveRunbookSectionAction, type RunbookFormState } from "./actions";

export function SectionEditor({
  section,
  label,
  placeholder,
  content,
}: {
  section: RunbookSectionId;
  label: string;
  placeholder: string;
  content: string;
}) {
  const [state, action, pending] = useActionState<RunbookFormState, FormData>(
    saveRunbookSectionAction,
    undefined,
  );

  // A hairline divider, not a nested box: the editor sits inside the section's
  // lifted card, so depth already separates the card — the seam to the edit
  // affordance is the one place a border belongs (study: borders for dividers).
  return (
    <form action={action} className="space-y-3 border-t border-border pt-4">
      <input type="hidden" name="section" value={section} />
      <div>
        <label
          htmlFor={`runbook-${section}`}
          className="block text-xs font-medium text-muted-foreground"
        >
          Edit {label.toLowerCase()}
        </label>
        <p className="mt-1 text-xs text-subtle">
          Markdown supported — use <code>-</code> or <code>1.</code> for steps,{" "}
          <code>##</code> for headings.
        </p>
      </div>
      <textarea
        id={`runbook-${section}`}
        name="content"
        rows={8}
        defaultValue={content}
        placeholder={placeholder}
        aria-invalid={state?.error ? true : undefined}
        aria-describedby={
          state?.error ? `runbook-${section}-error` : undefined
        }
        className={fieldInputVariants({ mono: true })}
      />
      {state?.error && (
        <p id={`runbook-${section}-error`} className="text-xs text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-xs text-ok" role="status">
          {state.ok}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
