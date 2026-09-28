ALTER TABLE "service_report" ADD COLUMN "editedAt" timestamp;--> statement-breakpoint
ALTER TABLE "supply" ADD COLUMN "unit" text;--> statement-breakpoint
ALTER TABLE "supply" ADD CONSTRAINT "supply_unit_length" CHECK (char_length("supply"."unit") <= 30);