-- Financial Data Migration
-- Migrates all spreadsheet/financial data from localStorage to Supabase

-- ============================================
-- Company Settings (single row)
-- ============================================
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

-- ============================================
-- Co-Founders
-- ============================================
CREATE TABLE IF NOT EXISTS co_founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL,
  rol TEXT DEFAULT '',
  winstverdeling_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Sales Persons
-- ============================================
CREATE TABLE IF NOT EXISTS sales_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL,
  commissie_percentage NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Customers
-- ============================================
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

-- ============================================
-- Leads (rejected/lost customers)
-- ============================================
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

-- ============================================
-- One-Time Income
-- ============================================
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

-- ============================================
-- One-Time Expenses
-- ============================================
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

-- ============================================
-- Monthly Expenses (per category)
-- ============================================
CREATE TABLE IF NOT EXISTS monthly_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categorie TEXT NOT NULL UNIQUE,
  maand_bedragen NUMERIC[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Expense Categories
-- ============================================
CREATE TABLE IF NOT EXISTS expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Enable RLS
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

-- ============================================
-- Public access policies (team shared)
-- ============================================
CREATE POLICY "Allow all access to company_settings" ON company_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to co_founders" ON co_founders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to sales_persons" ON sales_persons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to one_time_income" ON one_time_income FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to one_time_expenses" ON one_time_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to monthly_expenses" ON monthly_expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to expense_categories" ON expense_categories FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_pipeline ON customers(pipeline_fase);
CREATE INDEX IF NOT EXISTS idx_customers_sales_person ON customers(sales_persoon_id);
CREATE INDEX IF NOT EXISTS idx_one_time_income_datum ON one_time_income(datum);
CREATE INDEX IF NOT EXISTS idx_one_time_income_status ON one_time_income(status);
CREATE INDEX IF NOT EXISTS idx_one_time_expenses_datum ON one_time_expenses(datum);
CREATE INDEX IF NOT EXISTS idx_one_time_expenses_status ON one_time_expenses(status);

-- ============================================
-- Enable Realtime
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE company_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE co_founders;
ALTER PUBLICATION supabase_realtime ADD TABLE sales_persons;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE one_time_income;
ALTER PUBLICATION supabase_realtime ADD TABLE one_time_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE monthly_expenses;
ALTER PUBLICATION supabase_realtime ADD TABLE expense_categories;

-- ============================================
-- Insert default data
-- ============================================

-- Default company settings
INSERT INTO company_settings (bedrijfsnaam, btw_percentage, boekjaar)
VALUES ('TechTable', 21, 2026);

-- Default co-founders
INSERT INTO co_founders (naam, winstverdeling_percentage, rol) VALUES
  ('Damian', 25, ''),
  ('Wishant', 25, ''),
  ('Hicham', 25, ''),
  ('Mohammad', 25, '');

-- Default expense categories
INSERT INTO expense_categories (naam) VALUES
  ('Vercel (hosting)'),
  ('Resend (email)'),
  ('Telefoon'),
  ('Moneybird (boekhouding)'),
  ('Domeinnames'),
  ('Marketing & advertising'),
  ('Software & tools'),
  ('Kantoor / werkplek'),
  ('Verzekeringen (zakelijk)'),
  ('Reiskosten'),
  ('Hardware / apparatuur'),
  ('KVK / juridisch'),
  ('Overige bedrijfskosten');

-- Default monthly expenses (one row per category)
INSERT INTO monthly_expenses (categorie, maand_bedragen) VALUES
  ('Vercel (hosting)', ARRAY[20,20,20,20,20,20,20,20,20,20,20,20]::NUMERIC[]),
  ('Resend (email)', ARRAY[20,20,20,20,20,20,20,20,20,20,20,20]::NUMERIC[]),
  ('Telefoon', ARRAY[7,7,7,7,7,7,7,7,7,7,7,7]::NUMERIC[]),
  ('Moneybird (boekhouding)', ARRAY[22,22,22,22,22,22,22,22,22,22,22,22]::NUMERIC[]),
  ('Domeinnames', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('Marketing & advertising', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('Software & tools', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('Kantoor / werkplek', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('Verzekeringen (zakelijk)', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('Reiskosten', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('Hardware / apparatuur', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('KVK / juridisch', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]),
  ('Overige bedrijfskosten', ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[]);
