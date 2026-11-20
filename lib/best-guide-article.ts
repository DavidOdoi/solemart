import 'server-only'
import { parseDocument, DomUtils } from 'htmlparser2'
import { sanitizeCmsArticleHtml } from './cms-rich-text.ts'
import { getArticleContents } from './article-details.ts'
import { nativeBestGuideHtml } from './native-best-guide.ts'
import { normalizeBestGuideActions } from './best-guide-actions.ts'

/** Accept the saved pattern or an ordinary WordPress buying-guide article. */
export function getBestGuideArticle(source: string, { title = '' }: { title?: string } = {}) {
  const safe = sanitizeCmsArticleHtml(source)
  const document = parseDocument(safe)
  const marked = DomUtils.getElementsByTagName('div', document.children, true)
    .some(node => (node.attribs.class || '').split(/\s+/).includes('solemart-best-guide'))
  const body = marked ? safe : nativeBestGuideHtml(safe, title)
  if (body === null) return null
  return getArticleContents(sanitizeCmsArticleHtml(normalizeBestGuideActions(body)), ['best-guide-contents'])
}
