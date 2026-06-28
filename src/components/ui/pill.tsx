import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/** Shared chip base — reused by StatusPill so the two never drift apart. */
export const PILL_BASE =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium";

/**
 * Neutral / accent chip — event tags ("Special") and data chips. The mono
 * flag switches to JetBrains Mono for short codes (WATER, ATP, …).
 */
export const pillVariants = cva(PILL_BASE, {
  variants: {
    tone: {
      neutral: "border-border bg-muted text-muted-foreground",
      accent: "border-accent-foreground/20 bg-accent text-accent-foreground",
    },
    mono: {
      true: "px-1.5 font-mono text-[11px]",
      false: "",
    },
  },
  defaultVariants: {
    tone: "neutral",
    mono: false,
  },
});

export interface PillProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof pillVariants> {}

export const Pill = React.forwardRef<HTMLSpanElement, PillProps>(function Pill(
  { className, tone, mono, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cn(pillVariants({ tone, mono }), className)}
      {...props}
    />
  );
});
