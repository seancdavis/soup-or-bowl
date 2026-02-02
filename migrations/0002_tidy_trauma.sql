ALTER TABLE "approved_users" ADD COLUMN "is_admin" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "entries" ADD COLUMN "notes" text;