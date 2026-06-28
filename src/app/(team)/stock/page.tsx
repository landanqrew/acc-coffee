import { requireSession } from "@/lib/dal";
import { getStockLevels, stockStatus } from "@/modules/inventory/stock";
import { StockCard } from "./stock-card";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function StockPage() {
  await requireSession();
  const levels = await getStockLevels();

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock</h1>
        <p className="text-sm text-muted-foreground">
          Current level of every supply — the latest count wins. Tap a supply to
          record a new count any time (e.g. after a supply run).
        </p>
      </div>

      {levels.length === 0 ? (
        <p className="text-sm text-subtle">
          No active supplies yet. A Lead can add them on the Supplies page.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {levels.map((level) => (
            <li key={level.supply.id}>
              <StockCard
                supplyId={level.supply.id}
                name={level.supply.name}
                currentCount={level.currentCount}
                minimumLevel={level.supply.minimumLevel}
                status={stockStatus(level)}
                lastCountedLabel={
                  level.lastCountedAt
                    ? `Last counted ${dateFormat.format(level.lastCountedAt)}`
                    : "No counts on record"
                }
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
