CREATE TABLE "game_access" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "game_access_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"game_id" integer NOT NULL,
	"user_email" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'player' NOT NULL,
	"added_at" timestamp DEFAULT now(),
	"added_by" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "games_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"slug" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_locked" boolean DEFAULT false NOT NULL,
	"max_squares_per_user" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
-- Phase A: Add nullable game_id columns
ALTER TABLE "score_predictions" ADD COLUMN "game_id" integer;--> statement-breakpoint
ALTER TABLE "squares" ADD COLUMN "game_id" integer;--> statement-breakpoint
ALTER TABLE "squares_axis_numbers" ADD COLUMN "game_id" integer;--> statement-breakpoint
-- Phase B: Data migration — create party game and backfill
INSERT INTO games (slug, name, is_locked, max_squares_per_user)
SELECT
  'party',
  'Super Bowl Party',
  COALESCE((SELECT value = 'true' FROM app_settings WHERE key = 'squares_locked'), false),
  COALESCE((SELECT value::int FROM app_settings WHERE key = 'max_squares_per_user'), 5);
--> statement-breakpoint
UPDATE squares SET game_id = (SELECT id FROM games WHERE slug = 'party') WHERE game_id IS NULL;--> statement-breakpoint
UPDATE squares_axis_numbers SET game_id = (SELECT id FROM games WHERE slug = 'party') WHERE game_id IS NULL;--> statement-breakpoint
UPDATE score_predictions SET game_id = (SELECT id FROM games WHERE slug = 'party') WHERE game_id IS NULL;--> statement-breakpoint
-- Populate gameAccess from approvedUsers for party game
INSERT INTO game_access (game_id, user_email, role, added_by)
SELECT
  (SELECT id FROM games WHERE slug = 'party'),
  email,
  CASE WHEN is_admin THEN 'admin' ELSE 'player' END,
  'migration'
FROM approved_users
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Create family game
INSERT INTO games (slug, name, is_locked, max_squares_per_user)
VALUES ('family', 'Family Squares', false, 5)
ON CONFLICT DO NOTHING;
--> statement-breakpoint
-- Clean up old settings
DELETE FROM app_settings WHERE key IN ('squares_locked', 'max_squares_per_user');
--> statement-breakpoint
-- Phase C: Make game_id NOT NULL and add constraints/indexes
ALTER TABLE "score_predictions" ALTER COLUMN "game_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "squares" ALTER COLUMN "game_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "squares_axis_numbers" ALTER COLUMN "game_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "game_access" ADD CONSTRAINT "game_access_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "game_access_game_user_idx" ON "game_access" USING btree ("game_id","user_email");--> statement-breakpoint
ALTER TABLE "score_predictions" ADD CONSTRAINT "score_predictions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squares" ADD CONSTRAINT "squares_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "squares_axis_numbers" ADD CONSTRAINT "squares_axis_numbers_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "score_predictions_game_user_idx" ON "score_predictions" USING btree ("game_id","user_email");--> statement-breakpoint
CREATE UNIQUE INDEX "squares_game_row_col_idx" ON "squares" USING btree ("game_id","row","col");
