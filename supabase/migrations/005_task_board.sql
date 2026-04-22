-- Task Board Migration
-- Creates tables for Trello-style task management

-- Task columns table
CREATE TABLE IF NOT EXISTS task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID NOT NULL REFERENCES task_columns(id) ON DELETE CASCADE,
  priority TEXT CHECK (priority IN ('P1', 'P2', 'P3')) DEFAULT 'P2',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Public access policies (same as other tables in this app)
CREATE POLICY "Allow all access to task_columns" ON task_columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
CREATE INDEX IF NOT EXISTS idx_task_columns_position ON task_columns(position);

-- Insert default columns
INSERT INTO task_columns (name, color, position) VALUES
  ('To Do', '#6366f1', 0),
  ('In Progress', '#f59e0b', 1),
  ('Done', '#10b981', 2);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE task_columns;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
