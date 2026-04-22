'use client';

import { useState } from 'react';
import { X, Pencil, Square, CheckSquare, Paperclip, MessageSquare, Send, Trash2, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { Task, Friend, TaskColumn, TaskComment, ChecklistItem } from '@/types';

interface TaskDetailPanelProps {
  task: Task;
  column: TaskColumn | undefined;
  friends: Friend[];
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onUpdateTask: (data: { id: string; checklist?: ChecklistItem[]; comments?: TaskComment[] }) => void;
}

const priorityConfig: Record<string, { bg: string; text: string; label: string }> = {
  P1: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Urgent' },
  P2: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Normaal' },
  P3: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Laag' },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function TaskDetailPanel({
  task,
  column,
  friends,
  isOpen,
  onClose,
  onEdit,
  onUpdateTask,
}: TaskDetailPanelProps) {
  const [newComment, setNewComment] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState<string>(friends[0]?.id || '');

  if (!isOpen) return null;

  const assignees = friends.filter((f) => task.assignee_ids?.includes(f.id));
  const priority = priorityConfig[task.priority] || priorityConfig.P2;
  const completedItems = task.checklist?.filter((item) => item.completed).length || 0;
  const totalItems = task.checklist?.length || 0;

  const handleToggleChecklistItem = (itemId: string) => {
    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdateTask({ id: task.id, checklist: updatedChecklist });
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedAuthor) return;

    const author = friends.find((f) => f.id === selectedAuthor);
    if (!author) return;

    const comment: TaskComment = {
      id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      author_id: author.id,
      author_name: author.name,
      text: newComment.trim(),
      created_at: new Date().toISOString(),
    };

    const updatedComments = [...(task.comments || []), comment];
    onUpdateTask({ id: task.id, comments: updatedComments });
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
    const updatedComments = (task.comments || []).filter((c) => c.id !== commentId);
    onUpdateTask({ id: task.id, comments: updatedComments });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-zinc-900 border-l border-zinc-700 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold px-2 py-1 rounded ${priority.bg} ${priority.text}`}>
              {task.priority}
            </span>
            {column && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <span className="text-xs text-zinc-400">{column.name}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-8 px-3 hover:bg-zinc-800"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Bewerken
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-zinc-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <h2 className="text-xl font-bold text-white">{task.title}</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Aangemaakt {formatDate(task.created_at)}
            </p>
          </div>

          {/* Assignees */}
          {assignees.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Toegewezen aan</h3>
              <div className="flex flex-wrap gap-2">
                {assignees.map((friend) => (
                  <span
                    key={friend.id}
                    className="text-sm px-3 py-1 rounded-full text-white font-medium"
                    style={{ backgroundColor: friend.color }}
                  >
                    {friend.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description / Notes */}
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">Notities</h3>
              <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
                <p className="text-white whitespace-pre-wrap">{task.description}</p>
              </div>
            </div>
          )}

          {/* Checklist */}
          {task.checklist && task.checklist.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-zinc-400">Checklist</h3>
                <span className="text-xs text-zinc-500">
                  {completedItems}/{totalItems} voltooid
                </span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-zinc-800 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                />
              </div>
              <div className="space-y-2">
                {task.checklist.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleToggleChecklistItem(item.id)}
                    className="flex items-center gap-3 w-full p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors text-left"
                  >
                    {item.completed ? (
                      <CheckSquare className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <Square className="w-5 h-5 text-zinc-400 flex-shrink-0" />
                    )}
                    <span className={`text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                      {item.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          {task.attachments && task.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-2">
                <Paperclip className="w-4 h-4 inline mr-1" />
                Bestanden ({task.attachments.length})
              </h3>
              <div className="space-y-2">
                {task.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{attachment.name}</p>
                      <p className="text-xs text-zinc-500">{formatFileSize(attachment.size)}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-white transition-colors" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Comments / Opmerkingen */}
          <div>
            <h3 className="text-sm font-medium text-zinc-400 mb-3">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Opmerkingen ({task.comments?.length || 0})
            </h3>

            {/* Existing comments */}
            {task.comments && task.comments.length > 0 && (
              <div className="space-y-3 mb-4">
                {task.comments.map((comment) => {
                  const author = friends.find((f) => f.id === comment.author_id);
                  return (
                    <div
                      key={comment.id}
                      className="bg-zinc-800 rounded-xl p-4 border border-zinc-700 group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                            style={{ backgroundColor: author?.color || '#6366f1' }}
                          >
                            {comment.author_name}
                          </span>
                          <span className="text-xs text-zinc-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteComment(comment.id)}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </Button>
                      </div>
                      <p className="text-sm text-white whitespace-pre-wrap">{comment.text}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add new comment */}
            <div className="bg-zinc-800 rounded-xl p-4 border border-zinc-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs text-zinc-400">Reageren als:</span>
                <div className="flex gap-1">
                  {friends.map((friend) => (
                    <button
                      key={friend.id}
                      onClick={() => setSelectedAuthor(friend.id)}
                      className={`text-xs px-2 py-1 rounded-full font-medium transition-all ${
                        selectedAuthor === friend.id
                          ? 'text-white ring-2 ring-white/50'
                          : 'text-white/70 hover:text-white'
                      }`}
                      style={{ backgroundColor: friend.color }}
                    >
                      {friend.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Schrijf een opmerking..."
                  className="bg-zinc-900 border-zinc-600 text-white flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || !selectedAuthor}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
