CREATE TABLE "service_report" (
	"id" text PRIMARY KEY NOT NULL,
	"serviceId" text NOT NULL,
	"filedByUserId" text,
	"answers" jsonb NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "service_report_serviceId_unique" UNIQUE("serviceId")
);
--> statement-breakpoint
ALTER TABLE "stock_count" ADD COLUMN "reportId" text;--> statement-breakpoint
ALTER TABLE "service_report" ADD CONSTRAINT "service_report_serviceId_service_id_fk" FOREIGN KEY ("serviceId") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_report" ADD CONSTRAINT "service_report_filedByUserId_user_id_fk" FOREIGN KEY ("filedByUserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_count" ADD CONSTRAINT "stock_count_reportId_service_report_id_fk" FOREIGN KEY ("reportId") REFERENCES "public"."service_report"("id") ON DELETE set null ON UPDATE no action;