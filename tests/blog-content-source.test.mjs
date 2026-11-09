import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getPublicBlogArchive, getPublicBlogPost } from '../lib/blog-content.ts'
import { blogPosts } from '../data/blog.ts'
import { guides } from '../data/guides.ts'
import sitemap from '../app/sitemap.ts'

const originalFetch = globalThis.fetch
const keys = ['SOLEMART_CONTENT_SOURCE', 'WORDPRESS_GRAPHQL_URL', 'WORDPRESS_API_URL']
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]))
const slug = 'birkenstock-narrow-vs-regular-which-width-should-you-buy'
const endpoint = 'https://cms.thesolemart.com/graphql'

// Synthetic source-response fixtures; never a replacement for the real article.
function post(overrides = {}) {
  return {
    title: 'Birkenstock Narrow vs Regular — Fixture', slug, status: 'publish',
    content: '<p>Published fixture content.</p><script>unsafe()</script>', excerpt: '<p>A fixture excerpt.</p>',
    dateGmt: '2026-11-01T10:00:00', modifiedGmt: '2026-11-09T08:00:00',
    author: null, featuredImage: null, ...overrides,
  }
}

beforeEach(() => {
  for (const key of keys) delete process.env[key]
  process.env.WORDPRESS_GRAPHQL_URL = endpoint
  globalThis.fetch = async () => { throw new Error('Fixture CMS unavailable') }
})
afterEach(() => {
  globalThis.fetch = originalFetch
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key]
    else process.env[key] = original[key]
  }
})

test('the restored URL-based connection resolves a published CMS-only slug using public variable-based requests', async () => {
  assert.ok(!blogPosts.some(row => row.slug === slug))
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), endpoint)
    assert.equal(options.method, 'POST')
    assert.equal(options.headers.Authorization, undefined)
    assert.equal(options.next.revalidate, 60)
    assert.deepEqual(JSON.parse(options.body).variables, { slug })
    return Response.json({ data: { post: post() } })
  }
  const article = await getPublicBlogPost(slug)
  assert.equal(article.slug, slug)
  assert.equal(article.modifiedAt, '2026-11-09T08:00:00.000Z')
  assert.match(article.contentHtml, /Published fixture content/)
  assert.doesNotMatch(article.contentHtml, /script|unsafe/)
})

test('CMS content wins over local copy when the same published slug is available', async () => {
  const local = blogPosts[0]
  globalThis.fetch = async () => Response.json({ data: { post: post({ slug: local.slug, title: 'Current CMS fixture title' }) } })
  assert.equal((await getPublicBlogPost(local.slug)).title, 'Current CMS fixture title')
})

test('published comparison posts retain a temporary hero until an editor sets the real CMS Featured Image', async () => {
  const comparisonSlug = 'cowboy-boots-vs-work-boots'
  globalThis.fetch = async () => Response.json({ data: { post: post({ slug: comparisonSlug, content: '<p>Edited in WordPress.</p>' }) } })
  const article = await getPublicBlogPost(comparisonSlug)
  assert.equal(article.featuredImage.src, '/placeholder.svg')
  assert.match(article.contentHtml, /Edited in WordPress/)
  const sourceUrl = 'https://cms.thesolemart.com/wp-content/uploads/editor-photo.jpg'
  globalThis.fetch = async () => Response.json({ data: { post: post({ slug: comparisonSlug, featuredImage: { node: { sourceUrl, altText: 'Editor photo', mediaDetails: { width: 1200, height: 675 } } } }) } })
  assert.equal((await getPublicBlogPost(comparisonSlug)).featuredImage.src, sourceUrl)
})

test('draft and missing comparison Posts cannot expose the local preview article at the public blog URL', async () => {
  for (const value of [null, post({ slug: 'cowboy-boots-vs-work-boots', status: 'draft' })]) {
    globalThis.fetch = async () => Response.json({ data: { post: value } })
    assert.equal(await getPublicBlogPost('cowboy-boots-vs-work-boots'), undefined)
  }
})

test('the original CMS-first behavior preserves upstream errors instead of disguising them as missing content', async () => {
  await assert.rejects(getPublicBlogPost(blogPosts[0].slug), /temporarily unavailable/)
  await assert.rejects(getPublicBlogPost(slug), /temporarily unavailable/)
})

test('missing, draft and private CMS records remain unavailable without invented replacement content', async () => {
  for (const value of [null, post({ status: 'draft' }), post({ status: 'private' }), post({ status: 'future' })]) {
    globalThis.fetch = async () => Response.json({ data: { post: value } })
    assert.equal(await getPublicBlogPost(slug), undefined)
  }
})

test('an absent URL retains local articles while the obsolete local switch cannot pause configured reads', async () => {
  delete process.env.WORDPRESS_GRAPHQL_URL
  process.env.SOLEMART_CONTENT_SOURCE = 'local'
  globalThis.fetch = async () => assert.fail('No GraphQL URL means no CMS read')
  assert.strictEqual(await getPublicBlogPost(blogPosts[0].slug), blogPosts[0])
  assert.equal(await getPublicBlogPost(slug), undefined)
  process.env.WORDPRESS_GRAPHQL_URL = endpoint
  globalThis.fetch = async () => { throw new Error('Fixture connection refused') }
  await assert.rejects(getPublicBlogPost(blogPosts[0].slug), /temporarily unavailable/)
})

test('CMS archive failures remain errors rather than becoming local or missing pages', async () => {
  await assert.rejects(getPublicBlogArchive(), /temporarily unavailable/)
  await assert.rejects(getPublicBlogArchive('YXJyYXljb25uZWN0aW9uOjEy'), /temporarily unavailable/)
  await assert.rejects(getPublicBlogArchive('invalid cursor'), /Invalid article cursor/)
})

test('the restored sitemap paginates CMS posts beyond 100 and includes published CMS guides', async () => {
  let calls = 0
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), endpoint)
    const { query, variables } = JSON.parse(options.body)
    calls++
    if (query.includes('Sitemap_buyingGuides')) return Response.json({ data: { buyingGuides: {
      nodes: [{ slug: 'restored-cms-guide', status: 'publish', modifiedGmt: '2026-11-09T09:00:00' }],
      pageInfo: { hasNextPage: false, endCursor: null },
    } } })
    assert.match(query, /Sitemap_posts/)
    const offset = variables.after ? Number(Buffer.from(variables.after, 'base64').toString()) : 0
    const size = Math.min(100, 205 - offset)
    const next = offset + size
    return Response.json({ data: { posts: {
      nodes: Array.from({ length: size }, (_, index) => ({ slug: `cms-fixture-${offset + index}`, status: 'publish', modifiedGmt: '2026-11-09T08:00:00' })),
      pageInfo: { hasNextPage: next < 205, endCursor: next < 205 ? Buffer.from(String(next)).toString('base64') : null },
    } } })
  }
  const entries = await sitemap()
  assert.equal(calls, 4)
  assert.equal(entries.filter(entry => entry.url.includes('/blog/cms-fixture-')).length, 205)
  assert.equal(entries.find(entry => entry.url.endsWith('/cms-fixture-204')).lastModified, '2026-11-09T08:00:00.000Z')
  assert.equal(entries.find(entry => entry.url.endsWith('/best-shoes/restored-cms-guide')).lastModified, '2026-11-09T09:00:00.000Z')
  for (const guide of guides) assert.ok(!entries.some(entry => entry.url.endsWith(`/best-shoes/${guide.slug}`)))
  assert.ok(entries.every(entry => !entry.url.includes('/template-preview/')))
})
