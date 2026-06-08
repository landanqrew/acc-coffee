CREATE TABLE "runbook_section" (
	"section" text PRIMARY KEY NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"updatedByUserId" text,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "runbook_content_length" CHECK (char_length("runbook_section"."content") <= 20000)
);
--> statement-breakpoint
ALTER TABLE "runbook_section" ADD CONSTRAINT "runbook_section_updatedByUserId_user_id_fk" FOREIGN KEY ("updatedByUserId") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;