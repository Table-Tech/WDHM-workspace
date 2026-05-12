'use client';

import { FolderPlus, Plus } from 'lucide-react';
import { DocsTreeItem } from './DocsTreeItem';
import { DocsSearch } from './DocsSearch';
import type { DocTreeNode } from '@/types/docs';

interface DocsSidebarProps {
  tree: DocTreeNode[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  expanded: Set<string>;
  activeId: string | null;
  onToggleExpand: (id: string) => void;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
  onCreatePage: () => void;
  onCreateFolder: () => void;
}

export function DocsSidebar({
  tree,
  searchQuery,
  onSearchChange,
  expanded,
  activeId,
  onToggleExpand,
  onSelect,
  onRename,
  onDelete,
  onCreatePage,
  onCreateFolder,
}: DocsSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <div className="p-3 border-b border-white/10">
        <DocsSearch value={searchQuery} onChange={onSearchChange} />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 min-h-0">
        {tree.length === 0 ? (
          <div className="text-center py-10 px-4 text-sm text-zinc-500">
            {searchQuery
              ? 'Geen resultaten gevonden.'
              : 'Nog geen documenten. Maak je eerste pagina aan.'}
          </div>
        ) : (
          tree.map((node) => (
            <DocsTreeItem
              key={node.id}
              node={node}
              level={0}
              expanded={expanded}
              activeId={activeId}
              onToggle={onToggleExpand}
              onSelect={onSelect}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <div className="p-2 border-t border-white/10 space-y-1.5 bg-black/30">
        <button
          onClick={onCreatePage}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.5)]"
        >
          <Plus className="w-4 h-4" />
          Nieuwe pagina
        </button>
        <button
          onClick={onCreateFolder}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-200 text-sm font-medium transition-all"
        >
          <FolderPlus className="w-4 h-4 text-purple-400" />
          Nieuwe folder
        </button>
      </div>
    </aside>
  );
}
