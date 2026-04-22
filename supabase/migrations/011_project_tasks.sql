-- Add project tasks with checklists
-- This migration adds the requested project tasks

-- First, ensure we have the right columns. Get the "To Do" and "In Progress" column IDs
DO $$
DECLARE
  todo_col_id UUID;
  inprogress_col_id UUID;
BEGIN
  -- Get column IDs (or create if not exist)
  SELECT id INTO todo_col_id FROM task_columns WHERE name = 'To Do' LIMIT 1;
  SELECT id INTO inprogress_col_id FROM task_columns WHERE name = 'In Progress' LIMIT 1;

  IF todo_col_id IS NULL THEN
    INSERT INTO task_columns (name, color, position) VALUES ('To Do', '#6366f1', 0) RETURNING id INTO todo_col_id;
  END IF;

  IF inprogress_col_id IS NULL THEN
    INSERT INTO task_columns (name, color, position) VALUES ('In Progress', '#f59e0b', 1) RETURNING id INTO inprogress_col_id;
  END IF;

  -- 1. Pokebowl Website (In Progress - partially done)
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Pokebowl Website Afmaken',
    'Website en systeem voor Pokebowl restaurant afronden. Afhaalfunctie, dashboard en printer integratie.',
    inprogress_col_id,
    'P1',
    0,
    '[
      {"id": "pb1", "text": "Website maken", "completed": true},
      {"id": "pb2", "text": "Website afhaal functie maken", "completed": true},
      {"id": "pb3", "text": "Dashboard maken", "completed": true},
      {"id": "pb4", "text": "Printer bestellen", "completed": true},
      {"id": "pb5", "text": "Printer koppelen", "completed": false},
      {"id": "pb6", "text": "Mollie account aanmaken", "completed": false},
      {"id": "pb7", "text": "Alles goed testen", "completed": false}
    ]'::jsonb
  );

  -- 2. Cherani Nails Website
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Cherani Nails Website',
    'Website bouwen voor Cherani Nails. Start na afspraken zijn gemaakt.',
    todo_col_id,
    'P2',
    0,
    '[
      {"id": "cn1", "text": "Offerte aanmaken", "completed": false},
      {"id": "cn2", "text": "Plan maken", "completed": false},
      {"id": "cn3", "text": "Systeem gaan bouwen", "completed": false},
      {"id": "cn4", "text": "Taken verdelen", "completed": false}
    ]'::jsonb
  );

  -- 3. Ontstoppingsdienst Bedrijf Website
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Ontstoppingsdienst Website',
    'Website bouwen voor ontstoppingsdienst bedrijf.',
    todo_col_id,
    'P2',
    1,
    '[
      {"id": "od1", "text": "Offerte aanmaken", "completed": false},
      {"id": "od2", "text": "Plan maken", "completed": false},
      {"id": "od3", "text": "Systeem gaan bouwen", "completed": false},
      {"id": "od4", "text": "Taken verdelen", "completed": false}
    ]'::jsonb
  );

  -- 4. Lori Events Website
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Lori Events Website',
    'Website maken voor Lori Events. Wachten op antwoord van klant.',
    todo_col_id,
    'P3',
    2,
    '[
      {"id": "le1", "text": "Wachten op antwoord", "completed": false},
      {"id": "le2", "text": "Offerte aanmaken", "completed": false},
      {"id": "le3", "text": "Plan maken", "completed": false},
      {"id": "le4", "text": "Website bouwen", "completed": false}
    ]'::jsonb
  );

  -- 5. Rijschool Planning Systeem
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Rijschool Planning Systeem',
    'Planning systeem bouwen voor rijschool.',
    todo_col_id,
    'P2',
    3,
    '[
      {"id": "rs1", "text": "Requirements verzamelen", "completed": false},
      {"id": "rs2", "text": "Offerte aanmaken", "completed": false},
      {"id": "rs3", "text": "Plan maken", "completed": false},
      {"id": "rs4", "text": "Systeem bouwen", "completed": false},
      {"id": "rs5", "text": "Testen met klant", "completed": false}
    ]'::jsonb
  );

END $$;
