'use client';

import { useState } from 'react';
import { X, FileText, Rocket, Users, Calendar, Bug, FileSignature, Folder, type LucideIcon } from 'lucide-react';
import { DOC_TEMPLATES } from '@/lib/docsMockData';
import type { DocTemplate, DocItem } from '@/types/docs';

const ICON_MAP: Record<string, LucideIcon> = {
  FileText,
  Rocket,
  Users,
  Calendar,
  Bug,
  FileSignature,
};

interface DocsTemplatesModalProps {
  onClose: () => void;
  onSelect: (data: { template: DocTemplate; parentId: string | null }) => void;
  folders: DocItem[];
  defaultParentId: string | null;
}

export function DocsTemplatesModal({
  onClose,
  onSelect,
  folders,
  defaultParentId,
}: DocsTemplatesModalProps) {
  const [parentId, setParentId] = useState<string | null>(defaultParentId);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div>
            <h2 className="text-lg font-bold text-white">Kies een template</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Begin sneller met een kant-en-klare structuur.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="px-6 py-3 border-b border-white/10 bg-black/20">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-300 mb-1.5">
            <Folder className="w-3.5 h-3.5 text-purple-400" />
            Plaatsen in
          </label>
          <select
            value={parentId ?? ''}
            onChange={(e) => setParentId(e.target.value || null)}
            className="w-full h-10 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
          >
            <option value="">— Root (geen folder) —</option>
            {folders.map((f) => (
              <option key={f.id} value={f.id}>
                {f.title}
              </option>
            ))}
          </select>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DOC_TEMPLATES.map((tpl) => {
              const Icon = ICON_MAP[tpl.icon] ?? FileText;
              return (
                <button
                  key={tpl.id}
                  onClick={() => onSelect({ template: tpl, parentId })}
                  className="group text-left p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 border border-white/10 hover:border-purple-500/50 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 shrink-0 group-hover:bg-purple-500/25 transition-colors">
                      <Icon className="w-5 h-5 text-purple-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {tpl.description}
                      </p>
                      {tpl.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tpl.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-1.5 py-0.5 rounded-md bg-zinc-800 text-[10px] text-zinc-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
