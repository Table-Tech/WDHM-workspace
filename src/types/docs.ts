export type DocType = 'folder' | 'document';

export interface DocItem {
  id: string;
  title: string;
  type: DocType;
  parent_id: string | null;
  content: string;
  author: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface DocTreeNode extends DocItem {
  children: DocTreeNode[];
}

export interface DocTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  content: string;
  tags: string[];
}

export interface DocInsert {
  title: string;
  type: DocType;
  parent_id: string | null;
  content?: string;
  author?: string;
  tags?: string[];
}

export interface DocUpdate {
  id: string;
  title?: string;
  parent_id?: string | null;
  content?: string;
  author?: string;
  tags?: string[];
}
