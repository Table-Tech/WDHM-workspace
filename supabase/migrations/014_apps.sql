-- Apps Migration
-- Eigen apps/producten met maandelijkse omzet, gebruikers en historische data

CREATE TABLE IF NOT EXISTS apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL,
  beschrijving TEXT DEFAULT '',
  platform TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT DEFAULT 'Actief' CHECK (status IN ('Actief', 'Inactief', 'In ontwikkeling')),
  mrr_per_maand NUMERIC DEFAULT 0,
  aantal_gebruikers INTEGER DEFAULT 0,
  aantal_abonnees INTEGER DEFAULT 0,
  maand_inkomsten NUMERIC[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::NUMERIC[],
  maand_gebruikers INTEGER[] DEFAULT ARRAY[0,0,0,0,0,0,0,0,0,0,0,0]::INTEGER[],
  launch_datum DATE,
  url TEXT DEFAULT '',
  notities TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE apps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to apps" ON apps FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_apps_status ON apps(status);

ALTER PUBLICATION supabase_realtime ADD TABLE apps;
