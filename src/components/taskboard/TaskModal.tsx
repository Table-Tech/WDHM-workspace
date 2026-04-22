'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Check, File, Image, Trash2, Upload, Loader2, Plus, Square, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadTaskAttachment } from '@/hooks/useTasks';
import type { Task, TaskPriority, TaskColumn, Friend, TaskAttachment, ChecklistItem, TaskComment } from '@/types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; priority: TaskPriority; column_id: string; assignee_ids: string[]; attachments: TaskAttachment[]; checklist: ChecklistItem[]; comments: TaskComment[] }) => void;
  columns: TaskColumn[];
  friends: Friend[];
  task?: Task | null;
  defaultColumnId?: string;
  isSubmitting?: boolean;
}

const priorities: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'P1', label: 'P1 - Urgent', color: 'bg-red-500' },
  { value: 'P2', label: 'P2 - Normaal', color: 'bg-yellow-500' },
  { value: 'P3', label: 'P3 - Laag', color: 'bg-green-500' },
];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(type: string): boolean {
  return type.startsWith('image/');
}

export function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  columns,
  friends,
  task,
  defaultColumnId,
  isSubmitting,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('P2');
  const [columnId, setColumnId] = useState('');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setColumnId(task.column_id);
      setAssigneeIds(task.assignee_ids || []);
      setAttachments(task.attachments || []);
      setChecklist(task.checklist || []);
      setComments(task.comments || []);
    } else {
      setTitle('');
      setDescription('');
      setPriority('P2');
      setColumnId(defaultColumnId || columns[0]?.id || '');
      setAssigneeIds([]);
      setAttachments([]);
      setChecklist([]);
      setComments([]);
    }
    setNewChecklistItem('');
  }, [task, defaultColumnId, columns, isOpen]);

  const toggleAssignee = (friendId: string) => {
    setAssigneeIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAttachments: TaskAttachment[] = [];
      for (const file of Array.from(files)) {
        const attachment = await uploadTaskAttachment(file);
        newAttachments.push(attachment);
      }
      setAttachments((prev) => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Bestand uploaden mislukt. Probeer opnieuw.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const newItem: ChecklistItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      text: newChecklistItem.trim(),
      completed: false,
    };
    setChecklist((prev) => [...prev, newItem]);
    setNewChecklistItem('');
  };

  const toggleChecklistItem = (itemId: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const removeChecklistItem = (itemId: string) => {
    setChecklist((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !columnId) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      priority,
      column_id: columnId,
      assignee_ids: assigneeIds,
      attachments,
      checklist,
      comments,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {task ? 'Taak bewerken' : 'Nieuwe taak'}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wat moet er gedaan worden?"
              className="bg-zinc-800 border-zinc-700 text-white"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Beschrijving</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Extra details..."
              className="bg-zinc-800 border-zinc-700 text-white resize-none"
              rows={3}
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            <Label className="text-white">Checklist / Notities</Label>

            {/* Existing items */}
            {checklist.length > 0 && (
              <div className="space-y-1 mb-2">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700 group"
                  >
                    <button
                      type="button"
                      onClick={() => toggleChecklistItem(item.id)}
                      className="flex-shrink-0"
                    >
                      {item.completed ? (
                        <CheckSquare className="w-4 h-4 text-green-400" />
                      ) : (
                        <Square className="w-4 h-4 text-zinc-400" />
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {item.text}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeChecklistItem(item.id)}
                      className="h-6 w-6 p-0 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new item */}
            <div className="flex gap-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                placeholder="Nieuw item toevoegen..."
                className="bg-zinc-800 border-zinc-700 text-white flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addChecklistItem();
                  }
                }}
              />
              <Button
                type="button"
                variant="ghost"
                onClick={addChecklistItem}
                disabled={!newChecklistItem.trim()}
                className="px-3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label className="text-white">Bestanden</Label>

            {/* Existing attachments */}
            {attachments.length > 0 && (
              <div className="space-y-2 mb-2">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700"
                  >
                    {isImageFile(attachment.type) ? (
                      <Image className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    ) : (
                      <File className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{attachment.name}</p>
                      <p className="text-xs text-zinc-500">{formatFileSize(attachment.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                      className="h-6 w-6 p-0 hover:bg-red-500/20 flex-shrink-0"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full justify-center border-2 border-dashed border-zinc-700 hover:border-zinc-600 bg-zinc-800/50 hover:bg-zinc-800"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploaden...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Bestand toevoegen
                </>
              )}
            </Button>
          </div>

          {/* Assignees */}
          {friends.length > 0 && (
            <div className="space-y-2">
              <Label className="text-white">Toewijzen aan</Label>
              <div className="flex flex-wrap gap-2">
                {friends.map((friend) => {
                  const isSelected = assigneeIds.includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => toggleAssignee(friend.id)}
                      className={`
                        py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2
                        ${isSelected
                          ? 'border-transparent text-white'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }
                      `}
                      style={isSelected ? { backgroundColor: friend.color } : {}}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      {friend.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Priority */}
          <div className="space-y-2">
            <Label className="text-white">Prioriteit</Label>
            <div className="flex gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`
                    flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all
                    ${priority === p.value
                      ? `${p.color} border-transparent text-white`
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }
                  `}
                >
                  {p.value}
                </button>
              ))}
            </div>
          </div>

          {/* Column */}
          <div className="space-y-2">
            <Label className="text-white">Kolom</Label>
            <div className="flex flex-wrap gap-2">
              {columns.map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => setColumnId(col.id)}
                  className={`
                    py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center gap-2
                    ${columnId === col.id
                      ? 'bg-purple-500 border-purple-400 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }
                  `}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: col.color }}
                  />
                  {col.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !columnId || isSubmitting || isUploading}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? 'Opslaan...' : task ? 'Opslaan' : 'Toevoegen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
