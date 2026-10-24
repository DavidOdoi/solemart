import { sanitizeEditorialHtml } from '@/lib/cms-rich-text'

/** Sanitize at the rendering boundary as well as when building CMS view models. */
export function EditorialRichText({ value, className = '', plainFormat = 'paragraphs' }: {
  value: string
  className?: string
  plainFormat?: 'paragraphs' | 'list'
}) {
  const html = sanitizeEditorialHtml(value, plainFormat)
  return html ? <div className={`cms-rich-text ${className}`} dangerouslySetInnerHTML={{ __html: html }} /> : null
}
