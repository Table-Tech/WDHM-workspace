'use client';

import { useState } from 'react';
import NextImage from 'next/image';
import { MapPin, Clock, Camera, Video, Settings, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FriendAvatar } from './FriendAvatar';
import { ProgressBar } from './ProgressBar';
import type { FriendWithStats } from '@/types';

interface FriendCardProps {
  friend: FriendWithStats;
  onMarkLate: (friendId: string) => void;
  onEdit?: (friendId: string) => void;
  onViewGallery?: (friendId: string) => void;
  isAnimating?: boolean;
}

export function FriendCard({
  friend,
  onMarkLate,
  onEdit,
  onViewGallery,
  isAnimating = false,
}: FriendCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Check if friend has media in their incidents
  const hasMedia = friend.last_incident?.photo_url || friend.last_incident?.video_url;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <article
      className={`
        glass-card rounded-xl sm:rounded-2xl p-3 sm:p-5
        transition-all duration-300 ease-out
        hover:bg-white/6 hover:border-white/15
        ${isAnimating ? 'animate-glow-pulse' : ''}
        ${friend.progress_percentage >= 80 ? 'border-red-500/30' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`${friend.name}: ${friend.incident_count} keer te laat`}
    >
      {/* Header: Avatar, Name, Badge */}
      <div className="flex items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Smaller avatar on mobile */}
          <FriendAvatar name={friend.name} color={friend.color} size="sm" className="sm:hidden shrink-0" />
          <FriendAvatar name={friend.name} color={friend.color} size="md" className="hidden sm:flex shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-base sm:text-lg text-white truncate">{friend.name}</h3>
          </div>
        </div>

        {/* Count Badge and Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(friend.id)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors text-white/50 hover:text-white"
              aria-label={`${friend.name} bewerken`}
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <Badge
            variant="secondary"
            className={`
              text-sm sm:text-lg font-bold px-2 sm:px-3 py-1 sm:py-1.5
              border theme-border-light
              ${isAnimating ? 'animate-bounce-scale' : ''}
            `}
            style={{
              background: `linear-gradient(to right, rgba(var(--theme-primary-dark), 0.2), rgba(var(--theme-primary), 0.2))`,
              color: `rgb(var(--theme-primary-light))`,
            }}
          >
            {friend.incident_count}x
          </Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <ProgressBar
        percentage={friend.progress_percentage}
        remaining={friend.incidents_until_next}
        nextMilestoneCount={friend.next_milestone?.count}
        nextMilestoneEmoji={friend.next_milestone?.emoji}
        className="mb-3 sm:mb-4"
      />

      {/* Last Incident Info */}
      {friend.last_incident && (
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/3 border border-white/5">
          {/* Media thumbnail */}
          {(friend.last_incident.photo_url || friend.last_incident.video_url) && (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 bg-white/5 relative">
              {friend.last_incident.video_url ? (
                <>
                  <div className="w-full h-full flex items-center justify-center bg-[rgba(var(--theme-primary),0.2)]">
                    <Video className="w-4 h-4 sm:w-5 sm:h-5 theme-text-light" />
                  </div>
                </>
              ) : (
                <NextImage
                  src={friend.last_incident.photo_url!}
                  alt={`Laatste incident van ${friend.name}`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              )}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{formatDate(friend.last_incident.created_at)}</span>
            </div>
            {friend.last_incident.location && (
              <div className="flex items-center gap-1.5 sm:gap-2 text-xs text-muted-foreground mt-0.5 sm:mt-1">
                <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{friend.last_incident.location}</span>
              </div>
            )}
          </div>

          {hasMedia && onViewGallery ? (
            <button
              onClick={() => onViewGallery(friend.id)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-white/10 transition-colors theme-text-light shrink-0"
              aria-label={`Bekijk alle bewijzen van ${friend.name}`}
            >
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
            </button>
          ) : !hasMedia ? (
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-white/20 shrink-0" aria-hidden="true" />
          ) : null}
        </div>
      )}

      {/* Action Button */}
      <Button
        onClick={() => onMarkLate(friend.id)}
        className={`
          w-full h-10 sm:h-12 text-sm sm:text-base font-semibold
          bg-linear-to-r from-red-600 to-orange-600
          hover:from-red-500 hover:to-orange-500
          border-0 shadow-lg shadow-red-900/30
          transition-all duration-200
          ${isHovered ? 'shadow-red-600/40 scale-[1.02]' : ''}
        `}
        aria-label={`Markeer ${friend.name} als te laat`}
      >
        Te Laat!
      </Button>
    </article>
  );
}
