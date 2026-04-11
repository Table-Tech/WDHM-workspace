-- ============================================
-- LateTable Gamification Migration
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Add GPS columns to incidents table
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- 2. Create badges table
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  image_url TEXT,
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'consecutive_late',
    'total_late',
    'minutes_late_single',
    'minutes_late_avg',
    'no_evidence',
    'always_evidence',
    'on_time_streak',
    'first_late',
    'custom'
  )),
  condition_value INTEGER,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  is_system BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create friend_badges table
CREATE TABLE IF NOT EXISTS friend_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  earned_incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  UNIQUE(friend_id, badge_id)
);

-- 4. Create streaks table
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  friend_id UUID NOT NULL REFERENCES friends(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('late', 'on_time')),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_incident_id UUID REFERENCES incidents(id),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(friend_id, streak_type)
);

-- 5. Create team_trips table
CREATE TABLE IF NOT EXISTS team_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  photo_url TEXT,
  trip_date DATE,
  created_by UUID REFERENCES friends(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable RLS on new tables
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_trips ENABLE ROW LEVEL SECURITY;

-- 7. Create policies for public access (same as other tables)
CREATE POLICY "Allow public read on badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Allow public insert on badges" ON badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on badges" ON badges FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on badges" ON badges FOR DELETE USING (true);

CREATE POLICY "Allow public read on friend_badges" ON friend_badges FOR SELECT USING (true);
CREATE POLICY "Allow public insert on friend_badges" ON friend_badges FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on friend_badges" ON friend_badges FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on friend_badges" ON friend_badges FOR DELETE USING (true);

CREATE POLICY "Allow public read on streaks" ON streaks FOR SELECT USING (true);
CREATE POLICY "Allow public insert on streaks" ON streaks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on streaks" ON streaks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on streaks" ON streaks FOR DELETE USING (true);

CREATE POLICY "Allow public read on team_trips" ON team_trips FOR SELECT USING (true);
CREATE POLICY "Allow public insert on team_trips" ON team_trips FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on team_trips" ON team_trips FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on team_trips" ON team_trips FOR DELETE USING (true);

-- 8. Insert default system badges
INSERT INTO badges (name, description, icon, condition_type, condition_value, rarity) VALUES
  ('Eerste Keer', 'Je eerste te laat melding', 'baby', 'first_late', 1, 'common'),
  ('Speedrunner', '5x achter elkaar te laat', 'zap', 'consecutive_late', 5, 'common'),
  ('Altijd Te Laat', '10x achter elkaar te laat', 'flame', 'consecutive_late', 10, 'epic'),
  ('Chronisch', '20x achter elkaar te laat', 'alarm-clock-off', 'consecutive_late', 20, 'legendary'),
  ('Drama King', 'Meer dan 30 minuten te laat', 'crown', 'minutes_late_single', 30, 'rare'),
  ('Drama Queen', 'Meer dan 60 minuten te laat', 'sparkles', 'minutes_late_single', 60, 'epic'),
  ('Ghost', '5 incidents zonder bewijs', 'ghost', 'no_evidence', 5, 'rare'),
  ('Paparazzi', '10 incidents altijd met bewijs', 'camera', 'always_evidence', 10, 'rare'),
  ('Recidivist', 'Totaal 25x te laat', 'repeat', 'total_late', 25, 'epic'),
  ('Legende', 'Totaal 50x te laat', 'trophy', 'total_late', 50, 'legendary'),
  ('Heilige', '5x op tijd achter elkaar', 'heart', 'on_time_streak', 5, 'rare'),
  ('Engel', '10x op tijd achter elkaar', 'sparkle', 'on_time_streak', 10, 'legendary')
ON CONFLICT DO NOTHING;

-- 9. Create storage buckets for badge and trip images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'badge-images',
  'badge-images',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'trip-photos',
  'trip-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for badge-images
CREATE POLICY "Public badge images are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'badge-images');

CREATE POLICY "Anyone can upload badge images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'badge-images');

CREATE POLICY "Anyone can update badge images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'badge-images');

CREATE POLICY "Anyone can delete badge images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'badge-images');

-- Storage policies for trip-photos
CREATE POLICY "Public trip photos are viewable by everyone"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trip-photos');

CREATE POLICY "Anyone can upload trip photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'trip-photos');

CREATE POLICY "Anyone can update trip photos"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'trip-photos');

CREATE POLICY "Anyone can delete trip photos"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'trip-photos');

-- Done!
