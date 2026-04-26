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
