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
