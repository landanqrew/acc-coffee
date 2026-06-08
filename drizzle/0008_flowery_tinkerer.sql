CREATE TABLE "brew_quantity" (
	"serviceId" text PRIMARY KEY NOT NULL,
	"regularPots" integer NOT NULL,
	"decafPots" integer NOT NULL,
	"updatedByUserId" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "brew_quantity_regular_nonneg" CHECK ("brew_quantity"."regularPots" >= 0),
	CONSTRAINT "brew_quantity_decaf_nonneg" CHECK ("brew_quantity"."decafPots" >= 0)
);
--> statement-breakpoint
ALTER TABLE "brew_quantity" ADD CONSTRAINT "brew_quantity_serviceId_service_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brew_quantity" ADD CONSTRAINT "brew_quantity_updatedByUserId_user_id_fk" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;