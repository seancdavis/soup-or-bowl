-- Multi-Game Migration Script
-- Run this AFTER the Drizzle schema migration (which adds the tables and columns).
-- This script backfills existing data into the new multi-game structure.
--
-- Steps:
-- 1. Create the "party" game, pulling isLocked/maxSquaresPerUser from appSettings
-- 2. Backfill gameId on existing squares, squaresAxisNumbers, scorePredictions
-- 3. Populate gameAccess from approvedUsers for the party game
-- 4. Create the "family" game
-- 5. Clean up old settings

-- Step 1: Insert "party" game with current settings
INSERT INTO games (slug, name, is_locked, max_squares_per_user)
SELECT
  'party',
  'Super Bowl Party',
  COALESCE((SELECT value = 'true' FROM app_settings WHERE key = 'squares_locked'), false),
  COALESCE((SELECT value::int FROM app_settings WHERE key = 'max_squares_per_user'), 5);

-- Step 2: Backfill gameId on existing rows
UPDATE squares SET game_id = (SELECT id FROM games WHERE slug = 'party') WHERE game_id IS NULL;
UPDATE squares_axis_numbers SET game_id = (SELECT id FROM games WHERE slug = 'party') WHERE game_id IS NULL;
UPDATE score_predictions SET game_id = (SELECT id FROM games WHERE slug = 'party') WHERE game_id IS NULL;

-- Step 3: Populate gameAccess from approvedUsers for party game
INSERT INTO game_access (game_id, user_email, role, added_by)
SELECT
  (SELECT id FROM games WHERE slug = 'party'),
  email,
  CASE WHEN is_admin THEN 'admin' ELSE 'player' END,
  'migration'
FROM approved_users
ON CONFLICT (game_id, user_email) DO NOTHING;

-- Step 4: Insert "family" game (unlocked, default 5 squares)
INSERT INTO games (slug, name, is_locked, max_squares_per_user)
VALUES ('family', 'Family Squares', false, 5)
ON CONFLICT DO NOTHING;

-- Step 5: Clean up old game-scoped settings from appSettings
DELETE FROM app_settings WHERE key IN ('squares_locked', 'max_squares_per_user');
