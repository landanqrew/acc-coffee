import { Suspense } from "react";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">acc-coffee</h1>
          <p className="text-sm text-neutral-500">
            Sign in with the email your team invited.
          </p>
        </div>

        <Suspense>
          <SignInForm />
        </Suspense>

        <p className="text-center text-xs text-neutral-400">
          No passwords — we email you a one-time link.
        </p>
      </div>
    </main>
  );
}
