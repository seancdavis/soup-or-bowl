CREATE TABLE "squares" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "squares_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"row" integer NOT NULL,
	"col" integer NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"user_name" varchar(255),
	"user_image" varchar(255),
	"claimed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "squares_axis_numbers" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "squares_axis_numbers_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"axis" varchar(10) NOT NULL,
	"position" integer NOT NULL,
	"value" integer NOT NULL,
	"generated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "squares_scores" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "squares_scores_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"quarter" integer NOT NULL,
	"seahawks_score" integer,
	"patriots_score" integer,
	"updated_at" timestamp DEFAULT now()
);
