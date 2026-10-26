import 'server-only'
import { getEditorialArticle } from './editorial-article.ts'

/** These calls to action lead to our editorial guides, rather than retailer URLs. */
export function comparisonGuideHref(value?: string): string | undefined {
  if (!value || value !== value.trim() || /[\\\u0000-\u0020\u007f]/.test(value) || !value.startsWith('/') || value.startsWith('//')) return undefined
  try {
    const url = new URL(value, 'https://thesolemart.com')
    return url.origin === 'https://thesolemart.com' ? value : undefined
  } catch { return undefined }
}

export function comparisonArticle(html: string) {
  return getEditorialArticle(html)
}
