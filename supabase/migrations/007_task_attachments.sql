-- Add attachments to tasks
-- Stores array of file attachments as JSONB

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Create storage bucket for task attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to task attachments
CREATE POLICY "Public Access to task attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'task-attachments');

CREATE POLICY "Allow uploads to task attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'task-attachments');

CREATE POLICY "Allow updates to task attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'task-attachments');

CREATE POLICY "Allow deletes from task attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'task-attachments');
