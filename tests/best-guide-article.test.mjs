import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getBestGuideArticle } from '../lib/best-guide-article.ts'
import { sanitizeCmsArticleHtml, sanitizeEditorialHtml } from '../lib/cms-rich-text.ts'
import { nikeBestGuidePreview } from '../data/nike-best-guide-preview.ts'
import { parseDocument, DomUtils } from 'htmlparser2'

test('without a post title, only an explicit native Group layout activates the template', () => {
  assert.equal(getBestGuideArticle('<h2>Best running shoes</h2><p>Ordinary article.</p>'), null)
  assert.equal(getBestGuideArticle('<div class="solemart-best-guide-fake"><p>Other.</p></div>'), null)
  assert.equal(getBestGuideArticle('<p>The class name solemart-best-guide is just text.</p>'), null)
  const result = getBestGuideArticle('<div class="wp-block-group solemart-best-guide"><h2>Shortlist</h2><p>Actual content.</p></div>')
  assert.match(result.html, /Actual content/)
  assert.equal(result.headings[0].label, 'Shortlist')
})

test('WordPress wrappers around the saved pattern do not disable the layout', () => {
  const article = getBestGuideArticle('<div><div><div class="solemart-best-guide"><h2>My shortlist</h2><p>Saved content.</p></div></div></div>')
  assert(article)
  assert.match(article.html, /Saved content/)
  assert.doesNotMatch(article.html, /sm-auto-guide/)
})

const curlingTitle = '7 Best Curling Shoes: Top Picks for Beginners, League Players, and Competitive Curlers'
const nativeCurling = `<p>Choose a shoe for the ice and level you play at.</p>
<h2 id="quick-picks">Quick picks</h2><table><tbody><tr><td>First pick</td><td><a href="#first-model">First model</a></td></tr></tbody></table>
<h2 id="first-model">1. First Curling Model: Best for beginners</h2>
<figure><img src="https://cms.thesolemart.com/wp-content/uploads/curling-model.jpg" alt="The editor's curling shoe" /><figcaption>The original image caption.</figcaption></figure>
<p>A beginner-focused profile written in WordPress.</p><p>Check the manufacturer's fit information.</p>
<h3>Pros</h3><ul><li>First documented benefit.</li></ul><h3>Cons</h3><ul><li>First documented limitation.</li></ul>
<p><a href="https://www.amazon.com/dp/EDITOR123?tag=existing-20">Check price on Amazon</a></p>
<h2>2. Second Curling Model — Best for league players</h2><p>The second original product description.</p>
<p><strong>Pros:</strong></p><ul><li>Second documented benefit.</li></ul><p><strong>Cons:</strong></p><ul><li>Second documented limitation.</li></ul>
<h2>How to choose curling shoes</h2><p>Compare handedness, fit and slider specifications.</p><p>Read <a href="https://reference.example/curling">the cited source</a>.</p>
<h2>FAQs</h2><h3>What should a beginner check?</h3><p>Ask the club about the conditions and suitable equipment.</p>
<h2>Final verdict</h2><p>Match your own routine and check the exact pair.</p>`

const originalPurchase = '<p><a href="https://www.amazon.com/dp/EDITOR123?tag=existing-20">Check price on Amazon</a></p>'
const wordpressButton = (href, label = 'Buy in Amazon') => `<div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link" href="${href}" rel="sponsored">${label}</a></div></div>`
const byClass = (node, name) => DomUtils.findAll(item => item.type === 'tag' && (item.attribs.class || '').split(/\s+/).includes(name), node.children)
function assertActionBelowPanels(article, expectedHrefs) {
  const doc = parseDocument(article.html)
  const card = byClass(doc, 'sm-pick')[0]
  const content = byClass(card, 'sm-pick-content')[0]
  const grids = byClass(content, 'sm-pros-cons')
  const buttons = byClass(content, 'wp-block-button__link')
  assert.deepEqual(buttons.map(button => button.attribs.href), expectedHrefs)
  assert.equal(byClass(card, 'sm-cons').flatMap(panel => byClass(panel, 'wp-block-button__link')).length, 0)
  assert.equal(byClass(card, 'sm-pros').flatMap(panel => byClass(panel, 'wp-block-button__link')).length, 0)
  assert.equal(grids.flatMap(grid => byClass(grid, 'wp-block-button__link')).length, 0)
  const order = DomUtils.findAll(() => true, content.children)
  for (const button of buttons) assert(order.indexOf(button) > order.indexOf(grids.at(-1)))
  return { card, content, buttons }
}

test('native WordPress Buttons belong below both panels regardless of their retailer URL', () => {
  const url = 'https://www.amazon.co.uk/dp/EDITOR123?tag=existing-21'
  const article = getBestGuideArticle(nativeCurling.replace(originalPurchase, wordpressButton(url)), { title: curlingTitle })
  const { buttons } = assertActionBelowPanels(article, [url])
  assert.equal(DomUtils.textContent(buttons[0]), 'Buy in Amazon')
  assert.match(buttons[0].attribs.rel, /sponsored nofollow noopener noreferrer/)
})

test('buttons nested in Cons list items move beneath the panels without empty bullets or lost text', () => {
  const first = 'https://www.amazon.com/dp/EDITOR123?tag=existing-20'
  const second = 'https://shop.example/product?ref=editor'
  const source = nativeCurling.replace(originalPurchase, '').replace('<li>First documented limitation.</li>', `<li>First documented limitation.${wordpressButton(first)}</li><li>${wordpressButton(second, 'See retailer')}</li>`)
  const article = getBestGuideArticle(source, { title: curlingTitle })
  const { card } = assertActionBelowPanels(article, [first, second])
  const cons = byClass(card, 'sm-cons')[0]
  const items = DomUtils.getElementsByTagName('li', cons.children, true)
  assert.deepEqual(items.map(item => DomUtils.textContent(item)), ['First documented limitation.'])
  assert.equal(article.html.split('First documented limitation.').length - 1, 1)
  assert.equal(getBestGuideArticle(article.html, { title: curlingTitle }).html, article.html)
})

test('a WordPress Buttons block with several destinations stays together outside Cons', () => {
  const urls = ['https://www.amazon.com/dp/FIRST?tag=first-20', 'https://www.amazon.co.uk/dp/SECOND?tag=second-21']
  const block = `<div class="wp-block-buttons">${urls.map(url => `<div class="wp-block-button"><a class="wp-block-button__link" href="${url}" rel="sponsored">Buy on Amazon</a></div>`).join('')}</div>`
  assertActionBelowPanels(getBestGuideArticle(nativeCurling.replace(originalPurchase, block), { title: curlingTitle }), urls)
})

test('a purchase button added before Pros is placed below the completed comparison', () => {
  const url = 'https://www.amazon.com/dp/FIRST?tag=first-20'
  const source = nativeCurling.replace(originalPurchase, '').replace('<h3>Pros</h3>', wordpressButton(url) + '<h3>Pros</h3>')
  assertActionBelowPanels(getBestGuideArticle(source, { title: curlingTitle }), [url])
})

test('saved pattern content also keeps nested buttons below the panels and above their helper note', () => {
  const url = 'https://www.amazon.com/dp/FIRST?tag=first-20'
  const source = `<div class="solemart-best-guide"><div class="sm-pick"><h2>Original product</h2><div class="sm-pick-content"><div class="sm-pros-cons"><div class="sm-pros"><h3>Pros</h3><ul><li>Original pro.</li></ul></div><div class="sm-cons"><h3>Cons</h3><ul><li>Original con.${wordpressButton(url)}</li></ul></div></div><p class="sm-cta-note">Original helper note.</p></div></div></div>`
  const { content } = assertActionBelowPanels(getBestGuideArticle(source), [url])
  const children = content.children.filter(node => node.type === 'tag')
  assert.deepEqual(children.map(node => node.attribs.class), ['sm-pros-cons', 'wp-block-buttons', 'sm-cta-note'])
})

test('inline Amazon citations stay in their original Cons sentence', () => {
  const url = 'https://www.amazon.com/dp/SOURCE123'
  const source = nativeCurling.replace('First documented limitation.', `Read <a href="${url}">the original listing</a> for its limitations.`)
  const article = getBestGuideArticle(source, { title: curlingTitle })
  const first = byClass(parseDocument(article.html), 'sm-pick')[0]
  const cons = byClass(first, 'sm-cons')[0]
  const citation = DomUtils.getElementsByTagName('a', cons.children, true)[0]
  assert.equal(citation.attribs.href, url)
  assert(!citation.attribs.class)
  assert.equal(DomUtils.textContent(cons).trim(), 'ConsRead the original listing for its limitations.')
})

test('ordinary WordPress best articles render as product cards without a pattern or custom fields', () => {
  const article = getBestGuideArticle(nativeCurling, { title: curlingTitle })
  assert(article)
  assert.match(article.html, /class="solemart-best-guide sm-auto-guide"/)
  assert.equal((article.html.match(/class="sm-pick"/g) || []).length, 2)
  assert.equal((article.html.match(/class="sm-pros"/g) || []).length, 2)
  assert.equal((article.html.match(/class="sm-cons"/g) || []).length, 2)
  assert.match(article.html, /class="sm-quick-picks"/)
  assert.match(article.html, /class="sm-faq"/)
  assert.match(article.html, /class="sm-verdict"/)
  assert(article.headings.some(heading => heading.id === 'first-model'))
  assert.match(article.html, /href="#first-model"/)
})

test('automatic styling preserves original copy, photographs, captions, citations and exact affiliate links', () => {
  const article = getBestGuideArticle(nativeCurling, { title: curlingTitle })
  for (const copy of ['A beginner-focused profile written in WordPress.', 'Check the manufacturer\'s fit information.', 'The second original product description.', 'First documented benefit.', 'First documented limitation.', 'Second documented benefit.', 'Second documented limitation.', 'The original image caption.', 'Compare handedness, fit and slider specifications.', 'Ask the club about the conditions and suitable equipment.', 'Match your own routine and check the exact pair.']) {
    const escaped = copy.replaceAll('&', '&amp;')
    assert.equal(article.html.split(escaped).length - 1, 1, copy)
  }
  assert.match(article.html, /src="https:\/\/cms.thesolemart.com\/wp-content\/uploads\/curling-model.jpg"/)
  assert.match(article.html, /href="https:\/\/www.amazon.com\/dp\/EDITOR123\?tag=existing-20"/)
  assert.match(article.html, /class="wp-block-button__link" href="https:\/\/www.amazon.com/)
  assert.match(article.html, /sponsored nofollow noopener noreferrer/)
  assert.match(article.html, /href="https:\/\/reference.example\/curling" target="_blank" rel="noopener noreferrer"/)
  assert.equal((article.html.match(/Product photograph placeholder/g) || []).length, 1)
  assert.equal((article.html.match(/amazon\.com/g) || []).length, 1)
  assert.doesNotMatch(article.html, /Nike|Pegasus|Metcon|\$\d|ratingValue/)
})

test('bold product labels and nested plain WordPress Groups can use the same layout', () => {
  const source = '<div><p>Introduction.</p><p><strong>1. First model: Best overall</strong></p><p>First description.</p><p>Pros</p><ul><li>Original pro.</li></ul><p>Cons</p><ul><li>Original con.</li></ul><p><strong>2. Second model: Best budget</strong></p><p>Second description.</p><p>Final verdict</p><p>Original conclusion.</p></div>'
  const article = getBestGuideArticle(source, { title: '2 Best Curling Shoes' })
  assert.equal((article.html.match(/class="sm-pick"/g) || []).length, 2)
  assert.match(article.html, /class="sm-verdict"/)
  assert.match(article.html, /Original conclusion/)
})

test('unrelated advice/comparisons retain the ordinary layout, and incomplete content is never filled with sample copy', () => {
  assert.equal(getBestGuideArticle(nativeCurling, { title: 'Curling shoes vs trainers' }), null)
  assert.equal(getBestGuideArticle('<h2>Fit</h2><p>Advice.</p>', { title: 'Best time to buy shoes' }), null)
  const partial = getBestGuideArticle('<p>Only the editor’s current introduction.</p>', { title: curlingTitle })
  assert.match(partial.html, /Only the editor’s current introduction/)
  assert.doesNotMatch(partial.html, /class="sm-pick"|amazon|Buy on|Nike|<img/)
})

test('numbered buying instructions and ordinary paragraphs do not become extra product cards', () => {
  const source = nativeCurling.replace('<h2>How to choose curling shoes</h2>', '<h3>How to choose curling shoes</h3><h3>1. How to choose the right fit</h3><p>1. Measure both feet before ordering.</p>')
  const article = getBestGuideArticle(source, { title: curlingTitle })
  assert.equal((article.html.match(/class="sm-pick"/g) || []).length, 2)
  assert.match(article.html, /Measure both feet before ordering/)
})

test('automatic transformation remains safe and stable after repeated CMS sanitization', () => {
  const malicious = nativeCurling.replace('First documented benefit.', 'First documented benefit.<script>bad()</script><img src="x" onerror="bad()" />').replace('https://www.amazon.com/dp/EDITOR123?tag=existing-20', 'javascript:alert(1)')
  const first = getBestGuideArticle(sanitizeCmsArticleHtml(malicious), { title: curlingTitle })
  assert.doesNotMatch(first.html, /<script|onerror|javascript:|alert\(1\)|class="wp-block-button__link"/)
  const second = getBestGuideArticle(sanitizeCmsArticleHtml(first.html), { title: curlingTitle })
  assert.equal(first.html, second.html)
})

test('the seven-pick WordPress body survives upstream sanitization and preserves working jump links', () => {
  const result = getBestGuideArticle(sanitizeCmsArticleHtml(nikeBestGuidePreview.contentHtml))
  assert(result)
  assert.equal((result.html.match(/class="sm-pick"/g) || []).length, 7)
  assert.equal((result.html.match(/Buy on Amazon/g) || []).length, 7)
  assert.equal((result.html.match(/class="sm-product-image"/g) || []).length, 7)
  const ids = result.headings.map(item => item.id)
  assert.equal(ids.length, new Set(ids).size)
  for (const [, target] of result.html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), target)
  assert.match(result.html, /Your questions, answered/)
  assert.match(result.html, /The right pair starts with your routine/)
  assert.doesNotMatch(result.html, /<h1\b|<script\b|<!--/)
})

test('native product buttons preserve exact Amazon URLs and affiliate/security attributes', () => {
  const source = '<div class="solemart-best-guide"><div class="wp-block-buttons"><div class="wp-block-button"><a class="wp-block-button__link wp-element-button arbitrary-class" href="https://www.amazon.com/dp/EXAMPLE123?tag=provided-20" style="position:fixed" onclick="bad()">Buy on Amazon</a></div></div></div>'
  const html = getBestGuideArticle(source).html
  assert.match(html, /class="wp-block-button__link"/)
  assert.match(html, /href="https:\/\/www.amazon.com\/dp\/EXAMPLE123\?tag=provided-20"/)
  assert.match(html, /target="_blank" rel="sponsored nofollow noopener noreferrer"/)
  assert.doesNotMatch(html, /wp-element-button|arbitrary-class|onclick|style=/)
  const unsafe = getBestGuideArticle(source.replace('https://www.amazon.com/dp/EXAMPLE123?tag=provided-20', 'javascript:alert(1)')).html
  assert.doesNotMatch(unsafe, /href=|class="wp-block-button__link"/)
})

test('layout classes are tightly scoped to article content and cannot enable arbitrary styling', () => {
  const source = '<div class="solemart-best-guide fixed inset-0"><p class="sm-disclosure text-red-500" style="display:none">Disclosure</p><figure class="sm-product-image arbitrary"><img src="https://cms.thesolemart.com/wp-content/uploads/photo.jpg" alt="Actual product" onerror="bad()" /></figure></div>'
  const html = sanitizeCmsArticleHtml(source)
  assert.match(html, /class="solemart-best-guide"/)
  assert.match(html, /class="sm-disclosure"/)
  assert.match(html, /class="sm-product-image"/)
  assert.match(html, /alt="Actual product"/)
  assert.doesNotMatch(html, /inset-0|text-red|arbitrary|style=|onerror/)
  assert.doesNotMatch(sanitizeEditorialHtml(source), /class=|<img/)
  assert.equal(sanitizeCmsArticleHtml(html), html)
})

test('the unsynced WordPress pattern and example contain editable core blocks and match the preview', () => {
  const example = JSON.parse(readFileSync(new URL('../public/downloads/solemart-nike-guide-example.json', import.meta.url)))
  assert.equal(example.__file, 'wp_block')
  assert.equal(example.syncStatus, 'unsynced')
  assert.equal(example.content, nikeBestGuidePreview.contentHtml)
  const starter = JSON.parse(readFileSync(new URL('../public/downloads/solemart-best-guide-pattern.json', import.meta.url)))
  assert(getBestGuideArticle(starter.content))
  assert.doesNotMatch(starter.content, /Nike|Pegasus|Metcon/)
  for (const pattern of [starter, example]) {
    const names = [...pattern.content.matchAll(/<!-- wp:([\w-]+)/g)].map(match => match[1])
    assert(names.every(name => ['group', 'paragraph', 'heading', 'image', 'buttons', 'button', 'list', 'list-item', 'table'].includes(name)))
    assert.doesNotMatch(pattern.content, /wp:html|wp:freeform|shortcode|solemart\/|<h1\b/)
  }
})
