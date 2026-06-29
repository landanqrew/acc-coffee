import { Suspense } from "react";
import { Card } from "@/components/ui";
import { SignInForm } from "./signin-form";

export default function SignInPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-app p-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">acc-coffee</h1>
          <p className="text-sm text-muted-foreground">
            Sign in with the email your team invited.
          </p>
        </div>

        <Card elevation="lift" className="space-y-6">
          <Suspense fallback={<div className="h-[148px]" aria-hidden />}>
            <SignInForm />
          </Suspense>

          <p className="text-center text-xs text-subtle">
            No passwords — we email you a one-time link.
          </p>
        </Card>
      </div>
    </main>
  );
}
