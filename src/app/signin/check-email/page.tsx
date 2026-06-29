import { Card } from "@/components/ui";

export default function CheckEmailPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-app p-6">
      <Card elevation="lift" className="w-full max-w-sm space-y-3 text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-sm text-muted-foreground">
          If that address is on the coffee team, a sign-in link is on its way.
          Open it on this device to sign in.
        </p>
        <p className="text-xs text-subtle">
          The link expires shortly. You can close this tab.
        </p>
      </Card>
    </main>
  );
}
