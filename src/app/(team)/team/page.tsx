import { requireLead } from "@/lib/dal";
import { listMembers, listPendingInvites } from "@/modules/auth/invites";
import { Card, Pill } from "@/components/ui";
import { InviteForm } from "./invite-form";

export default async function TeamPage() {
  await requireLead();
  const [members, pending] = await Promise.all([
    listMembers(),
    listPendingInvites(),
  ]);

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team</h1>
        <p className="text-sm text-muted-foreground">
          Invite members by email. They sign in with a one-time link — no
          passwords.
        </p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-medium">Invite a member</h2>
        <InviteForm />
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-medium">Members</h2>
        <Card className="p-0">
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <span>{m.email ?? m.name ?? m.id}</span>
                <Pill className="capitalize">{m.role}</Pill>
              </li>
            ))}
            {members.length === 0 && (
              <li className="px-5 py-3 text-sm text-subtle">No members yet.</li>
            )}
          </ul>
        </Card>
      </div>

      {pending.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Pending invites</h2>
          <Card className="p-0">
            <ul className="divide-y divide-border">
              {pending.map((p) => (
                <li
                  key={p.email}
                  className="flex items-center justify-between gap-3 px-5 py-3 text-sm"
                >
                  <span>{p.email}</span>
                  <Pill className="capitalize">{p.role}</Pill>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </section>
  );
}
