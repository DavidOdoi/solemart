import { parseDocument, DomUtils } from 'htmlparser2'
import { isPurchaseBlock } from './best-guide-actions.ts'

type ContentNode = ReturnType<typeof parseDocument>['children'][number]
const text = (node: ContentNode) => DomUtils.textContent(node).replace(/\s+/g, ' ').trim()
const html = (nodes: ContentNode[]) => nodes.map(node => DomUtils.getOuterHTML(node)).join('')
const group = (name: string, content: string) => `<div class="${name}">${content}</div>`
const classes = (node: ContentNode) => node.type === 'tag' ? (node.attribs.class || '').split(/\s+/) : []

function flatBlocks(nodes: ContentNode[]): ContentNode[] {
  return nodes.flatMap(node => node.type === 'tag' && node.name === 'div' && !node.attribs.class
    ? flatBlocks(node.children) : [node])
}

function isHeading(node: ContentNode) {
  return node.type === 'tag' && /^h[2-4]$/.test(node.name)
}

function isH2(node: ContentNode) {
  return node.type === 'tag' && node.name === 'h2'
}

function productHeading(node: ContentNode) {
  if (node.type !== 'tag' || !/^(h[2-4]|p)$/.test(node.name)) return false
  const label = text(node)
  if (!label || label.length > 220 || label.endsWith('?')) return false
  if (sectionKind(node)) return false
  if (node.name === 'p' && !/\bbest\b/i.test(label)) {
    const bold = DomUtils.getElementsByTagName(name => name === 'strong' || name === 'b', node.children, true)
    if (!bold.some(element => text(element) === label)) return false
  }
  return /^(?:#\s*)?\d{1,2}\s*[.)–—-]\s+\S/.test(label)
    || /^best\s+(?:overall|for\b|budget|value|premium|beginner|intermediate|competitive|lightweight|wide|all.round|versatile)\b/i.test(label)
    || /\S\s*[:–—|]\s*best\b/i.test(label)
}

function sectionKind(node: ContentNode) {
  if (node.type !== 'tag' || !/^(h[2-4]|p)$/.test(node.name)) return undefined
  const label = text(node).replace(/^(?:#\s*)?\d{1,2}\s*[.)–—-]\s+/, '').replace(/[:：]$/, '')
  if (/^(?:quick\s+(?:picks|answer)|(?:our\s+)?top\s+picks|(?:the\s+)?shortlist|.*\bat a glance)$/i.test(label)) {
    return /answer/i.test(label) ? 'sm-quick-answer' : 'sm-quick-picks'
  }
  if (/^(?:how we (?:chose|choose|selected|select|picked|pick|tested|test)|our (?:approach|methodology)|methodology)\b/i.test(label)) return 'sm-method'
  if (/^(?:faqs?|frequently asked questions|your questions,? answered)\b/i.test(label)) return 'sm-faq'
  if (/^(?:final verdict|the verdict|verdict|conclusion|bottom line)\b/i.test(label)) return 'sm-verdict'
  if (/^(?:how to (?:choose|buy|size|fit)|what to (?:look for|avoid|check)|buying (?:guide|advice|tips)|before you buy|common mistakes|who (?:this|these)|sizing and fit)\b/i.test(label)) return 'sm-buying-advice'
  return undefined
}

function panelKind(node: ContentNode) {
  if (node.type !== 'tag' || !/^(h[2-6]|p)$/.test(node.name)) return undefined
  const label = text(node).replace(/[:：]$/, '')
  if (/^(?:pros|advantages|what we like)$/i.test(label)) return 'sm-pros'
  if (/^(?:cons|disadvantages|consider|things to consider|what to consider)$/i.test(label)) return 'sm-cons'
  return undefined
}

function mediaBlock(node: ContentNode) {
  if (node.type !== 'tag' || !['figure', 'p', 'a', 'img'].includes(node.name)) return false
  return DomUtils.getElementsByTagName('img', [node], true).length > 0
    && DomUtils.getElementsByTagName('table', [node], true).length === 0
    && (node.name === 'figure' || node.name === 'img' || !text(node))
}

function productBody(nodes: ContentNode[]) {
  const output: string[] = []
  let lead = false
  for (let i = 0; i < nodes.length;) {
    const node = nodes[i]
    if (panelKind(node)) {
      const panels: string[] = []
      while (i < nodes.length && panelKind(nodes[i])) {
        const label = nodes[i], kind = panelKind(label)!
        if (label.type === 'tag') label.name = 'h3'
        const content = [label]
        i++
        while (i < nodes.length && !panelKind(nodes[i]) && !isHeading(nodes[i]) && !isPurchaseBlock(nodes[i]) && !sectionKind(nodes[i])) content.push(nodes[i++])
        panels.push(group(kind, html(content)))
      }
      output.push(group('sm-pros-cons', panels.join('')))
      continue
    }
    const action = isPurchaseBlock(node)
    if (!lead && !action && node.type === 'tag' && node.name === 'p' && text(node)) {
      node.attribs.class = [...classes(node), 'sm-pick-lede'].filter(Boolean).join(' ')
      lead = true
    }
    output.push(html([node]))
    i++
  }
  return output.join('')
}

function productCard(heading: ContentNode, nodes: ContentNode[], rank: number) {
  if (heading.type === 'tag') heading.name = 'h2'
  const images = nodes.filter(mediaBlock)
  const copy = nodes.filter(node => !images.includes(node))
  const imageHtml = images.length
    ? group('sm-product-image', html(images))
    : '<figure class="sm-product-image"><img src="/placeholder.svg" alt="Product photograph placeholder" width="1200" height="1200" /></figure>'
  return group('sm-pick', `<p class="sm-pick-label"><strong>${String(rank).padStart(2, '0')}</strong></p>${html([heading])}`
    + group('sm-pick-layout', group('sm-pick-visual', imageHtml) + group('sm-pick-content', productBody(copy))))
}

/** Decorate the editor's existing content, never substitute local article copy. */
export function nativeBestGuideHtml(safeHtml: string, title: string): string | null {
  const bestTitle = /^(?:the\s+)?(?:\d+\s+)?best\b/i.test(title.trim())
  if (!bestTitle) return null
  const nodes = flatBlocks(parseDocument(safeHtml).children)
  const products = nodes.filter(productHeading)
  if (products.length < 2 && !/^(?:the\s+)?\d+\s+best\b/i.test(title.trim())) return null
  const output: string[] = []
  let index = 0, rank = 0
  const introduction: ContentNode[] = []
  while (index < nodes.length && !isHeading(nodes[index]) && !productHeading(nodes[index]) && !sectionKind(nodes[index])) introduction.push(nodes[index++])
  if (introduction.length) output.push(group('sm-guide-intro', html(introduction)))
  while (index < nodes.length) {
    const heading = nodes[index++]
    if (productHeading(heading)) {
      const content: ContentNode[] = []
      while (index < nodes.length && !productHeading(nodes[index]) && !sectionKind(nodes[index])
        && !(isH2(nodes[index]) && !panelKind(nodes[index]))) content.push(nodes[index++])
      output.push(productCard(heading, content, ++rank))
      continue
    }
    const kind = sectionKind(heading) || 'sm-buying-advice'
    if (heading.type === 'tag' && sectionKind(heading)) heading.name = 'h2'
    const content = [heading]
    while (index < nodes.length && !productHeading(nodes[index]) && !sectionKind(nodes[index])
      && !isH2(nodes[index])) content.push(nodes[index++])
    output.push(group(kind, html(content)))
  }
  return group('solemart-best-guide sm-auto-guide', output.join(''))
}
