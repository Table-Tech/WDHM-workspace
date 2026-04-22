'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { UserPlus, Clock, Zap, Settings, Image as ImageIcon, Award, MapPin, BarChart3, Gamepad2, Crown, Heart, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FriendCard } from '@/components/friends/FriendCard';
import { AddFriendModal } from '@/components/friends/AddFriendModal';
import { EditFriendModal } from '@/components/friends/EditFriendModal';
import { IncidentModal } from '@/components/incidents/IncidentModal';
import { OnTimeModal } from '@/components/incidents/OnTimeModal';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { MilestoneBanner } from '@/components/shared/MilestoneBanner';
import { MilestoneGallery } from '@/components/gallery/MilestoneGallery';
import { SettingsModal } from '@/components/settings/SettingsModal';
import { InviteButton } from '@/components/invite/InviteButton';
import { BadgeNotification } from '@/components/badges';
import { useFriendsWithStats, useAddFriend, useUpdateFriend, useDeleteFriend } from '@/hooks/useFriends';
import { useCreateIncident, useDeleteIncident } from '@/hooks/useIncidents';
import { useCreateOnTimeIncident } from '@/hooks/useOnTimeIncidents';
import { useUndoOnTime } from '@/hooks/useStreaks';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { useMilestones } from '@/hooks/useMilestones';
import type { Friend, IncidentFormData, OnTimeFormData, MilestoneReachedEvent, FriendBadge } from '@/types';

export function Dashboard() {
  // State
  const [isAddFriendOpen, setIsAddFriendOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isOnTimeModalOpen, setIsOnTimeModalOpen] = useState(false);
  const [onTimeFriend, setOnTimeFriend] = useState<Friend | null>(null);
  const [milestoneEvent, setMilestoneEvent] = useState<MilestoneReachedEvent | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryEvent, setGalleryEvent] = useState<MilestoneReachedEvent | null>(null);
  const [animatingFriendId, setAnimatingFriendId] = useState<string | null>(null);
  // Edit friend modal state
  const [editingFriend, setEditingFriend] = useState<Friend | null>(null);
  const [isEditFriendOpen, setIsEditFriendOpen] = useState(false);
  // Badge notification state
  const [earnedBadges, setEarnedBadges] = useState<FriendBadge[]>([]);
  const [badgeFriendName, setBadgeFriendName] = useState<string>('');

  // Data hooks
  const { data: friends = [], isLoading, error } = useFriendsWithStats();
  const { data: milestones = [] } = useMilestones();
  const addFriendMutation = useAddFriend();
  const updateFriendMutation = useUpdateFriend();
  const deleteFriendMutation = useDeleteFriend();
  const createIncidentMutation = useCreateIncident();
  const deleteIncidentMutation = useDeleteIncident();
  const createOnTimeIncidentMutation = useCreateOnTimeIncident();
  const undoOnTimeMutation = useUndoOnTime();

  // Realtime sync with milestone callback
  const handleMilestoneReached = useCallback((event: MilestoneReachedEvent) => {
    setMilestoneEvent(event);
    setGalleryEvent(event); // Store for gallery
    setAnimatingFriendId(event.friend.id);
    setTimeout(() => setAnimatingFriendId(null), 1000);
  }, []);

  useRealtimeSync({ onMilestoneReached: handleMilestoneReached });

  // Handler for opening gallery from milestone banner
  const handleViewGallery = useCallback(() => {
    setMilestoneEvent(null);
    setIsGalleryOpen(true);
  }, []);

  // Handler for editing a friend
  const handleEditFriend = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      setEditingFriend(friend);
      setIsEditFriendOpen(true);
    }
  };

  // Handler for saving friend edits
  const handleSaveFriend = async (data: { id: string; name: string; color: string }) => {
    await updateFriendMutation.mutateAsync(data);
    setIsEditFriendOpen(false);
    setEditingFriend(null);
  };

  // Handler for deleting a friend
  const handleDeleteFriend = async (id: string) => {
    await deleteFriendMutation.mutateAsync(id);
    setIsEditFriendOpen(false);
    setEditingFriend(null);
  };

  // Handlers
  const handleMarkLate = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      setSelectedFriend(friend);
      setIsIncidentModalOpen(true);
    }
  };

  const handleAddFriend = async (name: string) => {
    await addFriendMutation.mutateAsync(name);
    setIsAddFriendOpen(false);
  };

  const handleCreateIncident = async (data: IncidentFormData) => {
    const result = await createIncidentMutation.mutateAsync(data);
    setIsIncidentModalOpen(false);

    // Show badge notifications if any were earned
    if (result.newBadges.length > 0) {
      setBadgeFriendName(selectedFriend?.name || '');
      setEarnedBadges(result.newBadges);
    }

    setSelectedFriend(null);

    // Trigger animation
    setAnimatingFriendId(data.friend_id);
    setTimeout(() => setAnimatingFriendId(null), 1000);
  };

  // Handler for opening on-time modal
  const handleMarkOnTime = (friendId: string) => {
    const friend = friends.find((f) => f.id === friendId);
    if (friend) {
      setOnTimeFriend(friend);
      setIsOnTimeModalOpen(true);
    }
  };

  // Handler for creating on-time incident with photo
  const handleCreateOnTimeIncident = async (data: OnTimeFormData) => {
    const result = await createOnTimeIncidentMutation.mutateAsync(data);
    setIsOnTimeModalOpen(false);

    // Show badge notifications if any were earned
    if (result.newBadges.length > 0) {
      setBadgeFriendName(onTimeFriend?.name || '');
      setEarnedBadges(result.newBadges);
    }

    setOnTimeFriend(null);

    // Trigger animation
    setAnimatingFriendId(data.friend_id);
    setTimeout(() => setAnimatingFriendId(null), 1000);
  };

  // Handler for undoing an on-time mark (in case of accidental click)
  const handleUndoOnTime = async (friendId: string) => {
    await undoOnTimeMutation.mutateAsync(friendId);
  };

  const handleDeleteLastIncident = async (incidentId: string, friendName: string) => {
    if (!confirm(`Laatste te-laat melding van ${friendName} verwijderen?`)) {
      return;
    }

    await deleteIncidentMutation.mutateAsync(incidentId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-[rgb(var(--theme-primary))] border-t-transparent animate-spin mx-auto" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="p-4 rounded-full bg-red-500/10 w-fit mx-auto">
            <Zap className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Verbinding mislukt</h2>
          <p className="text-muted-foreground">
            Kan geen verbinding maken met de database. Controleer of Supabase correct is
            geconfigureerd.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Badge Notification */}
      <BadgeNotification
        badges={earnedBadges}
        friendName={badgeFriendName}
        onDismiss={() => {
          setEarnedBadges([]);
          setBadgeFriendName('');
        }}
      />

      {/* Milestone Banner */}
      <MilestoneBanner
        event={milestoneEvent}
        onDismiss={() => setMilestoneEvent(null)}
        onViewGallery={handleViewGallery}
      />

      {/* Milestone Gallery */}
      {galleryEvent && (
        <MilestoneGallery
          friend={galleryEvent.friend}
          milestone={galleryEvent.milestone}
          incidents={galleryEvent.incidents}
          isOpen={isGalleryOpen}
          onClose={() => {
            setIsGalleryOpen(false);
            setGalleryEvent(null);
          }}
        />
      )}

      {/* Main Layout */}
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <Link href="/" className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 transition-all">
                  <LayoutGrid className="w-6 h-6 text-purple-400" aria-hidden="true" />
                </Link>
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/logo.jpeg"
                    alt="LateTable Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Te Laat Tracker</h1>
                  <p className="text-xs text-muted-foreground">
                    {friends.length} vrienden
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {/* Desktop Navigation - Hidden on mobile (shown in bottom nav) */}
                <div className="hidden md:flex items-center gap-1.5">
                  {/* Gallery Button */}
                  <Link href="/gallery">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                      aria-label="Diavoorstellingen bekijken"
                    >
                      <ImageIcon className="w-5 h-5 text-blue-400" />
                    </Button>
                  </Link>

                  {/* Badges Button */}
                  <Link href="/badges">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                      aria-label="Badges bekijken"
                    >
                      <Award className="w-5 h-5 text-yellow-400" />
                    </Button>
                  </Link>

                  {/* Map Button */}
                  <Link href="/map">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                      aria-label="Kaart bekijken"
                    >
                      <MapPin className="w-5 h-5 text-green-400" />
                    </Button>
                  </Link>

                  {/* Stats Button */}
                  <Link href="/stats">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                      aria-label="Statistieken bekijken"
                    >
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </Button>
                  </Link>

                  {/* Games Button */}
                  <Link href="/games">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                      aria-label="Games spelen"
                    >
                      <Gamepad2 className="w-5 h-5 text-pink-400" />
                    </Button>
                  </Link>

                  {/* Hall of Fame Button */}
                  <Link href="/hall-of-fame">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                      aria-label="Hall of Fame bekijken"
                    >
                      <Crown className="w-5 h-5 text-yellow-400" />
                    </Button>
                  </Link>

                  {/* Memories Button */}
                  <Link href="/memories">
                    <Button
                      variant="ghost"
                      className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                      aria-label="Herinneringen bekijken"
                    >
                      <Heart className="w-5 h-5 text-pink-400" />
                    </Button>
                  </Link>
                </div>

                {/* Invite Button - Hidden on mobile */}
                <div className="hidden md:block">
                  <InviteButton variant="icon" />
                </div>

                {/* Settings Button */}
                <Button
                  variant="ghost"
                  onClick={() => setIsSettingsOpen(true)}
                  className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                  aria-label="Instellingen openen"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </Button>

                {/* Add Friend Button */}
                <Button
                  onClick={() => setIsAddFriendOpen(true)}
                  className="theme-gradient hover:opacity-90 border-0 shadow-[0_10px_15px_-3px_rgba(var(--theme-primary),0.25)] h-9 sm:h-10 px-3 sm:px-4"
                >
                  <UserPlus className="w-4 h-4 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Vriend</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {friends.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-6 rounded-full bg-white/5 mb-6">
                <UserPlus className="w-12 h-12 theme-text-light" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Geen vrienden nog
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Voeg je eerste vriend toe om te beginnen met het bijhouden van wie er
                te laat komt!
              </p>
              <Button
                onClick={() => setIsAddFriendOpen(true)}
                size="lg"
                className="theme-gradient hover:opacity-90 border-0"
              >
                <UserPlus className="w-5 h-5 mr-2" aria-hidden="true" />
                Eerste vriend toevoegen
              </Button>
            </div>
          ) : (
            // Two column layout
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Friends List */}
              <section
                className="lg:col-span-2 space-y-4"
                aria-labelledby="friends-heading"
              >
                <h2 id="friends-heading" className="sr-only">
                  Vrienden
                </h2>
                {friends.map((friend) => (
                  <FriendCard
                    key={friend.id}
                    friend={friend}
                    onMarkLate={handleMarkLate}
                    onMarkOnTime={handleMarkOnTime}
                    onUndoOnTime={handleUndoOnTime}
                    onEdit={handleEditFriend}
                    onDeleteLastIncident={handleDeleteLastIncident}
                    isAnimating={animatingFriendId === friend.id}
                  />
                ))}
              </section>

              {/* Sidebar - Leaderboard */}
              <section className="lg:col-span-1">
                <Leaderboard friends={friends} milestones={milestones} />
              </section>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-muted-foreground">
              LateTable Hou je vrienden scherp!
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <AddFriendModal
        isOpen={isAddFriendOpen}
        onClose={() => setIsAddFriendOpen(false)}
        onSubmit={handleAddFriend}
        isSubmitting={addFriendMutation.isPending}
      />

      <IncidentModal
        friend={selectedFriend}
        isOpen={isIncidentModalOpen}
        onClose={() => {
          setIsIncidentModalOpen(false);
          setSelectedFriend(null);
        }}
        onSubmit={handleCreateIncident}
        isSubmitting={createIncidentMutation.isPending}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <EditFriendModal
        friend={editingFriend}
        isOpen={isEditFriendOpen}
        onClose={() => {
          setIsEditFriendOpen(false);
          setEditingFriend(null);
        }}
        onSave={handleSaveFriend}
        onDelete={handleDeleteFriend}
        isSaving={updateFriendMutation.isPending}
        isDeleting={deleteFriendMutation.isPending}
      />

      <OnTimeModal
        friend={onTimeFriend}
        isOpen={isOnTimeModalOpen}
        onClose={() => {
          setIsOnTimeModalOpen(false);
          setOnTimeFriend(null);
        }}
        onSubmit={handleCreateOnTimeIncident}
        isSubmitting={createOnTimeIncidentMutation.isPending}
      />
    </>
  );
}
