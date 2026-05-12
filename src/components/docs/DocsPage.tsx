'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, BookOpen, FileText, Menu, X } from 'lucide-react';
import { DocsSidebar } from './DocsSidebar';
import { DocsViewer } from './DocsViewer';
import { DocsEditor } from './DocsEditor';
import { DocsTemplatesModal } from './DocsTemplatesModal';
import { DEFAULT_DOCS } from '@/lib/docsMockData';
import type { DocItem, DocTreeNode, DocTemplate } from '@/types/docs';

function buildTree(items: DocItem[]): DocTreeNode[] {
  const map = new Map<string, DocTreeNode>();
  items.forEach((it) => map.set(it.id, { ...it, children: [] }));

  const roots: DocTreeNode[] = [];
  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)!.children.push(node);
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
    while (cur && cur.parentId) {
      expanded.add(cur.parentId);
      cur = map.get(cur.parentId);
    }
  });

  const prune = (nodes: DocTreeNode[]): DocTreeNode[] =>
    nodes
      .filter((n) => expanded.has(n.id))
      .map((n) => ({ ...n, children: prune(n.children) }));

  return prune(tree);
}

const STORAGE_KEY = 'techtable-docs-v1';
const EXPANDED_KEY = 'techtable-docs-expanded-v1';

const noopSubscribe = () => () => {};

const DEFAULT_EXPANDED = new Set<string>(
  DEFAULT_DOCS.filter((d) => d.type === 'folder').map((d) => d.id),
);

let cachedDocs: DocItem[] | null = null;
let cachedExpanded: Set<string> | null = null;

function readDocsFromStorage(): DocItem[] {
  if (cachedDocs) return cachedDocs;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedDocs = DEFAULT_DOCS;
      return cachedDocs;
    }
    const parsed = JSON.parse(raw) as DocItem[];
    cachedDocs = Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_DOCS;
    return cachedDocs;
  } catch {
    cachedDocs = DEFAULT_DOCS;
    return cachedDocs;
  }
}

function readExpandedFromStorage(): Set<string> {
  if (cachedExpanded) return cachedExpanded;
  try {
    const raw = localStorage.getItem(EXPANDED_KEY);
    if (raw) {
      cachedExpanded = new Set(JSON.parse(raw));
      return cachedExpanded;
    }
  } catch {
    // ignore
  }
  cachedExpanded = DEFAULT_EXPANDED;
  return cachedExpanded;
}

function readDocsServer(): DocItem[] {
  return DEFAULT_DOCS;
}

function readExpandedServer(): Set<string> {
  return DEFAULT_EXPANDED;
}

function persist(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function DocsPage() {
  const initialDocs = useSyncExternalStore(
    noopSubscribe,
    readDocsFromStorage,
    readDocsServer,
  );
  const initialExpanded = useSyncExternalStore(
    noopSubscribe,
    readExpandedFromStorage,
    readExpandedServer,
  );

  const [docs, setDocsState] = useState<DocItem[]>(initialDocs);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expanded, setExpandedState] = useState<Set<string>>(initialExpanded);
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const setDocs = (updater: DocItem[] | ((prev: DocItem[]) => DocItem[])) => {
    setDocsState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(STORAGE_KEY, next);
      return next;
    });
  };

  const setExpanded = (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setExpandedState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      persist(EXPANDED_KEY, Array.from(next));
      return next;
    });
  };

  const tree = useMemo(() => buildTree(docs), [docs]);
  const filteredTree = useMemo(
    () => filterTree(tree, searchQuery, docs),
    [tree, searchQuery, docs],
  );

  const activeDoc = activeId ? docs.find((d) => d.id === activeId) ?? null : null;

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => {
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

  const handleRename = (id: string) => {
    const item = docs.find((d) => d.id === id);
    if (!item) return;
    const newName = window.prompt('Nieuwe naam:', item.title);
    if (!newName || !newName.trim()) return;
    setDocs((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, title: newName.trim(), updatedAt: new Date().toISOString() } : d,
      ),
    );
  };

  const handleDelete = (id: string) => {
    const item = docs.find((d) => d.id === id);
    if (!item) return;
    const childIds = new Set<string>();
    const collect = (parentId: string) => {
      docs.forEach((d) => {
        if (d.parentId === parentId) {
          childIds.add(d.id);
          collect(d.id);
        }
      });
    };
    collect(id);

    const target = item.type === 'folder' ? 'folder en alle inhoud' : 'document';
    if (!confirm(`Weet je zeker dat je deze ${target} wilt verwijderen?`)) return;

    setDocs((prev) => prev.filter((d) => d.id !== id && !childIds.has(d.id)));
    if (activeId && (activeId === id || childIds.has(activeId))) {
      setActiveId(null);
      setIsEditing(false);
    }
  };

  const handleSaveEdit = (data: { title: string; content: string; tags: string[] }) => {
    if (!activeDoc) return;
    const now = new Date().toISOString();
    setDocs((prev) =>
      prev.map((d) =>
        d.id === activeDoc.id
          ? { ...d, title: data.title, content: data.content, tags: data.tags, updatedAt: now }
          : d,
      ),
    );
    setIsEditing(false);
  };

  const createDocument = (template?: DocTemplate) => {
    const now = new Date().toISOString();
    const id = `d-${Date.now()}`;
    let parentId: string | null = null;
    if (activeDoc) {
      parentId = activeDoc.parentId;
    } else if (tree.length > 0) {
      const firstFolder = tree.find((n) => n.type === 'folder');
      parentId = firstFolder?.id ?? null;
    }
    const newDoc: DocItem = {
      id,
      title: template ? template.name : 'Nieuwe pagina',
      type: 'document',
      parentId,
      content: template?.content ?? '# Nieuwe pagina\n\nSchrijf hier je content...\n',
      author: 'Damian',
      tags: template?.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };
    setDocs((prev) => [...prev, newDoc]);
    if (parentId) {
      setExpanded((prev) => new Set([...prev, parentId!]));
    }
    setActiveId(id);
    setIsEditing(true);
    setTemplatesOpen(false);
  };

  const handleCreatePage = () => {
    setTemplatesOpen(true);
  };

  const handleCreateFolder = () => {
    const name = window.prompt('Naam van de folder:');
    if (!name || !name.trim()) return;
    const now = new Date().toISOString();
    const id = `f-${Date.now()}`;
    const newFolder: DocItem = {
      id,
      title: name.trim(),
      type: 'folder',
      parentId: null,
      createdAt: now,
      updatedAt: now,
    };
    setDocs((prev) => [...prev, newFolder]);
    setExpanded((prev) => new Set([...prev, id]));
  };

  return (
    <>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/"
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  aria-label="Terug naar takenbord"
                >
                  <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </Link>
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
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400" />
                    <h1 className="text-xl font-bold text-white">Knowledge Hub</h1>
                  </div>
                  <p className="text-xs text-muted-foreground">Interne documentatie & handleidingen</p>
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

        <main className="flex-1 max-w-[1800px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

      <DocsTemplatesModal
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        onSelect={(tpl) => createDocument(tpl)}
      />
    </>
  );
}
