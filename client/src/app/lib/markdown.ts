import { marked } from 'marked';

marked.setOptions({ gfm: true, breaks: true });

export function renderMarkdown(content: string): string {
  if (!content) return '';
  return marked.parse(content, { async: false }) as string;
}
