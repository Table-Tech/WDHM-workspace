'use client';

import { ChevronRight, Folder, FolderOpen, FileText, MoreVertical, Trash2, Pencil, FolderInput } from 'lucide-react';
import { useState } from 'react';
import type { DocTreeNode } from '@/types/docs';

interface DocsTreeItemProps {
  node: DocTreeNode;
  level: number;
  expanded: Set<string>;
  activeId: string | null;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onMove: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocsTreeItem({
  node,
  level,
  expanded,
  activeId,
  onToggle,
  onSelect,
  onRename,
  onMove,
  onDelete,
}: DocsTreeItemProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isFolder = node.type === 'folder';
  const isOpen = expanded.has(node.id);
  const isActive = activeId === node.id;

  const handleClick = () => {
    if (isFolder) {
      onToggle(node.id);
    } else {
      onSelect(node.id);
    }
  };

  return (
    <div>
      <div
        className={`group relative flex items-center gap-1.5 rounded-lg pr-1 transition-colors cursor-pointer ${
          isActive
            ? 'bg-purple-500/15 text-white'
            : 'hover:bg-white/5 text-zinc-300'
        }`}
        style={{ paddingLeft: `${level * 12 + 6}px` }}
      >
        {isActive && !isFolder && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r bg-purple-400" />
        )}
        <button
          onClick={handleClick}
          className="flex-1 flex items-center gap-1.5 py-1.5 text-left min-w-0"
        >
          {isFolder ? (
            <>
              <ChevronRight
                className={`w-3.5 h-3.5 shrink-0 text-zinc-500 transition-transform ${
                  isOpen ? 'rotate-90' : ''
                }`}
              />
              {isOpen ? (
                <FolderOpen className="w-4 h-4 shrink-0 text-purple-400" />
              ) : (
                <Folder className="w-4 h-4 shrink-0 text-purple-400" />
              )}
            </>
          ) : (
            <>
              <span className="w-3.5 shrink-0" />
              <FileText
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-purple-300' : 'text-zinc-500'
                }`}
              />
            </>
          )}
          <span
            className={`truncate text-sm ${
              isFolder ? 'font-medium text-zinc-200' : ''
            } ${isActive ? 'text-white font-medium' : ''}`}
          >
            {node.title}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
        >
          <MoreVertical className="w-3.5 h-3.5" />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-1 top-7 z-50 min-w-[140px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onRename(node.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                <Pencil className="w-3.5 h-3.5" />
                Hernoemen
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onMove(node.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                <FolderInput className="w-3.5 h-3.5" />
                Verplaatsen…
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(node.id);
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Verwijderen
              </button>
            </div>
          </>
        )}
      </div>

      {isFolder && isOpen && node.children.length > 0 && (
        <div className="mt-0.5">
          {node.children.map((child) => (
            <DocsTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              activeId={activeId}
              onToggle={onToggle}
              onSelect={onSelect}
              onRename={onRename}
              onMove={onMove}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
