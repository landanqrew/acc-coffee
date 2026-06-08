import Link from "next/link";
import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { signOutAction } from "./actions";

export default async function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSession();

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3">
        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/services">Services</Link>
          <Link href="/stock">Stock</Link>
          <Link href="/supplies">Supplies</Link>
          <Link href="/runbook">Runbook</Link>
          <Link href="/feedback">Feedback</Link>
          {isLead(user.role) && <Link href="/team">Team</Link>}
          {isLead(user.role) && <Link href="/settings">Settings</Link>}
        </nav>
        <form action={signOutAction}>
          <button
            type="submit"
            className="text-sm text-neutral-500 underline-offset-2 hover:underline"
          >
            Sign out
          </button>
        </form>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
