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

export type ArticleHeading = { id: string; label: string; level: 2 | 3 }

/** Adds anchors to the canonical H2/H3 markup produced by the article HTML sanitizer. */
export function getArticleContents(sanitizedHtml: string): { html: string; headings: ArticleHeading[] } {
  // Sanitized headings allow only an optional id; all other attributes have been removed.
  const pattern = /<(h[23])(?:\s+id="([^"]*)")?\s*>([\s\S]*?)<\/\1>/gi
  const validId = (value: string) => /^[A-Za-z][A-Za-z0-9_.:-]{0,120}$/.test(value)
  const reserved = new Set(['top', 'about-author', 'about-author-heading', 'article-contents'])
  const customIds = new Set([...sanitizedHtml.matchAll(pattern)].map(match => decodeHTML(match[2] || '')).filter(validId))
  const used = new Set(reserved)
  const headings: ArticleHeading[] = []
  const html = sanitizedHtml.replace(pattern, (_original, tag: string, rawId: string | undefined, inner: string) => {
    const label = decodeHTML(sanitizeHtml(inner, { allowedTags: [], allowedAttributes: {} })).replace(/\s+/g, ' ').trim()
    if (!label) return `<${tag}>${inner}</${tag}>`
    const customId = decodeHTML(rawId || '')
    const slug = label.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 72).replace(/-$/g, '') || 'heading'
    const preserveCustomId = validId(customId) && !reserved.has(customId) && !used.has(customId)
    const base = preserveCustomId ? customId : `section-${slug}`
    let id = base
    let suffix = 2
    while (used.has(id) || (!preserveCustomId && customIds.has(id))) id = `${base}-${suffix++}`
    used.add(id)
    headings.push({ id, label, level: tag.toLowerCase() === 'h2' ? 2 : 3 })
    return `<${tag} id="${id}">${inner}</${tag}>`
  })
  return { html, headings }
}
