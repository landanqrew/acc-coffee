import Link from "next/link";
import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";

export default async function DashboardPage() {
  const user = await requireSession();

  return (
    <section className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Team dashboard</h1>
        <p className="text-sm text-neutral-500">
          Signed in as {user.email} ·{" "}
          <span className="capitalize">{user.role}</span>
        </p>
      </div>

      <p className="text-neutral-600">
        This is the protected team area. Supplies, Service Reports, the Runbook,
        and brew quantities will live here as those slices land.
      </p>

      {isLead(user.role) && (
        <p className="text-sm">
          As a Lead, you can{" "}
          <Link href="/team" className="underline">
            invite team members
          </Link>
          .
        </p>
      )}
    </section>
  );
}
