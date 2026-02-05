CREATE TABLE "votes" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "votes_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"voter_email" varchar(255) NOT NULL,
	"voter_name" varchar(255),
	"first_place_entry_id" integer NOT NULL,
	"second_place_entry_id" integer NOT NULL,
	"third_place_entry_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "votes_voter_email_unique" UNIQUE("voter_email")
);
