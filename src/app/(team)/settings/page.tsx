import { requireLead } from "@/lib/dal";
import { getChurchAdminEmail } from "@/modules/settings/settings";
import { Card } from "@/components/ui";
import { ChurchAdminForm } from "./settings-form";

export default async function SettingsPage() {
  await requireLead();
  const current = await getChurchAdminEmail();

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Restock alerts email the Church Admin whenever a designated supply’s
          count drops below its minimum.
        </p>
      </div>

      <Card className="space-y-3">
        <h2 className="text-lg font-medium">Church Admin email</h2>
        <p className="text-sm text-muted-foreground">
          Where restock alerts are sent. This is an email address, not a team
          member — they don’t need an account.
        </p>
        <ChurchAdminForm current={current} />
      </Card>
    </section>
  );
}
