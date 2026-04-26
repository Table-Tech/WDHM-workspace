'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Customer, CustomerFormData, LeadFormData } from '@/types/financial';

async function fetchCustomers(): Promise<Customer[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('klantnaam', { ascending: true });

  if (error) throw error;
  return data || [];
}

async function addCustomerDb(customer: CustomerFormData): Promise<Customer> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateCustomerDb({ id, ...updates }: Partial<Customer> & { id: string }): Promise<Customer> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('customers')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteCustomerDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function moveCustomerToLeadsDb({ customerId, redenAfwijzing }: { customerId: string; redenAfwijzing: string }): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Fetch the customer first
  const { data: customer, error: fetchError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (fetchError) throw fetchError;

  // Insert into leads
  const leadData: LeadFormData = {
    bedrijfsnaam: customer.klantnaam,
    contactpersoon: customer.contactpersoon,
    email: customer.email,
    telefoon: customer.telefoon,
    product_interesse: customer.product_dienst,
    bron: '',
    reden_afwijzing: redenAfwijzing,
    notities: customer.notities,
    datum_eerste_contact: customer.datum_klant_geworden,
    datum_afgewezen: new Date().toISOString().split('T')[0],
    offerte_waarde: customer.offerte_waarde,
    aantal_contacten: customer.aantal_contacten,
  };

  const { error: insertError } = await supabase
    .from('leads')
    .insert(leadData);

  if (insertError) throw insertError;

  // Delete the customer
  const { error: deleteError } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId);

  if (deleteError) throw deleteError;
}

export function useCustomers() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['customers'],
    queryFn: fetchCustomers,
  });

  const addCustomer = useMutation({
    mutationFn: addCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: updateCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const deleteCustomer = useMutation({
    mutationFn: deleteCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const moveToLeads = useMutation({
    mutationFn: moveCustomerToLeadsDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  return {
    customers: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addCustomer: addCustomer.mutate,
    addCustomerAsync: addCustomer.mutateAsync,
    updateCustomer: updateCustomer.mutate,
    updateCustomerAsync: updateCustomer.mutateAsync,
    deleteCustomer: deleteCustomer.mutate,
    deleteCustomerAsync: deleteCustomer.mutateAsync,
    moveToLeads: moveToLeads.mutate,
    moveToLeadsAsync: moveToLeads.mutateAsync,
    isAdding: addCustomer.isPending,
    isUpdating: updateCustomer.isPending,
    isDeleting: deleteCustomer.isPending,
    isMovingToLeads: moveToLeads.isPending,
  };
}
