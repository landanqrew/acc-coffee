"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Field } from "@/components/ui";
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
      <Field
        id="email"
        name="email"
        label="Email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        autoCorrect="off"
        required
        placeholder="you@church.org"
      />

      {errorMessage && (
        <p className="text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Sending link…" : "Email me a sign-in link"}
      </Button>
    </form>
  );
}
