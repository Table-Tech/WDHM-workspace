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
