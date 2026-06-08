CREATE TABLE "feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"serviceId" text NOT NULL,
	"taste" integer NOT NULL,
	"temperature" integer NOT NULL,
	"variety" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "feedback_taste_range" CHECK ("feedback"."taste" between 1 and 5),
	CONSTRAINT "feedback_temperature_range" CHECK ("feedback"."temperature" between 1 and 5),
	CONSTRAINT "feedback_variety_range" CHECK ("feedback"."variety" between 1 and 5)
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_serviceId_service_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;