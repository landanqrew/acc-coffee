CREATE TABLE "supply" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"designated" boolean DEFAULT false NOT NULL,
	"minimumLevel" integer,
	"retiredAt" timestamp,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
