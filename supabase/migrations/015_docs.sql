-- Docs / Knowledge Hub
-- Stores folders and documents with markdown content for the team wiki.

CREATE TABLE IF NOT EXISTS docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('folder', 'document')),
  parent_id UUID REFERENCES docs(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  author TEXT DEFAULT '',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_parent ON docs(parent_id);
CREATE INDEX IF NOT EXISTS idx_docs_type ON docs(type);

ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to docs" ON docs FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE docs;

-- Seed default folder/document structure (only when empty)
INSERT INTO docs (id, title, type, parent_id, content, author, tags)
SELECT
  gen_random_uuid(),
  v.title,
  v.type,
  NULL,
  v.content,
  v.author,
  v.tags
FROM (
  VALUES
    ('Development', 'folder', '', '', ARRAY[]::TEXT[]),
    ('Klanten', 'folder', '', '', ARRAY[]::TEXT[]),
    ('Sales', 'folder', '', '', ARRAY[]::TEXT[]),
    ('Hosting', 'folder', '', '', ARRAY[]::TEXT[]),
    ('Finance', 'folder', '', '', ARRAY[]::TEXT[])
) AS v(title, type, content, author, tags)
WHERE NOT EXISTS (SELECT 1 FROM docs);
