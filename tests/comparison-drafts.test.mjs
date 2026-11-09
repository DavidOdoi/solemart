import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseDocument } from 'htmlparser2'
import { comparisonDrafts, getComparisonDraft } from '../data/comparison-drafts.ts'
import { comparisons } from '../data/comparisons.ts'
import { blogPosts } from '../data/blog.ts'
import { guides } from '../data/guides.ts'
import { categories } from '../data/categories.ts'
import { comparisonArticle, comparisonBlogPost } from '../lib/comparison-article.ts'
import { getEditorialArticle } from '../lib/editorial-article.ts'
import { editorialPlainText } from '../lib/cms-rich-text.ts'
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

test('the blog article adapter preserves every draft section, answer and verdict without changing source records', () => {
  for (const { content } of comparisonDrafts) {
    const snapshot = JSON.stringify(content)
    const post = comparisonBlogPost(content)
    const article = getEditorialArticle(post.contentHtml, { quickAnswer: true })
    assert.equal(JSON.stringify(content), snapshot)
    assert.equal(post.slug, content.post.slug)
    assert.equal(post.seoTitle, content.post.seoTitle)
    assert.equal(post.publishedAt, undefined)
    assert.strictEqual(post.featuredImage, content.post.featuredImage)
    assert.equal(article.parts.filter(part => part.kind === 'quick-answer').length, 1)
    assert.equal(article.parts.find(part => part.kind === 'faqs').faqs.length, 4)
    for (const text of [content.post.excerpt, content.fields.quickAnswer, content.fields.leftChooseIf, content.fields.rightChooseIf, ...content.post.contentHtml.split(/(?=<h2\b)/i), content.fields.finalVerdict]) {
      assert.ok(editorialPlainText(post.contentHtml).includes(editorialPlainText(text)))
    }
    assert.equal(article.headings.at(-1).label, 'Final verdict')
    assert.equal(article.headings.length, new Set(article.headings.map(heading => heading.id)).size)
    const sections = article.headings.filter(heading => heading.level === 2)
    assert.match(sections[0].label, /at a glance$/)
    assert.equal(sections.at(-2).label, 'Frequently asked questions')
  }
})

test('all comparison previews can use one shared featured and inline placeholder without changing stored images', () => {
  for (const { content } of comparisonDrafts) {
    const post = comparisonBlogPost(content, { imagePlaceholders: true })
    assert.equal(post.featuredImage.src, '/placeholder.svg')
    assert.equal(post.featuredImage.alt, 'Featured image placeholder')
    const article = getEditorialArticle(post.contentHtml, { quickAnswer: true })
    const answer = article.parts.find(part => part.kind === 'quick-answer')
    assert.match(answer.html, /<img src="\/placeholder\.svg" alt="Comparison image placeholder"/)
    assert.equal((post.contentHtml.match(/<img\b/g) || []).length, 1)
    assert.equal(content.post.featuredImage, undefined)
    assert.doesNotMatch(content.post.contentHtml, /<img\b/)
  }
  const realImage = { src: 'https://cms.thesolemart.com/wp-content/uploads/real-photo.jpg', alt: 'An editor-selected photo', width: 1200, height: 675 }
  const withPhoto = { ...comparisonDrafts[0].content, post: { ...comparisonDrafts[0].content.post, featuredImage: realImage } }
  assert.strictEqual(comparisonBlogPost(withPhoto, { imagePlaceholders: true }).featuredImage, realImage)
})

test('the blog adapter escapes option labels, rejects unsafe guide links and retains plain paragraph bodies', () => {
  const source = comparisonDrafts[0].content
  const post = comparisonBlogPost({
    post: { ...source.post, contentHtml: undefined, paragraphs: ['A retained paragraph.'] },
    fields: {
      ...source.fields,
      leftName: 'Work <img src=x onerror=bad()> & boots',
      leftGuideUrl: 'javascript:bad()', rightGuideUrl: '/work-boots?source=compare&part=two',
      quickAnswer: '<p>Useful answer.</p><script>bad()</script>',
    },
  })
  const article = getEditorialArticle(post.contentHtml, { quickAnswer: true })
  assert.doesNotMatch(article.html, /<img\b|<script\b|href="javascript:/)
  assert.match(article.html, /Work &lt;img src=x onerror=bad\(\)&gt; &amp; boots/)
  assert.match(article.html, /A retained paragraph\./)
  assert.match(article.html, /href="\/work-boots\?source=compare&amp;part=two"/)
})

test('pending comparisons never enter the public comparison inventory or sitemap', async () => {
  const originalUrl = process.env.WORDPRESS_GRAPHQL_URL
  delete process.env.WORDPRESS_GRAPHQL_URL
  try {
    const entries = await sitemap()
    for (const { content } of comparisonDrafts) {
      assert.ok(!comparisons.some(item => item.slug === content.post.slug))
      assert.ok(!entries.some(entry => new URL(entry.url).pathname === `/comparisons/${content.post.slug}`))
    }
    assert.ok(entries.every(entry => !new URL(entry.url).pathname.startsWith('/template-preview/')))
  } finally {
    if (originalUrl === undefined) delete process.env.WORDPRESS_GRAPHQL_URL
    else process.env.WORDPRESS_GRAPHQL_URL = originalUrl
  }
})
