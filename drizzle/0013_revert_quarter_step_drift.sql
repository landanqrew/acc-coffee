-- Production received the unmerged quarter-unit migration (PR #51), which added
-- 0.25-step checks and switched counts to double precision. Revert that drift;
-- a no-op on databases that never had it.
ALTER TABLE "stock_count" DROP CONSTRAINT IF EXISTS "stock_count_quarter_step";
--> statement-breakpoint
ALTER TABLE "supply" DROP CONSTRAINT IF EXISTS "supply_minimum_level_quarter_step";
--> statement-breakpoint
ALTER TABLE "stock_count" ALTER COLUMN "count" SET DATA TYPE numeric;
--> statement-breakpoint
ALTER TABLE "supply" ALTER COLUMN "minimumLevel" SET DATA TYPE numeric;
