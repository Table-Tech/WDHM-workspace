'use client';

import NextImage from 'next/image';
import { Plus, X } from 'lucide-react';
import { getGifById } from '@/lib/gifs';
import type { IncidentReaction } from '@/types';

interface ReactionDisplayProps {
  reactions: IncidentReaction[];
  onAddClick: () => void;
  onRemove?: (reactionId: string) => void;
  currentFriendId?: string;
  compact?: boolean;
}

export function ReactionDisplay({
  reactions,
  onAddClick,
  onRemove,
  currentFriendId,
  compact = false,
}: ReactionDisplayProps) {
  // Group reactions by gif_id and count occurrences
  const groupedReactions = reactions.reduce(
    (acc, reaction) => {
      const existing = acc.find((r) => r.gif_id === reaction.gif_id);
      if (existing) {
        existing.count += 1;
        existing.reactions.push(reaction);
      } else {
        acc.push({
          gif_id: reaction.gif_id,
          count: 1,
          reactions: [reaction],
        });
      }
      return acc;
    },
    [] as Array<{ gif_id: string; count: number; reactions: IncidentReaction[] }>
  );

  const sizeClass = compact ? 'h-10 w-10' : 'h-12 w-12';
  const badgeSizeClass = compact ? 'text-xs' : 'text-sm';
  const buttonSizeClass = compact ? 'h-10 w-10' : 'h-12 w-12';

  return (
    <div className="flex flex-wrap items-center gap-2">
      {groupedReactions.map((group) => {
        const gif = getGifById(group.gif_id);
        if (!gif) return null;

        // Check if current user can remove this reaction
        const canRemove =
          currentFriendId &&
          group.reactions.some((r) => r.friend_id === currentFriendId);

        return (
          <div
            key={group.gif_id}
            className="relative group"
          >
            <div className={`relative ${sizeClass} rounded-lg overflow-hidden bg-slate-800 ring-1 ring-slate-700 hover:ring-blue-500 transition-all`}>
              <NextImage
                src={gif.url}
                alt={gif.alt}
                fill
                unoptimized
                className="object-cover w-full h-full"
              />

              {/* Count badge */}
              {group.count > 1 && (
                <div className={`absolute bottom-0 right-0 bg-blue-600 text-white rounded-tl ${badgeSizeClass} font-semibold px-1.5 py-0.5 min-w-fit`}>
                  {group.count}
                </div>
              )}

              {/* Remove button on hover (only for own reactions) */}
              {canRemove && onRemove && (
                <button
                  type="button"
                  onClick={() => {
                    const ownReaction = group.reactions.find(
                      (r) => r.friend_id === currentFriendId
                    );
                    if (ownReaction) {
                      onRemove(ownReaction.id);
                    }
                  }}
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                  aria-label={`Remove reaction`}
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Add reaction button */}
      <button
        type="button"
        onClick={onAddClick}
        className={`${buttonSizeClass} rounded-lg bg-slate-800 hover:bg-slate-700 ring-1 ring-slate-700 hover:ring-blue-500 transition-all flex items-center justify-center text-slate-400 hover:text-white`}
        aria-label="Add reaction"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}
