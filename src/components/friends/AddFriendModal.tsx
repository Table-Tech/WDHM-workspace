'use client';

import { useState } from 'react';
import { UserPlus } from 'lucide-react';
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

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  isSubmitting?: boolean;
}

export function AddFriendModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}: AddFriendModalProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Vul een naam in');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Naam moet minimaal 2 karakters zijn');
      return;
    }

    await onSubmit(trimmedName);
    setName('');
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass-strong w-[95vw] max-w-sm border-white/10 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex-shrink-0">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl text-white">
                Nieuwe vriend toevoegen
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                Voeg een vriend toe aan de groep
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-3 sm:mt-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="friend-name" className="text-xs sm:text-sm text-white/70">
              Naam
            </Label>
            <Input
              id="friend-name"
              placeholder="Bijv. Jan de Vries"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="bg-white/5 border-white/10 focus:border-violet-500/50 placeholder:text-white/30 h-9 sm:h-10 text-sm"
              autoFocus
              aria-describedby={error ? 'name-error' : undefined}
            />
            {error && (
              <p id="name-error" className="text-xs text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-white/10 hover:bg-white/5 h-9 sm:h-10 text-sm"
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 border-0 h-9 sm:h-10 text-sm"
            >
              {isSubmitting ? 'Bezig...' : 'Toevoegen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
