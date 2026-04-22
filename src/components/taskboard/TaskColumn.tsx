'use client';

import { useState } from 'react';
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
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
}: TaskColumnProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { theme } = useTheme();

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
      className="flex flex-col min-w-[280px] max-w-[320px] bg-zinc-900/50 rounded-2xl border transition-all"
      style={isDragOver ? {
        borderColor: `rgb(${theme.colors.primary})`,
        backgroundColor: `rgba(${theme.colors.primary}, 0.05)`,
      } : {
        borderColor: 'rgb(39 39 42)', // zinc-800
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
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
