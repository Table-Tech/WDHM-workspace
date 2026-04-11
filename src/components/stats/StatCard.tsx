'use client';

import { createElement } from 'react';
import { Clock, AlertCircle, Calendar, Camera, Trophy, MapPin, MessageCircleOff, Info, type LucideIcon } from 'lucide-react';

// Map of icon names to components
const iconMap: Record<string, LucideIcon> = {
  clock: Clock,
  'alert-circle': AlertCircle,
  calendar: Calendar,
  camera: Camera,
  trophy: Trophy,
  'map-pin': MapPin,
  'message-circle-off': MessageCircleOff,
  info: Info,
};

function getIconComponent(iconName: string): LucideIcon {
  return iconMap[iconName.toLowerCase()] || Info;
}

// Render icon using createElement to avoid "component created during render" warning
function renderStatIcon(iconName: string, className: string) {
  const IconComponent = getIconComponent(iconName);
  return createElement(IconComponent, { className });
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  description?: string;
  color?: 'default' | 'purple' | 'orange' | 'green' | 'blue';
}

export function StatCard({
  label,
  value,
  icon,
  description,
  color = 'default',
}: StatCardProps) {
  const colorClasses = {
    default: 'bg-white/5 border-white/10',
    purple: 'bg-purple-500/10 border-purple-500/30',
    orange: 'bg-orange-500/10 border-orange-500/30',
    green: 'bg-green-500/10 border-green-500/30',
    blue: 'bg-blue-500/10 border-blue-500/30',
  };

  const iconColors = {
    default: 'text-white/50',
    purple: 'text-purple-400',
    orange: 'text-orange-400',
    green: 'text-green-400',
    blue: 'text-blue-400',
  };

  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg bg-white/5 ${iconColors[color]}`}>
          {renderStatIcon(icon, "w-5 h-5")}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-white/50">{label}</p>
          <p className="text-xl font-bold text-white mt-0.5">{value}</p>
          {description && (
            <p className="text-xs text-white/40 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
