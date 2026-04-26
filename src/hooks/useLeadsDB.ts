'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Lead, LeadFormData, CustomerFormData } from '@/types/financial';

async function fetchLeads(): Promise<Lead[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function addLeadDb(lead: LeadFormData): Promise<Lead> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateLeadDb({ id, ...updates }: Partial<Lead> & { id: string }): Promise<Lead> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteLeadDb(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

async function restoreLeadToCustomerDb(leadId: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Fetch the lead first
  const { data: lead, error: fetchError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', leadId)
    .single();

  if (fetchError) throw fetchError;

  // Insert into customers
  const customerData: CustomerFormData = {
    klantnaam: lead.bedrijfsnaam,
    product_dienst: lead.product_interesse,
    mrr_per_maand: 0,
    eenmalig: 0,
    sales_persoon_id: null,
    status: 'Actief',
    maand_inkomsten: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    contactpersoon: lead.contactpersoon,
    email: lead.email,
    telefoon: lead.telefoon,
    notities: lead.notities,
    pipeline_fase: 'Lead',
    aantal_contacten: lead.aantal_contacten,
    laatste_contact: null,
    offerte_waarde: lead.offerte_waarde,
    verwachte_sluitdatum: null,
    datum_klant_geworden: new Date().toISOString().split('T')[0],
    datum_onderhoud_start: null,
    onderhoud_actief: false,
    eenmalig_termijnen: 1,
    eenmalig_startdatum: null,
  };

  const { error: insertError } = await supabase
    .from('customers')
    .insert(customerData);

  if (insertError) throw insertError;

  // Delete the lead
  const { error: deleteError } = await supabase
    .from('leads')
    .delete()
    .eq('id', leadId);

  if (deleteError) throw deleteError;
}

export function useLeadsDB() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['leads'],
    queryFn: fetchLeads,
  });

  const addLead = useMutation({
    mutationFn: addLeadDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const updateLead = useMutation({
    mutationFn: updateLeadDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const deleteLead = useMutation({
    mutationFn: deleteLeadDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });

  const restoreToCustomer = useMutation({
    mutationFn: restoreLeadToCustomerDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    leads: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addLead: addLead.mutate,
    addLeadAsync: addLead.mutateAsync,
    updateLead: updateLead.mutate,
    updateLeadAsync: updateLead.mutateAsync,
    deleteLead: deleteLead.mutate,
    deleteLeadAsync: deleteLead.mutateAsync,
    restoreToCustomer: restoreToCustomer.mutate,
    restoreToCustomerAsync: restoreToCustomer.mutateAsync,
    isAdding: addLead.isPending,
    isUpdating: updateLead.isPending,
    isDeleting: deleteLead.isPending,
    isRestoring: restoreToCustomer.isPending,
  };
}
