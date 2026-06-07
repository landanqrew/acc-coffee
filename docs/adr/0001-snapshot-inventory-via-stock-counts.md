# Snapshot inventory via Stock Counts, not a ledger

Inventory is tracked as observed snapshots: each Service Report (and any ad-hoc update) records a Stock Count per designated Supply, and the latest count is the current stock level. Consumption is never recorded — there are no decrements and no purchase/consume ledger.

## Considered Options

- **Decrement model** — Service Reports log supplies used and subtract from stock. Rejected: drifts from reality (spills, untracked grabs, mid-week purchases) and demands accuracy from volunteers filling out a form on a Sunday morning.
- **Full purchase/consume ledger** — every purchase in, every use out. Rejected: most rigorous, but far more data entry than a small church coffee team will sustain.
- **Snapshot counts (chosen)** — counting shelves is something volunteers can do reliably; a fresh count self-corrects any drift by definition.

## Consequences

- Stock is only as fresh as the latest count; a skipped report means stale numbers until the next one.
- Restock Alerts trigger on observed counts crossing a Supply's minimum, not on computed consumption.
- Usage-rate analytics (e.g. "beans per Service") can only be inferred from count deltas, not from explicit consumption records.
