"use client";

import { useActionState } from "react";
import { Button, Field, fieldInputVariants } from "@/components/ui";
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

export function ScheduleForm() {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(
    addScheduleAction,
    undefined,
  );

  return (
    <form action={action} className="space-y-3">
      <Field
        id="sched-name"
        label="Gathering name"
        name="name"
        type="text"
        required
        placeholder="9am Gathering"
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <label
            htmlFor="sched-weekday"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            Day
          </label>
          <select
            id="sched-weekday"
            name="weekday"
            defaultValue="0"
            className={fieldInputVariants()}
          >
            {WEEKDAYS.map((d, i) => (
              <option key={d} value={i}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <div className="w-32">
          <Field
            id="sched-time"
            label="Time"
            name="time"
            type="time"
            required
            defaultValue="09:00"
            mono
          />
        </div>
      </div>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add gathering"}
      </Button>
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
      <Field
        id="adhoc-name"
        label="Service name"
        name="name"
        type="text"
        required
        placeholder="Christmas Eve"
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <Field
            id="adhoc-date"
            label="Date"
            name="date"
            type="date"
            required
            mono
          />
        </div>
        <div className="w-32">
          <Field
            id="adhoc-time"
            label="Time"
            name="time"
            type="time"
            required
            defaultValue="18:00"
            mono
          />
        </div>
      </div>
      <FormStatus state={state} />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add service"}
      </Button>
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
      <Button
        type="submit"
        variant="link"
        disabled={pending}
        className="text-danger"
      >
        {pending ? "Removing…" : "Remove"}
      </Button>
      {state?.error && (
        <span className="text-xs text-danger" role="alert">
          {state.error}
        </span>
      )}
    </form>
  );
}

function FormStatus({ state }: { state: ServiceFormState }) {
  if (state?.error) {
    return (
      <p className="text-sm text-danger" role="alert">
        {state.error}
      </p>
    );
  }
  if (state?.ok) {
    return (
      <p className="text-sm text-ok" role="status">
        {state.ok}
      </p>
    );
  }
  return null;
}
