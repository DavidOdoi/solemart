import 'server-only'
import { getArticleContents, type ArticleHeading } from './article-details.ts'
import { editorialPlainText, sanitizeCmsArticleHtml } from './cms-rich-text.ts'

type ArticlePart = { kind: 'html'; html: string } | {
  kind: 'faqs'
  heading: ArticleHeading
  introductionHtml: string
  faqs: { id: string; question: string; answer: string; answerHtml: string }[]
}

function scrollableTables(html: string) {
  return html.replace(/<table>/g, '<div class="comparison-table-scroll" role="region" aria-label="Comparison table" tabindex="0"><table>')
    .replace(/<\/table>/g, '</table></div>')
}

/** Standard Gutenberg H2 / H3 / paragraph blocks need no separate FAQ fields. */
function articleParts(html: string, headings: ArticleHeading[]): ArticlePart[] {
  const parts: ArticlePart[] = []
  let cursor = 0
  // getArticleContents emits canonical, allowlisted headings with safe IDs.
  const sections = /<h2 id="([^"]+)">[\s\S]*?<\/h2>([\s\S]*?)(?=<h2\b|$)/g
  for (const section of html.matchAll(sections)) {
    const heading = headings.find(item => item.id === section[1])
    if (!heading || !/^(?:frequently asked questions|faqs?)$/i.test(heading.label.trim())) continue
    const questions = [...section[2].matchAll(/<h3 id="([^"]+)">([\s\S]*?)<\/h3>([\s\S]*?)(?=<h3\b|$)/g)]
    if (!questions.length || questions.some(question => !editorialPlainText(question[2]) || !editorialPlainText(question[3]))) continue
    if (section.index! > cursor) parts.push({ kind: 'html', html: scrollableTables(html.slice(cursor, section.index)) })
    parts.push({
      kind: 'faqs', heading,
      introductionHtml: section[2].slice(0, questions[0].index),
      faqs: questions.map(question => ({ id: question[1], question: editorialPlainText(question[2]), answer: editorialPlainText(question[3]), answerHtml: question[3] })),
    })
    cursor = section.index! + section[0].length
  }
  if (cursor < html.length) parts.push({ kind: 'html', html: scrollableTables(html.slice(cursor)) })
  return parts
}

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
    html: scrollableTables(contents.html),
    parts: articleParts(contents.html, contents.headings),
  }
}
