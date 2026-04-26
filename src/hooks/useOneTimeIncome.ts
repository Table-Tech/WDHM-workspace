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
