import 'server-only'
import { escapeAttribute, escapeText } from 'entities'
import type { BlogPost } from '../data/blog'
import type { ComparisonTemplateContent } from '../data/comparison-template'
import { editorialPlainText, sanitizeEditorialHtml } from './cms-rich-text.ts'
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

/** Match the supplied reference flow while retaining every source section. */
function comparisonBody(html: string, choices: string) {
  const sections = html.split(/(?=<h2\b)/i).filter(section => section.trim())
  const groups = { table: [] as string[], details: [] as string[], checklist: [] as string[], sources: [] as string[], faqs: [] as string[] }
  for (const section of sections) {
    const heading = editorialPlainText(section.match(/^<h2\b[^>]*>([\s\S]*?)<\/h2>/i)?.[1] || '')
    if (/at a glance$/i.test(heading)) groups.table.push(section)
    else if (/^frequently asked questions$|^faqs?$/i.test(heading)) groups.faqs.push(section)
    else if (/^(?:sources and further reading|official resources and editorial approach)$/i.test(heading)) groups.sources.push(section)
    else if (/checklist|^a buying process|^how to evaluate a pair for both roles$|^check these features before comparing comfort$/i.test(heading)) groups.checklist.push(section)
    else groups.details.push(section)
  }
  return [...groups.table, ...groups.details, choices, ...groups.checklist, ...groups.sources, ...groups.faqs].join('\n')
}

/** Image placeholders are opt-in for previews, never a published CMS fallback. */
export function comparisonBlogPost({ post, fields }: ComparisonTemplateContent, { imagePlaceholders = false }: { imagePlaceholders?: boolean } = {}): BlogPost {
  const choices = [
    { name: fields.leftName, reason: fields.leftChooseIf, guide: fields.leftGuideUrl },
    { name: fields.rightName, reason: fields.rightChooseIf, guide: fields.rightGuideUrl },
  ]
  const choiceHtml = [
    '<h2>Which should you buy first?</h2>',
    ...choices.map(choice => {
      const href = comparisonGuideHref(choice.guide)
      return `<h3>${escapeText(choice.name)}</h3>${sanitizeEditorialHtml(choice.reason)}${href ? `<p><a href="${escapeAttribute(href)}">Explore ${escapeText(choice.name.toLowerCase())}</a></p>` : ''}`
    }),
  ].join('\n')
  const body = [
    sanitizeEditorialHtml(post.excerpt),
    ...(fields.quickAnswer ? [
      '<h3>Quick answer</h3>',
      ...(imagePlaceholders ? ['<figure><img src="/placeholder.svg" alt="Comparison image placeholder" width="1200" height="1200" /></figure>'] : []),
      sanitizeEditorialHtml(fields.quickAnswer),
    ] : []),
    comparisonBody(post.contentHtml ?? post.paragraphs.map(paragraph => sanitizeEditorialHtml(paragraph)).join('\n'), choiceHtml),
    ...(fields.finalVerdict ? ['<h2>Final verdict</h2>', sanitizeEditorialHtml(fields.finalVerdict)] : []),
  ]
  return {
    ...post,
    featuredImage: post.featuredImage ?? (imagePlaceholders ? {
      src: '/placeholder.svg', alt: 'Featured image placeholder', width: 1200, height: 1200,
    } : undefined),
    contentHtml: body.join('\n'),
  }
}
