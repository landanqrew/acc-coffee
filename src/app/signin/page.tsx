"use client";

import { useActionState } from "react";
import { signInAction } from "./actions";

export default function SignInPage() {
  const [state, action, pending] = useActionState(signInAction, undefined);

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">acc-coffee</h1>
          <p className="text-sm text-neutral-500">
            Sign in with the email your team invited.
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              required
              placeholder="you@church.org"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-red-600" role="alert">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-neutral-900 px-4 py-3 text-base font-medium text-white disabled:opacity-60"
          >
            {pending ? "Sending link…" : "Email me a sign-in link"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-400">
          No passwords — we email you a one-time link.
        </p>
      </div>
    </main>
  );
}
