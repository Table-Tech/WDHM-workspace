'use client';

import {
  Beer,
  Pizza,
  Mic2,
  Shirt,
  Plane,
  Gift,
  Wallet,
  PersonStanding,
  Paintbrush,
  Smartphone,
  Gamepad2,
  UtensilsCrossed,
  Trophy,
  Star,
  Flame,
  Zap,
  Heart,
  Crown,
  type LucideIcon,
} from 'lucide-react';

// Icon name to Lucide icon component mapping
export const MILESTONE_ICONS: Record<string, LucideIcon> = {
  beer: Beer,
  pizza: Pizza,
  mic: Mic2,
  shirt: Shirt,
  plane: Plane,
  gift: Gift,
  wallet: Wallet,
  running: PersonStanding,
  cleaning: Paintbrush,
  phone: Smartphone,
  gaming: Gamepad2,
  cooking: UtensilsCrossed,
  trophy: Trophy,
  star: Star,
  flame: Flame,
  zap: Zap,
  heart: Heart,
  crown: Crown,
};

// Available icon options for the settings modal
export const ICON_OPTIONS = Object.keys(MILESTONE_ICONS);

// Default icon if the stored icon name is not found (e.g., old emoji values)
export const DEFAULT_ICON = 'gift';

interface MilestoneIconProps {
  icon: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

export function MilestoneIcon({ icon, size = 'md', className = '' }: MilestoneIconProps) {
  // Get the icon component, fallback to Gift if not found
  const IconComponent = MILESTONE_ICONS[icon.toLowerCase()] || MILESTONE_ICONS[DEFAULT_ICON];

  return (
    <IconComponent
      className={`${sizeClasses[size]} ${className}`}
      aria-hidden="true"
    />
  );
}

// Icon display names for the settings UI
export const ICON_DISPLAY_NAMES: Record<string, string> = {
  beer: 'Drankje',
  pizza: 'Eten',
  mic: 'Karaoke',
  shirt: 'Kleding',
  plane: 'Reizen',
  gift: 'Cadeau',
  wallet: 'Geld',
  running: 'Sport',
  cleaning: 'Schoonmaken',
  phone: 'Telefoon',
  gaming: 'Gaming',
  cooking: 'Koken',
  trophy: 'Trofee',
  star: 'Ster',
  flame: 'Vuur',
  zap: 'Bliksem',
  heart: 'Hart',
  crown: 'Kroon',
};
