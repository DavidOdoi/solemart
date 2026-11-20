import 'server-only'
import { parseDocument, DomUtils } from 'htmlparser2'
import { sanitizeCmsArticleHtml } from './cms-rich-text.ts'
import { getArticleContents } from './article-details.ts'

/** Native WordPress Group blocks opt in explicitly; ordinary posts are unchanged. */
export function getBestGuideArticle(source: string) {
  const safe = sanitizeCmsArticleHtml(source)
  const document = parseDocument(safe)
  const marked = DomUtils.getElementsByTagName('div', document.children, false)
    .some(node => (node.attribs.class || '').split(/\s+/).includes('solemart-best-guide'))
  if (!marked) return null
  return getArticleContents(safe, ['best-guide-contents'])
}
