"use client";

import { useCallback, useState } from "react";
import {
  Card,
  Pill,
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui";
import type { Supply } from "@/modules/inventory/supply";
import { retireSupplyAction } from "./actions";
import { supplyCardView } from "./supply-display";
import { SupplyForm } from "./supply-form";

/** The minimum level + designated flag, shown the same way on every card so a
 * Lead and a Volunteer read a Supply identically. Numbers render in mono. */
function SupplyFacts({ supply }: { supply: Supply }) {
  const view = supplyCardView(supply);
  return (
    <div className="mt-3 flex items-center justify-between gap-3">
      {view.hasMinimum ? (
        <p className="font-mono tabular-nums text-2xl leading-none">
          {view.minimum}
          <span className="ml-1 text-sm font-sans text-muted-foreground">
            min level
          </span>
        </p>
      ) : (
        <p className="text-sm text-subtle">No minimum level</p>
      )}
      {view.designated && <Pill tone="accent">Counted</Pill>}
    </div>
  );
}

/**
 * One Supply as a lifted Card. A Lead taps the card to open the add/edit sheet
 * (bottom sheet on mobile, centred panel on `md:`+) holding the shared
 * `SupplyForm` plus Retire — the same quick single-object edit pattern as Stock.
 * A Volunteer sees the same card, read-only.
 */
export function SupplyCard({ supply, lead }: { supply: Supply; lead: boolean }) {
  const [open, setOpen] = useState(false);
  const closeSheet = useCallback(() => setOpen(false), []);

  const body = (
    <Card className={lead ? "transition-shadow hover:shadow-lift" : undefined}>
      <span className="font-semibold">{supply.name}</span>
      <SupplyFacts supply={supply} />
    </Card>
  );

  if (!lead) {
    return body;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={`Edit ${supply.name}`}
          className="block w-full rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {body}
        </button>
      </SheetTrigger>

      <SheetContent
        title={`Edit · ${supply.name}`}
        className="md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-sm md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
      >
        <SupplyForm supply={supply} onSaved={closeSheet} />

        <form action={retireSupplyAction} className="mt-4 border-t border-border pt-4">
          <input type="hidden" name="id" value={supply.id} />
          <button
            type="submit"
            className="text-sm text-danger underline-offset-2 hover:underline"
          >
            Retire this supply
          </button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
