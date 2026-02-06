CREATE TABLE "score_predictions" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "score_predictions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_email" varchar(255) NOT NULL,
	"user_name" varchar(255),
	"seahawks_score" integer NOT NULL,
	"patriots_score" integer NOT NULL,
	"is_proxy" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
