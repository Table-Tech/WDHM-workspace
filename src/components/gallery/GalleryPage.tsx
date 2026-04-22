'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import { ArrowLeft, Image as ImageIcon, Video, Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FriendAvatar } from '@/components/friends/FriendAvatar';
import { MilestoneIcon } from '@/components/shared/MilestoneIcon';
import { MilestoneGallery } from '@/components/gallery/MilestoneGallery';
import { useMilestoneGalleries } from '@/hooks/useIncidents';
import { useOnTimeIncidentsWithFriends } from '@/hooks/useOnTimeIncidents';
import type { FriendMilestoneGallery, ReachedMilestone, Friend, Milestone, Incident, OnTimeIncident } from '@/types';
import type { OnTimeIncidentWithFriend } from '@/hooks/useOnTimeIncidents';

export function GalleryPage() {
  const router = useRouter();
  const { data: galleries = [], isLoading } = useMilestoneGalleries();
  const { data: onTimeIncidents = [], isLoading: isLoadingOnTime } = useOnTimeIncidentsWithFriends();
  const [selectedSlideshow, setSelectedSlideshow] = useState<{
    friend: Friend;
    milestone: Milestone;
    incidents: Incident[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'late' | 'ontime'>('late');

  // Group on-time incidents by friend and filter those with media
  const onTimeByFriend = onTimeIncidents
    .filter((i) => i.photo_url || i.video_url)
    .reduce((acc, incident) => {
      const friendId = incident.friend.id;
      if (!acc[friendId]) {
        acc[friendId] = {
          friend: incident.friend,
          incidents: [],
        };
      }
      acc[friendId].incidents.push(incident);
      return acc;
    }, {} as Record<string, { friend: Friend; incidents: OnTimeIncidentWithFriend[] }>);

  const onTimeGalleries = Object.values(onTimeByFriend);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleOpenSlideshow = (
    friend: Friend,
    reached: ReachedMilestone
  ) => {
    if (reached.incidents.length > 0) {
      setSelectedSlideshow({
        friend,
        milestone: reached.milestone,
        incidents: reached.incidents,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Back button and title */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-10 w-10 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Diavoorstellingen</h1>
                <p className="text-xs text-muted-foreground">
                  Bekijk bewijzen per milestone
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setActiveTab('late')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'late'
                  ? 'bg-orange-600/80 text-white border border-orange-400'
                  : 'bg-zinc-900/90 text-white/70 border border-white/20 hover:bg-zinc-800/90'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              Te Laat ({galleries.length})
            </button>
            <button
              onClick={() => setActiveTab('ontime')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ontime'
                  ? 'bg-green-600/80 text-white border border-green-400'
                  : 'bg-zinc-900/90 text-white/70 border border-white/20 hover:bg-zinc-800/90'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Op Tijd ({onTimeGalleries.length})
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'late' ? (
          // Late incidents tab
          isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-[rgb(var(--theme-primary))] border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Laden...</p>
              </div>
            </div>
          ) : galleries.length === 0 ? (
            <EmptyState type="late" />
          ) : (
            <div className="space-y-8">
              {galleries.map((gallery) => (
                <FriendGallerySection
                  key={gallery.friend.id}
                  gallery={gallery}
                  onOpenSlideshow={handleOpenSlideshow}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )
        ) : (
          // On-time incidents tab
          isLoadingOnTime ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-green-500 border-t-transparent mx-auto mb-4" />
                <p className="text-muted-foreground">Laden...</p>
              </div>
            </div>
          ) : onTimeGalleries.length === 0 ? (
            <EmptyState type="ontime" />
          ) : (
            <div className="space-y-8">
              {onTimeGalleries.map(({ friend, incidents }) => (
                <OnTimeFriendSection
                  key={friend.id}
                  friend={friend}
                  incidents={incidents}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )
        )}
      </main>

      {/* Slideshow Modal */}
      {selectedSlideshow && (
        <MilestoneGallery
          friend={selectedSlideshow.friend}
          milestone={selectedSlideshow.milestone}
          incidents={selectedSlideshow.incidents}
          isOpen={true}
          onClose={() => setSelectedSlideshow(null)}
        />
      )}
    </div>
  );
}

function EmptyState({ type = 'late' }: { type?: 'late' | 'ontime' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className={`p-6 rounded-full backdrop-blur-md border mb-6 ${
        type === 'ontime'
          ? 'bg-green-900/40 border-green-500/30'
          : 'bg-zinc-900/80 border-white/20'
      }`}>
        {type === 'ontime' ? (
          <CheckCircle className="w-12 h-12 text-green-400" />
        ) : (
          <ImageIcon className="w-12 h-12 theme-text-light" />
        )}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        {type === 'ontime' ? 'Nog geen op-tijd foto\'s' : 'Nog geen diavoorstellingen'}
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {type === 'ontime'
          ? 'Als iemand op tijd is en er foto\'s worden toegevoegd, verschijnen die hier.'
          : 'Als iemand een milestone bereikt en er zijn foto\'s of video\'s toegevoegd, verschijnt hier een diavoorstelling.'
        }
      </p>
      <Link href="/">
        <Button className={`border-0 ${type === 'ontime' ? 'bg-green-600 hover:bg-green-500' : 'theme-gradient hover:opacity-90'}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Terug naar dashboard
        </Button>
      </Link>
    </div>
  );
}

interface FriendGallerySectionProps {
  gallery: FriendMilestoneGallery;
  onOpenSlideshow: (friend: Friend, reached: ReachedMilestone) => void;
  formatDate: (date: string) => string;
}

function FriendGallerySection({ gallery, onOpenSlideshow, formatDate }: FriendGallerySectionProps) {
  const { friend, totalIncidents, reachedMilestones } = gallery;

  return (
    <section className="bg-zinc-900/90 backdrop-blur-xl border border-white/15 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Friend Header */}
      <div className="flex items-center gap-3 mb-6">
        <FriendAvatar name={friend.name} color={friend.color} size="md" />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{friend.name}</h2>
          <p className="text-sm text-muted-foreground">
            {totalIncidents}x te laat - {reachedMilestones.length} milestone{reachedMilestones.length !== 1 ? 's' : ''} bereikt
          </p>
        </div>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reachedMilestones.map((reached) => (
          <MilestoneCard
            key={reached.milestone.count}
            reached={reached}
            onOpen={() => onOpenSlideshow(friend, reached)}
            formatDate={formatDate}
          />
        ))}
      </div>
    </section>
  );
}

interface MilestoneCardProps {
  reached: ReachedMilestone;
  onOpen: () => void;
  formatDate: (date: string) => string;
}

function MilestoneCard({ reached, onOpen, formatDate }: MilestoneCardProps) {
  const { milestone, incidents, reachedAt } = reached;
  const hasMedia = incidents.length > 0;
  const photoCount = incidents.filter((i) => i.photo_url).length;
  const videoCount = incidents.filter((i) => i.video_url).length;

  // Get first incident with photo for thumbnail
  const thumbnailIncident = incidents.find((i) => i.photo_url);

  return (
    <button
      onClick={onOpen}
      disabled={!hasMedia}
      className={`
        relative rounded-xl border text-left transition-all overflow-hidden backdrop-blur-md
        ${hasMedia
          ? 'bg-black/40 border-white/15 hover:border-[rgba(var(--theme-primary),0.5)] hover:bg-black/50 cursor-pointer'
          : 'bg-black/30 border-white/10 cursor-not-allowed opacity-60'
        }
      `}
    >
      {/* Thumbnail or placeholder */}
      <div className="relative h-32 bg-black/30">
        {thumbnailIncident?.photo_url ? (
          <>
            <NextImage
              src={thumbnailIncident.photo_url}
              alt={`Milestone ${milestone.count}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-white/30" />
          </div>
        )}

        {/* Play button overlay for slideshows with media */}
        {hasMedia && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="p-3 rounded-full shadow-lg bg-[rgba(var(--theme-primary-dark),0.9)]">
              <Play className="w-6 h-6 text-white fill-white" />
            </div>
          </div>
        )}

        {/* Media count badge */}
        {hasMedia && (
          <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/60 text-xs text-white">
            {photoCount > 0 && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {photoCount}
              </span>
            )}
            {videoCount > 0 && (
              <span className="flex items-center gap-1">
                <Video className="w-3 h-3" />
                {videoCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(var(--theme-primary),0.3)] border border-[rgba(var(--theme-primary),0.5)] text-[rgb(var(--theme-primary-light))]">
            <MilestoneIcon icon={milestone.emoji} size="sm" />
          </div>
          <span className="font-bold text-white">{milestone.count}x te laat</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {milestone.penalty}
        </p>
        {reachedAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Bereikt op {formatDate(reachedAt)}</span>
          </div>
        )}
        {!hasMedia && (
          <p className="text-xs text-muted-foreground/60 mt-2 italic">
            Geen foto&apos;s of video&apos;s
          </p>
        )}
      </div>
    </button>
  );
}

// On-time incidents section for a friend
interface OnTimeFriendSectionProps {
  friend: Friend;
  incidents: OnTimeIncidentWithFriend[];
  formatDate: (date: string) => string;
}

function OnTimeFriendSection({ friend, incidents, formatDate }: OnTimeFriendSectionProps) {
  return (
    <section className="bg-zinc-900/90 backdrop-blur-xl border border-green-500/30 rounded-2xl p-4 sm:p-6 shadow-xl">
      {/* Friend Header */}
      <div className="flex items-center gap-3 mb-6">
        <FriendAvatar name={friend.name} color={friend.color} size="md" />
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white truncate">{friend.name}</h2>
          <p className="text-sm text-green-400">
            {incidents.length} op-tijd moment{incidents.length !== 1 ? 'en' : ''} met foto
          </p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {incidents.map((incident) => (
          <OnTimePhotoCard
            key={incident.id}
            incident={incident}
            formatDate={formatDate}
          />
        ))}
      </div>
    </section>
  );
}

interface OnTimePhotoCardProps {
  incident: OnTimeIncidentWithFriend;
  formatDate: (date: string) => string;
}

function OnTimePhotoCard({ incident, formatDate }: OnTimePhotoCardProps) {
  const photoUrl = incident.photo_url?.split(',')[0]; // Get first photo if multiple
  const hasVideo = !!incident.video_url;

  return (
    <div className="relative rounded-xl overflow-hidden bg-black/40 border border-green-500/20 aspect-square group">
      {photoUrl ? (
        <NextImage
          src={photoUrl}
          alt="Op tijd bewijs"
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
        />
      ) : hasVideo ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
          <Video className="w-8 h-8 text-green-400" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-white/30" />
        </div>
      )}

      {/* Overlay with date */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="absolute bottom-2 left-2 right-2">
          <div className="flex items-center gap-1 text-xs text-white">
            <CheckCircle className="w-3 h-3 text-green-400" />
            <span className="truncate">{formatDate(incident.created_at)}</span>
          </div>
          {incident.location && (
            <p className="text-xs text-white/70 truncate mt-0.5">
              {incident.location}
            </p>
          )}
        </div>
      </div>

      {/* Green badge */}
      <div className="absolute top-2 right-2">
        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
          <CheckCircle className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}
