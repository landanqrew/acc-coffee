"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signInAction } from "./actions";

// Auth.js redirects here with ?error=<code> when a sign-in attempt fails.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Something is misconfigured on our end. Please try again later.",
  AccessDenied: "That email isn't on the coffee team.",
  Verification: "That sign-in link has expired or already been used.",
};

const DEFAULT_AUTH_ERROR = "We couldn't sign you in. Please try again.";

export function SignInForm() {
  const [state, action, pending] = useActionState(signInAction, undefined);
  const authError = useSearchParams().get("error");
  const errorMessage =
    state?.error ??
    (authError
      ? (AUTH_ERROR_MESSAGES[authError] ?? DEFAULT_AUTH_ERROR)
      : undefined);

  return (
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

      {errorMessage && (
        <p className="text-sm text-red-600" role="alert">
          {errorMessage}
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
  );
}
