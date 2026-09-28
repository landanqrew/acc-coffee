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

## Amendment: correcting a Service Report's counts

A filed Service Report can be edited and re-submitted by any team member. Its Stock Counts are corrected **in place** — the count changes but `countedAt` is kept — rather than appended as new counts.

- Appending would date the correction "now" and wrongly override any ad-hoc count taken after the Report; an in-place correction keeps last-count-wins honest.
- This is the only way a Stock Count is edited. Ad-hoc counts stay append-only, and no count is ever deleted.
- The trade-off is lost history: the pre-correction value isn't kept (the Report records only that it was edited, and when).
- A correction fires a Restock Alert only when the corrected count is still the Supply's current level and newly crosses below its minimum.
