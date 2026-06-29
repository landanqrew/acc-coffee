"use client";

import { useActionState, useEffect } from "react";
import { Button, Field } from "@/components/ui";
import type { Supply } from "@/modules/inventory/supply";
import {
  createSupplyAction,
  updateSupplyAction,
  type SupplyFormState,
} from "./actions";

/**
 * The body of the Supply add/edit sheet. Create mode (no `supply`) and edit
 * mode (with `supply`) share one layout so a Lead manages every Supply with the
 * same controls. On a successful save it calls `onSaved` so the sheet closes,
 * matching the Stock-Count sheet pattern.
 */
export function SupplyForm({
  supply,
  onSaved,
}: {
  supply?: Supply;
  onSaved?: () => void;
}) {
  const isEdit = Boolean(supply);
  // useActionState locks the action at mount, which is safe here: a given form
  // instance is always create (AddSupply, no `supply`) or always edit
  // (SupplyCard, with `supply`) — the `supply` prop never flips mid-mount.
  const [state, action, pending] = useActionState<SupplyFormState, FormData>(
    isEdit ? updateSupplyAction : createSupplyAction,
    undefined,
  );

  // The list re-renders from revalidated server data once the save lands, so
  // there is nothing left to keep the sheet open for.
  useEffect(() => {
    if (state?.ok) onSaved?.();
  }, [state, onSaved]);

  return (
    <form action={action} className="mt-4 space-y-4">
      {supply && <input type="hidden" name="id" value={supply.id} />}

      <Field
        label="Supply"
        name="name"
        type="text"
        required
        autoFocus
        defaultValue={supply?.name ?? ""}
        placeholder="e.g. Medium roast beans"
        error={state?.error}
      />

      <Field
        label="Minimum level"
        name="minimumLevel"
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        mono
        defaultValue={supply?.minimumLevel ?? ""}
        placeholder="none"
        help="A Restock Alert fires when stock drops below this. Leave blank for no minimum."
      />

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          name="designated"
          defaultChecked={supply?.designated ?? false}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        Count this on every Service Report
      </label>

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add supply"}
      </Button>
    </form>
  );
}
