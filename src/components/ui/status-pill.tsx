import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { PILL_BASE } from "./pill";

export type Status = "ok" | "warn" | "danger";

/**
 * Status chip using the status token trios (fg + bg + bd). Maps the stock
 * states — OK → ok, Low → warn, Out → danger.
 */
export const statusPillVariants = cva(PILL_BASE, {
  variants: {
    status: {
      ok: "border-ok-bd bg-ok-bg text-ok",
      warn: "border-warn-bd bg-warn-bg text-warn",
      danger: "border-danger-bd bg-danger-bg text-danger",
    },
  },
  defaultVariants: {
    status: "ok",
  },
});

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Required — every status pill must convey a real state, never default. */
  status: Status;
}

export const StatusPill = React.forwardRef<HTMLSpanElement, StatusPillProps>(
  function StatusPill({ className, status, ...props }, ref) {
    return (
      <span
        ref={ref}
        className={cn(statusPillVariants({ status }), className)}
        {...props}
      />
    );
  },
);
