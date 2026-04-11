'use client';

import { useState } from 'react';
import { User, Palette, Save, Trash2, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FriendAvatar } from './FriendAvatar';
import { AVATAR_COLORS } from '@/lib/colors';
import type { Friend } from '@/types';

interface EditFriendModalProps {
  friend: Friend | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { id: string; name: string; color: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
}

export function EditFriendModal({
  friend,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: EditFriendModalProps) {
  // Initialize state from friend prop - use friend values as initial state
  const [name, setName] = useState(friend?.name || '');
  const [color, setColor] = useState(friend?.color || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [lastFriendId, setLastFriendId] = useState<string | null>(null);

  // Reset form when a different friend is selected (not on every render)
  if (friend && friend.id !== lastFriendId) {
    setLastFriendId(friend.id);
    setName(friend.name);
    setColor(friend.color);
    setShowDeleteConfirm(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friend || !name.trim()) return;

    await onSave({
      id: friend.id,
      name: name.trim(),
      color,
    });
  };

  const handleDelete = async () => {
    if (!friend) return;
    await onDelete(friend.id);
  };

  const handleClose = () => {
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!friend) return null;

  const isProcessing = isSaving || isDeleting;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-strong w-[95vw] max-w-md border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <FriendAvatar name={name || friend.name} color={color} size="sm" className="sm:hidden flex-shrink-0" />
            <FriendAvatar name={name || friend.name} color={color} size="md" className="hidden sm:flex flex-shrink-0" />
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl text-white">Vriend bewerken</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                Pas naam of kleur aan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {showDeleteConfirm ? (
          // Delete confirmation
          <div className="space-y-3 sm:space-y-4">
            <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-red-500/10 border border-red-500/30">
              <div className="flex items-start gap-2 sm:gap-3">
                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-300 text-sm sm:text-base">Vriend verwijderen?</h3>
                  <p className="text-xs sm:text-sm text-red-300/70 mt-1">
                    Alle incidenten van {friend.name} worden ook verwijderd.
                    Dit kan niet ongedaan worden gemaakt.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 border-white/10 hover:bg-white/5 h-9 sm:h-10 text-sm"
                disabled={isProcessing}
              >
                Annuleren
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isProcessing}
                className="flex-1 bg-red-600 hover:bg-red-500 border-0 h-9 sm:h-10 text-sm"
              >
                {isDeleting ? 'Verwijderen...' : 'Ja, verwijderen'}
              </Button>
            </div>
          </div>
        ) : (
          // Edit form
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Name Input */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="edit-name" className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                Naam
              </Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Naam van je vriend"
                className="bg-white/5 border-white/10 focus:border-violet-500/50 h-9 sm:h-11 text-sm"
                autoComplete="off"
                disabled={isProcessing}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label className="text-xs sm:text-sm text-white/70 flex items-center gap-1.5 sm:gap-2">
                <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                Avatar kleur
              </Label>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {AVATAR_COLORS.map((avatarColor) => (
                  <button
                    key={avatarColor}
                    type="button"
                    onClick={() => setColor(avatarColor)}
                    disabled={isProcessing}
                    className={`
                      w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-all
                      ${
                        color === avatarColor
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110'
                          : 'hover:scale-105'
                      }
                    `}
                    style={{ backgroundColor: avatarColor }}
                    aria-label={`Kies kleur ${avatarColor}`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowDeleteConfirm(true)}
                className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-9 sm:h-10 w-9 sm:w-10 p-0"
                disabled={isProcessing}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 border-white/10 hover:bg-white/5 h-9 sm:h-10 text-sm"
                disabled={isProcessing}
              >
                Annuleren
              </Button>
              <Button
                type="submit"
                disabled={!name.trim() || isProcessing}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border-0 gap-1.5 sm:gap-2 h-9 sm:h-10 text-sm"
              >
                {isSaving ? (
                  'Opslaan...'
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Opslaan
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
