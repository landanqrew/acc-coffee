import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The input surface for a Field. `text-base` padding keeps iOS from zooming
 * on focus; `mono` is for numeric / data entry; `invalid` flips to danger.
 */
export const fieldInputVariants = cva(
  "w-full rounded-lg border bg-white px-3 py-2.5 text-base outline-none transition-colors placeholder:text-subtle",
  {
    variants: {
      mono: {
        true: "font-mono tabular-nums",
        false: "",
      },
      invalid: {
        true: "border-danger focus:border-danger focus:ring-2 focus:ring-danger/20",
        false:
          "border-border focus:border-primary focus:ring-2 focus:ring-primary/20",
      },
    },
    defaultVariants: {
      mono: false,
      invalid: false,
    },
  },
);

export interface FieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    Pick<VariantProps<typeof fieldInputVariants>, "mono"> {
  label: string;
  /** Validation message; presence flips the input into the invalid state. */
  error?: string;
  /** Optional helper text shown under the input when there is no error. */
  help?: string;
}

export const Field = React.forwardRef<HTMLInputElement, FieldProps>(
  function Field({ label, error, help, mono, className, id, ...props }, ref) {
    const reactId = React.useId();
    const inputId = id ?? reactId;
    const describedById = error
      ? `${inputId}-error`
      : help
        ? `${inputId}-help`
        : undefined;

    return (
      <div className="block">
        <label
          htmlFor={inputId}
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedById}
          className={cn(
            fieldInputVariants({ mono, invalid: Boolean(error) }),
            className,
          )}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-danger">
            {error}
          </p>
        ) : help ? (
          <p
            id={`${inputId}-help`}
            className="mt-1 text-xs text-muted-foreground"
          >
            {help}
          </p>
        ) : null}
      </div>
    );
  },
);
