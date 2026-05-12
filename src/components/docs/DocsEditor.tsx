'use client';

import { useState } from 'react';
import { Save, X, Eye, Edit3, Tag as TagIcon, Plus } from 'lucide-react';
import { MarkdownRenderer } from './MarkdownRenderer';
import type { DocItem } from '@/types/docs';

interface DocsEditorProps {
  doc: DocItem;
  onSave: (data: { title: string; content: string; tags: string[] }) => void;
  onCancel: () => void;
}

export function DocsEditor({ doc, onSave, onCancel }: DocsEditorProps) {
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content ?? '');
  const [tags, setTags] = useState<string[]>(doc.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const handleSave = () => {
    onSave({ title: title.trim() || 'Naamloos document', content, tags });
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <section className="h-full flex flex-col bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
      <header className="px-6 py-4 border-b border-white/10 bg-black/40 backdrop-blur space-y-3">
        <div className="flex items-start justify-between gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titel..."
            className="flex-1 min-w-0 bg-transparent text-2xl font-bold text-white placeholder:text-zinc-600 focus:outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setPreviewMode((v) => !v)}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
            >
              {previewMode ? (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Bewerken</span>
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Preview</span>
                </>
              )}
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-medium transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Annuleren</span>
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)]"
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Opslaan</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <TagIcon className="w-3.5 h-3.5 text-zinc-500" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-[11px] text-purple-200"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="hover:text-white"
                aria-label={`Verwijder tag ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <div className="inline-flex items-center gap-1">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Tag toevoegen..."
              className="h-6 px-2 rounded-md bg-zinc-900 border border-zinc-700 text-[11px] text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 w-32"
            />
            <button
              onClick={addTag}
              className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white transition-colors"
              aria-label="Tag toevoegen"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto min-h-0">
        {previewMode ? (
          <div className="px-6 py-6 max-w-3xl mx-auto">
            <MarkdownRenderer content={content} />
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="# Schrijf hier je content...&#10;&#10;Markdown wordt ondersteund: **bold**, *italic*, `code`, lists, # headings, [links](url), tabellen, en checkboxes ([ ] of [x])."
            className="w-full h-full min-h-100 px-6 py-6 bg-transparent text-zinc-200 placeholder:text-zinc-600 font-mono text-sm leading-relaxed focus:outline-none resize-none"
          />
        )}
      </div>
    </section>
  );
}
