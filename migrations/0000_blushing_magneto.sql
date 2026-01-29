CREATE TABLE "approved_users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "approved_users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"added_at" timestamp DEFAULT now(),
	"added_by" varchar(255),
	"notes" text,
	CONSTRAINT "approved_users_email_unique" UNIQUE("email")
);
