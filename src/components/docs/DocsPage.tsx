'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen, FileText, Menu, X, Zap, Loader2 } from 'lucide-react';
import { DocsSidebar } from './DocsSidebar';
import { DocsViewer } from './DocsViewer';
import { DocsEditor } from './DocsEditor';
import { DocsTemplatesModal } from './DocsTemplatesModal';
import { MoveDocModal } from './MoveDocModal';
import { useDocs } from '@/hooks/useDocs';
import { hasValidCredentials } from '@/lib/supabase';
import type { DocItem, DocTreeNode, DocTemplate } from '@/types/docs';

function buildTree(items: DocItem[]): DocTreeNode[] {
  const map = new Map<string, DocTreeNode>();
  items.forEach((it) => map.set(it.id, { ...it, children: [] }));

  const roots: DocTreeNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortNodes = (nodes: DocTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.title.localeCompare(b.title, 'nl');
    });
    nodes.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);

  return roots;
}

function filterTree(tree: DocTreeNode[], query: string, allItems: DocItem[]): DocTreeNode[] {
  if (!query.trim()) return tree;
  const q = query.toLowerCase();

  const matchingIds = new Set<string>();
  allItems.forEach((item) => {
    const inTitle = item.title.toLowerCase().includes(q);
    const inTags = (item.tags ?? []).some((t) => t.toLowerCase().includes(q));
    const inContent = (item.content ?? '').toLowerCase().includes(q);
    if (inTitle || inTags || inContent) matchingIds.add(item.id);
  });

  if (matchingIds.size === 0) return [];

  const expanded = new Set<string>(matchingIds);
  const map = new Map<string, DocItem>();
  allItems.forEach((it) => map.set(it.id, it));
  matchingIds.forEach((id) => {
    let cur = map.get(id);
    while (cur && cur.parent_id) {
      expanded.add(cur.parent_id);
      cur = map.get(cur.parent_id);
    }
  });

  const prune = (nodes: DocTreeNode[]): DocTreeNode[] =>
    nodes
      .filter((n) => expanded.has(n.id))
      .map((n) => ({ ...n, children: prune(n.children) }));

  return prune(tree);
}

const EXPANDED_KEY = 'techtable-docs-expanded-v1';

const noopSubscribe = () => () => {};

let cachedExpanded: string[] | null = null;

function readExpandedFromStorage(): string[] {
  if (cachedExpanded) return cachedExpanded;
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    cachedExpanded = raw ? JSON.parse(raw) : [];
  } catch {
    cachedExpanded = [];
  }
  return cachedExpanded ?? [];
}

function readExpandedServer(): string[] {
  return [];
}

function persistExpanded(set: Set<string>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(EXPANDED_KEY, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

export function DocsPage() {
  const {
    docs,
    isLoading,
    isError,
    addDocAsync,
    updateDocAsync,
    deleteDocAsync,
  } = useDocs();

  const storedExpanded = useSyncExternalStore(
    noopSubscribe,
    readExpandedFromStorage,
    readExpandedServer,
  );

  // null = user hasn't touched the tree yet → auto-expand all folders.
  // Set = explicit user preference (may have been hydrated from localStorage).
  const [expandedOverride, setExpandedOverride] = useState<Set<string> | null>(() =>
    storedExpanded.length > 0 ? new Set(storedExpanded) : null,
  );

  const [activeId, setActiveId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [moveTargetId, setMoveTargetId] = useState<string | null>(null);

  const tree = useMemo(() => buildTree(docs), [docs]);
  const filteredTree = useMemo(
    () => filterTree(tree, searchQuery, docs),
    [tree, searchQuery, docs],
  );

  const expanded = useMemo(() => {
    if (expandedOverride !== null) return expandedOverride;
    return new Set(docs.filter((d) => d.type === 'folder').map((d) => d.id));
  }, [expandedOverride, docs]);

  const activeDoc = activeId ? docs.find((d) => d.id === activeId) ?? null : null;

  const updateExpanded = (updater: (prev: Set<string>) => Set<string>) => {
    setExpandedOverride((prev) => {
      const base = prev ?? new Set(docs.filter((d) => d.type === 'folder').map((d) => d.id));
      const next = updater(base);
      persistExpanded(next);
      return next;
    });
  };

  const handleToggleExpand = (id: string) => {
    updateExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelect = (id: string) => {
    const item = docs.find((d) => d.id === id);
    if (item && item.type === 'document') {
      setActiveId(id);
      setIsEditing(false);
      setSidebarOpenMobile(false);
    }
  };

  const handleRename = async (id: string) => {
    const item = docs.find((d) => d.id === id);
    if (!item) return;
    const newName = window.prompt('Nieuwe naam:', item.title);
    if (!newName || !newName.trim()) return;
    try {
      await updateDocAsync({ id, title: newName.trim() });
    } catch (err) {
      console.error('Rename failed:', err);
      alert('Hernoemen mislukt. Probeer opnieuw.');
    }
  };

  const handleDelete = async (id: string) => {
    const item = docs.find((d) => d.id === id);
    if (!item) return;
    const target = item.type === 'folder' ? 'folder en alle inhoud' : 'document';
    if (!confirm(`Weet je zeker dat je deze ${target} wilt verwijderen?`)) return;
    try {
      await deleteDocAsync(id);
      if (activeId === id) {
        setActiveId(null);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Verwijderen mislukt. Probeer opnieuw.');
    }
  };

  const handleSaveEdit = async (data: { title: string; content: string; tags: string[] }) => {
    if (!activeDoc) return;
    try {
      await updateDocAsync({
        id: activeDoc.id,
        title: data.title,
        content: data.content,
        tags: data.tags,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Opslaan mislukt. Probeer opnieuw.');
    }
  };

  const createDocument = async (template: DocTemplate, parentId: string | null) => {
    try {
      const created = await addDocAsync({
        title: template.name,
        type: 'document',
        parent_id: parentId,
        content: template.content ?? '# Nieuwe pagina\n\nSchrijf hier je content...\n',
        author: 'Damian',
        tags: template.tags ?? [],
      });
      if (parentId) {
        updateExpanded((prev) => new Set([...prev, parentId]));
      }
      setActiveId(created.id);
      setIsEditing(true);
      setTemplatesOpen(false);
    } catch (err) {
      console.error('Create failed:', err);
      alert('Aanmaken mislukt. Probeer opnieuw.');
    }
  };

  const handleCreatePage = () => {
    setTemplatesOpen(true);
  };

  const handleMove = (id: string) => {
    setMoveTargetId(id);
  };

  const moveTargetDoc = moveTargetId ? docs.find((d) => d.id === moveTargetId) ?? null : null;

  const moveValidFolders = useMemo(() => {
    if (!moveTargetDoc) return [];
    // Exclude the item itself and all its descendants (a folder can't move into its own subtree).
    const blocked = new Set<string>([moveTargetDoc.id]);
    let added = true;
    while (added) {
      added = false;
      for (const d of docs) {
        if (d.parent_id && blocked.has(d.parent_id) && !blocked.has(d.id)) {
          blocked.add(d.id);
          added = true;
        }
      }
    }
    return docs.filter((d) => d.type === 'folder' && !blocked.has(d.id));
  }, [docs, moveTargetDoc]);

  const handleMoveConfirm = async (newParentId: string | null) => {
    if (!moveTargetDoc) return;
    try {
      await updateDocAsync({ id: moveTargetDoc.id, parent_id: newParentId });
      if (newParentId) {
        updateExpanded((prev) => new Set([...prev, newParentId]));
      }
      setMoveTargetId(null);
    } catch (err) {
      console.error('Move failed:', err);
      alert('Verplaatsen mislukt. Probeer opnieuw.');
    }
  };

  const defaultCreateParentId: string | null = activeDoc
    ? activeDoc.parent_id
    : tree.find((n) => n.type === 'folder')?.id ?? null;

  const allFolders = useMemo(
    () => docs.filter((d) => d.type === 'folder'),
    [docs],
  );

  const handleCreateFolder = async () => {
    const name = window.prompt('Naam van de folder:');
    if (!name || !name.trim()) return;
    try {
      const created = await addDocAsync({
        title: name.trim(),
        type: 'folder',
        parent_id: null,
      });
      updateExpanded((prev) => new Set([...prev, created.id]));
    } catch (err) {
      console.error('Create folder failed:', err);
      alert('Folder aanmaken mislukt. Probeer opnieuw.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
          <p className="text-muted-foreground">Docs laden...</p>
        </div>
      </div>
    );
  }

  if (isError || !hasValidCredentials) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="p-4 rounded-full bg-red-500/10 w-fit mx-auto">
            <Zap className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Verbinding mislukt</h2>
          <p className="text-muted-foreground">
            {hasValidCredentials
              ? 'Kan de docs niet ophalen uit de database. Controleer of de migratie is uitgevoerd.'
              : 'Supabase is niet geconfigureerd. Stel NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in.'}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Terug naar takenbord
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="max-w-[1800px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Link
                  href="/"
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors shrink-0"
                  aria-label="Terug naar takenbord"
                >
                  <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </Link>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden shadow-lg shrink-0">
                  <Image
                    src="/logo.jpeg"
                    alt="TechTable Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400 shrink-0" />
                    <h1 className="text-base sm:text-xl font-bold text-white truncate">Knowledge Hub</h1>
                  </div>
                  <p className="hidden sm:block text-xs text-muted-foreground">Interne documentatie & handleidingen</p>
                </div>
              </div>

              <button
                onClick={() => setSidebarOpenMobile((v) => !v)}
                className="md:hidden h-10 w-10 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white flex items-center justify-center transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-[1800px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4 h-[calc(100vh-9rem)]">
            <div
              className={`${
                sidebarOpenMobile ? 'block' : 'hidden md:block'
              } h-full min-h-0`}
            >
              <DocsSidebar
                tree={filteredTree}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                expanded={expanded}
                activeId={activeId}
                onToggleExpand={handleToggleExpand}
                onSelect={handleSelect}
                onRename={handleRename}
                onMove={handleMove}
                onDelete={handleDelete}
                onCreatePage={handleCreatePage}
                onCreateFolder={handleCreateFolder}
              />
            </div>

            <div
              className={`${
                sidebarOpenMobile ? 'hidden md:block' : 'block'
              } h-full min-h-0`}
            >
              {!activeDoc ? (
                <div className="h-full flex items-center justify-center bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                  <div className="text-center px-6 py-12 max-w-md">
                    <div className="w-16 h-16 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-purple-300" />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      Selecteer een document
                    </h2>
                    <p className="text-sm text-zinc-400 mb-6">
                      Kies links een document om te bekijken, of maak een nieuwe pagina aan.
                    </p>
                    <button
                      onClick={handleCreatePage}
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors shadow-[0_0_20px_rgba(147,51,234,0.4)]"
                    >
                      <FileText className="w-4 h-4" />
                      Nieuwe pagina maken
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                <DocsEditor
                  key={activeDoc.id}
                  doc={activeDoc}
                  onSave={handleSaveEdit}
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <DocsViewer
                  doc={activeDoc}
                  onEdit={() => setIsEditing(true)}
                  onDelete={() => handleDelete(activeDoc.id)}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {templatesOpen && (
        <DocsTemplatesModal
          onClose={() => setTemplatesOpen(false)}
          folders={allFolders}
          defaultParentId={defaultCreateParentId}
          onSelect={({ template, parentId }) => createDocument(template, parentId)}
        />
      )}

      {moveTargetDoc && (
        <MoveDocModal
          onClose={() => setMoveTargetId(null)}
          item={moveTargetDoc}
          folders={moveValidFolders}
          onConfirm={handleMoveConfirm}
        />
      )}
    </>
  );
}
