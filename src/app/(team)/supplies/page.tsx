import { requireSession } from "@/lib/dal";
import { isLead } from "@/modules/auth/roles";
import { listActiveSupplies } from "@/modules/inventory/supply";
import { retireSupplyAction } from "./actions";
import { SupplyForm } from "./supply-form";

export default async function SuppliesPage() {
  const user = await requireSession();
  const lead = isLead(user.role);
  const supplies = await listActiveSupplies();

  return (
    <section className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Supplies</h1>
        <p className="text-sm text-neutral-500">
          {lead
            ? "Add, edit, and retire the items the team tracks."
            : "The items the team tracks. Only a Lead can change these."}
        </p>
      </div>

      {lead && (
        <div className="rounded-lg border border-neutral-200 p-4">
          <h2 className="mb-3 text-lg font-medium">Add a supply</h2>
          <SupplyForm />
        </div>
      )}

      {supplies.length === 0 ? (
        <p className="text-sm text-neutral-400">No supplies yet.</p>
      ) : (
        <ul className="space-y-3">
          {supplies.map((supply) => (
            <li
              key={supply.id}
              className="rounded-lg border border-neutral-200 p-4"
            >
              {lead ? (
                <div className="space-y-3">
                  <SupplyForm supply={supply} />
                  <form action={retireSupplyAction}>
                    <input type="hidden" name="id" value={supply.id} />
                    <button
                      type="submit"
                      className="text-sm text-red-600 underline-offset-2 hover:underline"
                    >
                      Retire
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{supply.name}</span>
                  <span className="text-sm text-neutral-500">
                    {supply.designated && <span className="mr-2">counted</span>}
                    {supply.minimumLevel != null
                      ? `min ${supply.minimumLevel}`
                      : "no min"}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
