'use client';

import { Search, X } from 'lucide-react';

interface DocsSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DocsSearch({ value, onChange, placeholder = 'Zoek in docs...' }: DocsSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-9 rounded-xl bg-zinc-900/70 border border-zinc-700 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          aria-label="Zoekopdracht wissen"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
