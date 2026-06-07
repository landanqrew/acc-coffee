"use client";

import { useActionState } from "react";
import type { Supply } from "@/modules/inventory/supply";
import {
  createSupplyAction,
  updateSupplyAction,
  type SupplyFormState,
} from "./actions";

/**
 * Create form (no `supply`) or edit form (with `supply`). Shares one layout so a
 * Lead manages every Supply with the same controls.
 */
export function SupplyForm({ supply }: { supply?: Supply }) {
  const isEdit = Boolean(supply);
  const [state, action, pending] = useActionState<SupplyFormState, FormData>(
    isEdit ? updateSupplyAction : createSupplyAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      {supply && <input type="hidden" name="id" value={supply.id} />}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1">
          <label htmlFor={`name-${supply?.id ?? "new"}`} className="text-sm font-medium">
            Supply
          </label>
          <input
            id={`name-${supply?.id ?? "new"}`}
            name="name"
            type="text"
            required
            defaultValue={supply?.name ?? ""}
            placeholder="e.g. Medium roast beans"
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
          />
        </div>

        <div className="space-y-1 sm:w-32">
          <label htmlFor={`min-${supply?.id ?? "new"}`} className="text-sm font-medium">
            Min level
          </label>
          <input
            id={`min-${supply?.id ?? "new"}`}
            name="minimumLevel"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            defaultValue={supply?.minimumLevel ?? ""}
            placeholder="none"
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="designated"
          defaultChecked={supply?.designated ?? false}
          className="h-4 w-4"
        />
        Count this on every Service Report
      </label>

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
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add supply"}
      </button>
    </form>
  );
}
