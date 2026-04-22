import { Dashboard } from '@/components/dashboard/Dashboard';

// Force dynamic rendering since we need Supabase at runtime
export const dynamic = 'force-dynamic';

export default function TeLaatPage() {
  return <Dashboard />;
}
