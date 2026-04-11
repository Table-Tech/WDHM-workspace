'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings, Plus, Trash2, Save, X } from 'lucide-react';
import { MilestoneIcon, ICON_OPTIONS, MILESTONE_ICONS, DEFAULT_ICON } from '@/components/shared/MilestoneIcon';
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
  icon: string;
  isNew?: boolean;
}


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
    icon: DEFAULT_ICON,
    isNew: true,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      scrollContainerRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [isOpen]);

  const handleEdit = (milestone: GroupSetting) => {
    setEditingId(milestone.id);
    setEditForm({
      id: milestone.id,
      milestone_count: milestone.milestone_count.toString(),
      penalty_text: milestone.penalty_text,
      icon: milestone.emoji, // emoji field in DB stores icon name
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
      emoji: editForm.icon, // icon stored in emoji DB field
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
      emoji: newMilestone.icon, // icon stored in emoji DB field
    });

    setNewMilestone({
      id: 'new',
      milestone_count: '',
      penalty_text: '',
      icon: DEFAULT_ICON,
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
      <DialogContent
        className="w-[calc(100vw-1rem)] sm:w-[95vw] max-w-lg border border-white/15 bg-slate-950/90 backdrop-blur-xl max-h-[85dvh] sm:max-h-[85dvh] overflow-hidden p-0 rounded-xl sm:rounded-2xl shadow-2xl shadow-black/60"
        showCloseButton={false}
      >
        <div className="flex h-full max-h-[85dvh] flex-col">
          <DialogHeader className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-slate-950/85 backdrop-blur-md">
            <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30 shrink-0">
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

          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-4 sm:p-6">
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
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="p-1 hover:bg-white/10 rounded"
                          aria-label="Formulier sluiten"
                          title="Formulier sluiten"
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
                    <Label className="text-xs text-white/50">Icoon</Label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                      {ICON_OPTIONS.map((iconName) => (
                        <button
                          key={iconName}
                          type="button"
                          onClick={() => setNewMilestone({ ...newMilestone, icon: iconName })}
                          className={`
                            w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center
                            transition-all
                            ${
                              newMilestone.icon === iconName
                                ? 'bg-violet-500/30 border-2 border-violet-500 text-violet-300'
                                : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
                            }
                          `}
                          title={iconName}
                        >
                          <MilestoneIcon icon={iconName} size="sm" />
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
                        ? 'bg-white/6 border-violet-500/50'
                        : 'bg-white/3 border-white/10 hover:bg-white/5'
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
                        <Label className="text-xs text-white/50">Icoon</Label>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
                          {ICON_OPTIONS.map((iconName) => (
                            <button
                              key={iconName}
                              type="button"
                              onClick={() => setEditForm({ ...editForm, icon: iconName })}
                              className={`
                                w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center
                                transition-all
                                ${
                                  editForm.icon === iconName
                                    ? 'bg-violet-500/30 border-2 border-violet-500 text-violet-300'
                                    : 'bg-white/5 border border-white/10 hover:bg-white/10 text-white/70'
                                }
                              `}
                              title={iconName}
                            >
                              <MilestoneIcon icon={iconName} size="sm" />
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
                      <span className="text-xl sm:text-2xl shrink-0">{milestone.emoji}</span>
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
                      <div className="flex gap-0.5 sm:gap-1 shrink-0">
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
          </div>

          <div className="sticky bottom-0 z-10 p-4 sm:p-6 pt-3 sm:pt-4 border-t border-white/10 bg-slate-950/85 backdrop-blur-md">
            <Button onClick={onClose} variant="outline" className="w-full border-white/10 h-9 sm:h-10 text-sm">
              Sluiten
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
