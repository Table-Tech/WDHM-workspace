'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskCard } from './TaskCard';
import { useTheme } from '@/contexts/ThemeContext';
import type { Task, TaskColumn as TaskColumnType, Friend } from '@/types';

interface TaskColumnProps {
  column: TaskColumnType;
  tasks: Task[];
  friends: Friend[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onEditColumn: (column: TaskColumnType) => void;
  onDeleteColumn: (columnId: string) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, columnId: string) => void;
  onColumnDragStart?: (e: React.DragEvent, column: TaskColumnType) => void;
  onColumnDragOver?: (e: React.DragEvent, column: TaskColumnType) => void;
  onColumnDrop?: (e: React.DragEvent, column: TaskColumnType) => void;
  onColumnDragEnd?: () => void;
  isDraggingColumn?: boolean;
}

export function TaskColumn({
  column,
  tasks,
  friends,
  onAddTask,
  onEditTask,
  onViewTask,
  onDeleteTask,
  onEditColumn,
  onDeleteColumn,
  onDragStart,
  onDragOver,
  onDrop,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  onColumnDragEnd,
  isDraggingColumn = false,
}: TaskColumnProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isColumnDragOver, setIsColumnDragOver] = useState(false);
  const { theme } = useTheme();

  // Column drag handlers
  const handleColumnDragStart = (e: React.DragEvent) => {
    if (onColumnDragStart) {
      onColumnDragStart(e, column);
    }
  };

  const handleColumnDragOver = (e: React.DragEvent) => {
    // Check if this is a column drag (not a task drag)
    if (e.dataTransfer.types.includes('text/column')) {
      e.preventDefault();
      setIsColumnDragOver(true);
      if (onColumnDragOver) {
        onColumnDragOver(e, column);
      }
    }
  };

  const handleColumnDrop = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('text/column')) {
      e.preventDefault();
      setIsColumnDragOver(false);
      if (onColumnDrop) {
        onColumnDrop(e, column);
      }
    }
  };

  const handleColumnDragLeave = () => {
    setIsColumnDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    onDragOver(e);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    setIsDragOver(false);
    onDrop(e, column.id);
  };

  return (
    <div
      className={`flex flex-col min-w-[280px] max-w-[320px] bg-zinc-900/50 rounded-2xl border transition-all ${
        isDraggingColumn ? 'opacity-50 scale-95' : ''
      }`}
      style={isColumnDragOver ? {
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
      } : isDragOver ? {
        borderColor: `rgb(${theme.colors.primary})`,
        backgroundColor: `rgba(${theme.colors.primary}, 0.05)`,
      } : {
        borderColor: 'rgb(39 39 42)', // zinc-800
      }}
      onDragOver={(e) => {
        handleDragOver(e);
        handleColumnDragOver(e);
      }}
      onDragLeave={(e) => {
        handleDragLeave();
        handleColumnDragLeave();
      }}
      onDrop={(e) => {
        if (e.dataTransfer.types.includes('text/column')) {
          handleColumnDrop(e);
        } else {
          handleDrop(e);
        }
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          {/* Drag Handle */}
          <div
            draggable
            onDragStart={handleColumnDragStart}
            onDragEnd={onColumnDragEnd}
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 hover:bg-zinc-800 rounded transition-colors"
            title="Sleep om kolom te verplaatsen"
          >
            <GripVertical className="w-4 h-4 text-zinc-500" />
          </div>
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-white">{column.name}</h3>
          <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-7 w-7 p-0 hover:bg-zinc-800"
          >
            <MoreVertical className="w-4 h-4 text-zinc-400" />
          </Button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-50 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl py-1 min-w-[140px]">
                <button
                  onClick={() => {
                    onEditColumn(column);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-white hover:bg-zinc-700 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Bewerken
                </button>
                <button
                  onClick={() => {
                    onDeleteColumn(column.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-zinc-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Verwijderen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            friends={friends}
            onEdit={onEditTask}
            onView={onViewTask}
            onDelete={onDeleteTask}
            onDragStart={onDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Geen taken
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <div className="p-3 border-t border-zinc-800">
        <Button
          variant="ghost"
          onClick={() => onAddTask(column.id)}
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Taak toevoegen
        </Button>
      </div>
    </div>
  );
}
