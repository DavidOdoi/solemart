import 'server-only'

import { decodeHTML } from 'entities'
import sanitizeHtml from 'sanitize-html'

const siteHosts = new Set(['thesolemart.com', 'www.thesolemart.com'])
const fieldTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'a']
const articleTags = [...fieldTags, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 's', 'del', 'u', 'blockquote', 'pre', 'code', 'hr', 'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption', 'img', 'sup', 'sub', 'dl', 'dt', 'dd', 'span', 'div']

function links(retailerUrls: string[]) {
  const retailers = new Set(['amazon.com', 'amzn.to'])
  for (const value of retailerUrls) {
    try {
      const url = new URL(value)
      if (url.protocol === 'https:' && !url.username && !url.password && !siteHosts.has(url.hostname)) retailers.add(url.hostname.replace(/^www\./, ''))
    } catch { /* Invalid structured URLs must not influence editorial links. */ }
  }
  return (tagName: string, attributes: Record<string, string>): { tagName: string; attribs: Record<string, string> } => {
    const href = (attributes.href || '').trim()
    const title: Record<string, string> = attributes.title ? { title: attributes.title } : {}
    if (!href || /[\\\u0000-\u001f\u007f]/.test(href) || href.startsWith('//')) return { tagName, attribs: title }
    try {
      const url = new URL(href, 'https://thesolemart.com/')
      if (!['http:', 'https:', 'mailto:'].includes(url.protocol) || url.username || url.password) return { tagName, attribs: title }
      const web = ['http:', 'https:'].includes(url.protocol)
      const external = web && (!siteHosts.has(url.hostname) || Boolean(url.port))
      const retailer = web && [...retailers].some(host => url.hostname === host || url.hostname.endsWith(`.${host}`))
      const sponsored = retailer || (attributes.rel || '').split(/\s+/).includes('sponsored')
      if (sponsored) return { tagName, attribs: { ...title, href, target: '_blank', rel: 'sponsored nofollow noopener noreferrer' } }
      if (external) return { tagName, attribs: { ...title, href, target: '_blank', rel: 'noopener noreferrer' } }
      // Keep relative URLs, queries and fragment links exactly as entered.
      return { tagName, attribs: { ...title, href } }
    } catch { return { tagName, attribs: title } }
  }
}

function clean(value: string, article: boolean, retailerUrls: string[]) {
  return sanitizeHtml(value, {
    allowedTags: article ? articleTags : fieldTags,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      ...(article ? {
        h2: ['id'], h3: ['id'],
        img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
        th: ['scope', 'colspan', 'rowspan'], td: ['colspan', 'rowspan'],
      } : {}),
      ol: ['start', 'reversed'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    transformTags: {
      ...(article ? { h1: 'h2' } : { h1: 'p', h2: 'p', h3: 'p', h4: 'p', h5: 'p', h6: 'p' }),
      a: links(retailerUrls),
      ...(article ? { img: (tagName: string, attributes: Record<string, string>) => ({ tagName, attribs: { ...attributes, loading: 'lazy', decoding: 'async' } }) } : {}),
    },
  })
}

export function hasRichMarkup(value: string): boolean {
  return /<\/?[a-z][\s\S]*?>/i.test(value)
}

export function editorialPlainText(value: string): string {
  if (!hasRichMarkup(value)) return value.trim()
  const spaced = value.replace(/<br\s*\/?>|<\/li>/gi, '\n').replace(/<\/(?:p|div|h[1-6]|blockquote|tr)>/gi, '\n\n')
  return decodeHTML(sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} }))
    .replace(/\u00a0/g, ' ').split('\n').map(line => line.trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim()
}

function escapeText(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** The same boundary accepts old textarea strings and formatted ACF HTML. */
export function sanitizeEditorialHtml(value: string, plainFormat: 'paragraphs' | 'list' = 'paragraphs', retailerUrls: string[] = []): string {
  if (!value.trim()) return ''
  if (hasRichMarkup(value)) return clean(value, false, retailerUrls)
  const html = plainFormat === 'list'
    ? `<ul>${value.split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => `<li>${escapeText(line)}</li>`).join('')}</ul>`
    : value.trim().split(/\r?\n\s*\r?\n/).map(paragraph => `<p>${escapeText(paragraph).replace(/\r?\n/g, '<br />')}</p>`).join('')
  return clean(html, false, retailerUrls)
}

export function sanitizeCmsArticleHtml(value: string, retailerUrls: string[] = []): string {
  return clean(value, true, retailerUrls)
}
