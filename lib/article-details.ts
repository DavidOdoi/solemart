import { decodeHTML } from 'entities'
import sanitizeHtml from 'sanitize-html'

/** An approximate reading time, based only on visible article text at 220 words/minute. */
export function getReadingMinutes(html: string): number {
  const visible = sanitizeHtml(html, {
    allowedTags: ['p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'div', 'blockquote'],
    allowedAttributes: {},
  }).replace(/<[^>]*>/g, ' ')
  const words = decodeHTML(visible).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length || 0
  return Math.max(1, Math.ceil(words / 220))
}
