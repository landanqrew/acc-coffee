import { requireSession } from "@/lib/dal";
import { getStockLevels } from "@/modules/inventory/stock";
import { CountForm } from "./count-form";

const dateFormat = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function StockPage() {
  await requireSession();
  const levels = await getStockLevels();

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Stock</h1>
        <p className="text-sm text-neutral-500">
          Current level of every supply — the latest count wins. Record a new
          count any time (e.g. after a supply run).
        </p>
      </div>

      {levels.length === 0 ? (
        <p className="text-sm text-neutral-400">
          No active supplies yet. A Lead can add them on the Supplies page.
        </p>
      ) : (
        <ul className="space-y-3">
          {levels.map(({ supply, currentCount, lastCountedAt, isLow }) => (
            <li
              key={supply.id}
              className={`rounded-lg border p-4 ${
                isLow ? "border-red-300 bg-red-50" : "border-neutral-200"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{supply.name}</span>
                    {isLow && (
                      <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                        Low
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-neutral-600">
                    {currentCount != null ? (
                      <>
                        On hand: <strong>{currentCount}</strong>
                        {supply.minimumLevel != null && (
                          <span className="text-neutral-400">
                            {" "}
                            · min {supply.minimumLevel}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-neutral-400">Not counted yet</span>
                    )}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {lastCountedAt
                      ? `Last counted ${dateFormat.format(lastCountedAt)}`
                      : "No counts on record"}
                  </p>
                </div>

                <CountForm supplyId={supply.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
