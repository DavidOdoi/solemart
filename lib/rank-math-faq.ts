import 'server-only'
import { parseDocument, DomUtils } from 'htmlparser2'

type Node = ReturnType<typeof parseDocument>['children'][number]
type Element = ReturnType<typeof DomUtils.getElementsByTagName>[number]
const isElement = (node: Node): node is Element => node.type === 'tag' || node.type === 'script' || node.type === 'style'
const hasClass = (node: Node, names: string[]) => isElement(node) && (node.attribs.class || '').split(/\s+/).some(name => names.includes(name))
export const isFaqHeading = (text: string) => /^(?:frequently asked questions\b|faqs?\b)/i.test(text.trim())

/** Translate the plugin's published FAQ HTML before the normal allowlist runs.
 * Both its PHP renderer (list-item) and saved Gutenberg markup (faq-item) work.
 * Original WordPress content is never changed. This is not a sanitizer. */
export function normalizeRankMathFaq(html: string): string {
  if (!/rank-math-(?:block|faq)/i.test(html)) return html
  const document = parseDocument(html)
  const blocks = DomUtils.findAll(node => hasClass(node, ['rank-math-block', 'wp-block-rank-math-faq-block']), document.children)
  for (const block of blocks) {
    const items = DomUtils.findAll(node => hasClass(node, ['rank-math-list-item', 'rank-math-faq-item']), block.children)
    if (!items.length) continue
    const questions = items.map(item => {
      const question = DomUtils.findOne(node => hasClass(node, ['rank-math-question']), item.children)
      const answer = DomUtils.findOne(node => hasClass(node, ['rank-math-answer']), item.children)
      return { item, question, answer }
    })
    // Leave malformed/incomplete blocks readable rather than silently dropping content.
    if (questions.some(({ question, answer }) => !question || !answer || !DomUtils.textContent(question).trim() || !DomUtils.textContent(answer).trim())) continue
    let previous = block.prev
    while (previous && previous.type === 'text' && !previous.data.trim()) previous = previous.prev
    const hasHeading = previous && isElement(previous) && /^h[23]$/.test(previous.name) && isFaqHeading(DomUtils.textContent(previous))
    if (hasHeading && previous && isElement(previous)) previous.name = 'h2'
    const replacements = new Map<Node, string>()
    const wrappers = new Set<Node>([block])
    for (const { item, question, answer } of questions) {
      question!.name = 'h3'
      const id = question!.attribs.id || item.attribs.id || ''
      question!.attribs = /^[A-Za-z][A-Za-z0-9_.:-]{0,120}$/.test(id) ? { id } : {}
      replacements.set(question!, DomUtils.getOuterHTML(question!))
      replacements.set(answer!, DomUtils.getInnerHTML(answer!))
      for (const node of [question!, answer!]) {
        let ancestor = node.parent
        while (ancestor && ancestor !== block) { wrappers.add(ancestor); ancestor = ancestor.parent }
      }
    }
    const render = (node: Node): string => replacements.get(node) ?? (wrappers.has(node) && 'children' in node ? node.children.map(render).join('') : DomUtils.getOuterHTML(node))
    const markup = (hasHeading ? '' : '<h2>Frequently asked questions</h2>') + block.children.map(render).join('')
    const replacement = parseDocument(markup)
    const parent = block.parent
    if (!parent) continue
    parent.children.splice(parent.children.indexOf(block), 1, ...replacement.children)
    parent.children.forEach((child, index) => {
      child.parent = parent
      child.prev = parent.children[index - 1] || null
      child.next = parent.children[index + 1] || null
    })
    block.parent = null
  }
  return DomUtils.getInnerHTML(document)
}
