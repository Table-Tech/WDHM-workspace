-- ============================================
-- LateTable Fun Features Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create incident_reactions table for GIF reactions
CREATE TABLE IF NOT EXISTS incident_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  gif_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(incident_id, friend_id, gif_id)
);

-- 2. Create seasons table for tracking game seasons
CREATE TABLE IF NOT EXISTS seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- 3. Create resets table for tracking stat resets
CREATE TABLE IF NOT EXISTS resets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  triggered_by UUID REFERENCES friends(id) ON DELETE SET NULL,
  reset_at TIMESTAMPTZ DEFAULT NOW(),
  stats_snapshot JSONB NOT NULL
);

-- 4. Enable RLS on new tables
ALTER TABLE incident_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE resets ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for incident_reactions
CREATE POLICY "Allow public read on incident_reactions" ON incident_reactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert on incident_reactions" ON incident_reactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete on incident_reactions" ON incident_reactions FOR DELETE USING (true);

-- 6. Create RLS policies for seasons
CREATE POLICY "Allow public read on seasons" ON seasons FOR SELECT USING (true);
CREATE POLICY "Allow public insert on seasons" ON seasons FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on seasons" ON seasons FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on seasons" ON seasons FOR DELETE USING (true);

-- 7. Create RLS policies for resets
CREATE POLICY "Allow public read on resets" ON resets FOR SELECT USING (true);
CREATE POLICY "Allow public insert on resets" ON resets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on resets" ON resets FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on resets" ON resets FOR DELETE USING (true);

-- 8. Add columns to incidents table
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS is_iconic BOOLEAN DEFAULT false;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS season_id UUID REFERENCES seasons(id);

-- 9. Create initial season
INSERT INTO seasons (name, start_date, is_active)
VALUES ('Seizoen 1', NOW(), true)
ON CONFLICT DO NOTHING;

-- Done!
