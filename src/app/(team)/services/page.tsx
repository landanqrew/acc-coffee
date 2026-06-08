import Link from "next/link";
import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
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

function ServiceRow({ service }: { service: Service }) {
  return (
    <li>
      <Link
        href={`/services/${service.id}`}
        className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-neutral-50"
      >
        <div>
          <span className="font-medium">{service.name}</span>
          {service.kind === "ad_hoc" && (
            <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              Special
            </span>
          )}
          <div className="text-neutral-500">
            {formatDate(service.date)} · {formatTime(service.time)}
          </div>
        </div>
        <span className="text-neutral-400" aria-hidden>
          ›
        </span>
      </Link>
    </li>
  );
}

function ServiceList({ services }: { services: Service[] }) {
  return (
    <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
      {services.map((s) => (
        <ServiceRow key={s.id} service={s} />
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

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Services</h1>
        <p className="text-sm text-neutral-500">
          Sunday gatherings recur automatically. {lead && "Configure the schedule or add a special event below."}
        </p>
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Today</h2>
        {todays.length > 0 ? (
          <ServiceList services={todays} />
        ) : (
          <p className="text-sm text-neutral-400">No services today.</p>
        )}
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Upcoming</h2>
        {laterUpcoming.length > 0 ? (
          <ServiceList services={laterUpcoming} />
        ) : (
          <p className="text-sm text-neutral-400">Nothing scheduled ahead.</p>
        )}
      </div>

      {lead && (
        <div className="space-y-6 rounded-lg border border-neutral-200 p-4">
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Recurring schedule</h2>
            {schedule.length > 0 ? (
              <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
                {schedule.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                  >
                    <span>
                      <strong>{entry.name}</strong> · {WEEKDAYS[entry.weekday]}{" "}
                      {formatTime(entry.time)}
                    </span>
                    <RemoveScheduleForm id={entry.id} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-400">
                No recurring gatherings yet.
              </p>
            )}
            <ScheduleForm />
          </div>

          <div className="space-y-3 border-t border-neutral-200 pt-4">
            <h2 className="text-lg font-medium">Add a special event</h2>
            <AdHocForm />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Past</h2>
        {past.length > 0 ? (
          <ServiceList services={past} />
        ) : (
          <p className="text-sm text-neutral-400">No past services on record.</p>
        )}
      </div>
    </section>
  );
}
