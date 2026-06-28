import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status chip using the status token trios (fg + bg + bd). Maps the stock
 * states — OK → ok, Low → warn, Out → danger.
 */
export const statusPillVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
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
  },
);

export interface StatusPillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {}

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
