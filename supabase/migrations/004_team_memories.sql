-- ============================================
-- LateTable Team Memories Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create memory_albums table
CREATE TABLE IF NOT EXISTS memory_albums (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  event_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create memory_photos table
CREATE TABLE IF NOT EXISTS memory_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES memory_albums(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  video_url TEXT,
  caption TEXT,
  is_cover BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS on new tables
ALTER TABLE memory_albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_photos ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for memory_albums
CREATE POLICY "Allow public read on memory_albums" ON memory_albums FOR SELECT USING (true);
CREATE POLICY "Allow public insert on memory_albums" ON memory_albums FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on memory_albums" ON memory_albums FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on memory_albums" ON memory_albums FOR DELETE USING (true);

-- 5. Create RLS policies for memory_photos
CREATE POLICY "Allow public read on memory_photos" ON memory_photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert on memory_photos" ON memory_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on memory_photos" ON memory_photos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on memory_photos" ON memory_photos FOR DELETE USING (true);

-- 6. Create storage bucket for memory photos (run in Supabase dashboard or use API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('memory-photos', 'memory-photos', true);

-- Done!
