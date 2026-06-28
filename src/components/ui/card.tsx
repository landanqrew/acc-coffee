import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Lifted white surface on the app background — depth, not borders.
 * `rounded-2xl` with a soft (default) or lift shadow.
 */
export const cardVariants = cva("rounded-2xl bg-white p-5", {
  variants: {
    elevation: {
      soft: "shadow-soft",
      lift: "shadow-lift",
    },
  },
  defaultVariants: {
    elevation: "soft",
  },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, elevation, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(cardVariants({ elevation }), className)}
      {...props}
    />
  );
});
