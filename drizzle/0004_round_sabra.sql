CREATE TABLE "service_schedule" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"weekday" integer NOT NULL,
	"time" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_schedule_weekday" CHECK ("service_schedule"."weekday" between 0 and 6),
	CONSTRAINT "service_schedule_time" CHECK ("service_schedule"."time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" date NOT NULL,
	"time" text NOT NULL,
	"kind" text NOT NULL,
	"scheduleId" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_schedule_date" UNIQUE("scheduleId","date"),
	CONSTRAINT "service_kind" CHECK ("service"."kind" in ('recurring', 'ad_hoc')),
	CONSTRAINT "service_time" CHECK ("service"."time" ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);
--> statement-breakpoint
ALTER TABLE "service" ADD CONSTRAINT "service_scheduleId_service_schedule_id_fk" FOREIGN KEY ("scheduleId") REFERENCES "public"."service_schedule"("id") ON DELETE set null ON UPDATE no action;