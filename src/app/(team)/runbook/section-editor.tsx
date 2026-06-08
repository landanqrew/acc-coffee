"use client";

import { useActionState } from "react";
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

  return (
    <form
      action={action}
      className="space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-4"
    >
      <input type="hidden" name="section" value={section} />
      <label htmlFor={`runbook-${section}`} className="text-sm font-medium">
        Edit {label.toLowerCase()}
      </label>
      <p className="text-xs text-neutral-500">
        Markdown supported — use <code>-</code> or <code>1.</code> for steps,{" "}
        <code>##</code> for headings.
      </p>
      <textarea
        id={`runbook-${section}`}
        name="content"
        rows={8}
        defaultValue={content}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 px-3 py-2 font-mono text-sm outline-none focus:border-neutral-900"
      />
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
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
