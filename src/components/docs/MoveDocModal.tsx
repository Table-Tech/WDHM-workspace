'use client';

import { useState } from 'react';
import { X, Folder, Check } from 'lucide-react';
import type { DocItem } from '@/types/docs';

interface MoveDocModalProps {
  onClose: () => void;
  item: DocItem;
  folders: DocItem[];
  onConfirm: (parentId: string | null) => void;
}

export function MoveDocModal({ onClose, item, folders, onConfirm }: MoveDocModalProps) {
  const [selected, setSelected] = useState<string | null>(item.parent_id);

  const isUnchanged = selected === item.parent_id;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white">Verplaatsen</h2>
            <p className="text-xs text-zinc-500 mt-0.5 truncate">{item.title}</p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-3 max-h-[50vh] overflow-y-auto">
          <button
            onClick={() => setSelected(null)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors ${
              selected === null
                ? 'bg-purple-500/15 border border-purple-500/40'
                : 'hover:bg-white/5 border border-transparent'
            }`}
          >
            <span className="flex items-center gap-2 text-sm text-zinc-200">
              <Folder className="w-4 h-4 text-zinc-500" />
              <span className="italic">Root (geen folder)</span>
            </span>
            {selected === null && <Check className="w-4 h-4 text-purple-300" />}
          </button>

          {folders.length === 0 ? (
            <p className="text-xs text-zinc-500 px-3 py-3 italic">
              Geen geldige doel-folders beschikbaar.
            </p>
          ) : (
            folders.map((f) => (
              <button
                key={f.id}
                onClick={() => setSelected(f.id)}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-colors ${
                  selected === f.id
                    ? 'bg-purple-500/15 border border-purple-500/40'
                    : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <span className="flex items-center gap-2 text-sm text-zinc-200">
                  <Folder className="w-4 h-4 text-purple-400" />
                  <span className="truncate">{f.title}</span>
                </span>
                {selected === f.id && <Check className="w-4 h-4 text-purple-300" />}
              </button>
            ))
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 px-6 py-3 border-t border-white/10 bg-black/40">
          <button
            onClick={onClose}
            className="h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
          >
            Annuleren
          </button>
          <button
            onClick={() => onConfirm(selected)}
            disabled={isUnchanged}
            className="h-9 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] disabled:shadow-none"
          >
            Verplaatsen
          </button>
        </footer>
      </div>
    </div>
  );
}
