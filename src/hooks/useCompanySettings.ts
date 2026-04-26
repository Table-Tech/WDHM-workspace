'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { CompanySettings, CompanySettingsFormData } from '@/types/financial';

async function fetchCompanySettings(): Promise<CompanySettings | null> {
  if (!hasValidCredentials) return null;

  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function updateCompanySettingsDb(settings: Partial<CompanySettingsFormData>): Promise<CompanySettings> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Get existing settings or create new
  const { data: existing } = await supabase
    .from('company_settings')
    .select('id')
    .limit(1)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from('company_settings')
      .update({ ...settings, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('company_settings')
      .insert(settings)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export function useCompanySettings() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['company-settings'],
    queryFn: fetchCompanySettings,
  });

  const updateSettings = useMutation({
    mutationFn: updateCompanySettingsDb,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateSettings: updateSettings.mutate,
    updateSettingsAsync: updateSettings.mutateAsync,
    isUpdating: updateSettings.isPending,
  };
}
