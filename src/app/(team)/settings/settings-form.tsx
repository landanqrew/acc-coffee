"use client";

import { useActionState } from "react";
import { Button, Field } from "@/components/ui";
import { setChurchAdminAction, type SettingsFormState } from "./actions";

export function ChurchAdminForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    setChurchAdminAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <Field
        label="Email address"
        name="email"
        type="email"
        required
        defaultValue={current ?? ""}
        placeholder="admin@church.org"
        inputMode="email"
        autoComplete="email"
        error={state?.error}
      />
      {state?.ok && (
        <p className="text-sm text-ok" role="status">
          {state.ok}
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
