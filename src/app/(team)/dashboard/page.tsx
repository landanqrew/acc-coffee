import Link from "next/link";
import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { getBrewQuantitiesByService } from "@/modules/services/brew";
import { getTodaysServices } from "@/modules/services/service";

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

export default async function DashboardPage() {
  const user = await requireSession();
  const todays = await getTodaysServices();
  const quantities = await getBrewQuantitiesByService(todays.map((s) => s.id));

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team dashboard</h1>
        <p className="text-sm text-neutral-500">
          Signed in as {user.email} ·{" "}
          <span className="capitalize">{user.role}</span>
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Today&rsquo;s coffee</h2>
        {todays.length > 0 ? (
          <ul className="space-y-3">
            {todays.map((s) => {
              const q = quantities.get(s.id);
              return (
                <li key={s.id} className="rounded-lg border border-neutral-200 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <Link
                      href={`/services/${s.id}`}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {s.name}
                    </Link>
                    <span className="text-sm text-neutral-500">
                      {formatTime(s.time)}
                    </span>
                  </div>
                  {q ? (
                    <p className="mt-2 text-sm">
                      Brew <strong>{q.regularPots}</strong> regular ·{" "}
                      <strong>{q.decafPots}</strong> decaf (pots)
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-neutral-400">
                      No brew quantities set
                      {isLead(user.role) ? " — set them on the Service." : " yet."}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">No Services today.</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Service-day Runbook</h2>
        <Link
          href="/runbook"
          className="block rounded-lg border border-neutral-200 p-4 hover:border-neutral-400"
        >
          <span className="font-medium underline-offset-2">
            Open the Runbook →
          </span>
          <p className="mt-1 text-sm text-neutral-500">
            Setup &amp; teardown checklist, equipment notes, and where supplies
            live.
          </p>
        </Link>
      </div>

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
