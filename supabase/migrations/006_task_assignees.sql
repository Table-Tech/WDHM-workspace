-- Add assignees to tasks
-- Stores array of friend IDs who are assigned to the task

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee_ids UUID[] DEFAULT '{}';

-- Create index for querying tasks by assignee
CREATE INDEX IF NOT EXISTS idx_tasks_assignees ON tasks USING GIN(assignee_ids);
