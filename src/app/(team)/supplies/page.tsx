import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { listActiveSupplies } from "@/modules/inventory/supply";
import { AddSupply } from "./add-supply";
import { SupplyCard } from "./supply-card";

export default async function SuppliesPage() {
  const user = await requireSession();
  const lead = isLead(user.role);
  const supplies = await listActiveSupplies();

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Supplies</h1>
          <p className="text-sm text-muted-foreground">
            {lead
              ? "The items the team tracks. Tap a supply to edit or retire it."
              : "The items the team tracks. Only a Lead can change these."}
          </p>
        </div>
        {lead && <AddSupply />}
      </div>

      {supplies.length === 0 ? (
        <p className="text-sm text-subtle">
          {lead
            ? "No supplies yet. Add the first one to start tracking."
            : "No supplies yet. A Lead can add them."}
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {supplies.map((supply) => (
            <li key={supply.id}>
              <SupplyCard supply={supply} lead={lead} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
