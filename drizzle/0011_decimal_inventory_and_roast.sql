ALTER TABLE "brew_quantity" DROP CONSTRAINT "brew_quantity_regular_nonneg";
--> statement-breakpoint
ALTER TABLE "brew_quantity" DROP CONSTRAINT "brew_quantity_decaf_nonneg";
--> statement-breakpoint
ALTER TABLE "brew_quantity" RENAME COLUMN "regularPots" TO "mediumPots";
--> statement-breakpoint
ALTER TABLE "brew_quantity" RENAME COLUMN "decafPots" TO "darkPots";
--> statement-breakpoint
ALTER TABLE "stock_count" ALTER COLUMN "count" SET DATA TYPE numeric;
--> statement-breakpoint
ALTER TABLE "supply" ALTER COLUMN "minimumLevel" SET DATA TYPE numeric;
--> statement-breakpoint
ALTER TABLE "brew_quantity" ADD CONSTRAINT "brew_quantity_medium_nonneg" CHECK ("brew_quantity"."mediumPots" >= 0);
--> statement-breakpoint
ALTER TABLE "brew_quantity" ADD CONSTRAINT "brew_quantity_dark_nonneg" CHECK ("brew_quantity"."darkPots" >= 0);--> statement-breakpoint
UPDATE "service_report" SET "answers" = ("answers" - 'regularPots' - 'decafPots') || jsonb_strip_nulls(jsonb_build_object('mediumPots', "answers" -> 'regularPots', 'darkPots', "answers" -> 'decafPots')) WHERE "answers" ? 'regularPots' OR "answers" ? 'decafPots';
