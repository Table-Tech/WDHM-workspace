# Financial Data Migration to Supabase

**Date:** 2026-04-26
**Status:** Approved
**Scope:** Migrate all financial/spreadsheet data from localStorage to Supabase database

## Overview

Currently, financial data (customers, expenses, income, settings) is stored only in browser localStorage. This creates data loss risk and prevents team collaboration. This design migrates all financial data to Supabase for persistent, shared storage.

## Goals

1. All financial data persisted in Supabase database
2. Real-time sync across team members
3. CRUD operations with React Query caching
4. Consistent with existing patterns (tasks, friends, badges)
5. Remove localStorage dependency for financial data

## Database Schema

### company_settings
Single row containing company-wide settings.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| bedrijfsnaam | TEXT | Company name |
| kvk_nummer | TEXT | KVK registration number |
| btw_percentage | NUMERIC | VAT percentage (default 21) |
| boekjaar | INTEGER | Fiscal year (default 2026) |
| startdatum | DATE | Start date |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### co_founders
Team co-founders with profit sharing.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| naam | TEXT | Name |
| rol | TEXT | Role |
| winstverdeling_percentage | NUMERIC | Profit share % |
| created_at | TIMESTAMPTZ | Creation timestamp |

### sales_persons
Sales team members with commission rates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| naam | TEXT | Name |
| commissie_percentage | NUMERIC | Commission % |
| created_at | TIMESTAMPTZ | Creation timestamp |

### customers
Customer records with MRR and pipeline tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| klantnaam | TEXT | Customer name |
| product_dienst | TEXT | Product/service |
| mrr_per_maand | NUMERIC | Monthly recurring revenue |
| eenmalig | NUMERIC | One-time amount |
| sales_persoon_id | UUID | FK to sales_persons |
| status | TEXT | Actief/Inactief/Paused |
| maand_inkomsten | NUMERIC[] | 12-month income array |
| contactpersoon | TEXT | Contact person |
| email | TEXT | Email |
| telefoon | TEXT | Phone |
| notities | TEXT | Notes |
| pipeline_fase | TEXT | Pipeline stage |
| aantal_contacten | INTEGER | Contact count |
| laatste_contact | DATE | Last contact date |
| offerte_waarde | NUMERIC | Quote value |
| verwachte_sluitdatum | DATE | Expected close date |
| datum_klant_geworden | DATE | Customer since |
| datum_onderhoud_start | DATE | Maintenance start |
| onderhoud_actief | BOOLEAN | Maintenance active |
| eenmalig_termijnen | INTEGER | Payment terms |
| eenmalig_startdatum | DATE | First payment date |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### leads
Lost/rejected leads for tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| bedrijfsnaam | TEXT | Company name |
| contactpersoon | TEXT | Contact person |
| email | TEXT | Email |
| telefoon | TEXT | Phone |
| product_interesse | TEXT | Product interest |
| bron | TEXT | Lead source |
| reden_afwijzing | TEXT | Rejection reason |
| notities | TEXT | Notes |
| datum_eerste_contact | DATE | First contact date |
| datum_afgewezen | DATE | Rejection date |
| offerte_waarde | NUMERIC | Quote value |
| aantal_contacten | INTEGER | Contact count |
| created_at | TIMESTAMPTZ | Creation timestamp |

### one_time_income
One-time income records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| datum | DATE | Date |
| klantnaam | TEXT | Customer name |
| omschrijving | TEXT | Description |
| bedrag_excl_btw | NUMERIC | Amount excl. VAT |
| btw | NUMERIC | VAT amount |
| bedrag_incl_btw | NUMERIC | Amount incl. VAT |
| sales_commissie | BOOLEAN | Has sales commission |
| netto_na_commissie | NUMERIC | Net after commission |
| status | TEXT | Open/Gefactureerd/Betaald/Geannuleerd |
| created_at | TIMESTAMPTZ | Creation timestamp |

### one_time_expenses
One-time expense records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| datum | DATE | Date |
| leverancier | TEXT | Supplier |
| omschrijving | TEXT | Description |
| categorie | TEXT | Category |
| bedrag_excl_btw | NUMERIC | Amount excl. VAT |
| btw | NUMERIC | VAT amount |
| bedrag_incl_btw | NUMERIC | Amount incl. VAT |
| status | TEXT | Gepland/Besteld/Betaald/Geannuleerd |
| created_at | TIMESTAMPTZ | Creation timestamp |

### monthly_expenses
Monthly recurring expenses by category.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| categorie | TEXT | Category name |
| maand_bedragen | NUMERIC[] | 12-month amounts array |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

### expense_categories
Available expense categories.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| naam | TEXT | Category name (unique) |
| created_at | TIMESTAMPTZ | Creation timestamp |

## Hooks Architecture

New hooks following existing patterns (similar to `useTasks.ts`):

```
src/hooks/
├── useCompanySettings.ts   # Company settings CRUD
├── useCoFounders.ts        # Co-founders CRUD
├── useSalesPersons.ts      # Sales persons CRUD
├── useCustomers.ts         # Customers CRUD + pipeline logic
├── useLeads.ts             # Leads CRUD + restore to customer
├── useOneTimeIncome.ts     # One-time income CRUD
├── useOneTimeExpenses.ts   # One-time expenses CRUD
├── useMonthlyExpenses.ts   # Monthly expenses CRUD
├── useExpenseCategories.ts # Categories CRUD
└── useFinancialMetrics.ts  # Calculated KPIs, MRR, profit, etc.
```

### Hook Pattern

Each hook uses React Query for caching and Supabase for persistence:

```typescript
export function useCustomers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('klantnaam');
      if (error) throw error;
      return data;
    }
  });

  const addCustomer = useMutation({
    mutationFn: async (customer: Omit<Customer, 'id'>) => {
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });

  // ... updateCustomer, deleteCustomer, moveToLeads

  return {
    customers: query.data ?? [],
    isLoading: query.isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    moveToLeads
  };
}
```

### useFinancialMetrics Hook

Combines data from all hooks for calculations:

```typescript
export function useFinancialMetrics() {
  const { customers } = useCustomers();
  const { settings } = useCompanySettings();
  const { coFounders } = useCoFounders();
  const { monthlyExpenses } = useMonthlyExpenses();
  const { oneTimeIncome } = useOneTimeIncome();
  const { oneTimeExpenses } = useOneTimeExpenses();

  const getKlantenKPIs = useCallback(() => {
    // Calculate active customers, MRR, ARR, etc.
  }, [customers]);

  const getMaandMRR = useCallback(() => {
    // Calculate MRR per month
  }, [customers]);

  const getDashboardMetrics = useCallback(() => {
    // All dashboard metrics
  }, [customers, settings, monthlyExpenses, oneTimeIncome]);

  const getFounderVerdelingen = useCallback(() => {
    // Profit distribution per founder
  }, [coFounders, /* profit data */]);

  // ... other calculations

  return {
    getKlantenKPIs,
    getMaandMRR,
    getDashboardMetrics,
    getFounderVerdelingen,
    // ... etc
  };
}
```

## Migration Strategy

### Phase 1: Database Setup
1. Create Supabase migration file with all tables
2. Set up RLS policies (public read/write for now, team-based later)
3. Create storage bucket for any file attachments if needed

### Phase 2: Hooks Implementation
1. Create all 10 hooks with CRUD operations
2. Add React Query provider if not exists
3. Test each hook independently

### Phase 3: Context Replacement
1. Create new `FinancialDataProvider` that uses hooks
2. Replace `SpreadsheetContext` usage in components
3. Migrate calculation logic to `useFinancialMetrics`

### Phase 4: Data Migration
1. One-time migration script to move localStorage data to Supabase
2. Optional: keep localStorage as offline fallback

### Phase 5: Cleanup
1. Remove old `SpreadsheetContext.tsx`
2. Remove localStorage keys
3. Update any remaining references

## File Changes

### New Files
- `supabase/migrations/012_financial_data.sql`
- `src/hooks/useCompanySettings.ts`
- `src/hooks/useCoFounders.ts`
- `src/hooks/useSalesPersons.ts`
- `src/hooks/useCustomers.ts`
- `src/hooks/useLeads.ts`
- `src/hooks/useOneTimeIncome.ts`
- `src/hooks/useOneTimeExpenses.ts`
- `src/hooks/useMonthlyExpenses.ts`
- `src/hooks/useExpenseCategories.ts`
- `src/hooks/useFinancialMetrics.ts`

### Modified Files
- Components using `SpreadsheetContext` → use new hooks
- `src/app/spreadsheet/*` pages

### Deleted Files
- `src/contexts/SpreadsheetContext.tsx` (after migration complete)

## Testing

1. Unit tests for each hook
2. Integration test for data flow
3. Manual testing of all CRUD operations
4. Verify calculations match current localStorage version

## Rollback Plan

If issues arise:
1. SpreadsheetContext can be restored from git
2. localStorage data remains untouched during migration
3. Feature flag to switch between old/new implementation
