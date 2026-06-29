"use client";

import { useActionState, useId } from "react";
import { Button, Field, fieldInputVariants } from "@/components/ui";
import { cn } from "@/lib/utils";
import { inviteAction } from "./actions";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteAction, undefined);
  const roleId = useId();

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="off"
        autoCapitalize="none"
        autoCorrect="off"
        required
        placeholder="newmember@church.org"
      />

      <div className="block">
        <label
          htmlFor={roleId}
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Role
        </label>
        <div className="relative">
          <select
            id={roleId}
            name="role"
            defaultValue="volunteer"
            className={cn(fieldInputVariants(), "appearance-none pr-10")}
          >
            <option value="volunteer">Volunteer</option>
            <option value="lead">Lead</option>
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-subtle"
          >
            <path
              d="m6 8 4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-danger" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-ok" role="status">
          {state.ok}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending invite…" : "Send invite"}
      </Button>
    </form>
  );
}
