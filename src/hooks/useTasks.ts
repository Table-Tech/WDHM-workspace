'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hasValidCredentials, supabase } from '@/lib/supabase';
import type { Task, TaskColumn, TaskFormData, TaskAttachment, ChecklistItem } from '@/types';

// Upload a file to task-attachments bucket
export async function uploadTaskAttachment(file: File): Promise<TaskAttachment> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `attachments/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('task-attachments')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('task-attachments')
    .getPublicUrl(filePath);

  return {
    id: fileName,
    name: file.name,
    url: publicUrl,
    type: file.type,
    size: file.size,
  };
}

// Delete a file from task-attachments bucket
export async function deleteTaskAttachment(attachmentId: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase.storage
    .from('task-attachments')
    .remove([`attachments/${attachmentId}`]);

  if (error) throw error;
}

// Fetch all columns
async function fetchColumns(): Promise<TaskColumn[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('task_columns')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Fetch all tasks
async function fetchTasks(): Promise<Task[]> {
  if (!hasValidCredentials) return [];

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('position', { ascending: true });

  if (error) throw error;
  return data || [];
}

// Add a new column
async function addColumn(name: string): Promise<TaskColumn> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Get max position
  const { data: columns } = await supabase
    .from('task_columns')
    .select('position')
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = columns?.[0]?.position ?? -1;

  const { data, error } = await supabase
    .from('task_columns')
    .insert({
      name: name.trim(),
      position: maxPosition + 1,
      color: '#6366f1',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Update a column
async function updateColumn(data: { id: string; name: string; color: string }): Promise<TaskColumn> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { data: column, error } = await supabase
    .from('task_columns')
    .update({
      name: data.name.trim(),
      color: data.color,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.id)
    .select()
    .single();

  if (error) throw error;
  return column;
}

// Delete a column
async function deleteColumn(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('task_columns')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Add a new task
async function addTask(data: TaskFormData): Promise<Task> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Get max position in column
  const { data: tasks } = await supabase
    .from('tasks')
    .select('position')
    .eq('column_id', data.column_id)
    .order('position', { ascending: false })
    .limit(1);

  const maxPosition = tasks?.[0]?.position ?? -1;

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title: data.title.trim(),
      description: data.description.trim() || null,
      priority: data.priority,
      column_id: data.column_id,
      position: maxPosition + 1,
      assignee_ids: data.assignee_ids || [],
      attachments: data.attachments || [],
      checklist: data.checklist || [],
      comments: data.comments || [],
    })
    .select()
    .single();

  if (error) throw error;
  return task;
}

// Update a task
async function updateTask(data: { id: string } & Partial<TaskFormData>): Promise<Task> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.description !== undefined) updateData.description = data.description.trim() || null;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.column_id !== undefined) updateData.column_id = data.column_id;
  if (data.assignee_ids !== undefined) updateData.assignee_ids = data.assignee_ids;
  if (data.attachments !== undefined) updateData.attachments = data.attachments;
  if (data.checklist !== undefined) updateData.checklist = data.checklist;
  if (data.comments !== undefined) updateData.comments = data.comments;

  const { data: task, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', data.id)
    .select()
    .single();

  if (error) throw error;
  return task;
}

// Move a task to a different column
async function moveTask(data: { taskId: string; newColumnId: string; newPosition: number }): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('tasks')
    .update({
      column_id: data.newColumnId,
      position: data.newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.taskId);

  if (error) throw error;
}

// Reorder tasks within a column
async function reorderTasks(updates: { id: string; position: number }[]): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Update each task position
  for (const update of updates) {
    const { error } = await supabase
      .from('tasks')
      .update({ position: update.position, updated_at: new Date().toISOString() })
      .eq('id', update.id);

    if (error) throw error;
  }
}

// Reorder columns
async function reorderColumns(updates: { id: string; position: number }[]): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  // Update each column position
  for (const update of updates) {
    const { error } = await supabase
      .from('task_columns')
      .update({ position: update.position, updated_at: new Date().toISOString() })
      .eq('id', update.id);

    if (error) throw error;
  }
}

// Move column to new position
async function moveColumn(data: { columnId: string; newPosition: number }): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('task_columns')
    .update({
      position: data.newPosition,
      updated_at: new Date().toISOString(),
    })
    .eq('id', data.columnId);

  if (error) throw error;
}

// Delete a task
async function deleteTask(id: string): Promise<void> {
  if (!hasValidCredentials) {
    throw new Error('Supabase is not configured.');
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Hooks

export function useColumns() {
  return useQuery({
    queryKey: ['task-columns'],
    queryFn: fetchColumns,
  });
}

export function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });
}

export function useAddColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-columns'] });
    },
  });
}

export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-columns'] });
    },
  });
}

export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-columns'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useAddTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderTasks,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

export function useReorderColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reorderColumns,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-columns'] });
    },
  });
}

export function useMoveColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-columns'] });
    },
  });
}
