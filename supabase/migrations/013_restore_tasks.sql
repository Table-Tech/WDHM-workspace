-- ============================================
-- RESTORE TASKBOARD DATA
-- Run this AFTER 005_task_board.sql and related migrations
-- ============================================

-- First, get the friend IDs for assignees
-- We'll need to look these up or create them

-- Clear existing default columns and recreate with correct names
DELETE FROM tasks;
DELETE FROM task_columns;

-- Insert columns with correct order
INSERT INTO task_columns (id, name, color, position) VALUES
  (gen_random_uuid(), 'Backlog', '#6b7280', 0),
  (gen_random_uuid(), 'To Do', '#6366f1', 1),
  (gen_random_uuid(), 'In Progress', '#f59e0b', 2),
  (gen_random_uuid(), 'Review', '#10b981', 3);

-- Now insert tasks (we need to reference column IDs)
-- Using a DO block to get column IDs

DO $$
DECLARE
  backlog_id UUID;
  todo_id UUID;
  inprogress_id UUID;
  review_id UUID;
BEGIN
  -- Get column IDs
  SELECT id INTO backlog_id FROM task_columns WHERE name = 'Backlog';
  SELECT id INTO todo_id FROM task_columns WHERE name = 'To Do';
  SELECT id INTO inprogress_id FROM task_columns WHERE name = 'In Progress';
  SELECT id INTO review_id FROM task_columns WHERE name = 'Review';

  -- ============================================
  -- BACKLOG TASKS
  -- ============================================

  -- 1. IRI Service
  INSERT INTO tasks (title, description, column_id, priority, position, assignee_ids, checklist, attachments, comments)
  VALUES (
    'IRI Service',
    '',
    backlog_id,
    'P1',
    0,
    '{}',
    '[]',
    '[{"id": "iri-attachment", "name": "IRI Service attachment", "url": "", "type": "application/pdf", "size": 0}]',
    '[]'
  );

  -- 2. Ontstoppingsdienst Website
  INSERT INTO tasks (title, description, column_id, priority, position, assignee_ids, checklist, attachments, comments)
  VALUES (
    'Ontstoppingsdienst Website',
    'Website bouwen voor ontstoppingsdienst bedrijf.',
    backlog_id,
    'P1',
    1,
    '{}',
    '[
      {"id": "1", "text": "Offerte aanmaken", "completed": false},
      {"id": "2", "text": "Plan maken", "completed": false},
      {"id": "3", "text": "Systeem gaan bouwen", "completed": false},
      {"id": "4", "text": "Taken verdelen", "completed": false}
    ]',
    '[{"id": "ontstopping-pdf", "name": "Ontstoppingsdienst.nl Case .pdf", "url": "", "type": "application/pdf", "size": 243955}]',
    '[]'
  );

  -- 3. Rijschool Planning Systeem
  INSERT INTO tasks (title, description, column_id, priority, position, assignee_ids, checklist, attachments, comments)
  VALUES (
    'Rijschool Planning Systeem',
    'Planning systeem bouwen voor rijschool.',
    backlog_id,
    'P2',
    2,
    '{}',
    '[
      {"id": "1", "text": "Requirements verzamelen", "completed": false},
      {"id": "2", "text": "Offerte aanmaken", "completed": false},
      {"id": "3", "text": "Plan maken", "completed": false},
      {"id": "4", "text": "Systeem bouwen", "completed": false},
      {"id": "5", "text": "Testen met klant", "completed": false}
    ]',
    '[]',
    '[]'
  );

  -- ============================================
  -- TO DO TASKS
  -- ============================================

  -- 1. Nishani website vader
  INSERT INTO tasks (title, description, column_id, priority, position, assignee_ids, checklist, attachments, comments)
  VALUES (
    'Nishani website vader',
    '',
    todo_id,
    'P2',
    0,
    '{}',
    '[
      {"id": "1", "text": "Vragen aan haar", "completed": false},
      {"id": "2", "text": "wachten op antwoord", "completed": false},
      {"id": "3", "text": "offerte opstellen", "completed": false},
      {"id": "4", "text": "website maken", "completed": false}
    ]',
    '[]',
    '[]'
  );

  -- ============================================
  -- IN PROGRESS TASKS
  -- ============================================

  -- 1. Pokebowl Website Afmaken
  INSERT INTO tasks (title, description, column_id, priority, position, assignee_ids, checklist, attachments, comments)
  VALUES (
    'Pokebowl Website Afmaken',
    'Website en systeem voor Pokebowl restaurant afronden. Afhaalfunctie, dashboard en printer integratie.',
    inprogress_id,
    'P1',
    0,
    '{}',
    '[
      {"id": "1", "text": "Website maken", "completed": true},
      {"id": "2", "text": "Website afhaal functie maken", "completed": true},
      {"id": "3", "text": "Dashboard maken", "completed": true},
      {"id": "4", "text": "Printer bestellen", "completed": true},
      {"id": "5", "text": "Printer koppelen", "completed": false},
      {"id": "6", "text": "Mollie account aanmaken", "completed": false},
      {"id": "7", "text": "Alles goed testen", "completed": false}
    ]',
    '[]',
    '[]'
  );

  -- 2. Cherani Nails Website
  INSERT INTO tasks (title, description, column_id, priority, position, assignee_ids, checklist, attachments, comments)
  VALUES (
    'Cherani Nails Website',
    'Website bouwen voor Cherani Nails. Start na afspraken zijn gemaakt.',
    inprogress_id,
    'P2',
    1,
    '{}',
    '[
      {"id": "1", "text": "Offerte aanmaken", "completed": false},
      {"id": "2", "text": "Plan maken", "completed": false},
      {"id": "3", "text": "Systeem gaan bouwen", "completed": false},
      {"id": "4", "text": "Taken verdelen", "completed": false}
    ]',
    '[]',
    '[]'
  );

  -- 3. Lori Events Website
  INSERT INTO tasks (title, description, column_id, priority, position, assignee_ids, checklist, attachments, comments)
  VALUES (
    'Lori Events Website',
    'Website maken voor Lori Events. Wachten op antwoord van klant.',
    inprogress_id,
    'P2',
    2,
    '{}',
    '[
      {"id": "1", "text": "Wachten op antwoord", "completed": false},
      {"id": "2", "text": "Offerte aanmaken", "completed": false},
      {"id": "3", "text": "Plan maken", "completed": false},
      {"id": "4", "text": "Website bouwen", "completed": false}
    ]',
    '[]',
    '[]'
  );

END $$;
