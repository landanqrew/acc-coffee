"use client";

import { useActionState } from "react";
import {
  addScheduleAction,
  createAdHocAction,
  removeScheduleAction,
  type ServiceFormState,
} from "./actions";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const inputClass =
  "w-full rounded-lg border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900";

export function ScheduleForm() {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(
    addScheduleAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="sched-name" className="text-sm font-medium">
          Gathering name
        </label>
        <input id="sched-name" name="name" type="text" required placeholder="9am Gathering" className={inputClass} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="sched-weekday" className="text-sm font-medium">
            Day
          </label>
          <select id="sched-weekday" name="weekday" defaultValue="0" className={inputClass}>
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="w-32 space-y-1">
          <label htmlFor="sched-time" className="text-sm font-medium">
            Time
          </label>
          <input id="sched-time" name="time" type="time" required defaultValue="09:00" className={inputClass} />
        </div>
      </div>
      <FormStatus state={state} />
      <button type="submit" disabled={pending} className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Saving…" : "Add gathering"}
      </button>
    </form>
  );
}

export function AdHocForm() {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(
    createAdHocAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="adhoc-name" className="text-sm font-medium">
          Service name
        </label>
        <input id="adhoc-name" name="name" type="text" required placeholder="Christmas Eve" className={inputClass} />
      </div>
      <div className="flex gap-3">
        <div className="flex-1 space-y-1">
          <label htmlFor="adhoc-date" className="text-sm font-medium">
            Date
          </label>
          <input id="adhoc-date" name="date" type="date" required className={inputClass} />
        </div>
        <div className="w-32 space-y-1">
          <label htmlFor="adhoc-time" className="text-sm font-medium">
            Time
          </label>
          <input id="adhoc-time" name="time" type="time" required defaultValue="18:00" className={inputClass} />
        </div>
      </div>
      <FormStatus state={state} />
      <button type="submit" disabled={pending} className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60">
        {pending ? "Saving…" : "Add service"}
      </button>
    </form>
  );
}

export function RemoveScheduleForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(
    removeScheduleAction,
    undefined,
  );

  return (
    <form action={action} className="flex flex-col items-end gap-1">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-red-600 underline-offset-2 hover:underline disabled:opacity-60"
      >
        {pending ? "Removing…" : "Remove"}
      </button>
      {state?.error && (
        <span className="text-xs text-red-600" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}

function FormStatus({ state }: { state: ServiceFormState }) {
  if (state?.error) {
    return (
      <p className="text-sm text-red-600" role="alert">
        {state.error}
      </p>
    );
  }
  if (state?.ok) {
    return (
      <p className="text-sm text-green-700" role="status">
        {state.ok}
      </p>
    );
  }
  return null;
}
