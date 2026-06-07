"use client";

import { useActionState } from "react";
import { inviteAction } from "./actions";

export function InviteForm() {
  const [state, action, pending] = useActionState(inviteAction, undefined);

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="invite-email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="invite-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          required
          placeholder="newmember@church.org"
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="invite-role" className="text-sm font-medium">
          Role
        </label>
        <select
          id="invite-role"
          name="role"
          defaultValue="volunteer"
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
        >
          <option value="volunteer">Volunteer</option>
          <option value="lead">Lead</option>
        </select>
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
        className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
      >
        {pending ? "Sending invite…" : "Send invite"}
      </button>
    </form>
  );
}
