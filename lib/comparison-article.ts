import 'server-only'
import { escapeAttribute, escapeText } from 'entities'
import type { BlogPost } from '../data/blog'
import type { ComparisonTemplateContent } from '../data/comparison-template'
import { sanitizeEditorialHtml } from './cms-rich-text.ts'
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

/** Use the existing /blog article layout without losing the draft's split fields. */
export function comparisonBlogPost({ post, fields }: ComparisonTemplateContent): BlogPost {
  const choices = [
    { name: fields.leftName, reason: fields.leftChooseIf, guide: fields.leftGuideUrl },
    { name: fields.rightName, reason: fields.rightChooseIf, guide: fields.rightGuideUrl },
  ]
  const body = [
    sanitizeEditorialHtml(post.excerpt),
    ...(fields.quickAnswer ? ['<h3>The quick answer</h3>', sanitizeEditorialHtml(fields.quickAnswer)] : []),
    '<h2>Choose by your main use</h2>',
    ...choices.map(choice => {
      const href = comparisonGuideHref(choice.guide)
      return `<h3>${escapeText(choice.name)}</h3>${sanitizeEditorialHtml(choice.reason)}${href ? `<p><a href="${escapeAttribute(href)}">Explore ${escapeText(choice.name.toLowerCase())}</a></p>` : ''}`
    }),
    post.contentHtml ?? post.paragraphs.map(paragraph => sanitizeEditorialHtml(paragraph)).join('\n'),
    ...(fields.finalVerdict ? ['<h2>Final verdict</h2>', sanitizeEditorialHtml(fields.finalVerdict)] : []),
  ]
  return { ...post, contentHtml: body.join('\n') }
}
