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
