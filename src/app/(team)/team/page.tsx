import { requireLead } from "@/lib/dal";
import { listMembers, listPendingInvites } from "@/modules/auth/invites";
import { InviteForm } from "./invite-form";

export default async function TeamPage() {
  await requireLead();
  const [members, pending] = await Promise.all([
    listMembers(),
    listPendingInvites(),
  ]);

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-neutral-500">
          Invite members by email. They sign in with a one-time link — no
          passwords.
        </p>
      </div>

      <InviteForm />

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Members</h2>
        <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between px-4 py-3 text-sm"
            >
              <span>{m.email ?? m.name ?? m.id}</span>
              <span className="capitalize text-neutral-500">{m.role}</span>
            </li>
          ))}
          {members.length === 0 && (
            <li className="px-4 py-3 text-sm text-neutral-400">
              No members yet.
            </li>
          )}
        </ul>
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Pending invites</h2>
          <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200">
            {pending.map((p) => (
              <li
                key={p.email}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span>{p.email}</span>
                <span className="capitalize text-neutral-500">{p.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
