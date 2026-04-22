'use client';

import { useState } from 'react';
import { GripVertical, Pencil, Trash2, Paperclip, CheckSquare, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import type { Task, TaskPriority, Friend } from '@/types';

interface TaskCardProps {
  task: Task;
  friends: Friend[];
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onView: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}

const priorityColors: Record<TaskPriority, { bg: string; text: string; border: string }> = {
  P1: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' },
  P2: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  P3: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
};

export function TaskCard({ task, friends, onEdit, onDelete, onView, onDragStart }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false);
  const priority = priorityColors[task.priority];
  const { theme } = useTheme();

  // Get assigned friends
  const assignees = friends.filter((f) => task.assignee_ids?.includes(f.id));

  const handleClick = (e: React.MouseEvent) => {
    // Don't open detail panel if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) return;
    onView(task);
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className="group relative bg-zinc-800/80 border border-zinc-700 rounded-xl p-3 hover:border-zinc-600 hover:bg-zinc-800 transition-all cursor-pointer"
      style={showActions ? { boxShadow: `0 0 0 1px rgba(${theme.colors.primary}, 0.3)` } : {}}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
        <GripVertical className="w-4 h-4 text-zinc-500" />
      </div>

      <div className="pl-4">
        {/* Priority badge */}
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${priority.bg} ${priority.text} ${priority.border} border`}>
            {task.priority}
          </span>

          {/* Actions */}
          <div className={`flex gap-1 transition-opacity ${showActions ? 'opacity-100' : 'opacity-0'}`}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(task)}
              className="h-6 w-6 p-0 hover:bg-zinc-700"
            >
              <Pencil className="w-3 h-3 text-zinc-400" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(task.id)}
              className="h-6 w-6 p-0 hover:bg-red-500/20"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-medium text-white mb-1">{task.title}</h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{task.description}</p>
        )}

        {/* Assignees */}
        {assignees.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {assignees.map((friend) => (
              <span
                key={friend.id}
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ backgroundColor: friend.color }}
              >
                {friend.name}
              </span>
            ))}
          </div>
        )}

        {/* Bottom indicators row */}
        {((task.attachments && task.attachments.length > 0) || (task.checklist && task.checklist.length > 0) || (task.comments && task.comments.length > 0)) && (
          <div className="flex items-center gap-3 mt-2">
            {/* Attachments indicator */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-zinc-400">
                <Paperclip className="w-3 h-3" />
                <span className="text-xs">{task.attachments.length}</span>
              </div>
            )}

            {/* Checklist indicator */}
            {task.checklist && task.checklist.length > 0 && (
              <div className="flex items-center gap-1 text-zinc-400">
                <CheckSquare className="w-3 h-3" />
                <span className="text-xs">
                  {task.checklist.filter((item) => item.completed).length}/{task.checklist.length}
                </span>
              </div>
            )}

            {/* Comments indicator */}
            {task.comments && task.comments.length > 0 && (
              <div className="flex items-center gap-1 text-zinc-400">
                <MessageSquare className="w-3 h-3" />
                <span className="text-xs">{task.comments.length}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
