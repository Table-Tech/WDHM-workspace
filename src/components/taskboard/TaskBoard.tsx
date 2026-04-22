'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, FileSpreadsheet, Clock, Settings, Zap, Grid3X3, ExternalLink, Table2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { TaskColumn } from './TaskColumn';
import { TaskModal } from './TaskModal';
import { TaskDetailPanel } from './TaskDetailPanel';
import { ColumnModal } from './ColumnModal';
import { TaskBoardSettings, type QuickLink } from './TaskBoardSettings';
import { SalesTeamSection } from './SalesTeamSection';
import { useTheme } from '@/contexts/ThemeContext';
import {
  useColumns,
  useTasks,
  useAddColumn,
  useUpdateColumn,
  useDeleteColumn,
  useAddTask,
  useUpdateTask,
  useMoveTask,
  useDeleteTask,
  useReorderColumns,
} from '@/hooks/useTasks';
import { useFriends } from '@/hooks/useFriends';
import type { Task, TaskColumn as TaskColumnType, TaskPriority, TaskAttachment, ChecklistItem, TaskComment } from '@/types';

const EXCEL_URL = 'https://hrnl-my.sharepoint.com/:x:/r/personal/1073155_hr_nl/_layouts/15/Doc.aspx?sourcedoc=%7B9EC361D5-178C-41F8-B6A4-2F5E44752EB4%7D&file=TechTable_Financieel.xlsx&fromShare=true&action=default&mobileredirect=true';
const BITWARDEN_URL = 'https://vault.bitwarden.eu';
const STRATO_URL = 'https://webmail.strato.com/appsuite/';
const VERCEL_URL = 'https://vercel.com/login';
const MONEYBIRD_URL = 'https://moneybird.com/login';
const DUBLINE_URL = 'https://setup.dubline.nl/';

// Brand Logo Components
const VercelLogo = () => (
  <svg viewBox="0 0 76 65" className="w-5 h-5" fill="currentColor">
    <path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/>
  </svg>
);

export function TaskBoard() {
  // State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuickLinksOpen, setIsQuickLinksOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [editingColumn, setEditingColumn] = useState<TaskColumnType | null>(null);
  const [defaultColumnId, setDefaultColumnId] = useState<string>('');
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedColumn, setDraggedColumn] = useState<TaskColumnType | null>(null);
  const [customQuickLinks, setCustomQuickLinks] = useState<QuickLink[]>([]);
  const { theme } = useTheme();

  // Theme-based styles
  const themeStyles = {
    primaryBg: `rgb(${theme.colors.primary})`,
    primaryBgLight: `rgb(${theme.colors.primaryLight})`,
    primaryBgDark: `rgb(${theme.colors.primaryDark})`,
    primaryGlow: `rgba(${theme.colors.primaryGlow}, 0.3)`,
    accentBg: `rgb(${theme.colors.accent})`,
  };

  // Load custom quick links from localStorage
  useEffect(() => {
    const loadQuickLinks = () => {
      const stored = localStorage.getItem('taskboard-quicklinks');
      if (stored) {
        setCustomQuickLinks(JSON.parse(stored));
      }
    };
    loadQuickLinks();

    // Listen for storage changes (when settings are updated)
    const handleStorage = () => loadQuickLinks();
    window.addEventListener('storage', handleStorage);

    // Also reload when settings modal closes
    const interval = setInterval(loadQuickLinks, 1000);
    return () => {
      window.removeEventListener('storage', handleStorage);
      clearInterval(interval);
    };
  }, []);

  // Data hooks
  const { data: columns = [], isLoading: columnsLoading, error: columnsError } = useColumns();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks();
  const { data: friends = [] } = useFriends();

  // Mutation hooks
  const addColumnMutation = useAddColumn();
  const updateColumnMutation = useUpdateColumn();
  const deleteColumnMutation = useDeleteColumn();
  const addTaskMutation = useAddTask();
  const updateTaskMutation = useUpdateTask();
  const moveTaskMutation = useMoveTask();
  const deleteTaskMutation = useDeleteTask();
  const reorderColumnsMutation = useReorderColumns();

  // Get tasks for a specific column
  const getColumnTasks = useCallback(
    (columnId: string) => {
      return tasks
        .filter((task) => task.column_id === columnId)
        .sort((a, b) => a.position - b.position);
    },
    [tasks]
  );

  // Handlers
  const handleAddTask = (columnId: string) => {
    setEditingTask(null);
    setDefaultColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setViewingTask(null); // Close detail panel when editing
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleViewTask = (task: Task) => {
    setViewingTask(task);
  };

  const handleUpdateTaskFromPanel = async (data: { id: string; checklist?: ChecklistItem[]; comments?: TaskComment[] }) => {
    await updateTaskMutation.mutateAsync(data);
    // Update the viewing task with new data
    if (viewingTask && viewingTask.id === data.id) {
      setViewingTask({
        ...viewingTask,
        ...(data.checklist && { checklist: data.checklist }),
        ...(data.comments && { comments: data.comments }),
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Weet je zeker dat je deze taak wilt verwijderen?')) return;
    await deleteTaskMutation.mutateAsync(taskId);
  };

  const handleTaskSubmit = async (data: { title: string; description: string; priority: TaskPriority; column_id: string; assignee_ids: string[]; attachments: TaskAttachment[]; checklist: ChecklistItem[]; comments: TaskComment[] }) => {
    if (editingTask) {
      await updateTaskMutation.mutateAsync({ id: editingTask.id, ...data });
    } else {
      await addTaskMutation.mutateAsync(data);
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleAddColumn = () => {
    setEditingColumn(null);
    setIsColumnModalOpen(true);
  };

  const handleEditColumn = (column: TaskColumnType) => {
    setEditingColumn(column);
    setIsColumnModalOpen(true);
  };

  const handleDeleteColumn = async (columnId: string) => {
    const columnTasks = getColumnTasks(columnId);
    if (columnTasks.length > 0) {
      alert('Verwijder eerst alle taken uit deze kolom.');
      return;
    }
    if (!confirm('Weet je zeker dat je deze kolom wilt verwijderen?')) return;
    await deleteColumnMutation.mutateAsync(columnId);
  };

  const handleColumnSubmit = async (data: { name: string; color: string }) => {
    if (editingColumn) {
      await updateColumnMutation.mutateAsync({ id: editingColumn.id, ...data });
    } else {
      await addColumnMutation.mutateAsync(data.name);
    }
    setIsColumnModalOpen(false);
    setEditingColumn(null);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, columnId: string, targetIndex?: number) => {
    e.preventDefault();
    if (!draggedTask) return;

    const columnTasks = getColumnTasks(columnId);
    const currentIndex = columnTasks.findIndex(t => t.id === draggedTask.id);
    const isSameColumn = draggedTask.column_id === columnId;

    // Calculate the new position
    let newPosition = targetIndex !== undefined ? targetIndex : columnTasks.length;

    // If reordering within the same column, adjust position
    if (isSameColumn && currentIndex !== -1) {
      // If moving down, the position needs adjustment since we're removing the item first
      if (currentIndex < newPosition) {
        newPosition = Math.max(0, newPosition - 1);
      }

      // Don't move if dropping in the same position
      if (currentIndex === newPosition) {
        setDraggedTask(null);
        return;
      }
    }

    await moveTaskMutation.mutateAsync({
      taskId: draggedTask.id,
      newColumnId: columnId,
      newPosition,
    });

    setDraggedTask(null);
  };

  // Column drag and drop handlers
  const handleColumnDragStart = (e: React.DragEvent, column: TaskColumnType) => {
    setDraggedColumn(column);
    e.dataTransfer.effectAllowed = 'move';
    // Add a custom data type to distinguish from task drag
    e.dataTransfer.setData('text/column', column.id);
  };

  const handleColumnDragOver = (e: React.DragEvent, targetColumn: TaskColumnType) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn.id === targetColumn.id) return;
    e.dataTransfer.dropEffect = 'move';
  };

  const handleColumnDrop = async (e: React.DragEvent, targetColumn: TaskColumnType) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn.id === targetColumn.id) {
      setDraggedColumn(null);
      return;
    }

    // Calculate new positions for all columns
    const currentIndex = columns.findIndex((c) => c.id === draggedColumn.id);
    const targetIndex = columns.findIndex((c) => c.id === targetColumn.id);

    const newColumns = [...columns];
    newColumns.splice(currentIndex, 1);
    newColumns.splice(targetIndex, 0, draggedColumn);

    // Update positions
    const updates = newColumns.map((col, index) => ({
      id: col.id,
      position: index,
    }));

    await reorderColumnsMutation.mutateAsync(updates);
    setDraggedColumn(null);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
  };

  // Loading state
  if (columnsLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: themeStyles.primaryBg, borderTopColor: 'transparent' }}
          />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (columnsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="p-4 rounded-full bg-red-500/10 w-fit mx-auto">
            <Zap className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Verbinding mislukt</h2>
          <p className="text-muted-foreground">
            Kan geen verbinding maken met de database. Voer eerst de migratie uit.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src="/logo.jpeg"
                    alt="TechTable Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">TechTable</h1>
                  <p className="text-xs text-muted-foreground">Takenbord</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {/* Quick Links Dropdown */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setIsQuickLinksOpen(!isQuickLinksOpen)}
                    className="h-10 w-10 rounded-xl border-0 transition-all p-0 hover:opacity-90"
                    style={{
                      background: `linear-gradient(135deg, ${themeStyles.primaryBg}, ${themeStyles.accentBg})`,
                    }}
                    title="Apps"
                  >
                    <Grid3X3 className="w-5 h-5 text-white" />
                  </Button>

                  {/* Dropdown Menu */}
                  {isQuickLinksOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsQuickLinksOpen(false)}
                      />
                      <div className="absolute right-0 top-12 z-50 bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl p-4 min-w-[200px]">
                        <p className="text-xs text-zinc-500 mb-3 px-1">Snelkoppelingen</p>
                        <div className="grid grid-cols-3 gap-3">
                          {/* Bitwarden */}
                          <a
                            href={BITWARDEN_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsQuickLinksOpen(false)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
                              <Image
                                src="/afbeeldingen/Bitwarden.avif"
                                alt="Bitwarden"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-zinc-400 group-hover:text-white">Bitwarden</span>
                          </a>

                          {/* Strato */}
                          <a
                            href={STRATO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsQuickLinksOpen(false)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
                              <Image
                                src="/afbeeldingen/Strato.jpg"
                                alt="Strato"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-zinc-400 group-hover:text-white">Strato</span>
                          </a>

                          {/* Vercel */}
                          <a
                            href={VERCEL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsQuickLinksOpen(false)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                          >
                            <div className="w-10 h-10 flex items-center justify-center bg-black border border-zinc-700 rounded-xl text-white group-hover:scale-110 transition-transform">
                              <VercelLogo />
                            </div>
                            <span className="text-xs text-zinc-400 group-hover:text-white">Vercel</span>
                          </a>

                          {/* Moneybird */}
                          <a
                            href={MONEYBIRD_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsQuickLinksOpen(false)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
                              <Image
                                src="/afbeeldingen/Moneybird.png"
                                alt="Moneybird"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-zinc-400 group-hover:text-white">Moneybird</span>
                          </a>

                          {/* Dubline */}
                          <a
                            href={DUBLINE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => setIsQuickLinksOpen(false)}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                          >
                            <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
                              <Image
                                src="/afbeeldingen/dubline.png"
                                alt="Dubline"
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-zinc-400 group-hover:text-white">Dubline</span>
                          </a>

                          {/* Custom Quick Links */}
                          {customQuickLinks.map((link) => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => setIsQuickLinksOpen(false)}
                              className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-zinc-800 transition-colors group"
                            >
                              {link.image ? (
                                <div className="w-10 h-10 rounded-xl overflow-hidden group-hover:scale-110 transition-transform">
                                  <Image
                                    src={link.image}
                                    alt={link.name}
                                    width={40}
                                    height={40}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div
                                  className="w-10 h-10 flex items-center justify-center rounded-xl text-white group-hover:scale-110 transition-transform"
                                  style={{ backgroundColor: link.color }}
                                >
                                  <ExternalLink className="w-5 h-5" />
                                </div>
                              )}
                              <span className="text-xs text-zinc-400 group-hover:text-white truncate max-w-[60px]">{link.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Financieel Link */}
                <Link href="/financieel">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all"
                  >
                    <Table2 className="w-5 h-5 mr-2 text-green-400" />
                    <span className="hidden sm:inline">Financieel</span>
                  </Button>
                </Link>

                {/* Te Laat Link */}
                <Link href="/te-laat">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all"
                  >
                    <Clock className="w-5 h-5 mr-2" style={{ color: themeStyles.primaryBgLight }} />
                    <span className="hidden sm:inline">Te Laat</span>
                  </Button>
                </Link>

                {/* Settings */}
                <Button
                  variant="ghost"
                  onClick={() => setIsSettingsOpen(true)}
                  className="h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 transition-all p-0"
                >
                  <Settings className="w-5 h-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Board */}
        <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {columns.length === 0 ? (
            // Empty state
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="p-6 rounded-full bg-white/5 mb-6">
                <Plus className="w-12 h-12" style={{ color: themeStyles.primaryBgLight }} />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Geen kolommen nog</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Voeg je eerste kolom toe om te beginnen met het organiseren van taken!
              </p>
              <Button
                onClick={handleAddColumn}
                size="lg"
                className="border-0 hover:opacity-90"
                style={{ backgroundColor: themeStyles.primaryBg }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Eerste kolom toevoegen
              </Button>
            </div>
          ) : (
            // Board with columns
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column) => (
                <TaskColumn
                  key={column.id}
                  column={column}
                  tasks={getColumnTasks(column.id)}
                  friends={friends}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                  onViewTask={handleViewTask}
                  onDeleteTask={handleDeleteTask}
                  onEditColumn={handleEditColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onColumnDragStart={handleColumnDragStart}
                  onColumnDragOver={handleColumnDragOver}
                  onColumnDrop={handleColumnDrop}
                  onColumnDragEnd={handleColumnDragEnd}
                  isDraggingColumn={draggedColumn?.id === column.id}
                  draggedTask={draggedTask}
                />
              ))}

              {/* Add Column Card */}
              <div className="min-w-[280px] flex items-center justify-center">
                <Button
                  variant="ghost"
                  onClick={handleAddColumn}
                  className="h-auto py-8 px-6 border-2 border-dashed border-zinc-700 rounded-2xl transition-all bg-zinc-800/50 hover:border-opacity-100"
                  style={{
                    ['--hover-border' as string]: themeStyles.primaryBg,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = themeStyles.primaryBg;
                    e.currentTarget.style.backgroundColor = `rgba(${theme.colors.primary}, 0.05)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '';
                    e.currentTarget.style.backgroundColor = '';
                  }}
                >
                  <Plus className="w-6 h-6 mr-2 text-white" />
                  <span className="text-white font-medium">Kolom toevoegen</span>
                </Button>
              </div>
            </div>
          )}

          {/* Sales Team Section */}
          <SalesTeamSection />
        </main>

        {/* Footer */}
        <footer className="border-t border-white/5 py-6 mt-auto">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-muted-foreground">
              TechTable - Beheer je projecten en taken
            </p>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleTaskSubmit}
        columns={columns}
        friends={friends}
        task={editingTask}
        defaultColumnId={defaultColumnId}
        isSubmitting={addTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <ColumnModal
        isOpen={isColumnModalOpen}
        onClose={() => {
          setIsColumnModalOpen(false);
          setEditingColumn(null);
        }}
        onSubmit={handleColumnSubmit}
        column={editingColumn}
        isSubmitting={addColumnMutation.isPending || updateColumnMutation.isPending}
      />

      <TaskBoardSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Task Detail Panel */}
      {viewingTask && (
        <TaskDetailPanel
          task={viewingTask}
          column={columns.find((c) => c.id === viewingTask.column_id)}
          friends={friends}
          isOpen={!!viewingTask}
          onClose={() => setViewingTask(null)}
          onEdit={handleEditTask}
          onUpdateTask={handleUpdateTaskFromPanel}
        />
      )}
    </>
  );
}
