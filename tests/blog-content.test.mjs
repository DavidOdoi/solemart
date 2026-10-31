import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { decodeHTML } from 'entities'
import { blogPosts } from '../data/blog.ts'
import { comparisons } from '../data/comparisons.ts'
import { getEditorialArticle } from '../lib/editorial-article.ts'
import { editorialPlainText } from '../lib/cms-rich-text.ts'

const publicPaths = new Set([
  ...blogPosts.map(post => `/blog/${post.slug}`),
  ...comparisons.map(comparison => `/comparisons/${comparison.slug}`),
])

for (const post of blogPosts) {
  test(`${post.slug}: complete article, shared FAQs, and clear featured and inline images`, async () => {
    const text = editorialPlainText(post.contentHtml)
    const words = text.split(/\s+/).filter(Boolean).length
    assert.ok(words >= 1400 && words <= 1500, `${words} body words`)
    assert.doesNotMatch(`${text} ${post.featuredImage.alt} ${post.featuredImage.caption}`, /\bAI[-\s]+generated\b|\bno named product\b|\bno hands-on test\b/i)
    for (const paragraph of post.contentHtml.matchAll(/<p>([\s\S]*?)<\/p>/g)) {
      assert.ok(editorialPlainText(paragraph[1]).split(/\s+/).length <= 80, 'Keep paragraphs short enough to scan')
    }
    assert.ok(post.seoTitle.length <= 60)
    assert.ok(post.metaDescription.length >= 130 && post.metaDescription.length <= 160)
    assert.equal(post.authorType, 'Organization')
    assert.equal(post.modifiedAt, '2026-10-31')
    assert.doesNotMatch(post.contentHtml, /<h1\b/)
    let previous = 1
    for (const match of post.contentHtml.matchAll(/<h([23])\b/g)) {
      const level = Number(match[1])
      assert.ok(level <= previous + 1, 'Heading levels must not skip')
      previous = level
    }
    const article = getEditorialArticle(post.contentHtml, { quickAnswer: true })
    assert.equal(article.parts.filter(part => part.kind === 'quick-answer').length, 1)
    assert.equal(article.parts.filter(part => part.kind === 'faqs').length, 1)
    assert.equal(article.parts.find(part => part.kind === 'faqs').faqs.length, 4)
    const internal = [...post.contentHtml.matchAll(/href="(\/[^"#]*)"/g)].map(match => match[1])
    assert.ok(new Set(internal.filter(path => path.startsWith('/blog/'))).size >= 2)
    for (const path of internal) assert.ok(publicPaths.has(path), `Unresolved internal link ${path}`)
    const external = [...article.html.matchAll(/<a\b[^>]*href="(https:[^"]+)"[^>]*>/g)]
    assert.ok(external.length >= 3)
    for (const [tag] of external) {
      assert.match(tag, /target="_blank"/)
      assert.match(tag, /rel="noopener noreferrer"/)
    }
    const inline = [...article.html.matchAll(/<figure><img ([^>]+)\/><figcaption>([^<]+)<\/figcaption><\/figure>/g)]
    assert.equal(inline.length, 2)
    const sources = []
    for (const [, attributes, caption] of inline) {
      assert.match(attributes, /loading="lazy"/)
      assert.match(attributes, /decoding="async"/)
      assert.match(attributes, /width="800" height="450"/)
      assert.match(attributes, /alt="[^"]{30,}"/)
      assert.ok(caption.length > 30)
      assert.doesNotMatch(caption, /\bAI[-\s]+generated\b/i)
      const url = new URL(decodeHTML(attributes.match(/src="([^"]+)"/)[1]), 'https://thesolemart.com')
      assert.equal(url.pathname, '/_next/image')
      assert.equal(url.searchParams.get('w'), '1200')
      const src = url.searchParams.get('url')
      assert.match(src, /^\/articles\/[a-z0-9-]+\.png$/)
      sources.push(src)
      const bytes = await readFile(new URL(`../public${src}`, import.meta.url))
      assert.ok(bytes.readUInt32BE(16) >= 1600)
      assert.ok(bytes.readUInt32BE(20) >= 900)
    }
    assert.equal(new Set(sources).size, 2)
    const image = post.featuredImage
    assert.ok(image.alt.length > 30)
    assert.ok(image.caption.length > 30)
    const bytes = await readFile(new URL(`../public${image.src}`, import.meta.url))
    assert.equal(bytes.readUInt32BE(16), image.width)
    assert.equal(bytes.readUInt32BE(20), image.height)
    assert.ok(image.width >= 1600)
    assert.ok(image.height >= 900)
  })
}
