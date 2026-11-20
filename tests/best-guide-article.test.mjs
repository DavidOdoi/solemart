import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { getBestGuideArticle } from '../lib/best-guide-article.ts'
import { sanitizeCmsArticleHtml, sanitizeEditorialHtml } from '../lib/cms-rich-text.ts'
import { nikeBestGuidePreview } from '../data/nike-best-guide-preview.ts'

test('only an explicit native Group layout activates the best-guide template', () => {
  assert.equal(getBestGuideArticle('<h2>Best running shoes</h2><p>Ordinary article.</p>'), null)
  assert.equal(getBestGuideArticle('<div class="solemart-best-guide-fake"><p>Other.</p></div>'), null)
  assert.equal(getBestGuideArticle('<p>The class name solemart-best-guide is just text.</p>'), null)
  const result = getBestGuideArticle('<div class="wp-block-group solemart-best-guide"><h2>Shortlist</h2><p>Actual content.</p></div>')
  assert.match(result.html, /Actual content/)
  assert.equal(result.headings[0].label, 'Shortlist')
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
