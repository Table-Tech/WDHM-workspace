# Financial Data to Supabase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate all financial/spreadsheet data from localStorage to Supabase database for persistent, shared team storage.

**Architecture:** Create 8 new database tables matching the existing TypeScript types. Build React Query hooks following the `useTasks.ts` pattern. Replace `SpreadsheetContext` with the new hooks. All calculations move to `useFinancialMetrics.ts`.

**Tech Stack:** Supabase (PostgreSQL), React Query v5, TypeScript, Next.js 14

---

## File Structure

### New Files
| File | Responsibility |
|------|----------------|
| `supabase/migrations/012_financial_data.sql` | Database schema for all financial tables |
| `src/types/financial.ts` | TypeScript types matching database schema |
| `src/hooks/useCompanySettings.ts` | Company settings CRUD |
| `src/hooks/useCoFounders.ts` | Co-founders CRUD |
| `src/hooks/useSalesPersons.ts` | Sales persons CRUD |
| `src/hooks/useCustomers.ts` | Customers CRUD + pipeline logic |
| `src/hooks/useLeadsDB.ts` | Leads CRUD (renamed to avoid conflict) |
| `src/hooks/useOneTimeIncome.ts` | One-time income CRUD |
| `src/hooks/useOneTimeExpenses.ts` | One-time expenses CRUD |
| `src/hooks/useMonthlyExpenses.ts` | Monthly expenses CRUD |
| `src/hooks/useExpenseCategories.ts` | Expense categories CRUD |
| `src/hooks/useFinancialMetrics.ts` | All KPI/metric calculations |
| `src/contexts/FinancialDataProvider.tsx` | Provider combining all hooks |

### Modified Files
| File | Change |
|------|--------|
| `src/app/spreadsheet/*` | Replace SpreadsheetContext with new hooks |

### Deleted Files (after migration)
| File | Reason |
|------|--------|
| `src/contexts/SpreadsheetContext.tsx` | Replaced by hooks + FinancialDataProvider |

---

## Task 1: Create Database Migration

**Files:**
- Create: `supabase/migrations/012_financial_data.sql`

- [ ] **Step 1: Create the migration file**

```sql
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
```

- [ ] **Step 2: Commit the migration**

```bash
git add supabase/migrations/012_financial_data.sql
git commit -m "feat: add database migration for financial data tables"
```

---

## Task 2: Create TypeScript Types

**Files:**
- Create: `src/types/financial.ts`

- [ ] **Step 1: Create the types file**

```typescript
// Financial Data Types - matching Supabase schema

export interface CompanySettings {
  id: string;
  bedrijfsnaam: string;
  kvk_nummer: string;
  btw_percentage: number;
  boekjaar: number;
  startdatum: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoFounder {
  id: string;
  naam: string;
  rol: string;
  winstverdeling_percentage: number;
  created_at: string;
}

export interface SalesPerson {
  id: string;
  naam: string;
  commissie_percentage: number;
  created_at: string;
}

export type CustomerStatus = 'Actief' | 'Inactief' | 'Paused';
export type PipelineFase = 'Lead' | 'Contact gelegd' | 'Offerte gestuurd' | 'In onderhandeling' | 'Klant' | 'Afgevallen';

export interface Customer {
  id: string;
  klantnaam: string;
  product_dienst: string;
  mrr_per_maand: number;
  eenmalig: number;
  sales_persoon_id: string | null;
  status: CustomerStatus;
  maand_inkomsten: number[];
  contactpersoon: string;
  email: string;
  telefoon: string;
  notities: string;
  pipeline_fase: PipelineFase;
  aantal_contacten: number;
  laatste_contact: string | null;
  offerte_waarde: number;
  verwachte_sluitdatum: string | null;
  datum_klant_geworden: string | null;
  datum_onderhoud_start: string | null;
  onderhoud_actief: boolean;
  eenmalig_termijnen: number;
  eenmalig_startdatum: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  bedrijfsnaam: string;
  contactpersoon: string;
  email: string;
  telefoon: string;
  product_interesse: string;
  bron: string;
  reden_afwijzing: string;
  notities: string;
  datum_eerste_contact: string | null;
  datum_afgewezen: string | null;
  offerte_waarde: number;
  aantal_contacten: number;
  created_at: string;
}

export type OneTimeIncomeStatus = 'Open' | 'Gefactureerd' | 'Betaald' | 'Geannuleerd';

export interface OneTimeIncome {
  id: string;
  datum: string;
  klantnaam: string;
  omschrijving: string;
  bedrag_excl_btw: number;
  btw: number;
  bedrag_incl_btw: number;
  sales_commissie: boolean;
  netto_na_commissie: number;
  status: OneTimeIncomeStatus;
  created_at: string;
}

export type OneTimeExpenseStatus = 'Gepland' | 'Besteld' | 'Betaald' | 'Geannuleerd';

export interface OneTimeExpense {
  id: string;
  datum: string;
  leverancier: string;
  omschrijving: string;
  categorie: string;
  bedrag_excl_btw: number;
  btw: number;
  bedrag_incl_btw: number;
  status: OneTimeExpenseStatus;
  created_at: string;
}

export interface MonthlyExpense {
  id: string;
  categorie: string;
  maand_bedragen: number[];
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  naam: string;
  created_at: string;
}

// Form data types (without id and timestamps)
export type CompanySettingsFormData = Omit<CompanySettings, 'id' | 'created_at' | 'updated_at'>;
export type CoFounderFormData = Omit<CoFounder, 'id' | 'created_at'>;
export type SalesPersonFormData = Omit<SalesPerson, 'id' | 'created_at'>;
export type CustomerFormData = Omit<Customer, 'id' | 'created_at' | 'updated_at'>;
export type LeadFormData = Omit<Lead, 'id' | 'created_at'>;
export type OneTimeIncomeFormData = Omit<OneTimeIncome, 'id' | 'created_at'>;
export type OneTimeExpenseFormData = Omit<OneTimeExpense, 'id' | 'created_at'>;
export type MonthlyExpenseFormData = Omit<MonthlyExpense, 'id' | 'created_at' | 'updated_at'>;
export type ExpenseCategoryFormData = Omit<ExpenseCategory, 'id' | 'created_at'>;

// Calculated types
export interface KlantenKPIs {
  actieveKlanten: number;
  totaleMRR: number;
  arr: number;
  gemOmzetPerKlant: number;
}

export interface DashboardMetrics {
  totaleMRR: number;
  arr: number;
  actieveKlanten: number;
  totaleJaaromzetRecurring: number;
  totaleJaaruitgaven: number;
  jaarwinst: number;
  totaleEenmaligeInkomsten: number;
  totaleSalesCommissie: number;
  winstmarge: number;
}

export interface FounderVerdeling {
  naam: string;
  aandeel: number;
  jaarwinst: number;
  perMaandGem: number;
}

export interface PipelineStats {
  perFase: Record<PipelineFase, number>;
  totaalWaarde: number;
  aantalActief: number;
}

export interface MonthlyChartData {
  maand: string;
  maandKort: string;
  inkomsten: number;
  uitgaven: number;
  commissie: number;
  kosten: number;
  winst: number;
  mrr: number;
  eenmalig: number;
  isFuture: boolean;
}

export interface UitgavenBreakdown {
  categorie: string;
  totaal: number;
  percentage: number;
}

export interface YearSummary {
  jaar: number;
  totaalInkomsten: number;
  totaalUitgaven: number;
  totaalWinst: number;
  aantalKlanten: number;
  totaalMRR: number;
  totaalEenmalig: number;
  totaalCommissie: number;
  winstmarge: number;
}

export interface BTWSummary {
  omzetExclBTW: number;
  btwBedrag: number;
  omzetInclBTW: number;
  mrrExclBTW: number;
  mrrBTW: number;
  mrrInclBTW: number;
  eenmaligExclBTW: number;
  eenmaligBTW: number;
  eenmaligInclBTW: number;
  btwPercentage: number;
}

// Month labels
export const MAAND_LABELS = [
  'jan-26', 'feb-26', 'mrt-26', 'apr-26', 'mei-26', 'jun-26',
  'jul-26', 'aug-26', 'sep-26', 'okt-26', 'nov-26', 'dec-26'
] as const;

export const MAAND_LABELS_KORT = [
  'J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'
] as const;

export const PIPELINE_FASES: PipelineFase[] = [
  'Lead',
  'Contact gelegd',
  'Offerte gestuurd',
  'In onderhandeling',
  'Klant',
  'Afgevallen',
];

export const EENMALIGE_KOSTEN_CATEGORIEEN = [
  'Hardware / Apparatuur',
  'Software licenties',
  'Kantoorinrichting',
  'Marketing campagne',
  'Juridisch / Advies',
  'Opleiding / Training',
  'Reiskosten (eenmalig)',
  'Overig',
] as const;
```

- [ ] **Step 2: Commit the types**

```bash
git add src/types/financial.ts
git commit -m "feat: add TypeScript types for financial data"
```

---

## Task 3: Create useCompanySettings Hook

**Files:**
- Create: `src/hooks/useCompanySettings.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { CompanySettings, CompanySettingsFormData } from '@/types/financial';

async function fetchCompanySettings(): Promise<CompanySettings | null> {
  if (!hasValidCredentials) return null;

  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function updateCompanySettingsDb(settings: Partial<CompanySettingsFormData>): Promise<CompanySettings> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Get existing settings or create new
  const { data: existing } = await supabase
    .from('company_settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('company_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('company_settings')
      .insert(settings)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export function useCompanySettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['company-settings'],
    queryFn: fetchCompanySettings,
  });

  const updateSettings = useMutation({
    mutationFn: updateCompanySettingsDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateSettings: updateSettings.mutate,
    updateSettingsAsync: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useCompanySettings.ts
git commit -m "feat: add useCompanySettings hook"
```

---

## Task 4: Create useCoFounders Hook

**Files:**
- Create: `src/hooks/useCoFounders.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { CoFounder, CoFounderFormData } from '@/types/financial';

async function fetchCoFounders(): Promise<CoFounder[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('co_founders')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addCoFounderDb(coFounder: CoFounderFormData): Promise<CoFounder> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('co_founders')
    .insert(coFounder)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateCoFounderDb({ id, ...updates }: Partial<CoFounder> & { id: string }): Promise<CoFounder> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('co_founders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteCoFounderDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('co_founders')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useCoFounders() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['co-founders'],
    queryFn: fetchCoFounders,
  });

  const addCoFounder = useMutation({
    mutationFn: addCoFounderDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['co-founders'] });
    },
  });

  const updateCoFounder = useMutation({
    mutationFn: updateCoFounderDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['co-founders'] });
    },
  });

  const deleteCoFounder = useMutation({
    mutationFn: deleteCoFounderDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['co-founders'] });
    },
  });

  return {
    coFounders: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addCoFounder: addCoFounder.mutate,
    addCoFounderAsync: addCoFounder.mutateAsync,
    updateCoFounder: updateCoFounder.mutate,
    updateCoFounderAsync: updateCoFounder.mutateAsync,
    deleteCoFounder: deleteCoFounder.mutate,
    deleteCoFounderAsync: deleteCoFounder.mutateAsync,
    isAdding: addCoFounder.isPending,
    isUpdating: updateCoFounder.isPending,
    isDeleting: deleteCoFounder.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useCoFounders.ts
git commit -m "feat: add useCoFounders hook"
```

---

## Task 5: Create useSalesPersons Hook

**Files:**
- Create: `src/hooks/useSalesPersons.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { SalesPerson, SalesPersonFormData } from '@/types/financial';

async function fetchSalesPersons(): Promise<SalesPerson[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('sales_persons')
    .select('*')
    .order('naam', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addSalesPersonDb(salesPerson: SalesPersonFormData): Promise<SalesPerson> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('sales_persons')
    .insert(salesPerson)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateSalesPersonDb({ id, ...updates }: Partial<SalesPerson> & { id: string }): Promise<SalesPerson> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('sales_persons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteSalesPersonDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('sales_persons')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useSalesPersons() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['sales-persons'],
    queryFn: fetchSalesPersons,
  });

  const addSalesPerson = useMutation({
    mutationFn: addSalesPersonDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-persons'] });
    },
  });

  const updateSalesPerson = useMutation({
    mutationFn: updateSalesPersonDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-persons'] });
    },
  });

  const deleteSalesPerson = useMutation({
    mutationFn: deleteSalesPersonDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-persons'] });
    },
  });

  const getSalesPerson = (id: string): SalesPerson | undefined => {
    return query.data?.find((sp) => sp.id === id);
  };

  return {
    salesPersons: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    getSalesPerson,
    addSalesPerson: addSalesPerson.mutate,
    addSalesPersonAsync: addSalesPerson.mutateAsync,
    updateSalesPerson: updateSalesPerson.mutate,
    updateSalesPersonAsync: updateSalesPerson.mutateAsync,
    deleteSalesPerson: deleteSalesPerson.mutate,
    deleteSalesPersonAsync: deleteSalesPerson.mutateAsync,
    isAdding: addSalesPerson.isPending,
    isUpdating: updateSalesPerson.isPending,
    isDeleting: deleteSalesPerson.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useSalesPersons.ts
git commit -m "feat: add useSalesPersons hook"
```

---

## Task 6: Create useCustomers Hook

**Files:**
- Create: `src/hooks/useCustomers.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Customer, CustomerFormData, LeadFormData } from '@/types/financial';

async function fetchCustomers(): Promise<Customer[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('klantnaam', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addCustomerDb(customer: CustomerFormData): Promise<Customer> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateCustomerDb({ id, ...updates }: Partial<Customer> & { id: string }): Promise<Customer> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteCustomerDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function moveCustomerToLeadsDb({ customerId, redenAfwijzing }: { customerId: string; redenAfwijzing: string }): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Fetch the customer first
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (fetchError) throw fetchError;

  // Insert into leads
  const leadData: LeadFormData = {
    bedrijfsnaam: customer.klantnaam,
    contactpersoon: customer.contactpersoon,
    email: customer.email,
    telefoon: customer.telefoon,
    product_interesse: customer.product_dienst,
    bron: '',
    reden_afwijzing: redenAfwijzing,
    notities: customer.notities,
    datum_eerste_contact: customer.datum_klant_geworden,
    datum_afgewezen: new Date().toISOString().split('T')[0],
    offerte_waarde: customer.offerte_waarde,
    aantal_contacten: customer.aantal_contacten,
  };

  const { error: insertError } = await supabase
    .from('leads')
    .insert(leadData);

  if (insertError) throw insertError;

  // Delete the customer
  const { error: deleteError } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (deleteError) throw deleteError;
}

export function useCustomers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const addCustomer = useMutation({
    mutationFn: addCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: updateCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: deleteCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const moveToLeads = useMutation({
    mutationFn: moveCustomerToLeadsDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return {
    customers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addCustomer: addCustomer.mutate,
    addCustomerAsync: addCustomer.mutateAsync,
    updateCustomer: updateCustomer.mutate,
    updateCustomerAsync: updateCustomer.mutateAsync,
    deleteCustomer: deleteCustomer.mutate,
    deleteCustomerAsync: deleteCustomer.mutateAsync,
    moveToLeads: moveToLeads.mutate,
    moveToLeadsAsync: moveToLeads.mutateAsync,
    isAdding: addCustomer.isPending,
    isUpdating: updateCustomer.isPending,
    isDeleting: deleteCustomer.isPending,
    isMovingToLeads: moveToLeads.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useCustomers.ts
git commit -m "feat: add useCustomers hook with pipeline support"
```

---

## Task 7: Create useLeadsDB Hook

**Files:**
- Create: `src/hooks/useLeadsDB.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Lead, LeadFormData, CustomerFormData } from '@/types/financial';

async function fetchLeads(): Promise<Lead[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addLeadDb(lead: LeadFormData): Promise<Lead> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateLeadDb({ id, ...updates }: Partial<Lead> & { id: string }): Promise<Lead> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteLeadDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function restoreLeadToCustomerDb(leadId: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Fetch the lead first
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError) throw fetchError;

  // Insert into customers
  const customerData: CustomerFormData = {
    klantnaam: lead.bedrijfsnaam,
    product_dienst: lead.product_interesse,
    mrr_per_maand: 0,
    eenmalig: 0,
    sales_persoon_id: null,
    status: 'Actief',
    maand_inkomsten: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    contactpersoon: lead.contactpersoon,
    email: lead.email,
    telefoon: lead.telefoon,
    notities: lead.notities,
    pipeline_fase: 'Lead',
    aantal_contacten: lead.aantal_contacten,
    laatste_contact: null,
    offerte_waarde: lead.offerte_waarde,
    verwachte_sluitdatum: null,
    datum_klant_geworden: new Date().toISOString().split('T')[0],
    datum_onderhoud_start: null,
    onderhoud_actief: false,
    eenmalig_termijnen: 1,
    eenmalig_startdatum: null,
  };

  const { error: insertError } = await supabase
    .from('customers')
    .insert(customerData);

  if (insertError) throw insertError;

  // Delete the lead
  const { error: deleteError } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (deleteError) throw deleteError;
}

export function useLeadsDB() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  const addLead = useMutation({
    mutationFn: addLeadDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateLead = useMutation({
    mutationFn: updateLeadDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const deleteLead = useMutation({
    mutationFn: deleteLeadDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const restoreToCustomer = useMutation({
    mutationFn: restoreLeadToCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    leads: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addLead: addLead.mutate,
    addLeadAsync: addLead.mutateAsync,
    updateLead: updateLead.mutate,
    updateLeadAsync: updateLead.mutateAsync,
    deleteLead: deleteLead.mutate,
    deleteLeadAsync: deleteLead.mutateAsync,
    restoreToCustomer: restoreToCustomer.mutate,
    restoreToCustomerAsync: restoreToCustomer.mutateAsync,
    isAdding: addLead.isPending,
    isUpdating: updateLead.isPending,
    isDeleting: deleteLead.isPending,
    isRestoring: restoreToCustomer.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useLeadsDB.ts
git commit -m "feat: add useLeadsDB hook with restore to customer"
```

---

## Task 8: Create useOneTimeIncome Hook

**Files:**
- Create: `src/hooks/useOneTimeIncome.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { OneTimeIncome, OneTimeIncomeFormData } from '@/types/financial';

async function fetchOneTimeIncome(): Promise<OneTimeIncome[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('one_time_income')
    .select('*')
    .order('datum', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addOneTimeIncomeDb(income: OneTimeIncomeFormData): Promise<OneTimeIncome> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('one_time_income')
    .insert(income)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateOneTimeIncomeDb({ id, ...updates }: Partial<OneTimeIncome> & { id: string }): Promise<OneTimeIncome> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('one_time_income')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteOneTimeIncomeDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('one_time_income')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useOneTimeIncome() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['one-time-income'],
    queryFn: fetchOneTimeIncome,
  });

  const addIncome = useMutation({
    mutationFn: addOneTimeIncomeDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-time-income'] });
    },
  });

  const updateIncome = useMutation({
    mutationFn: updateOneTimeIncomeDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-time-income'] });
    },
  });

  const deleteIncome = useMutation({
    mutationFn: deleteOneTimeIncomeDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-time-income'] });
    },
  });

  return {
    oneTimeIncome: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addIncome: addIncome.mutate,
    addIncomeAsync: addIncome.mutateAsync,
    updateIncome: updateIncome.mutate,
    updateIncomeAsync: updateIncome.mutateAsync,
    deleteIncome: deleteIncome.mutate,
    deleteIncomeAsync: deleteIncome.mutateAsync,
    isAdding: addIncome.isPending,
    isUpdating: updateIncome.isPending,
    isDeleting: deleteIncome.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useOneTimeIncome.ts
git commit -m "feat: add useOneTimeIncome hook"
```

---

## Task 9: Create useOneTimeExpenses Hook

**Files:**
- Create: `src/hooks/useOneTimeExpenses.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { OneTimeExpense, OneTimeExpenseFormData } from '@/types/financial';

async function fetchOneTimeExpenses(): Promise<OneTimeExpense[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('one_time_expenses')
    .select('*')
    .order('datum', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addOneTimeExpenseDb(expense: OneTimeExpenseFormData): Promise<OneTimeExpense> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('one_time_expenses')
    .insert(expense)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateOneTimeExpenseDb({ id, ...updates }: Partial<OneTimeExpense> & { id: string }): Promise<OneTimeExpense> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('one_time_expenses')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteOneTimeExpenseDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('one_time_expenses')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useOneTimeExpenses() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['one-time-expenses'],
    queryFn: fetchOneTimeExpenses,
  });

  const addExpense = useMutation({
    mutationFn: addOneTimeExpenseDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-time-expenses'] });
    },
  });

  const updateExpense = useMutation({
    mutationFn: updateOneTimeExpenseDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-time-expenses'] });
    },
  });

  const deleteExpense = useMutation({
    mutationFn: deleteOneTimeExpenseDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['one-time-expenses'] });
    },
  });

  return {
    oneTimeExpenses: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addExpense: addExpense.mutate,
    addExpenseAsync: addExpense.mutateAsync,
    updateExpense: updateExpense.mutate,
    updateExpenseAsync: updateExpense.mutateAsync,
    deleteExpense: deleteExpense.mutate,
    deleteExpenseAsync: deleteExpense.mutateAsync,
    isAdding: addExpense.isPending,
    isUpdating: updateExpense.isPending,
    isDeleting: deleteExpense.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useOneTimeExpenses.ts
git commit -m "feat: add useOneTimeExpenses hook"
```

---

## Task 10: Create useMonthlyExpenses Hook

**Files:**
- Create: `src/hooks/useMonthlyExpenses.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { MonthlyExpense } from '@/types/financial';

async function fetchMonthlyExpenses(): Promise<MonthlyExpense[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('monthly_expenses')
    .select('*')
    .order('categorie', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function updateMonthlyExpenseDb({
  categorie,
  maandIndex,
  bedrag,
}: {
  categorie: string;
  maandIndex: number;
  bedrag: number;
}): Promise<MonthlyExpense> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Fetch the current expense
  const { data: existing, error: fetchError } = await supabase
    .from('monthly_expenses')
    .select('*')
    .eq('categorie', categorie)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

  if (existing) {
    // Update the specific month
    const newBedragen = [...existing.maand_bedragen];
    newBedragen[maandIndex] = bedrag;

    const { data, error } = await supabase
      .from('monthly_expenses')
      .update({ maand_bedragen: newBedragen, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new expense row
    const maandBedragen = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    maandBedragen[maandIndex] = bedrag;

    const { data, error } = await supabase
      .from('monthly_expenses')
      .insert({ categorie, maand_bedragen: maandBedragen })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

async function addMonthlyExpenseCategoryDb(categorie: string): Promise<MonthlyExpense> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('monthly_expenses')
    .insert({ categorie, maand_bedragen: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteMonthlyExpenseCategoryDb(categorie: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('monthly_expenses')
    .delete()
    .eq('categorie', categorie);

  if (error) throw error;
}

export function useMonthlyExpenses() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['monthly-expenses'],
    queryFn: fetchMonthlyExpenses,
  });

  const updateExpense = useMutation({
    mutationFn: updateMonthlyExpenseDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
    },
  });

  const addCategory = useMutation({
    mutationFn: addMonthlyExpenseCategoryDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: deleteMonthlyExpenseCategoryDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthly-expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });

  // Convert to Record<string, number[]> format for compatibility
  const uitgaven: Record<string, number[]> = {};
  for (const expense of query.data ?? []) {
    uitgaven[expense.categorie] = expense.maand_bedragen;
  }

  return {
    monthlyExpenses: query.data ?? [],
    uitgaven,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateExpense: updateExpense.mutate,
    updateExpenseAsync: updateExpense.mutateAsync,
    addCategory: addCategory.mutate,
    addCategoryAsync: addCategory.mutateAsync,
    deleteCategory: deleteCategory.mutate,
    deleteCategoryAsync: deleteCategory.mutateAsync,
    isUpdating: updateExpense.isPending,
    isAddingCategory: addCategory.isPending,
    isDeletingCategory: deleteCategory.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useMonthlyExpenses.ts
git commit -m "feat: add useMonthlyExpenses hook"
```

---

## Task 11: Create useExpenseCategories Hook

**Files:**
- Create: `src/hooks/useExpenseCategories.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { ExpenseCategory, ExpenseCategoryFormData } from '@/types/financial';

async function fetchExpenseCategories(): Promise<ExpenseCategory[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .order('naam', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addExpenseCategoryDb(category: ExpenseCategoryFormData): Promise<ExpenseCategory> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('expense_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteExpenseCategoryDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('expense_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useExpenseCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['expense-categories'],
    queryFn: fetchExpenseCategories,
  });

  const addCategory = useMutation({
    mutationFn: addExpenseCategoryDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: deleteExpenseCategoryDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
    },
  });

  // Extract category names for compatibility
  const categoryNames = (query.data ?? []).map((c) => c.naam);

  return {
    expenseCategories: query.data ?? [],
    categoryNames,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addCategory: addCategory.mutate,
    addCategoryAsync: addCategory.mutateAsync,
    deleteCategory: deleteCategory.mutate,
    deleteCategoryAsync: deleteCategory.mutateAsync,
    isAdding: addCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useExpenseCategories.ts
git commit -m "feat: add useExpenseCategories hook"
```

---

## Task 12: Create useFinancialMetrics Hook

**Files:**
- Create: `src/hooks/useFinancialMetrics.ts`

- [ ] **Step 1: Create the hook**

```typescript
'use client';

import { useMemo } from 'react';
import { useCompanySettings } from './useCompanySettings';
import { useCoFounders } from './useCoFounders';
import { useSalesPersons } from './useSalesPersons';
import { useCustomers } from './useCustomers';
import { useOneTimeIncome } from './useOneTimeIncome';
import { useOneTimeExpenses } from './useOneTimeExpenses';
import { useMonthlyExpenses } from './useMonthlyExpenses';
import type {
  KlantenKPIs,
  DashboardMetrics,
  FounderVerdeling,
  PipelineStats,
  PipelineFase,
  MonthlyChartData,
  UitgavenBreakdown,
  YearSummary,
  BTWSummary,
  MAAND_LABELS,
} from '@/types/financial';

const MAAND_LABELS_ARRAY = [
  'jan-26', 'feb-26', 'mrt-26', 'apr-26', 'mei-26', 'jun-26',
  'jul-26', 'aug-26', 'sep-26', 'okt-26', 'nov-26', 'dec-26'
];

const MAAND_LABELS_KORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function useFinancialMetrics() {
  const { settings } = useCompanySettings();
  const { coFounders } = useCoFounders();
  const { salesPersons } = useSalesPersons();
  const { customers } = useCustomers();
  const { oneTimeIncome } = useOneTimeIncome();
  const { oneTimeExpenses } = useOneTimeExpenses();
  const { uitgaven } = useMonthlyExpenses();

  const isLoading = !settings;

  const btwPercentage = settings?.btw_percentage ?? 21;

  // Get current month index (0-11)
  const getCurrentMonthIndex = (): number => {
    return new Date().getMonth();
  };

  // Active customers
  const activeCustomers = useMemo(() => {
    return customers.filter((k) => k.status === 'Actief');
  }, [customers]);

  // KPIs
  const getKlantenKPIs = useMemo((): KlantenKPIs => {
    const actieveKlanten = activeCustomers.length;
    const totaleMRR = activeCustomers.reduce((sum, k) => sum + k.mrr_per_maand, 0);
    const arr = totaleMRR * 12;
    const gemOmzetPerKlant = actieveKlanten > 0 ? totaleMRR / actieveKlanten : 0;

    return { actieveKlanten, totaleMRR, arr, gemOmzetPerKlant };
  }, [activeCustomers]);

  // MRR per month
  const getMaandMRR = useMemo((): number[] => {
    const result = Array(12).fill(0);
    for (const klant of activeCustomers) {
      for (let i = 0; i < 12; i++) {
        result[i] += klant.maand_inkomsten[i] ?? 0;
      }
    }
    return result;
  }, [activeCustomers]);

  // One-time income per month
  const getMaandEenmalig = useMemo((): number[] => {
    const result = Array(12).fill(0);
    for (const income of oneTimeIncome) {
      if (income.status !== 'Geannuleerd') {
        const month = new Date(income.datum).getMonth();
        result[month] += income.bedrag_excl_btw;
      }
    }
    return result;
  }, [oneTimeIncome]);

  // One-time expenses per month
  const getMaandEenmaligeKosten = useMemo((): number[] => {
    const result = Array(12).fill(0);
    for (const expense of oneTimeExpenses) {
      if (expense.status !== 'Geannuleerd') {
        const month = new Date(expense.datum).getMonth();
        result[month] += expense.bedrag_excl_btw;
      }
    }
    return result;
  }, [oneTimeExpenses]);

  // Sales commission per month
  const getSalesCommissiePerMaand = useMemo((): number[] => {
    const result = Array(12).fill(0);

    for (const klant of activeCustomers) {
      if (klant.sales_persoon_id) {
        const salesPerson = salesPersons.find((sp) => sp.id === klant.sales_persoon_id);
        if (salesPerson) {
          const commissieRate = salesPerson.commissie_percentage / 100;
          for (let i = 0; i < 12; i++) {
            result[i] += (klant.maand_inkomsten[i] ?? 0) * commissieRate;
          }
        }
      }
    }

    for (const income of oneTimeIncome) {
      if (income.sales_commissie && income.status !== 'Geannuleerd') {
        const month = new Date(income.datum).getMonth();
        // Assuming default 10% commission for one-time income
        result[month] += income.bedrag_excl_btw * 0.1;
      }
    }

    return result;
  }, [activeCustomers, salesPersons, oneTimeIncome]);

  // Total expenses per month
  const getTotaalUitgavenPerMaand = useMemo((): number[] => {
    const result = Array(12).fill(0);
    const eenmaligeKosten = getMaandEenmaligeKosten;

    for (const categorie of Object.keys(uitgaven)) {
      const bedragen = uitgaven[categorie];
      for (let i = 0; i < 12; i++) {
        result[i] += bedragen[i] ?? 0;
      }
    }

    for (let i = 0; i < 12; i++) {
      result[i] += eenmaligeKosten[i];
    }

    return result;
  }, [uitgaven, getMaandEenmaligeKosten]);

  // Profit before distribution
  const getWinstVoorVerdeling = useMemo((): number[] => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const commissie = getSalesCommissiePerMaand;
    const uitgavenTotaal = getTotaalUitgavenPerMaand;

    return Array(12).fill(0).map((_, i) => {
      return mrr[i] + eenmalig[i] - commissie[i] - uitgavenTotaal[i];
    });
  }, [getMaandMRR, getMaandEenmalig, getSalesCommissiePerMaand, getTotaalUitgavenPerMaand]);

  // Founder distributions
  const getFounderVerdelingen = useMemo((): FounderVerdeling[] => {
    const winst = getWinstVoorVerdeling;
    const totaalJaarwinst = winst.reduce((a, b) => a + b, 0);

    return coFounders.map((founder) => {
      const aandeel = founder.winstverdeling_percentage / 100;
      const jaarwinst = totaalJaarwinst * aandeel;
      return {
        naam: founder.naam,
        aandeel: founder.winstverdeling_percentage,
        jaarwinst,
        perMaandGem: jaarwinst / 12,
      };
    });
  }, [coFounders, getWinstVoorVerdeling]);

  // Dashboard metrics
  const getDashboardMetrics = useMemo((): DashboardMetrics => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const commissie = getSalesCommissiePerMaand;
    const uitgavenTotaal = getTotaalUitgavenPerMaand;

    const totaleMRR = getKlantenKPIs.totaleMRR;
    const arr = totaleMRR * 12;
    const totaleJaaromzetRecurring = mrr.reduce((a, b) => a + b, 0);
    const totaleEenmaligeInkomsten = eenmalig.reduce((a, b) => a + b, 0);
    const totaleJaaruitgaven = uitgavenTotaal.reduce((a, b) => a + b, 0);
    const totaleSalesCommissie = commissie.reduce((a, b) => a + b, 0);
    const totaalInkomsten = totaleJaaromzetRecurring + totaleEenmaligeInkomsten;
    const jaarwinst = totaalInkomsten - totaleJaaruitgaven - totaleSalesCommissie;
    const winstmarge = totaalInkomsten > 0 ? (jaarwinst / totaalInkomsten) * 100 : 0;

    return {
      totaleMRR,
      arr,
      actieveKlanten: getKlantenKPIs.actieveKlanten,
      totaleJaaromzetRecurring,
      totaleJaaruitgaven,
      jaarwinst,
      totaleEenmaligeInkomsten,
      totaleSalesCommissie,
      winstmarge,
    };
  }, [getMaandMRR, getMaandEenmalig, getSalesCommissiePerMaand, getTotaalUitgavenPerMaand, getKlantenKPIs]);

  // Profit margin per month
  const getWinstmarge = useMemo((): number[] => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const winst = getWinstVoorVerdeling;

    return Array(12).fill(0).map((_, i) => {
      const totaalInkomsten = mrr[i] + eenmalig[i];
      return totaalInkomsten > 0 ? (winst[i] / totaalInkomsten) * 100 : 0;
    });
  }, [getMaandMRR, getMaandEenmalig, getWinstVoorVerdeling]);

  // Pipeline stats
  const getPipelineStats = useMemo((): PipelineStats => {
    const perFase: Record<PipelineFase, number> = {
      'Lead': 0,
      'Contact gelegd': 0,
      'Offerte gestuurd': 0,
      'In onderhandeling': 0,
      'Klant': 0,
      'Afgevallen': 0,
    };

    let totaalWaarde = 0;
    let aantalActief = 0;

    for (const klant of customers) {
      perFase[klant.pipeline_fase]++;
      if (klant.pipeline_fase !== 'Afgevallen' && klant.pipeline_fase !== 'Klant') {
        totaalWaarde += klant.offerte_waarde;
        aantalActief++;
      }
    }

    return { perFase, totaalWaarde, aantalActief };
  }, [customers]);

  // Monthly chart data
  const getMonthlyChartData = useMemo((): MonthlyChartData[] => {
    const mrr = getMaandMRR;
    const eenmalig = getMaandEenmalig;
    const commissie = getSalesCommissiePerMaand;
    const uitgavenTotaal = getTotaalUitgavenPerMaand;
    const currentMonth = getCurrentMonthIndex();

    return Array(12).fill(0).map((_, i) => {
      const inkomsten = mrr[i] + eenmalig[i];
      const kosten = uitgavenTotaal[i] + commissie[i];
      return {
        maand: MAAND_LABELS_ARRAY[i],
        maandKort: MAAND_LABELS_KORT[i],
        inkomsten,
        uitgaven: uitgavenTotaal[i],
        commissie: commissie[i],
        kosten,
        winst: inkomsten - kosten,
        mrr: mrr[i],
        eenmalig: eenmalig[i],
        isFuture: i > currentMonth,
      };
    });
  }, [getMaandMRR, getMaandEenmalig, getSalesCommissiePerMaand, getTotaalUitgavenPerMaand]);

  // Expense breakdown
  const getUitgavenBreakdown = useMemo((): UitgavenBreakdown[] => {
    const totaalPerCategorie: Record<string, number> = {};
    let grandTotal = 0;

    for (const categorie of Object.keys(uitgaven)) {
      const totaal = uitgaven[categorie].reduce((a, b) => a + b, 0);
      totaalPerCategorie[categorie] = totaal;
      grandTotal += totaal;
    }

    return Object.keys(totaalPerCategorie)
      .map((categorie) => ({
        categorie,
        totaal: totaalPerCategorie[categorie],
        percentage: grandTotal > 0 ? (totaalPerCategorie[categorie] / grandTotal) * 100 : 0,
      }))
      .filter((item) => item.totaal > 0)
      .sort((a, b) => b.totaal - a.totaal);
  }, [uitgaven]);

  // Year summary
  const getYearSummary = useMemo((): YearSummary => {
    const metrics = getDashboardMetrics;
    return {
      jaar: settings?.boekjaar ?? 2026,
      totaalInkomsten: metrics.totaleJaaromzetRecurring + metrics.totaleEenmaligeInkomsten,
      totaalUitgaven: metrics.totaleJaaruitgaven,
      totaalWinst: metrics.jaarwinst,
      aantalKlanten: metrics.actieveKlanten,
      totaalMRR: metrics.totaleMRR,
      totaalEenmalig: metrics.totaleEenmaligeInkomsten,
      totaalCommissie: metrics.totaleSalesCommissie,
      winstmarge: metrics.winstmarge,
    };
  }, [getDashboardMetrics, settings]);

  // BTW summary
  const getBTWSummary = useMemo((): BTWSummary => {
    const mrrTotaal = getMaandMRR.reduce((a, b) => a + b, 0);
    const eenmaligTotaal = getMaandEenmalig.reduce((a, b) => a + b, 0);
    const omzetExclBTW = mrrTotaal + eenmaligTotaal;
    const btwRate = btwPercentage / 100;

    return {
      omzetExclBTW,
      btwBedrag: omzetExclBTW * btwRate,
      omzetInclBTW: omzetExclBTW * (1 + btwRate),
      mrrExclBTW: mrrTotaal,
      mrrBTW: mrrTotaal * btwRate,
      mrrInclBTW: mrrTotaal * (1 + btwRate),
      eenmaligExclBTW: eenmaligTotaal,
      eenmaligBTW: eenmaligTotaal * btwRate,
      eenmaligInclBTW: eenmaligTotaal * (1 + btwRate),
      btwPercentage,
    };
  }, [getMaandMRR, getMaandEenmalig, btwPercentage]);

  // Customer monthly income calculation
  const getKlantMaandInkomsten = (klantId: string): number[] => {
    const klant = customers.find((k) => k.id === klantId);
    return klant?.maand_inkomsten ?? Array(12).fill(0);
  };

  // MRR breakdown by customer
  const getMRRBreakdown = useMemo(() => {
    return activeCustomers.map((klant) => ({
      klantId: klant.id,
      klantnaam: klant.klantnaam,
      maanden: klant.maand_inkomsten,
      totaal: klant.maand_inkomsten.reduce((a, b) => a + b, 0),
    }));
  }, [activeCustomers]);

  return {
    isLoading,
    settings,
    btwPercentage,
    getCurrentMonthIndex,
    getKlantenKPIs,
    getMaandMRR,
    getMaandEenmalig,
    getMaandEenmaligeKosten,
    getSalesCommissiePerMaand,
    getTotaalUitgavenPerMaand,
    getWinstVoorVerdeling,
    getFounderVerdelingen,
    getDashboardMetrics,
    getWinstmarge,
    getPipelineStats,
    getMonthlyChartData,
    getUitgavenBreakdown,
    getYearSummary,
    getBTWSummary,
    getKlantMaandInkomsten,
    getMRRBreakdown,
  };
}
```

- [ ] **Step 2: Commit the hook**

```bash
git add src/hooks/useFinancialMetrics.ts
git commit -m "feat: add useFinancialMetrics hook with all calculations"
```

---

## Task 13: Create FinancialDataProvider

**Files:**
- Create: `src/contexts/FinancialDataProvider.tsx`

- [ ] **Step 1: Create the provider**

```typescript
'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useCoFounders } from '@/hooks/useCoFounders';
import { useSalesPersons } from '@/hooks/useSalesPersons';
import { useCustomers } from '@/hooks/useCustomers';
import { useLeadsDB } from '@/hooks/useLeadsDB';
import { useOneTimeIncome } from '@/hooks/useOneTimeIncome';
import { useOneTimeExpenses } from '@/hooks/useOneTimeExpenses';
import { useMonthlyExpenses } from '@/hooks/useMonthlyExpenses';
import { useExpenseCategories } from '@/hooks/useExpenseCategories';
import { useFinancialMetrics } from '@/hooks/useFinancialMetrics';

// Re-export all hook return types combined
type FinancialDataContextType = {
  // Company Settings
  settings: ReturnType<typeof useCompanySettings>;
  // Co-Founders
  coFounders: ReturnType<typeof useCoFounders>;
  // Sales Persons
  salesPersons: ReturnType<typeof useSalesPersons>;
  // Customers
  customers: ReturnType<typeof useCustomers>;
  // Leads
  leads: ReturnType<typeof useLeadsDB>;
  // One-Time Income
  oneTimeIncome: ReturnType<typeof useOneTimeIncome>;
  // One-Time Expenses
  oneTimeExpenses: ReturnType<typeof useOneTimeExpenses>;
  // Monthly Expenses
  monthlyExpenses: ReturnType<typeof useMonthlyExpenses>;
  // Expense Categories
  expenseCategories: ReturnType<typeof useExpenseCategories>;
  // Metrics
  metrics: ReturnType<typeof useFinancialMetrics>;
  // Overall loading state
  isHydrated: boolean;
};

const FinancialDataContext = createContext<FinancialDataContextType | null>(null);

export function FinancialDataProvider({ children }: { children: ReactNode }) {
  const settings = useCompanySettings();
  const coFounders = useCoFounders();
  const salesPersons = useSalesPersons();
  const customers = useCustomers();
  const leads = useLeadsDB();
  const oneTimeIncome = useOneTimeIncome();
  const oneTimeExpenses = useOneTimeExpenses();
  const monthlyExpenses = useMonthlyExpenses();
  const expenseCategories = useExpenseCategories();
  const metrics = useFinancialMetrics();

  // Consider hydrated when all essential data is loaded
  const isHydrated = !settings.isLoading &&
    !customers.isLoading &&
    !monthlyExpenses.isLoading;

  return (
    <FinancialDataContext.Provider
      value={{
        settings,
        coFounders,
        salesPersons,
        customers,
        leads,
        oneTimeIncome,
        oneTimeExpenses,
        monthlyExpenses,
        expenseCategories,
        metrics,
        isHydrated,
      }}
    >
      {children}
    </FinancialDataContext.Provider>
  );
}

export function useFinancialData() {
  const context = useContext(FinancialDataContext);
  if (!context) {
    throw new Error('useFinancialData must be used within a FinancialDataProvider');
  }
  return context;
}
```

- [ ] **Step 2: Commit the provider**

```bash
git add src/contexts/FinancialDataProvider.tsx
git commit -m "feat: add FinancialDataProvider combining all hooks"
```

---

## Task 14: Run Migration on Supabase

- [ ] **Step 1: Apply migration to Supabase**

Run the migration in your Supabase dashboard SQL editor or via CLI:

```bash
# If using Supabase CLI
supabase db push

# Or copy the migration SQL and run in Supabase Dashboard > SQL Editor
```

Expected: All 8 tables created with default data

- [ ] **Step 2: Verify tables exist**

In Supabase Dashboard > Table Editor, verify these tables exist:
- company_settings (1 row with TechTable defaults)
- co_founders (4 rows - Damian, Wishant, Hicham, Mohammad)
- sales_persons (0 rows)
- customers (0 rows)
- leads (0 rows)
- one_time_income (0 rows)
- one_time_expenses (0 rows)
- monthly_expenses (13 rows - one per category)
- expense_categories (13 rows)

---

## Task 15: Update Spreadsheet Components to Use New Hooks

**Files:**
- Modify: All files in `src/app/spreadsheet/` that use SpreadsheetContext

- [ ] **Step 1: Identify components using SpreadsheetContext**

```bash
grep -r "useSpreadsheet" src/app/spreadsheet/
```

- [ ] **Step 2: Update imports in each component**

Replace:
```typescript
import { useSpreadsheet } from '@/contexts/SpreadsheetContext';
```

With:
```typescript
import { useFinancialData } from '@/contexts/FinancialDataProvider';
```

- [ ] **Step 3: Update hook usage**

Replace:
```typescript
const { klanten, updateKlant, ... } = useSpreadsheet();
```

With:
```typescript
const { customers, metrics, ... } = useFinancialData();
const { customers: klanten, updateCustomer } = customers;
```

- [ ] **Step 4: Add FinancialDataProvider to layout**

In `src/app/spreadsheet/layout.tsx` or the root layout, wrap with provider:

```typescript
import { FinancialDataProvider } from '@/contexts/FinancialDataProvider';

export default function SpreadsheetLayout({ children }) {
  return (
    <FinancialDataProvider>
      {children}
    </FinancialDataProvider>
  );
}
```

- [ ] **Step 5: Test and commit**

```bash
npm run build
git add -A
git commit -m "refactor: update spreadsheet components to use new hooks"
```

---

## Task 16: Cleanup Old SpreadsheetContext

**Files:**
- Delete: `src/contexts/SpreadsheetContext.tsx`

- [ ] **Step 1: Verify no more references**

```bash
grep -r "SpreadsheetContext" src/
```

Expected: No results

- [ ] **Step 2: Delete the old context**

```bash
rm src/contexts/SpreadsheetContext.tsx
```

- [ ] **Step 3: Commit cleanup**

```bash
git add -A
git commit -m "chore: remove deprecated SpreadsheetContext"
```

---

## Final Verification

- [ ] **Step 1: Run full build**

```bash
npm run build
```

Expected: Build succeeds with no errors

- [ ] **Step 2: Test the application**

1. Open the spreadsheet page
2. Add a new customer
3. Edit customer MRR
4. Add a one-time expense
5. Verify data persists after page refresh
6. Open in another browser tab - verify data syncs

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete financial data migration to Supabase"
```
