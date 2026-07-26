ALTER TABLE "stock_count" ALTER COLUMN "count" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "supply" ALTER COLUMN "minimumLevel" SET DATA TYPE double precision;--> statement-breakpoint
ALTER TABLE "stock_count" ADD CONSTRAINT "stock_count_quarter_step" CHECK ("stock_count"."count" * 4 = floor("stock_count"."count" * 4));--> statement-breakpoint
ALTER TABLE "supply" ADD CONSTRAINT "supply_minimum_level_quarter_step" CHECK ("supply"."minimumLevel" is null or "supply"."minimumLevel" * 4 = floor("supply"."minimumLevel" * 4));