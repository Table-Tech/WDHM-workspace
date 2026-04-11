'use client';

import { getInitials, getContrastColor } from '@/lib/colors';

interface FriendAvatarProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
};

export function FriendAvatar({ name, color, size = 'md', className = '' }: FriendAvatarProps) {
  const initials = getInitials(name);
  const textColor = getContrastColor(color);

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center font-bold
        shadow-lg ring-2 ring-white/10
        transition-transform duration-200 hover:scale-105
        ${className}
      `}
      style={{ backgroundColor: color, color: textColor }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
