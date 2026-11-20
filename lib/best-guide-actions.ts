import { parseDocument, DomUtils } from 'htmlparser2'

type ContentNode = ReturnType<typeof parseDocument>['children'][number]
const hasClass = (node: ContentNode, name: string) => node.type === 'tag' && (node.attribs.class || '').split(/\s+/).includes(name)
const text = (node: ContentNode) => DomUtils.textContent(node).replace(/\s+/g, ' ').trim()

/** Native Buttons are structural blocks, independent of their destination. */
export function isPurchaseBlock(node: ContentNode) {
  if (node.type !== 'tag' || !['p', 'a', 'div'].includes(node.name)) return false
  const anchors = DomUtils.getElementsByTagName('a', [node], true)
  const nativeBlock = hasClass(node, 'wp-block-buttons') || hasClass(node, 'wp-block-button') || hasClass(node, 'wp-block-button__link')
  if (nativeBlock && anchors.some(anchor => hasClass(anchor, 'wp-block-button__link') && anchor.attribs.href)) return true
  if (anchors.length !== 1 || !text(anchors[0]) || text(node) !== text(anchors[0])) return false
  try {
    const url = new URL(anchors[0].attribs.href || '')
    if (url.protocol !== 'https:' || !/^(?:[^.]+\.)*amazon\.com$|^(?:www\.)?amzn\.to$/i.test(url.hostname)) return false
    anchors[0].attribs.class = 'wp-block-button__link'
    return true
  } catch { return false }
}

/** Move only misplaced CTAs; retain already-correct buttons and helper notes. */
export function normalizeBestGuideActions(source: string) {
  const document = parseDocument(source)
  const contents = DomUtils.getElementsByTagName('div', document.children, true)
    .filter(node => hasClass(node, 'sm-pick-content'))
  for (const content of contents) {
    const grids = DomUtils.getElementsByTagName('div', content.children, true)
      .filter(node => hasClass(node, 'sm-pros-cons'))
    const lastGrid = grids.at(-1)
    if (!lastGrid) continue
    let beforeLastGrid = true
    const misplaced: ContentNode[] = []
    const visit = (node: ContentNode, insidePanel = false) => {
      if (node === lastGrid) beforeLastGrid = false
      const panel = insidePanel || ['sm-pros-cons', 'sm-pros', 'sm-cons'].some(name => hasClass(node, name))
      // A citation inside a sentence/list is still editorial text. Native
      // Button anchors are explicit CTAs even when the editor nests them.
      const candidate = node.type === 'tag' && (node.name !== 'a' || hasClass(node, 'wp-block-button__link') || node.parent === content)
      if (candidate && isPurchaseBlock(node)) {
        if (panel || beforeLastGrid) misplaced.push(node)
        return
      }
      if ('children' in node) for (const child of node.children) visit(child, panel)
    }
    for (const child of content.children) visit(child)
    let insertionPoint: ContentNode = lastGrid
    while (insertionPoint.parent && insertionPoint.parent !== content) insertionPoint = insertionPoint.parent
    for (const action of misplaced) {
      let parent = action.parent
      DomUtils.removeElement(action)
      // Removing a nested button must not leave a blank bullet or empty Group.
      while (parent && parent !== content && parent.type === 'tag'
        && ['li', 'ul', 'ol', 'p', 'div'].includes(parent.name)
        && !['sm-pros-cons', 'sm-pros', 'sm-cons'].some(name => hasClass(parent!, name))
        && !text(parent) && !DomUtils.getElementsByTagName('img', parent.children, true).length) {
        const ancestor = parent.parent
        DomUtils.removeElement(parent)
        parent = ancestor
      }
      DomUtils.append(insertionPoint, action)
      insertionPoint = action
    }
  }
  return document.children.map(node => DomUtils.getOuterHTML(node)).join('')
}
