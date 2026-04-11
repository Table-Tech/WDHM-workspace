'use client';

import { useState } from 'react';
import { Settings, Plus, Trash2, Save, X } from 'lucide-react';
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
import type { GroupSetting } from '@/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface EditableMilestone {
  id: string;
  milestone_count: string;
  penalty_text: string;
  emoji: string;
  isNew?: boolean;
}

const EMOJI_OPTIONS = ['🍺', '🍕', '🎤', '👕', '✈️', '🎁', '💰', '🏃', '🧹', '📱', '🎮', '🍳'];

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { data: milestones = [], isLoading } = useMilestoneSettings();
  const updateMutation = useUpdateMilestone();
  const addMutation = useAddMilestone();
  const deleteMutation = useDeleteMilestone();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditableMilestone | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMilestone, setNewMilestone] = useState<EditableMilestone>({
    id: 'new',
    milestone_count: '',
    penalty_text: '',
    emoji: '🎁',
    isNew: true,
  });

  const handleEdit = (milestone: GroupSetting) => {
    setEditingId(milestone.id);
    setEditForm({
      id: milestone.id,
      milestone_count: milestone.milestone_count.toString(),
      penalty_text: milestone.penalty_text,
      emoji: milestone.emoji,
    });
    setShowAddForm(false);
  };

  const handleSave = async () => {
    if (!editForm) return;

    const count = parseInt(editForm.milestone_count, 10);
    if (isNaN(count) || count <= 0) return;
    if (!editForm.penalty_text.trim()) return;

    await updateMutation.mutateAsync({
      id: editForm.id,
      milestone_count: count,
      penalty_text: editForm.penalty_text.trim(),
      emoji: editForm.emoji,
    });

    setEditingId(null);
    setEditForm(null);
  };

  const handleAdd = async () => {
    const count = parseInt(newMilestone.milestone_count, 10);
    if (isNaN(count) || count <= 0) return;
    if (!newMilestone.penalty_text.trim()) return;

    await addMutation.mutateAsync({
      milestone_count: count,
      penalty_text: newMilestone.penalty_text.trim(),
      emoji: newMilestone.emoji,
    });

    setNewMilestone({
      id: 'new',
      milestone_count: '',
      penalty_text: '',
      emoji: '🎁',
      isNew: true,
    });
    setShowAddForm(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Weet je zeker dat je deze milestone wilt verwijderen?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const isSaving = updateMutation.isPending || addMutation.isPending || deleteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-strong w-[95vw] max-w-lg border-white/10 max-h-[85vh] overflow-y-auto p-4 sm:p-6 rounded-xl sm:rounded-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 flex-shrink-0">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl text-white">Instellingen</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs sm:text-sm">
                Pas milestones en straffen aan
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
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
              className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 h-8 text-xs sm:text-sm px-2 sm:px-3"
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
              {/* Add new milestone form */}
              {showAddForm && (
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-violet-500/10 border border-violet-500/30 space-y-2.5 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-medium text-violet-300">Nieuwe milestone</span>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="p-1 hover:bg-white/10 rounded"
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
                        onChange={(e) =>
                          setNewMilestone({ ...newMilestone, milestone_count: e.target.value })
                        }
                        className="bg-white/5 border-white/10 h-8 sm:h-9 text-sm"
                        placeholder="10"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-white/50">Straf</Label>
                      <Input
                        value={newMilestone.penalty_text}
                        onChange={(e) =>
                          setNewMilestone({ ...newMilestone, penalty_text: e.target.value })
                        }
                        className="bg-white/5 border-white/10 h-8 sm:h-9 text-sm"
                        placeholder="Beschrijf de straf..."
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-white/50">Emoji</Label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewMilestone({ ...newMilestone, emoji })}
                          className={`
                            w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-base sm:text-lg flex items-center justify-center
                            transition-all
                            ${
                              newMilestone.emoji === emoji
                                ? 'bg-violet-500/30 border-2 border-violet-500'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10'
                            }
                          `}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleAdd}
                    disabled={
                      isSaving ||
                      !newMilestone.milestone_count ||
                      !newMilestone.penalty_text.trim()
                    }
                    className="w-full bg-violet-600 hover:bg-violet-500 h-9 sm:h-10 text-sm"
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Milestone toevoegen
                  </Button>
                </div>
              )}

              {/* Existing milestones */}
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`
                    p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all
                    ${
                      editingId === milestone.id
                        ? 'bg-white/[0.06] border-violet-500/50'
                        : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
                    }
                  `}
                >
                  {editingId === milestone.id && editForm ? (
                    // Edit mode
                    <div className="space-y-2.5 sm:space-y-3">
                      <div className="grid grid-cols-[60px_1fr] sm:grid-cols-[80px_1fr] gap-2 sm:gap-3">
                        <div>
                          <Label className="text-xs text-white/50">Aantal</Label>
                          <Input
                            type="number"
                            min="1"
                            value={editForm.milestone_count}
                            onChange={(e) =>
                              setEditForm({ ...editForm, milestone_count: e.target.value })
                            }
                            className="bg-white/5 border-white/10 h-8 sm:h-9 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-white/50">Straf</Label>
                          <Input
                            value={editForm.penalty_text}
                            onChange={(e) =>
                              setEditForm({ ...editForm, penalty_text: e.target.value })
                            }
                            className="bg-white/5 border-white/10 h-8 sm:h-9 text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-white/50">Emoji</Label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                          {EMOJI_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setEditForm({ ...editForm, emoji })}
                              className={`
                                w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-base sm:text-lg flex items-center justify-center
                                transition-all
                                ${
                                  editForm.emoji === emoji
                                    ? 'bg-violet-500/30 border-2 border-violet-500'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                                }
                              `}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                          className="flex-1 border-white/10 h-8 sm:h-9 text-xs sm:text-sm"
                          disabled={isSaving}
                        >
                          Annuleren
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="flex-1 bg-violet-600 hover:bg-violet-500 h-8 sm:h-9 text-xs sm:text-sm"
                          disabled={isSaving}
                        >
                          <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                          Opslaan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{milestone.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-white">
                            {milestone.milestone_count}x te laat
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">
                          {milestone.penalty_text}
                        </p>
                      </div>
                      <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(milestone)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-white/10"
                          disabled={isSaving}
                        >
                          <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(milestone.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-500/20 text-red-400"
                          disabled={isSaving}
                        >
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

        <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-white/10">
          <Button onClick={onClose} variant="outline" className="w-full border-white/10 h-9 sm:h-10 text-sm">
            Sluiten
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
