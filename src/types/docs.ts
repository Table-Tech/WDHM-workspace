export type DocType = 'folder' | 'document';

export interface DocItem {
  id: string;
  title: string;
  type: DocType;
  parentId: string | null;
  content?: string;
  author?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
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
