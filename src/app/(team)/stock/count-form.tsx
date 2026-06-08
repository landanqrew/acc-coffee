"use client";

import { useActionState } from "react";
import { recordCountAction, type CountState } from "./actions";

export function CountForm({ supplyId }: { supplyId: string }) {
  const [state, action, pending] = useActionState<CountState, FormData>(
    recordCountAction,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <input type="hidden" name="supplyId" value={supplyId} />
        <input
          name="count"
          type="number"
          min="0"
          step="1"
          inputMode="numeric"
          required
          aria-label="New count"
          placeholder="count"
          className="w-24 rounded-lg border border-neutral-300 px-3 py-2 text-base outline-none focus:border-neutral-900"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "…" : "Record"}
        </button>
      </div>
      {state?.error && (
        <p className="text-xs text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-xs text-green-700" role="status">
          {state.ok}
        </p>
      )}
    </form>
  );
}
