import 'server-only'
import { getArticleContents } from './article-details.ts'
import { sanitizeCmsArticleHtml } from './cms-rich-text.ts'

/** These calls to action lead to our editorial guides, rather than retailer URLs. */
export function comparisonGuideHref(value?: string): string | undefined {
  if (!value || value !== value.trim() || /[\\\u0000-\u0020\u007f]/.test(value) || !value.startsWith('/') || value.startsWith('//')) return undefined
  try {
    const url = new URL(value, 'https://thesolemart.com')
    return url.origin === 'https://thesolemart.com' ? value : undefined
  } catch { return undefined }
}

export function comparisonArticle(html: string) {
  const contents = getArticleContents(sanitizeCmsArticleHtml(html), [
    'comparison-answer', 'comparison-answer-heading', 'comparison-verdict', 'comparison-verdict-heading',
    'comparison-option-a', 'comparison-option-a-heading', 'comparison-option-b', 'comparison-option-b-heading',
  ])
  return {
    ...contents,
    // The allowlist emits bare table tags. Each table gets its own accessible
    // scroll region so a long table cannot widen the entire article on mobile.
    html: contents.html.replace(/<table>/g, '<div class="comparison-table-scroll" role="region" aria-label="Comparison table" tabindex="0"><table>')
      .replace(/<\/table>/g, '</table></div>'),
  }
}
