'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Plus, Trash2, Check, GripVertical, Users, Phone, Search, Edit2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Types
interface SalesTask {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface SalesPerson {
  id: string;
  name: string;
  role: string;
  tasks: SalesTask[];
}

const STORAGE_KEY = 'techtable-sales-team';

// Default sales team members
const DEFAULT_SALES_TEAM: SalesPerson[] = [
  {
    id: 'silas',
    name: 'Silas',
    role: 'Sales',
    tasks: [
      { id: '1', text: 'Sales regelen en cold callings doen', completed: false, createdAt: new Date().toISOString() },
    ],
  },
  {
    id: 'kadir',
    name: 'Kadir',
    role: 'Sales',
    tasks: [
      { id: '2', text: 'Istanbul restaurant navragen', completed: false, createdAt: new Date().toISOString() },
    ],
  },
  {
    id: 'asmen',
    name: 'Asmen',
    role: 'Sales',
    tasks: [
      { id: '3', text: 'Sales - nog aan het zoeken net als Silas', completed: false, createdAt: new Date().toISOString() },
    ],
  },
];

export function SalesTeamSection() {
  const [salesTeam, setSalesTeam] = useState<SalesPerson[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [newTaskTexts, setNewTaskTexts] = useState<Record<string, string>>({});
  const [editingTask, setEditingTask] = useState<{ personId: string; taskId: string } | null>(null);
  const [editText, setEditText] = useState('');
  const [draggedTask, setDraggedTask] = useState<{ personId: string; task: SalesTask } | null>(null);
  const [dragOverPerson, setDragOverPerson] = useState<string | null>(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSalesTeam(parsed);
        } else {
          setSalesTeam(DEFAULT_SALES_TEAM);
        }
      } catch {
        setSalesTeam(DEFAULT_SALES_TEAM);
      }
    } else {
      setSalesTeam(DEFAULT_SALES_TEAM);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(salesTeam));
    }
  }, [salesTeam, isLoaded]);

  const addTask = (personId: string) => {
    const text = newTaskTexts[personId]?.trim();
    if (!text) return;

    setSalesTeam((prev) =>
      prev.map((person) =>
        person.id === personId
          ? {
              ...person,
              tasks: [
                ...person.tasks,
                {
                  id: Date.now().toString(),
                  text,
                  completed: false,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : person
      )
    );
    setNewTaskTexts((prev) => ({ ...prev, [personId]: '' }));
  };

  const toggleTask = (personId: string, taskId: string) => {
    setSalesTeam((prev) =>
      prev.map((person) =>
        person.id === personId
          ? {
              ...person,
              tasks: person.tasks.map((task) =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
              ),
            }
          : person
      )
    );
  };

  const deleteTask = (personId: string, taskId: string) => {
    setSalesTeam((prev) =>
      prev.map((person) =>
        person.id === personId
          ? {
              ...person,
              tasks: person.tasks.filter((task) => task.id !== taskId),
            }
          : person
      )
    );
  };

  const startEditTask = (personId: string, taskId: string, currentText: string) => {
    setEditingTask({ personId, taskId });
    setEditText(currentText);
  };

  const saveEditTask = () => {
    if (!editingTask || !editText.trim()) {
      setEditingTask(null);
      return;
    }

    setSalesTeam((prev) =>
      prev.map((person) =>
        person.id === editingTask.personId
          ? {
              ...person,
              tasks: person.tasks.map((task) =>
                task.id === editingTask.taskId ? { ...task, text: editText.trim() } : task
              ),
            }
          : person
      )
    );
    setEditingTask(null);
    setEditText('');
  };

  // Drag handlers
  const handleDragStart = (personId: string, task: SalesTask) => {
    setDraggedTask({ personId, task });
  };

  const handleDragOver = (e: React.DragEvent, personId: string) => {
    e.preventDefault();
    setDragOverPerson(personId);
  };

  const handleDragLeave = () => {
    setDragOverPerson(null);
  };

  const handleDrop = (e: React.DragEvent, targetPersonId: string) => {
    e.preventDefault();
    setDragOverPerson(null);

    if (!draggedTask || draggedTask.personId === targetPersonId) {
      setDraggedTask(null);
      return;
    }

    // Move task from source to target
    setSalesTeam((prev) => {
      const newTeam = prev.map((person) => {
        if (person.id === draggedTask.personId) {
          // Remove from source
          return {
            ...person,
            tasks: person.tasks.filter((t) => t.id !== draggedTask.task.id),
          };
        }
        if (person.id === targetPersonId) {
          // Add to target
          return {
            ...person,
            tasks: [...person.tasks, draggedTask.task],
          };
        }
        return person;
      });
      return newTeam;
    });

    setDraggedTask(null);
  };

  if (!isLoaded) {
    return (
      <div className="mt-8 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800">
        <div className="animate-pulse h-32 bg-zinc-800/50 rounded-xl" />
      </div>
    );
  }

  return (
    <section className="mt-8">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Sales Team</h2>
          <p className="text-xs text-zinc-500">Taken voor het sales team</p>
        </div>
      </div>

      {/* Sales Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {salesTeam.map((person) => (
          <div
            key={person.id}
            className={`bg-zinc-900/50 rounded-2xl border p-4 transition-all ${
              dragOverPerson === person.id
                ? 'border-blue-500 bg-blue-500/5'
                : 'border-zinc-800'
            }`}
            onDragOver={(e) => handleDragOver(e, person.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, person.id)}
          >
            {/* Person Header */}
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {person.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{person.name}</h3>
                <p className="text-xs text-zinc-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {person.role}
                </p>
              </div>
              <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                {person.tasks.length}
              </span>
            </div>

            {/* Tasks List */}
            <div className="space-y-2 mb-3 max-h-[300px] overflow-y-auto">
              {person.tasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => handleDragStart(person.id, task)}
                  className={`group flex items-start gap-2 p-2 rounded-lg border transition-all cursor-grab active:cursor-grabbing ${
                    task.completed
                      ? 'bg-zinc-800/30 border-zinc-800'
                      : 'bg-zinc-800/50 border-zinc-700 hover:border-zinc-600'
                  }`}
                >
                  <GripVertical className="w-4 h-4 text-zinc-600 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => toggleTask(person.id, task.id)}
                    className={`mt-0.5 shrink-0 w-4 h-4 rounded border transition-all flex items-center justify-center ${
                      task.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-zinc-600 hover:border-blue-500'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3 text-white" />}
                  </button>

                  {editingTask?.personId === person.id && editingTask?.taskId === task.id ? (
                    <div className="flex-1 flex items-center gap-1">
                      <Input
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEditTask();
                          if (e.key === 'Escape') setEditingTask(null);
                        }}
                        className="h-6 text-sm bg-zinc-900 border-zinc-700"
                        autoFocus
                      />
                      <button
                        onClick={saveEditTask}
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <Check className="w-3 h-3 text-green-400" />
                      </button>
                      <button
                        onClick={() => setEditingTask(null)}
                        className="p-1 hover:bg-zinc-700 rounded"
                      >
                        <X className="w-3 h-3 text-zinc-400" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span
                        className={`flex-1 text-sm ${
                          task.completed ? 'text-zinc-500 line-through' : 'text-white'
                        }`}
                      >
                        {task.text}
                      </span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditTask(person.id, task.id, task.text)}
                          className="p-1 hover:bg-zinc-700 rounded"
                        >
                          <Edit2 className="w-3 h-3 text-zinc-400" />
                        </button>
                        <button
                          onClick={() => deleteTask(person.id, task.id)}
                          className="p-1 hover:bg-zinc-700 rounded"
                        >
                          <Trash2 className="w-3 h-3 text-red-400" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {person.tasks.length === 0 && (
                <div className="text-center py-4 text-zinc-500 text-sm">
                  Geen taken
                </div>
              )}
            </div>

            {/* Add Task */}
            <div className="flex gap-2">
              <Input
                placeholder="Nieuwe taak..."
                value={newTaskTexts[person.id] || ''}
                onChange={(e) =>
                  setNewTaskTexts((prev) => ({ ...prev, [person.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addTask(person.id);
                }}
                className="h-8 text-sm bg-zinc-900 border-zinc-700"
              />
              <Button
                size="sm"
                onClick={() => addTask(person.id)}
                disabled={!newTaskTexts[person.id]?.trim()}
                className="h-8 px-2 bg-blue-600 hover:bg-blue-500"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
