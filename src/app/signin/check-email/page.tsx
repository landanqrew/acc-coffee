export default function CheckEmailPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 text-center">
      <div className="w-full max-w-sm space-y-3">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-sm text-neutral-500">
          If that address is on the coffee team, a sign-in link is on its way.
          Open it on this device to sign in.
        </p>
        <p className="text-xs text-neutral-400">
          The link expires shortly. You can close this tab.
        </p>
      </div>
    </main>
  );
}
