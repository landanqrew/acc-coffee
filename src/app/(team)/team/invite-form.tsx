"use client";

import { useActionState, useId } from "react";
import { Button, Field, fieldInputVariants } from "@/components/ui";
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
        error={state?.error}
      />

      <div className="block">
        <label
          htmlFor={roleId}
          className="mb-1 block text-xs font-medium text-muted-foreground"
        >
          Role
        </label>
        <select
          id={roleId}
          name="role"
          defaultValue="volunteer"
          className={fieldInputVariants()}
        >
          <option value="volunteer">Volunteer</option>
          <option value="lead">Lead</option>
        </select>
      </div>

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
