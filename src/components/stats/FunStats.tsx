'use client';

import { StatCard } from './StatCard';
import { useFunStats } from '@/hooks/useStats';

export function FunStats() {
  const { data: stats = [], isLoading } = useFunStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-24 bg-black/40 backdrop-blur-md border border-white/15 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="text-center py-8 text-white/50">
        Nog geen statistieken beschikbaar
      </div>
    );
  }

  const colors: Array<'purple' | 'orange' | 'green' | 'blue'> = ['purple', 'orange', 'green', 'blue'];

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          color={colors[index % colors.length]}
        />
      ))}
    </div>
  );
}
