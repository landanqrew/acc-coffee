"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Field,
  Sheet,
  SheetContent,
  SheetTrigger,
  StatusPill,
  type Status,
} from "@/components/ui";
import type { StockStatus } from "@/modules/inventory/stock";
import { recordCountAction, type CountState } from "./actions";

/** Maps a domain stock status to its pill colour + human label. */
const STATUS_META: Record<StockStatus, { status: Status; label: string }> = {
  ok: { status: "ok", label: "OK" },
  low: { status: "warn", label: "Low" },
  out: { status: "danger", label: "Out" },
};

export type StockCardProps = {
  supplyId: string;
  name: string;
  currentCount: number | null;
  minimumLevel: number | null;
  status: StockStatus | null;
  lastCountedLabel: string;
};

/**
 * One tap-friendly Card per Supply. Tapping the card opens the Stock-Count
 * sheet (bottom sheet on mobile, centred panel on larger screens). Counts
 * render in mono so columns of digits line up across cards.
 */
export function StockCard({
  supplyId,
  name,
  currentCount,
  minimumLevel,
  status,
  lastCountedLabel,
}: StockCardProps) {
  const [open, setOpen] = useState(false);
  const meta = status ? STATUS_META[status] : null;
  // Stable across renders so CountSheetForm's effect doesn't re-fire when the
  // server revalidation re-renders this card while the sheet is still open.
  const closeSheet = useCallback(() => setOpen(false), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Record a stock count for ${name}`}
          className="block w-full rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Card className="transition-shadow hover:shadow-lift">
            <div className="flex items-start justify-between gap-3">
              <span className="font-semibold">{name}</span>
              {meta && (
                <StatusPill status={meta.status}>{meta.label}</StatusPill>
              )}
            </div>

            {currentCount != null ? (
              <p className="mt-3 font-mono tabular-nums text-2xl leading-none">
                {currentCount}
                <span className="ml-1 text-sm font-sans text-muted-foreground">
                  on hand
                </span>
                {minimumLevel != null && (
                  <span className="ml-2 text-xs font-sans text-muted-foreground">
                    min {minimumLevel}
                  </span>
                )}
              </p>
            ) : (
              <p className="mt-3 text-sm text-subtle">Not counted yet</p>
            )}

            <p className="mt-2 text-xs text-muted-foreground">
              {lastCountedLabel}
            </p>
          </Card>
        </button>
      </SheetTrigger>

      <SheetContent
        title={`Count · ${name}`}
        className="md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-sm md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
      >
        <CountSheetForm
          supplyId={supplyId}
          currentCount={currentCount}
          onSaved={closeSheet}
        />
      </SheetContent>
    </Sheet>
  );
}

/**
 * The body of the Stock-Count sheet: a single mono count Field wired to the
 * existing `recordCountAction`. Pre-fills the current level so a small
 * correction is one keystroke, and closes the sheet once the count is saved.
 */
function CountSheetForm({
  supplyId,
  currentCount,
  onSaved,
}: {
  supplyId: string;
  currentCount: number | null;
  onSaved: () => void;
}) {
  const [state, action, pending] = useActionState<CountState, FormData>(
    recordCountAction,
    undefined,
  );

  // The card re-renders from the revalidated server data; once the count is
  // saved there is nothing left to show in the sheet, so close it.
  useEffect(() => {
    if (state?.ok) onSaved();
  }, [state, onSaved]);

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="supplyId" value={supplyId} />
      <Field
        label="New count"
        name="count"
        type="number"
        min={0}
        step={1}
        inputMode="numeric"
        required
        mono
        autoFocus
        defaultValue={currentCount ?? ""}
        error={state?.error}
        help="Whole number on hand right now — the latest count wins."
      />
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Save count"}
      </Button>
    </form>
  );
}
