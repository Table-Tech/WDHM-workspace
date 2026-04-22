import { TaskBoard } from '@/components/taskboard';

// Force dynamic rendering since we need Supabase at runtime
export const dynamic = 'force-dynamic';

export default function Home() {
  return <TaskBoard />;
}
