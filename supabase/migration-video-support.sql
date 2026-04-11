-- ============================================
-- LATETABLE VIDEO SUPPORT MIGRATION
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- Safe to run multiple times - will not error if already applied
--
-- This migration adds:
-- 1. video_url column to incidents table
-- 2. media_type column to incidents table
-- 3. Creates incident-videos storage bucket
-- ============================================

-- ============================================
-- ADD VIDEO COLUMNS TO INCIDENTS TABLE
-- ============================================

-- Add video_url column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'incidents' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE incidents ADD COLUMN video_url TEXT;
        RAISE NOTICE 'Added video_url column to incidents table';
    ELSE
        RAISE NOTICE 'video_url column already exists, skipping';
    END IF;
END $$;

-- Add media_type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'incidents' AND column_name = 'media_type'
    ) THEN
        ALTER TABLE incidents ADD COLUMN media_type TEXT CHECK (media_type IN ('photo', 'video'));
        RAISE NOTICE 'Added media_type column to incidents table';
    ELSE
        RAISE NOTICE 'media_type column already exists, skipping';
    END IF;
END $$;

-- ============================================
-- UPDATE EXISTING INCIDENTS WITH PHOTO TO HAVE media_type = 'photo'
-- ============================================

UPDATE incidents
SET media_type = 'photo'
WHERE photo_url IS NOT NULL
  AND media_type IS NULL;

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Note: Storage buckets must be created via Supabase Dashboard or API
-- This SQL reminder helps you remember the steps:
--
-- MANUAL STEPS IN SUPABASE DASHBOARD:
-- 1. Go to Storage in your Supabase Dashboard
-- 2. Create bucket: "incident-videos"
-- 3. Make it PUBLIC (enable public access)
-- 4. Verify bucket: "incident-photos" exists and is public
--
-- Or use this SQL to create buckets programmatically:

-- Create incident-videos bucket if storage extension is available
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'incident-videos',
    'incident-videos',
    true,
    52428800,  -- 50MB limit for videos
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800;

-- Ensure incident-photos bucket exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'incident-photos',
    'incident-photos',
    true,
    10485760,  -- 10MB limit for photos
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 10485760;

-- ============================================
-- STORAGE POLICIES (Allow public access)
-- ============================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public Access incident-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload incident-videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access incident-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload incident-photos" ON storage.objects;

-- Allow public read access to incident-videos
CREATE POLICY "Public Access incident-videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'incident-videos');

-- Allow public upload to incident-videos
CREATE POLICY "Public Upload incident-videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'incident-videos');

-- Allow public read access to incident-photos
CREATE POLICY "Public Access incident-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'incident-photos');

-- Allow public upload to incident-photos
CREATE POLICY "Public Upload incident-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'incident-photos');

-- ============================================
-- VERIFY MIGRATION
-- ============================================

-- Check that columns exist
DO $$
DECLARE
    video_col_exists BOOLEAN;
    media_col_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'incidents' AND column_name = 'video_url'
    ) INTO video_col_exists;

    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'incidents' AND column_name = 'media_type'
    ) INTO media_col_exists;

    IF video_col_exists AND media_col_exists THEN
        RAISE NOTICE '✅ Migration successful! Video support is enabled.';
    ELSE
        RAISE WARNING '⚠️ Migration may have issues. Check columns manually.';
    END IF;
END $$;

-- ============================================
-- SHOW CURRENT TABLE STRUCTURE
-- ============================================

-- Run this to verify:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'incidents'
-- ORDER BY ordinal_position;
