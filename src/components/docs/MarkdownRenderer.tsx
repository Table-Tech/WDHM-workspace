'use client';

import { useState, type ReactNode } from 'react';
import { Check, Copy } from 'lucide-react';

type Token =
  | { type: 'h1' | 'h2' | 'h3' | 'h4'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }
  | { type: 'checklist'; items: { text: string; checked: boolean }[] }
  | { type: 'code'; lang: string; content: string }
  | { type: 'quote'; text: string }
  | { type: 'hr' }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'p'; text: string };

function tokenize(md: string): Token[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const tokens: Token[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const content: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        content.push(lines[i]);
        i++;
      }
      i++;
      tokens.push({ type: 'code', lang, content: content.join('\n') });
      continue;
    }

    if (line.startsWith('#### ')) {
      tokens.push({ type: 'h4', text: line.slice(5).trim() });
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      tokens.push({ type: 'h3', text: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      tokens.push({ type: 'h2', text: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      tokens.push({ type: 'h1', text: line.slice(2).trim() });
      i++;
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      tokens.push({ type: 'hr' });
      i++;
      continue;
    }

    if (line.startsWith('> ')) {
      tokens.push({ type: 'quote', text: line.slice(2) });
      i++;
      continue;
    }

    const checkboxMatch = line.match(/^[-*]\s\[( |x|X)\]\s+(.*)$/);
    if (checkboxMatch) {
      const items: { text: string; checked: boolean }[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^[-*]\s\[( |x|X)\]\s+(.*)$/);
        if (!m) break;
        items.push({ text: m[2], checked: m[1].toLowerCase() === 'x' });
        i++;
      }
      tokens.push({ type: 'checklist', items });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^[-*]\s+/, ''));
        i++;
      }
      tokens.push({ type: 'ul', items });
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      tokens.push({ type: 'ol', items });
      continue;
    }

    if (line.startsWith('|') && i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1])) {
      const headers = line.split('|').slice(1, -1).map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()));
        i++;
      }
      tokens.push({ type: 'table', headers, rows });
      continue;
    }

    const paragraph: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !lines[i].startsWith('#') &&
      !lines[i].startsWith('```') &&
      !/^[-*]\s+/.test(lines[i]) &&
      !/^\d+\.\s+/.test(lines[i]) &&
      !lines[i].startsWith('>') &&
      !lines[i].startsWith('|')
    ) {
      paragraph.push(lines[i]);
      i++;
    }
    tokens.push({ type: 'p', text: paragraph.join(' ') });
  }

  return tokens;
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex =
    /(\*\*([^*]+)\*\*)|(\*([^*]+)\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)]+)\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      nodes.push(
        <strong key={key++} className="font-semibold text-white">
          {match[2]}
        </strong>,
      );
    } else if (match[3]) {
      nodes.push(
        <em key={key++} className="italic">
          {match[4]}
        </em>,
      );
    } else if (match[5]) {
      nodes.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-[0.85em] font-mono text-purple-300"
        >
          {match[6]}
        </code>,
      );
    } else if (match[7]) {
      nodes.push(
        <a
          key={key++}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:text-purple-300 underline underline-offset-2"
        >
          {match[8]}
        </a>,
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

function CodeBlock({ lang, content }: { lang: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative my-4 group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border border-zinc-800 border-b-0 rounded-t-xl">
        <span className="text-[11px] uppercase tracking-wide text-zinc-500 font-mono">
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-0.5 rounded"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-400" />
              <span>Gekopieerd</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Kopiëren</span>
            </>
          )}
        </button>
      </div>
      <pre className="px-4 py-3 bg-black/60 border border-zinc-800 rounded-b-xl overflow-x-auto text-sm font-mono text-zinc-200">
        <code>{content}</code>
      </pre>
    </div>
  );
}

export function MarkdownRenderer({ content }: { content: string }) {
  const tokens = tokenize(content);

  return (
    <div className="space-y-3 text-zinc-300 leading-relaxed">
      {tokens.map((token, idx) => {
        switch (token.type) {
          case 'h1':
            return (
              <h1
                key={idx}
                className="text-3xl font-bold text-white pb-2 border-b border-white/10"
              >
                {renderInline(token.text)}
              </h1>
            );
          case 'h2':
            return (
              <h2 key={idx} className="text-2xl font-bold text-white mt-6">
                {renderInline(token.text)}
              </h2>
            );
          case 'h3':
            return (
              <h3 key={idx} className="text-xl font-semibold text-white mt-4">
                {renderInline(token.text)}
              </h3>
            );
          case 'h4':
            return (
              <h4 key={idx} className="text-lg font-semibold text-white mt-3">
                {renderInline(token.text)}
              </h4>
            );
          case 'p':
            return (
              <p key={idx} className="text-zinc-300">
                {renderInline(token.text)}
              </p>
            );
          case 'ul':
            return (
              <ul key={idx} className="list-disc list-outside pl-6 space-y-1">
                {token.items.map((item, i) => (
                  <li key={i} className="text-zinc-300">
                    {renderInline(item)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={idx} className="list-decimal list-outside pl-6 space-y-1">
                {token.items.map((item, i) => (
                  <li key={i} className="text-zinc-300">
                    {renderInline(item)}
                  </li>
                ))}
              </ol>
            );
          case 'checklist':
            return (
              <ul key={idx} className="space-y-1.5">
                {token.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-zinc-300">
                    <span
                      className={`mt-0.5 inline-flex w-4 h-4 items-center justify-center rounded border ${
                        item.checked
                          ? 'bg-purple-600 border-purple-500'
                          : 'border-zinc-600 bg-zinc-900'
                      }`}
                    >
                      {item.checked && <Check className="w-3 h-3 text-white" />}
                    </span>
                    <span className={item.checked ? 'line-through text-zinc-500' : ''}>
                      {renderInline(item.text)}
                    </span>
                  </li>
                ))}
              </ul>
            );
          case 'code':
            return <CodeBlock key={idx} lang={token.lang} content={token.content} />;
          case 'quote':
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-purple-500/60 pl-4 py-1 text-zinc-400 italic"
              >
                {renderInline(token.text)}
              </blockquote>
            );
          case 'hr':
            return <hr key={idx} className="border-white/10 my-4" />;
          case 'table':
            return (
              <div
                key={idx}
                className="overflow-x-auto rounded-xl border border-white/10 my-3"
              >
                <table className="w-full text-sm">
                  <thead className="bg-zinc-900/80">
                    <tr>
                      {token.headers.map((h, i) => (
                        <th
                          key={i}
                          className="text-left px-3 py-2 font-semibold text-white border-b border-white/10"
                        >
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {token.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-white/5 last:border-0">
                        {row.map((c, ci) => (
                          <td key={ci} className="px-3 py-2 text-zinc-300">
                            {renderInline(c)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
