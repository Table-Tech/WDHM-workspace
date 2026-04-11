-- ============================================
-- LATETABLE DATABASE MIGRATION
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This will create all tables and seed the initial data

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DROP EXISTING TABLES (for fresh start)
-- ============================================
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS friends CASCADE;
DROP TABLE IF EXISTS group_settings CASCADE;

-- ============================================
-- FRIENDS TABLE
-- ============================================
CREATE TABLE friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for sorting
CREATE INDEX idx_friends_created_at ON friends(created_at);

-- ============================================
-- INCIDENTS TABLE
-- ============================================
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  location TEXT,
  scheduled_time TEXT,
  minutes_late INTEGER,
  photo_url TEXT,
  video_url TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'video')),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for queries
CREATE INDEX idx_incidents_friend_id ON incidents(friend_id);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);

-- ============================================
-- GROUP SETTINGS TABLE (Milestones)
-- ============================================
CREATE TABLE group_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_count INTEGER NOT NULL UNIQUE,
  penalty_text TEXT NOT NULL,
  emoji TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- SEED DATA: DE 4 VRIENDEN
-- ============================================
INSERT INTO friends (name, color) VALUES
  ('Wishant', '#8b5cf6'),   -- Violet
  ('Damian', '#06b6d4'),    -- Cyan
  ('Hicham', '#f97316'),    -- Orange
  ('Mohammad', '#22c55e');  -- Green

-- ============================================
-- SEED DATA: MILESTONES & STRAFFEN
-- ============================================
INSERT INTO group_settings (milestone_count, penalty_text, emoji) VALUES
  (5, 'Jij betaalt de volgende ronde drankjes voor de hele groep', '🍺'),
  (10, 'Jij trakteert de groep op pizza of eten naar keuze van de groep', '🍕'),
  (15, 'Jij zingt een solo bij de volgende karaoke-avond, geen excuses', '🎤'),
  (20, 'Je draagt een week lang een schaamshirt dat de groep kiest en ontwerpt', '👕'),
  (25, 'Jij organiseert en regelt volledig een weekendje weg voor de hele groep', '✈️');

-- ============================================
-- DISABLE ROW LEVEL SECURITY (App is fully open)
-- ============================================
ALTER TABLE friends DISABLE ROW LEVEL SECURITY;
ALTER TABLE incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE group_settings DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ENABLE REALTIME
-- ============================================
-- Run these commands to enable realtime updates:
ALTER PUBLICATION supabase_realtime ADD TABLE friends;
ALTER PUBLICATION supabase_realtime ADD TABLE incidents;

-- ============================================
-- VERIFY DATA
-- ============================================
-- After running this migration, you should see:
-- SELECT * FROM friends;
-- +--------------------------------------+----------+---------+
-- | id                                   | name     | color   |
-- +--------------------------------------+----------+---------+
-- | ...                                  | Wishant  | #8b5cf6 |
-- | ...                                  | Damian   | #06b6d4 |
-- | ...                                  | Hicham   | #f97316 |
-- | ...                                  | Mohammad | #22c55e |
-- +--------------------------------------+----------+---------+

-- ============================================
-- STORAGE SETUP (Manual step in Supabase Dashboard)
-- ============================================
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Create a new bucket named: incident-photos
-- 3. Make it PUBLIC (toggle public access on)
-- 4. Create another bucket named: incident-videos
-- 5. Make it PUBLIC (toggle public access on)
-- 6. Done!

-- ============================================
-- MIGRATION: Add video support (run if upgrading)
-- ============================================
-- If you already have the database set up, run this to add video support:
-- ALTER TABLE incidents ADD COLUMN video_url TEXT;
-- ALTER TABLE incidents ADD COLUMN media_type TEXT CHECK (media_type IN ('photo', 'video'));
