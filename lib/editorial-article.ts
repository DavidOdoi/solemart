import 'server-only'
import { getArticleContents, type ArticleHeading } from './article-details.ts'
import { editorialPlainText, sanitizeCmsArticleHtml } from './cms-rich-text.ts'
import { isFaqHeading } from './rank-math-faq.ts'

export type ArticlePart = { kind: 'html'; html: string } | {
  kind: 'quick-answer'
  heading: ArticleHeading
  html: string
} | {
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
    if (!heading || !isFaqHeading(heading.label)) continue
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

/** Highlight only an explicitly named quick answer, never an unrelated first H3. */
function quickAnswerParts(parts: ArticlePart[], headings: ArticleHeading[]): ArticlePart[] {
  const heading = headings.find(item => item.level === 3)
  if (!heading || !/^(?:the\s+)?quick\s+answer(?:\s*[:—-].*)?$/i.test(heading.label)) return parts
  return parts.flatMap((part): ArticlePart[] => {
    if (part.kind !== 'html') return [part]
    const start = part.html.indexOf(`<h3 id="${heading.id}">`)
    if (start < 0) return [part]
    const bodyStart = part.html.indexOf('</h3>', start) + '</h3>'.length
    const remainder = part.html.slice(bodyStart)
    const next = remainder.search(/<h[2-6]\b/i)
    const end = next < 0 ? part.html.length : bodyStart + next
    const answer = part.html.slice(bodyStart, end)
    if (!editorialPlainText(answer)) return [part]
    return [
      ...(start > 0 ? [{ kind: 'html' as const, html: part.html.slice(0, start) }] : []),
      { kind: 'quick-answer', heading, html: answer },
      ...(end < part.html.length ? [{ kind: 'html' as const, html: part.html.slice(end) }] : []),
    ]
  })
}

export function getEditorialArticle(html: string, { quickAnswer = false }: { quickAnswer?: boolean } = {}) {
  const contents = getArticleContents(sanitizeCmsArticleHtml(html), [
    'comparison-answer', 'comparison-answer-heading', 'comparison-verdict', 'comparison-verdict-heading',
    'comparison-option-a', 'comparison-option-a-heading', 'comparison-option-b', 'comparison-option-b-heading',
  ])
  return {
    ...contents,
    // The allowlist emits bare table tags. Each table gets its own accessible
    // scroll region so a long table cannot widen the entire article on mobile.
    html: scrollableTables(contents.html),
    parts: quickAnswer ? quickAnswerParts(articleParts(contents.html, contents.headings), contents.headings) : articleParts(contents.html, contents.headings),
  }
}
