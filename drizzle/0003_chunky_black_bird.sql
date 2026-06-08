CREATE TABLE "stock_count" (
	"id" text PRIMARY KEY NOT NULL,
	"supplyId" text NOT NULL,
	"count" integer NOT NULL,
	"source" text DEFAULT 'ad_hoc' NOT NULL,
	"recordedByUserId" text,
	"countedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "stock_count_nonneg" CHECK ("stock_count"."count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "stock_count" ADD CONSTRAINT "stock_count_supplyId_supply_id_fk" FOREIGN KEY ("supplyId") REFERENCES "public"."supply"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_count" ADD CONSTRAINT "stock_count_recordedByUserId_user_id_fk" FOREIGN KEY ("recordedByUserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;