-- Add checklist to tasks
-- Stores array of checklist items as JSONB

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS checklist JSONB DEFAULT '[]';
