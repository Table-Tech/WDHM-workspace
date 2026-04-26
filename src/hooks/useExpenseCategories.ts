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
