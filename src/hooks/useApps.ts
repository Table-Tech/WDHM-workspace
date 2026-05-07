'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { App, AppFormData } from '@/types/financial';

async function fetchApps(): Promise<App[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('apps')
    .select('*')
    .order('naam', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addAppDb(app: AppFormData): Promise<App> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('apps')
    .insert(app)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateAppDb({ id, ...updates }: Partial<App> & { id: string }): Promise<App> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('apps')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteAppDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useApps() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['apps'],
    queryFn: fetchApps,
  });

  const addApp = useMutation({
    mutationFn: addAppDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });

  const updateApp = useMutation({
    mutationFn: updateAppDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });

  const deleteApp = useMutation({
    mutationFn: deleteAppDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apps'] });
    },
  });

  return {
    apps: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addApp: addApp.mutate,
    addAppAsync: addApp.mutateAsync,
    updateApp: updateApp.mutate,
    updateAppAsync: updateApp.mutateAsync,
    deleteApp: deleteApp.mutate,
    deleteAppAsync: deleteApp.mutateAsync,
    isAdding: addApp.isPending,
    isUpdating: updateApp.isPending,
    isDeleting: deleteApp.isPending,
  };
}
