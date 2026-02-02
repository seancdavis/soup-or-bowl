CREATE TABLE "entries" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "entries_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"needs_power" boolean DEFAULT false NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"user_name" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "entries_user_email_unique" UNIQUE("user_email")
);
