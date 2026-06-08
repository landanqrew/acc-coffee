"use client";

import { useActionState } from "react";
import { setChurchAdminAction, type SettingsFormState } from "./actions";

export function ChurchAdminForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState<SettingsFormState, FormData>(
    setChurchAdminAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="church-admin-email" className="text-sm font-medium">
          Email address
        </label>
        <input
          id="church-admin-email"
          name="email"
          type="email"
          required
          defaultValue={current ?? ""}
          placeholder="admin@church.org"
          inputMode="email"
          autoComplete="email"
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="text-sm text-green-700" role="status">
          {state.ok}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
