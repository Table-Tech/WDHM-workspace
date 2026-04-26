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
