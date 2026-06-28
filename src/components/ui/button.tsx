import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Pill buttons from the study's component grammar. Primary is a royal-blue
 * fill that deepens to brand-deep on hover; the shadow lifts soft → lift.
 * Default and icon sizes keep a >=44px tap target for mobile.
 */
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-shadow transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-soft hover:bg-brand-deep hover:shadow-lift",
        secondary:
          "border border-border bg-white text-foreground shadow-soft hover:shadow-lift",
        link: "text-brand-deep hover:underline",
        ghost: "text-muted-foreground hover:bg-muted",
      },
      size: {
        default: "min-h-11 px-4 py-2 text-sm",
        sm: "min-h-9 px-3 py-1.5 text-xs",
        icon: "h-11 w-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
