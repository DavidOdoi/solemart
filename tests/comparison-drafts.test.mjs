import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDocument } from 'htmlparser2'
import { comparisonDrafts, getComparisonDraft } from '../data/comparison-drafts.ts'
import { comparisons } from '../data/comparisons.ts'
import { blogPosts } from '../data/blog.ts'
import { guides } from '../data/guides.ts'
import { categories } from '../data/categories.ts'
import { comparisonArticle } from '../lib/comparison-article.ts'
import sitemap from '../app/sitemap.ts'

function anchors(html) {
  const result = []
  function walk(node) {
    if (node.name === 'a' && node.attribs?.href) result.push(node.attribs)
    for (const child of node.children || []) walk(child)
  }
  walk(parseDocument(html))
  return result
}

test('the five pending comparison drafts have explicit review gaps and contain no unapproved images or invented publication dates', () => {
  assert.equal(comparisonDrafts.length, 5)
  assert.equal(new Set(comparisonDrafts.map(draft => draft.content.post.slug)).size, 5)
  for (const draft of comparisonDrafts) {
    assert.strictEqual(getComparisonDraft(draft.content.post.slug), draft)
    assert.ok(draft.reviewNotes.length > 0)
    assert.ok(draft.imageNeeds.length >= 2)
    assert.equal(draft.content.post.featuredImage, undefined)
    assert.equal(draft.content.post.publishedAt, undefined)
    assert.doesNotMatch(draft.content.post.contentHtml, /<img\b|<iframe\b/i)
    assert.equal(comparisonArticle(draft.content.post.contentHtml).parts.find(part => part.kind === 'faqs')?.faqs.length, 4)
  }
  assert.equal(getComparisonDraft('missing-comparison'), undefined)
})

test('draft citations retain editorial semantics and internal links resolve to existing public content rather than proposed pages', () => {
  const publicPaths = new Set([
    '/how-we-review', '/editorial-policy',
    ...categories.map(item => `/${item.slug}`),
    ...blogPosts.map(item => `/blog/${item.slug}`),
    ...guides.map(item => `/best-shoes/${item.slug}`),
    ...comparisons.map(item => `/comparisons/${item.slug}`),
  ])
  for (const { content } of comparisonDrafts) {
    const html = comparisonArticle(content.post.contentHtml).html
    const links = anchors(html)
    assert.ok(links.some(link => link.href.startsWith('https://')))
    assert.ok(links.some(link => link.href.startsWith('/')))
    for (const link of links) {
      if (link.href.startsWith('/')) assert.ok(publicPaths.has(link.href), `Unresolved draft link: ${link.href}`)
      else {
        assert.equal(new URL(link.href).protocol, 'https:')
        assert.equal(link.target, '_blank')
        assert.equal(link.rel, 'noopener noreferrer')
      }
    }
    for (const href of [content.fields.leftGuideUrl, content.fields.rightGuideUrl].filter(Boolean)) assert.ok(publicPaths.has(href))
    assert.doesNotMatch(html, /xxbrits|30%|we (?:tested|wore)|guaranteed.*(?:protection|injury)/i)
  }
})

test('pending comparisons never enter the public comparison inventory or sitemap', async () => {
  const originalMode = process.env.SOLEMART_CONTENT_SOURCE
  process.env.SOLEMART_CONTENT_SOURCE = 'local'
  try {
    const entries = await sitemap()
    for (const { content } of comparisonDrafts) {
      assert.ok(!comparisons.some(item => item.slug === content.post.slug))
      assert.ok(!entries.some(entry => new URL(entry.url).pathname === `/comparisons/${content.post.slug}`))
    }
    assert.ok(entries.every(entry => !new URL(entry.url).pathname.startsWith('/template-preview/')))
  } finally {
    if (originalMode === undefined) delete process.env.SOLEMART_CONTENT_SOURCE
    else process.env.SOLEMART_CONTENT_SOURCE = originalMode
  }
})
