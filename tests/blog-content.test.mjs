import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { blogPosts } from '../data/blog.ts'
import { comparisons } from '../data/comparisons.ts'
import { getEditorialArticle } from '../lib/editorial-article.ts'
import { editorialPlainText } from '../lib/cms-rich-text.ts'

const publicPaths = new Set([
  ...blogPosts.map(post => `/blog/${post.slug}`),
  ...comparisons.map(comparison => `/comparisons/${comparison.slug}`),
])

for (const post of blogPosts) {
  test(`${post.slug}: complete readable article, linked sources, shared FAQs and clear image`, async () => {
    const text = editorialPlainText(post.contentHtml)
    const words = text.split(/\s+/).filter(Boolean).length
    assert.ok(words >= 1400 && words <= 1500, `${words} body words`)
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
    const image = post.featuredImage
    assert.ok(image.alt.length > 30)
    assert.match(image.caption, /AI-generated/)
    const bytes = await readFile(new URL(`../public${image.src}`, import.meta.url))
    assert.equal(bytes.readUInt32BE(16), image.width)
    assert.equal(bytes.readUInt32BE(20), image.height)
    assert.ok(image.width >= 1600)
    assert.ok(image.height >= 900)
  })
}
