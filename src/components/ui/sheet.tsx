"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Bottom sheet from the study's "side-pane → bottom sheet" rule: a dimmed
 * backdrop and a lifted white panel that rises from the bottom edge with a
 * drag handle, respecting the iOS safe-area inset. Built on Radix Dialog so
 * focus-trapping, Esc-to-close and scroll-locking come for free.
 */
export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export const SheetContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    title: string;
  }
>(function SheetContent({ className, children, title, ...props }, ref) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-foreground/25" />
      <DialogPrimitive.Content
        ref={ref}
        // The sheet's own header is its label; it has no separate description,
        // so suppress Radix's default aria-describedby (it would point at a
        // node that never renders). Callers can still override via ...props.
        aria-describedby={undefined}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-5 shadow-panel",
          "pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "focus:outline-none",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden
          className="mx-auto mb-3 h-1 w-10 rounded-full bg-border"
        />
        <div className="flex items-center">
          <DialogPrimitive.Title className="text-sm font-bold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            className="-my-1.5 -mr-1.5 ml-auto grid h-11 w-11 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
});
