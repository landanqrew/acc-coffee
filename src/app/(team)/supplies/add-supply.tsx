"use client";

import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { Button, Sheet, SheetContent, SheetTrigger } from "@/components/ui";
import { SupplyForm } from "./supply-form";

/**
 * The Lead's entry point for adding a Supply: a button that opens the same
 * add/edit sheet used for editing, with an empty `SupplyForm`. Closes itself
 * once the new Supply is saved.
 */
export function AddSupply() {
  const [open, setOpen] = useState(false);
  const closeSheet = useCallback(() => setOpen(false), []);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add supply
        </Button>
      </SheetTrigger>

      <SheetContent
        title="Add a supply"
        className="md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-sm md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
      >
        <SupplyForm onSaved={closeSheet} />
      </SheetContent>
    </Sheet>
  );
}
