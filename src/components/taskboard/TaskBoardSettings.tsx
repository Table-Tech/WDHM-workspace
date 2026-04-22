'use client';

import { useState, useRef } from 'react';
import { Settings, X, Palette, Check, Link2, Trash2, Plus, ExternalLink, ImagePlus } from 'lucide-react';
import Image from 'next/image';
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
import { useTheme } from '@/contexts/ThemeContext';

interface TaskBoardSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_SWATCH_CLASSES: Record<string, string> = {
  purple: 'bg-violet-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  cyan: 'bg-cyan-500',
  yellow: 'bg-yellow-500',
};

// Quick links stored in localStorage
export interface QuickLink {
  id: string;
  name: string;
  url: string;
  color: string;
  image?: string; // Base64 encoded image or URL
}

const DEFAULT_COLORS = [
  '#175DDC', // Bitwarden blue
  '#1e3a5f', // Strato dark blue
  '#000000', // Vercel black
  '#50b6f5', // Moneybird light blue
  '#7c3aed', // Purple
  '#217346', // Excel green
  '#ef4444', // Red
  '#f59e0b', // Amber
];

export function TaskBoardSettings({ isOpen, onClose }: TaskBoardSettingsProps) {
  const { themeId, setThemeId, themes } = useTheme();
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskboard-quicklinks');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });
  const [showAddLink, setShowAddLink] = useState(false);
  const [newLink, setNewLink] = useState({ name: '', url: '', color: DEFAULT_COLORS[0], image: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 500KB for localStorage)
    if (file.size > 500 * 1024) {
      alert('Afbeelding is te groot. Max 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewLink({ ...newLink, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setNewLink({ ...newLink, image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveQuickLinks = (links: QuickLink[]) => {
    setQuickLinks(links);
    if (typeof window !== 'undefined') {
      localStorage.setItem('taskboard-quicklinks', JSON.stringify(links));
    }
  };

  const handleAddLink = () => {
    if (!newLink.name.trim() || !newLink.url.trim()) return;

    const link: QuickLink = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      name: newLink.name.trim(),
      url: newLink.url.trim().startsWith('http') ? newLink.url.trim() : `https://${newLink.url.trim()}`,
      color: newLink.color,
      image: newLink.image || undefined,
    };

    saveQuickLinks([...quickLinks, link]);
    setNewLink({ name: '', url: '', color: DEFAULT_COLORS[0], image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowAddLink(false);
  };

  const handleDeleteLink = (id: string) => {
    saveQuickLinks(quickLinks.filter(link => link.id !== id));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[min(500px,calc(100vw-1rem))] border border-zinc-700 bg-zinc-900 max-h-[85dvh] overflow-hidden p-0 rounded-2xl shadow-2xl"
        showCloseButton={false}
      >
        <div className="flex h-full max-h-[85dvh] flex-col">
          {/* Header */}
          <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 border-b border-zinc-700 bg-zinc-800">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-xl text-white">Takenbord Instellingen</DialogTitle>
                  <DialogDescription className="text-zinc-400 text-sm">
                    Personaliseer je takenbord
                  </DialogDescription>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="h-8 w-8 hover:bg-zinc-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Theme Picker */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold text-zinc-300">Kleurthema</h3>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setThemeId(theme.id)}
                    className={`relative w-full aspect-square rounded-xl transition-all duration-200 hover:scale-105 ${THEME_SWATCH_CLASSES[theme.id] || 'bg-zinc-500'} ${themeId === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900' : ''}`}
                    title={theme.name}
                  >
                    {themeId === theme.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-zinc-700" />

            {/* Custom Quick Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-zinc-400" />
                  <h3 className="text-sm font-semibold text-zinc-300">Extra Snelkoppelingen</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowAddLink(true)}
                  className="h-8 text-xs border-zinc-600 hover:bg-zinc-800"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Toevoegen
                </Button>
              </div>

              <p className="text-xs text-zinc-500">
                Voeg je eigen links toe aan het snelkoppelingen menu.
              </p>

              {/* Add Link Form */}
              {showAddLink && (
                <div className="p-4 rounded-xl bg-zinc-800 border border-zinc-700 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-zinc-400">Naam</Label>
                      <Input
                        value={newLink.name}
                        onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                        placeholder="Mijn Link"
                        className="bg-zinc-900 border-zinc-600 h-9 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-zinc-400">URL</Label>
                      <Input
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder="https://..."
                        className="bg-zinc-900 border-zinc-600 h-9 text-sm"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <Label className="text-xs text-zinc-400">Afbeelding (optioneel)</Label>
                    <div className="flex items-center gap-3 mt-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {newLink.image ? (
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-zinc-600">
                          <Image
                            src={newLink.image}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                          <button
                            type="button"
                            onClick={removeImage}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-12 h-12 rounded-lg border-2 border-dashed border-zinc-600 hover:border-zinc-500 flex items-center justify-center transition-colors"
                        >
                          <ImagePlus className="w-5 h-5 text-zinc-500" />
                        </button>
                      )}
                      <p className="text-xs text-zinc-500 flex-1">
                        Upload een logo (max 500KB). Zonder afbeelding wordt de kleur gebruikt.
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-zinc-400">Kleur (fallback)</Label>
                    <div className="flex gap-2 mt-1">
                      {DEFAULT_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewLink({ ...newLink, color })}
                          className={`w-8 h-8 rounded-lg transition-all ${newLink.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-800' : ''}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowAddLink(false)}
                      className="flex-1 border-zinc-600 hover:bg-zinc-700 h-9"
                    >
                      Annuleren
                    </Button>
                    <Button
                      onClick={handleAddLink}
                      disabled={!newLink.name.trim() || !newLink.url.trim()}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 h-9"
                    >
                      Toevoegen
                    </Button>
                  </div>
                </div>
              )}

              {/* Existing Custom Links */}
              {quickLinks.length > 0 && (
                <div className="space-y-2">
                  {quickLinks.map((link) => (
                    <div
                      key={link.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800 border border-zinc-700 group"
                    >
                      {link.image ? (
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={link.image}
                            alt={link.name}
                            width={32}
                            height={32}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                          style={{ backgroundColor: link.color }}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{link.name}</p>
                        <p className="text-xs text-zinc-500 truncate">{link.url}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteLink(link.id)}
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {quickLinks.length === 0 && !showAddLink && (
                <div className="text-center py-6 text-zinc-500 text-sm">
                  Nog geen extra snelkoppelingen toegevoegd.
                </div>
              )}
            </div>

            {/* Info */}
            <div className="border-t border-zinc-700 pt-4">
              <p className="text-xs text-zinc-500 text-center">
                Standaard snelkoppelingen (Bitwarden, Strato, etc.) kunnen niet worden verwijderd.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 z-10 p-4 sm:p-6 pt-3 border-t border-zinc-700 bg-zinc-800">
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full border-zinc-600 hover:bg-zinc-700 h-10"
            >
              Sluiten
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
