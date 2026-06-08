import { requireLead } from "@/lib/dal";
import { getChurchAdminEmail } from "@/modules/settings/settings";
import { ChurchAdminForm } from "./settings-form";

export default async function SettingsPage() {
  await requireLead();
  const current = await getChurchAdminEmail();

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-neutral-500">
          Restock alerts email the Church Admin whenever a designated supply’s
          count drops below its minimum.
        </p>
      </div>

      <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
        <h2 className="text-lg font-medium">Church Admin email</h2>
        <p className="text-sm text-neutral-500">
          Where restock alerts are sent. This is an email address, not a team
          member — they don’t need an account.
        </p>
        <ChurchAdminForm current={current} />
      </div>
    </section>
  );
}
