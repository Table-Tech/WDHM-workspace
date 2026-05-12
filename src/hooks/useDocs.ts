'use client';

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { DocItem, DocInsert, DocUpdate } from '@/types/docs';

const QUERY_KEY = ['docs'] as const;

async function fetchDocs(): Promise<DocItem[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('docs')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addDocDb(doc: DocInsert): Promise<DocItem> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('docs')
    .insert(doc)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateDocDb({ id, ...updates }: DocUpdate): Promise<DocItem> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('docs')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteDocDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // FK is ON DELETE CASCADE, so children disappear with the parent.
  const { error } = await supabase.from('docs').delete().eq('id', id);
  if (error) throw error;
}

export function useDocs() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchDocs,
  });

  useEffect(() => {
    if (!hasValidCredentials) return;

    const channel = supabase
      .channel('docs-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'docs' },
        () => {
          queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const addDoc = useMutation({
    mutationFn: addDocDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const updateDoc = useMutation({
    mutationFn: updateDocDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  const deleteDoc = useMutation({
    mutationFn: deleteDocDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });

  return {
    docs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addDoc: addDoc.mutate,
    addDocAsync: addDoc.mutateAsync,
    updateDoc: updateDoc.mutate,
    updateDocAsync: updateDoc.mutateAsync,
    deleteDoc: deleteDoc.mutate,
    deleteDocAsync: deleteDoc.mutateAsync,
    isAdding: addDoc.isPending,
    isUpdating: updateDoc.isPending,
    isDeleting: deleteDoc.isPending,
  };
}
