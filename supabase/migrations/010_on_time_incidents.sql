-- ============================================
-- LateTable On-Time Incidents Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create on_time_incidents table
CREATE TABLE IF NOT EXISTS on_time_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  location TEXT,
  photo_url TEXT,
  video_url TEXT,
  media_type TEXT CHECK (media_type IN ('photo', 'video')),
  note TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS on the table
ALTER TABLE on_time_incidents ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for public access (same as other tables)
CREATE POLICY "Allow public read on on_time_incidents" ON on_time_incidents FOR SELECT USING (true);
CREATE POLICY "Allow public insert on on_time_incidents" ON on_time_incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on on_time_incidents" ON on_time_incidents FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on on_time_incidents" ON on_time_incidents FOR DELETE USING (true);

-- 4. Create index for faster lookups by friend
CREATE INDEX IF NOT EXISTS idx_on_time_incidents_friend_id ON on_time_incidents(friend_id);
CREATE INDEX IF NOT EXISTS idx_on_time_incidents_created_at ON on_time_incidents(created_at DESC);

-- Done!
