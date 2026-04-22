-- Add comments to tasks
-- Stores array of comments as JSONB

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS comments JSONB DEFAULT '[]';
