import Link from "next/link";
import { Card, Pill } from "@/components/ui";
import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { getBrewQuantitiesByService } from "@/modules/services/brew";
import { listSchedule, listServices, type Service } from "@/modules/services/service";
import { AdHocForm, RemoveScheduleForm, ScheduleForm } from "./service-forms";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "full",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2000, 0, 1, h, m)));
}

/** A lifted Service card — name in sans, date/time in mono, "Special" as a Pill. */
function ServiceCard({ service }: { service: Service }) {
  return (
    <li>
      <Link
        href={`/services/${service.id}`}
        className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Card className="flex items-center justify-between gap-3 transition-shadow hover:shadow-lift">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium">{service.name}</span>
              {service.kind === "ad_hoc" && <Pill tone="accent">Special</Pill>}
            </div>
            <div className="mt-1 font-mono text-xs text-muted-foreground">
              {formatDate(service.date)} · {formatTime(service.time)}
            </div>
          </div>
          <span className="text-subtle" aria-hidden>
            ›
          </span>
        </Card>
      </Link>
    </li>
  );
}

/**
 * A group of Service cards — a single column on mobile, a wider grid at `md:`+.
 * Empty groups fall back to a quiet note instead of an empty grid.
 */
function ServiceGroup({
  services,
  empty,
}: {
  services: Service[];
  empty: string;
}) {
  if (services.length === 0) {
    return <p className="text-sm text-subtle">{empty}</p>;
  }
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {services.map((s) => (
        <ServiceCard key={s.id} service={s} />
      ))}
    </ul>
  );
}

export default async function ServicesPage() {
  const user = await requireSession();
  const lead = isLead(user.role);
  const [{ upcoming, past, today: t }, schedule] = await Promise.all([
    listServices(),
    lead ? listSchedule() : Promise.resolve([]),
  ]);

  const todays = upcoming.filter((s) => s.date === t);
  const laterUpcoming = upcoming.filter((s) => s.date > t);

  // Services is now the post-login home, so it absorbs the retired Dashboard's
  // "Today's coffee" view — today's gatherings with their brew quantities.
  const quantities = await getBrewQuantitiesByService(todays.map((s) => s.id));

  return (
    <section className="mx-auto max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Services</h1>
        <p className="text-sm text-muted-foreground">
          Sunday gatherings recur automatically.{" "}
          {lead && "Configure the schedule or add a special event below."}
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Today&rsquo;s coffee</h2>
        {todays.length > 0 ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {todays.map((s) => {
              const q = quantities.get(s.id);
              return (
                <li key={s.id}>
                  <Card elevation="lift">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/services/${s.id}`}
                        aria-label={
                          s.kind === "ad_hoc" ? `${s.name} (Special)` : undefined
                        }
                        className="rounded font-medium underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {s.name}
                      </Link>
                      <div className="flex shrink-0 items-center gap-2">
                        {s.kind === "ad_hoc" && <Pill tone="accent">Special</Pill>}
                        <span className="font-mono text-sm text-muted-foreground">
                          {formatTime(s.time)}
                        </span>
                      </div>
                    </div>
                    {q ? (
                      <p className="mt-3 text-sm">
                        Brew{" "}
                        <span className="font-mono font-medium tabular-nums">
                          {q.regularPots}
                        </span>{" "}
                        regular ·{" "}
                        <span className="font-mono font-medium tabular-nums">
                          {q.decafPots}
                        </span>{" "}
                        decaf (pots)
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-subtle">
                        No brew quantities set
                        {lead ? " — set them on the Service." : " yet."}
                      </p>
                    )}
                  </Card>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-subtle">No services today.</p>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Upcoming</h2>
        <ServiceGroup services={laterUpcoming} empty="Nothing scheduled ahead." />
      </div>

      {lead && (
        <div className="space-y-6">
          <Card className="space-y-3">
            <h2 className="text-lg font-medium">Recurring schedule</h2>
            {schedule.length > 0 ? (
              <ul className="space-y-1">
                {schedule.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm hover:bg-muted"
                  >
                    <span>
                      <span className="font-medium">{entry.name}</span> ·{" "}
                      <span className="font-mono text-muted-foreground">
                        {WEEKDAYS[entry.weekday]} {formatTime(entry.time)}
                      </span>
                    </span>
                    <RemoveScheduleForm id={entry.id} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-subtle">No recurring gatherings yet.</p>
            )}
            <ScheduleForm />
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-medium">Add a special event</h2>
            <AdHocForm />
          </Card>
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Past</h2>
        <ServiceGroup services={past} empty="No past services on record." />
      </div>
    </section>
  );
}
