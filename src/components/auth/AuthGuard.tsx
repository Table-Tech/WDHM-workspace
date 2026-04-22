'use client';

import { useAuth } from '@/contexts/AuthContext';
import { PinScreen } from './PinScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Show PIN screen if not authenticated
  if (!isAuthenticated) {
    return <PinScreen />;
  }

  // Show the app content if authenticated
  return <>{children}</>;
}
