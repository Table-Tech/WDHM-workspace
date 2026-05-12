'use client';

import { useState } from 'react';
import { Pencil, MoreVertical, Trash2, User, Clock, Tag, FileText } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { DocItem } from '@/types/docs';

interface DocsViewerProps {
  doc: DocItem;
  onEdit: () => void;
  onDelete: () => void;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function DocsViewer({ doc, onEdit, onDelete }: DocsViewerProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <article className="h-full flex flex-col bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <header className="sticky top-0 z-10 px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Document</span>
            </div>
            <h1 className="text-2xl font-bold text-white truncate">{doc.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-zinc-400">
              {doc.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  {doc.author}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-purple-400" />
                Laatst gewijzigd: {formatDate(doc.updated_at)}
              </span>
            </div>
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <Tag className="w-3.5 h-3.5 text-zinc-500" />
                {doc.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-[11px] text-purple-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              <Pencil className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-10 z-50 min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        onDelete();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-zinc-800"
                    >
                      <Trash2 className="w-4 h-4" />
                      Verwijderen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
        <div className="max-w-3xl mx-auto">
          {doc.content && doc.content.trim().length > 0 ? (
            <MarkdownRenderer content={doc.content} />
          ) : (
            <p className="text-zinc-500 italic">Dit document is nog leeg. Klik op Edit om te beginnen met schrijven.</p>
          )}
        </div>
      </div>
    </article>
  );
}
