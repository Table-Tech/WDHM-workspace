-- ============================================
-- COMPLETE MIGRATION - RUN THIS IN SUPABASE SQL EDITOR
-- Contains: Financial tables + Task tables + Task data
-- ============================================

-- ============================================
-- PART 1: FINANCIAL TABLES
-- ============================================

-- Company Settings
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bedrijfsnaam TEXT DEFAULT '',
  kvk_nummer TEXT DEFAULT '',
  btw_percentage NUMERIC DEFAULT 21,
  boekjaar INTEGER DEFAULT 2026,
  startdatum DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Co-Founders
CREATE TABLE IF NOT EXISTS co_founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL,
  rol TEXT DEFAULT '',
  winstverdeling_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Persons
CREATE TABLE IF NOT EXISTS sales_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL,
  commissie_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  klantnaam TEXT NOT NULL,
  product_dienst TEXT DEFAULT '',
  mrr_per_maand NUMERIC DEFAULT 0,
  eenmalig NUMERIC DEFAULT 0,
  sales_persoon_id UUID REFERENCES sales_persons(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Actief' CHECK (status IN ('Actief', 'Inactief', 'Paused')),
  maand_inkomsten NUMERIC[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[],
  contactpersoon TEXT DEFAULT '',
  email TEXT DEFAULT '',
  telefoon TEXT DEFAULT '',
  notities TEXT DEFAULT '',
  pipeline_fase TEXT DEFAULT 'Klant' CHECK (pipeline_fase IN ('Lead', 'Contact gelegd', 'Offerte gestuurd', 'In onderhandeling', 'Klant', 'Afgevallen')),
  aantal_contacten INTEGER DEFAULT 0,
  laatste_contact DATE,
  offerte_waarde NUMERIC DEFAULT 0,
  verwachte_sluitdatum DATE,
  datum_klant_geworden DATE,
  datum_onderhoud_start DATE,
  onderhoud_actief BOOLEAN DEFAULT true,
  eenmalig_termijnen INTEGER DEFAULT 1,
  eenmalig_startdatum DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bedrijfsnaam TEXT NOT NULL,
  contactpersoon TEXT DEFAULT '',
  email TEXT DEFAULT '',
  telefoon TEXT DEFAULT '',
  product_interesse TEXT DEFAULT '',
  bron TEXT DEFAULT '',
  reden_afwijzing TEXT DEFAULT '',
  notities TEXT DEFAULT '',
  datum_eerste_contact DATE,
  datum_afgewezen DATE,
  offerte_waarde NUMERIC DEFAULT 0,
  aantal_contacten INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One-Time Income
CREATE TABLE IF NOT EXISTS one_time_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datum DATE NOT NULL,
  klantnaam TEXT DEFAULT '',
  omschrijving TEXT DEFAULT '',
  bedrag_excl_btw NUMERIC DEFAULT 0,
  btw NUMERIC DEFAULT 0,
  bedrag_incl_btw NUMERIC DEFAULT 0,
  sales_commissie BOOLEAN DEFAULT false,
  netto_na_commissie NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Gefactureerd', 'Betaald', 'Geannuleerd')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- One-Time Expenses
CREATE TABLE IF NOT EXISTS one_time_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datum DATE NOT NULL,
  leverancier TEXT DEFAULT '',
  omschrijving TEXT DEFAULT '',
  categorie TEXT DEFAULT '',
  bedrag_excl_btw NUMERIC DEFAULT 0,
  btw NUMERIC DEFAULT 0,
  bedrag_incl_btw NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Gepland' CHECK (status IN ('Gepland', 'Besteld', 'Betaald', 'Geannuleerd')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Expenses
CREATE TABLE IF NOT EXISTS monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie TEXT NOT NULL UNIQUE,
  maand_bedragen NUMERIC[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Expense Categories
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 2: TASK BOARD TABLES
-- ============================================

-- Task columns
CREATE TABLE IF NOT EXISTS task_columns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  column_id UUID NOT NULL REFERENCES task_columns(id) ON DELETE CASCADE,
  priority TEXT CHECK (priority IN ('P1', 'P2', 'P3')) DEFAULT 'P2',
  position INTEGER NOT NULL DEFAULT 0,
  assignee_ids UUID[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  checklist JSONB DEFAULT '[]',
  comments JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PART 3: ENABLE RLS
-- ============================================

ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE co_founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_time_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE one_time_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PART 4: RLS POLICIES (Public access for team)
-- ============================================

-- Drop existing policies first (in case re-running)
DROP POLICY IF EXISTS "Allow all access to company_settings" ON company_settings;
DROP POLICY IF EXISTS "Allow all access to co_founders" ON co_founders;
DROP POLICY IF EXISTS "Allow all access to sales_persons" ON sales_persons;
DROP POLICY IF EXISTS "Allow all access to customers" ON customers;
DROP POLICY IF EXISTS "Allow all access to leads" ON leads;
DROP POLICY IF EXISTS "Allow all access to one_time_income" ON one_time_income;
DROP POLICY IF EXISTS "Allow all access to one_time_expenses" ON one_time_expenses;
DROP POLICY IF EXISTS "Allow all access to monthly_expenses" ON monthly_expenses;
DROP POLICY IF EXISTS "Allow all access to expense_categories" ON expense_categories;
DROP POLICY IF EXISTS "Allow all access to task_columns" ON task_columns;
DROP POLICY IF EXISTS "Allow all access to tasks" ON tasks;

CREATE POLICY "Allow all access to company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to co_founders" ON co_founders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales_persons" ON sales_persons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to one_time_income" ON one_time_income FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to one_time_expenses" ON one_time_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to monthly_expenses" ON monthly_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to expense_categories" ON expense_categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to task_columns" ON task_columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- PART 5: INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_pipeline ON customers(pipeline_fase);
CREATE INDEX IF NOT EXISTS idx_customers_sales_person ON customers(sales_persoon_id);
CREATE INDEX IF NOT EXISTS idx_one_time_income_datum ON one_time_income(datum);
CREATE INDEX IF NOT EXISTS idx_one_time_income_status ON one_time_income(status);
CREATE INDEX IF NOT EXISTS idx_one_time_expenses_datum ON one_time_expenses(datum);
CREATE INDEX IF NOT EXISTS idx_one_time_expenses_status ON one_time_expenses(status);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_position ON tasks(position);
CREATE INDEX IF NOT EXISTS idx_task_columns_position ON task_columns(position);
CREATE INDEX IF NOT EXISTS idx_tasks_assignees ON tasks USING GIN(assignee_ids);

-- ============================================
-- PART 6: ENABLE REALTIME
-- ============================================

DO $$
BEGIN
  -- Financial tables
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'company_settings') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE company_settings;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'co_founders') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE co_founders;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'sales_persons') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE sales_persons;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'customers') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE customers;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leads') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'one_time_income') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE one_time_income;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'one_time_expenses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE one_time_expenses;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'monthly_expenses') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE monthly_expenses;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'expense_categories') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE expense_categories;
  END IF;
  -- Task tables
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'task_columns') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE task_columns;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'tasks') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
  END IF;
END $$;

-- ============================================
-- PART 7: STORAGE BUCKET FOR ATTACHMENTS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('task-attachments', 'task-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public Access to task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads to task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates to task attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow deletes from task attachments" ON storage.objects;

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

-- ============================================
-- PART 8: INSERT TASK COLUMNS AND TASKS DATA
-- ============================================

-- Clear existing and insert fresh
DELETE FROM tasks;
DELETE FROM task_columns;

-- Insert columns
INSERT INTO task_columns (name, color, position) VALUES
  ('Backlog', '#6b7280', 0),
  ('To Do', '#6366f1', 1),
  ('In Progress', '#f59e0b', 2),
  ('Review', '#10b981', 3);

-- Insert tasks
DO $$
DECLARE
  backlog_id UUID;
  todo_id UUID;
  inprogress_id UUID;
BEGIN
  SELECT id INTO backlog_id FROM task_columns WHERE name = 'Backlog';
  SELECT id INTO todo_id FROM task_columns WHERE name = 'To Do';
  SELECT id INTO inprogress_id FROM task_columns WHERE name = 'In Progress';

  -- BACKLOG: IRI Service
  INSERT INTO tasks (title, description, column_id, priority, position, checklist, attachments)
  VALUES (
    'IRI Service',
    '',
    backlog_id,
    'P1',
    0,
    '[]',
    '[]'
  );

  -- BACKLOG: Ontstoppingsdienst Website
  INSERT INTO tasks (title, description, column_id, priority, position, checklist, attachments)
  VALUES (
    'Ontstoppingsdienst Website',
    'Website bouwen voor ontstoppingsdienst bedrijf.',
    backlog_id,
    'P1',
    1,
    '[{"id":"1","text":"Offerte aanmaken","completed":false},{"id":"2","text":"Plan maken","completed":false},{"id":"3","text":"Systeem gaan bouwen","completed":false},{"id":"4","text":"Taken verdelen","completed":false}]',
    '[{"id":"pdf1","name":"Ontstoppingsdienst.nl Case .pdf","url":"","type":"application/pdf","size":243955}]'
  );

  -- BACKLOG: Rijschool Planning Systeem
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Rijschool Planning Systeem',
    'Planning systeem bouwen voor rijschool.',
    backlog_id,
    'P2',
    2,
    '[{"id":"1","text":"Requirements verzamelen","completed":false},{"id":"2","text":"Offerte aanmaken","completed":false},{"id":"3","text":"Plan maken","completed":false},{"id":"4","text":"Systeem bouwen","completed":false},{"id":"5","text":"Testen met klant","completed":false}]'
  );

  -- TO DO: Nishani website vader
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Nishani website vader',
    '',
    todo_id,
    'P2',
    0,
    '[{"id":"1","text":"Vragen aan haar","completed":false},{"id":"2","text":"wachten op antwoord","completed":false},{"id":"3","text":"offerte opstellen","completed":false},{"id":"4","text":"website maken","completed":false}]'
  );

  -- IN PROGRESS: Pokebowl Website Afmaken
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Pokebowl Website Afmaken',
    'Website en systeem voor Pokebowl restaurant afronden. Afhaalfunctie, dashboard en printer integratie.',
    inprogress_id,
    'P1',
    0,
    '[{"id":"1","text":"Website maken","completed":true},{"id":"2","text":"Website afhaal functie maken","completed":true},{"id":"3","text":"Dashboard maken","completed":true},{"id":"4","text":"Printer bestellen","completed":true},{"id":"5","text":"Printer koppelen","completed":false},{"id":"6","text":"Mollie account aanmaken","completed":false},{"id":"7","text":"Alles goed testen","completed":false}]'
  );

  -- IN PROGRESS: Cherani Nails Website
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Cherani Nails Website',
    'Website bouwen voor Cherani Nails. Start na afspraken zijn gemaakt.',
    inprogress_id,
    'P2',
    1,
    '[{"id":"1","text":"Offerte aanmaken","completed":false},{"id":"2","text":"Plan maken","completed":false},{"id":"3","text":"Systeem gaan bouwen","completed":false},{"id":"4","text":"Taken verdelen","completed":false}]'
  );

  -- IN PROGRESS: Lori Events Website
  INSERT INTO tasks (title, description, column_id, priority, position, checklist)
  VALUES (
    'Lori Events Website',
    'Website maken voor Lori Events. Wachten op antwoord van klant.',
    inprogress_id,
    'P2',
    2,
    '[{"id":"1","text":"Wachten op antwoord","completed":false},{"id":"2","text":"Offerte aanmaken","completed":false},{"id":"3","text":"Plan maken","completed":false},{"id":"4","text":"Website bouwen","completed":false}]'
  );

END $$;

-- ============================================
-- DONE!
-- Now go to /migratie to import your localStorage data
-- (klanten, instellingen, co-founders, etc.)
-- ============================================
