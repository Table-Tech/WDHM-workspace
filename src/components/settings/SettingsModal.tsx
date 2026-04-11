'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, Plus, Trash2, Save, X, Check, Palette } from 'lucide-react';
import { MilestoneIcon, ICON_OPTIONS, DEFAULT_ICON } from '@/components/shared/MilestoneIcon';
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
import {
  useMilestoneSettings,
  useUpdateMilestone,
  useAddMilestone,
  useDeleteMilestone,
} from '@/hooks/useMilestones';
import { useTheme } from '@/contexts/ThemeContext';
import type { GroupSetting } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditableMilestone {
  id: string;
  milestone_count: string;
  penalty_text: string;
  icon: string;
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

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: milestones = [], isLoading } = useMilestoneSettings();
  const updateMutation = useUpdateMilestone();
  const addMutation = useAddMilestone();
  const deleteMutation = useDeleteMilestone();
  const { themeId, setThemeId, themes } = useTheme();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditableMilestone | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState<EditableMilestone>({
    id: 'new',
    milestone_count: '',
    penalty_text: '',
    icon: DEFAULT_ICON,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [isOpen]);

  const isSaving = updateMutation.isPending || addMutation.isPending || deleteMutation.isPending;

  const handleEdit = (milestone: GroupSetting) => {
    setEditingId(milestone.id);
    setEditForm({
      id: milestone.id,
      milestone_count: milestone.milestone_count.toString(),
      penalty_text: milestone.penalty_text,
      icon: milestone.emoji,
    });
    setShowAddForm(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSave = async () => {
    if (!editForm) return;
    const count = parseInt(editForm.milestone_count, 10);
    if (isNaN(count) || count <= 0 || !editForm.penalty_text.trim()) return;

    await updateMutation.mutateAsync({
      id: editForm.id,
      milestone_count: count,
      penalty_text: editForm.penalty_text.trim(),
      emoji: editForm.icon,
    });

    handleCancel();
  };

  const handleAdd = async () => {
    const count = parseInt(newMilestone.milestone_count, 10);
    if (isNaN(count) || count <= 0 || !newMilestone.penalty_text.trim()) return;

    await addMutation.mutateAsync({
      milestone_count: count,
      penalty_text: newMilestone.penalty_text.trim(),
      emoji: newMilestone.icon,
    });

    setNewMilestone({
      id: 'new',
      milestone_count: '',
      penalty_text: '',
      icon: DEFAULT_ICON,
    });
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Weet je zeker dat je deze milestone wilt verwijderen?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="w-[min(760px,calc(100vw-1rem))] sm:w-[95vw] max-w-2xl border border-white/10 bg-slate-950 max-h-[85dvh] overflow-hidden p-0 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/80 text-left [direction:ltr]"
        showCloseButton={false}
      >
        <div className="flex h-full max-h-[85dvh] flex-col">
          <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-slate-900">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div
                  className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl theme-border-light shrink-0 bg-linear-to-br from-[rgba(var(--theme-primary),0.2)] to-[rgba(var(--theme-primary-dark),0.2)]"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 theme-text-light" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-lg sm:text-xl text-white">Instellingen</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                    Pas thema en milestones aan
                  </DialogDescription>
                </div>
              </div>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onClose}
                aria-label="Instellingen sluiten"
                className="h-8 w-8 hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 bg-slate-950">
            <div className="space-y-6">
              {/* Theme Picker Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-white/50" />
                  <h3 className="text-xs sm:text-sm font-semibold text-white/70">Kleurthema</h3>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setThemeId(theme.id)}
                      className={`relative w-full aspect-square rounded-lg sm:rounded-xl transition-all duration-200 hover:scale-105 ${THEME_SWATCH_CLASSES[theme.id] || 'bg-slate-500'} ${themeId === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950' : ''}`}
                      title={theme.name}
                      aria-label={`Selecteer ${theme.name} thema`}
                    >
                      {themeId === theme.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-white/40">
                  Huidige thema: <span className="text-white/60">{themes.find(t => t.id === themeId)?.name}</span>
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10" />

              {/* Milestones Section */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xs sm:text-sm font-semibold text-white/70">Milestones & Straffen</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(true);
                      setEditingId(null);
                      setEditForm(null);
                    }}
                    className="theme-border-light theme-text h-8 text-xs sm:text-sm px-2 sm:px-3"
                    disabled={isSaving}
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                    <span className="hidden sm:inline">Toevoegen</span>
                    <span className="sm:hidden">Nieuw</span>
                  </Button>
                </div>

                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Laden...</div>
                ) : (
                  <div className="space-y-3">
                    {showAddForm && (
                      <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-slate-800 theme-border-light space-y-2.5 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium theme-text-light">Nieuwe milestone</span>
                          <button
                            type="button"
                            onClick={() => setShowAddForm(false)}
                            className="p-1 hover:bg-white/10 rounded"
                            aria-label="Formulier sluiten"
                          >
                            <X className="w-4 h-4 text-white/50" />
                          </button>
                        </div>
                        <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] gap-2 sm:gap-3">
                          <div>
                            <Label className="text-xs text-white/50">Aantal</Label>
                            <Input
                              type="number"
                              min="1"
                              value={newMilestone.milestone_count}
                              onChange={(e) => setNewMilestone({ ...newMilestone, milestone_count: e.target.value })}
                              className="bg-slate-800 border-slate-700 h-8 sm:h-9 text-sm text-white"
                              placeholder="10"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-white/50">Straf</Label>
                            <Input
                              value={newMilestone.penalty_text}
                              onChange={(e) => setNewMilestone({ ...newMilestone, penalty_text: e.target.value })}
                              className="bg-slate-800 border-slate-700 h-8 sm:h-9 text-sm text-white placeholder:text-slate-500"
                              placeholder="Beschrijf de straf..."
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-xs text-white/50">Icoon</Label>
                          <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                            {ICON_OPTIONS.map((iconName) => (
                              <button
                                key={iconName}
                                type="button"
                                onClick={() => setNewMilestone({ ...newMilestone, icon: iconName })}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${newMilestone.icon === iconName ? 'theme-bg border-2 border-[rgb(var(--theme-primary-light))] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                                title={iconName}
                              >
                                <MilestoneIcon icon={iconName} size="sm" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="flex-1 border-slate-600 hover:bg-slate-700 h-9 text-sm text-white">
                            Annuleren
                          </Button>
                          <Button
                            type="button"
                            onClick={handleAdd}
                            disabled={isSaving || !newMilestone.milestone_count || !newMilestone.penalty_text.trim()}
                            className="flex-1 theme-bg hover:opacity-90 h-9 text-sm"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1.5" />
                            Toevoegen
                          </Button>
                        </div>
                      </div>
                    )}

                    {milestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all ${editingId === milestone.id ? 'bg-slate-800 theme-border-light' : 'bg-slate-900 border-slate-800 hover:bg-slate-800/80'}`}
                      >
                        {editingId === milestone.id && editForm ? (
                          <div className="space-y-2.5 sm:space-y-3">
                            <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] gap-2 sm:gap-3">
                              <div>
                                <Label className="text-xs text-white/50">Aantal</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={editForm.milestone_count}
                                  onChange={(e) => setEditForm({ ...editForm, milestone_count: e.target.value })}
                                  className="bg-slate-800 border-slate-700 h-8 sm:h-9 text-sm text-white"
                                />
                              </div>
                              <div>
                                <Label className="text-xs text-white/50">Straf</Label>
                                <Input
                                  value={editForm.penalty_text}
                                  onChange={(e) => setEditForm({ ...editForm, penalty_text: e.target.value })}
                                  className="bg-slate-800 border-slate-700 h-8 sm:h-9 text-sm text-white"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-xs text-white/50">Icoon</Label>
                              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                                {ICON_OPTIONS.map((iconName) => (
                                  <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setEditForm({ ...editForm, icon: iconName })}
                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${editForm.icon === iconName ? 'theme-bg border-2 border-[rgb(var(--theme-primary-light))] text-white' : 'bg-slate-700 border border-slate-600 hover:bg-slate-600 text-slate-300'}`}
                                    title={iconName}
                                  >
                                    <MilestoneIcon icon={iconName} size="sm" />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <Button type="button" size="sm" variant="outline" onClick={handleCancel} className="flex-1 border-slate-600 hover:bg-slate-700 h-8 sm:h-9 text-xs sm:text-sm text-white" disabled={isSaving}>
                                Annuleren
                              </Button>
                              <Button type="button" size="sm" onClick={handleSave} className="flex-1 theme-bg hover:opacity-90 h-8 sm:h-9 text-xs sm:text-sm" disabled={isSaving}>
                                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                                Opslaan
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center theme-text-light shrink-0 bg-[rgba(var(--theme-primary),0.3)] border border-[rgba(var(--theme-primary),0.5)]">
                              <MilestoneIcon icon={milestone.emoji} size="md" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-white">{milestone.milestone_count}x te laat</p>
                              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed wrap-break-word">{milestone.penalty_text}</p>
                            </div>
                            <div className="flex gap-0.5 sm:gap-1 shrink-0">
                              <Button type="button" size="sm" variant="ghost" onClick={() => handleEdit(milestone)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white/10" disabled={isSaving}>
                                <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => handleDelete(milestone.id)} className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-500/20 text-red-400" disabled={isSaving}>
                                <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {milestones.length === 0 && !showAddForm && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Geen milestones gevonden.</p>
                        <p className="text-sm mt-1">Voeg een nieuwe milestone toe om te beginnen.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 z-10 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-white/10 bg-slate-900">
            <Button onClick={onClose} variant="outline" className="w-full border-slate-700 hover:bg-slate-800 h-9 sm:h-10 text-sm text-white">
              Sluiten
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
