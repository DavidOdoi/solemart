import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getWordPressPost, getWordPressPosts } from '../lib/wordpress.ts'

const originalFetch = globalThis.fetch
const originalEndpoint = process.env.WORDPRESS_GRAPHQL_URL
const endpoint = 'https://cms.thesolemart.com/graphql'

function post(overrides = {}) {
  return {
    title: 'Shoes &amp; Fit', slug: 'shoe-fit', status: 'publish',
    content: '<h1>Article heading</h1><p>Clear <strong>advice</strong>.</p>',
    excerpt: '<p>A &amp; B</p>', dateGmt: '2026-10-20T12:00:00',
    modifiedGmt: '2026-10-20T13:00:00', author: { node: { name: 'Editor &amp; Team' } },
    featuredImage: null, ...overrides,
  }
}

function respond(value) {
  globalThis.fetch = async () => Response.json(value)
}

beforeEach(() => { process.env.WORDPRESS_GRAPHQL_URL = endpoint })
afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalEndpoint === undefined) delete process.env.WORDPRESS_GRAPHQL_URL
  else process.env.WORDPRESS_GRAPHQL_URL = originalEndpoint
})

test('uses a variable-based server POST with timeout and revalidation', async () => {
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), endpoint)
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body).variables, { slug: 'shoe-fit' })
    assert.match(JSON.parse(options.body).query, /post\(id: \$slug, idType: SLUG\)/)
    assert.ok(options.signal instanceof AbortSignal)
    assert.equal(options.cache, 'force-cache')
    assert.equal(options.next.revalidate, 60)
    assert.ok(options.next.tags.includes('wordpress:post:shoe-fit'))
    assert.equal(options.headers.Authorization, undefined)
    return Response.json({ data: { post: post() } })
  }
  const result = await getWordPressPost('shoe-fit')
  assert.equal(result.title, 'Shoes & Fit')
  assert.equal(result.excerpt, 'A & B')
  assert.equal(result.author, 'Editor & Team')
  assert.equal(result.publishedAt, '2026-10-20T12:00:00.000Z')
  assert.equal(result.modifiedAt, '2026-10-20T13:00:00.000Z')
  assert.match(result.contentHtml, /<h2>Article heading<\/h2>/)
})

test('sanitizes scripts, attributes, unsafe URLs, forms and extra H1s', async () => {
  respond({ data: { post: post({ content: '<h1>Heading</h1><script>alert(1)</script><style>body{display:none}</style><p onclick="alert(1)">Safe</p><a href="javascript:alert(1)">Bad URL</a><a href="https://example.com" target="_blank" rel="sponsored">Retailer</a><img src="https://example.com/image.jpg" onerror="alert(1)"><form><input name="password"></form><iframe src="https://example.com"></iframe>' }) } })
  const result = await getWordPressPost('shoe-fit')
  assert.doesNotMatch(result.contentHtml, /<script|<style|<h1|onclick|onerror|javascript:|<form|<input|<iframe/)
  assert.match(result.contentHtml, /<p>Safe<\/p>/)
  assert.match(result.contentHtml, /sponsored noopener noreferrer/)
  assert.match(result.contentHtml, /loading="lazy"/)
})

test('returns null for missing, draft and private posts', async () => {
  for (const value of [null, post({ status: 'draft' }), post({ status: 'private' })]) {
    respond({ data: { post: value } })
    assert.equal(await getWordPressPost('shoe-fit'), null)
  }
})

test('does not convert upstream failures or malformed responses into not-found', async () => {
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
  await assert.rejects(getWordPressPost('shoe-fit'), /temporarily unavailable/)
  globalThis.fetch = async () => { throw new DOMException('Timed out', 'TimeoutError') }
  await assert.rejects(getWordPressPost('shoe-fit'), /temporarily unavailable/)
  respond({ errors: [{ message: 'GraphQL failed' }], data: { post: null } })
  await assert.rejects(getWordPressPost('shoe-fit'), /could not return/)
  respond({ data: {} })
  await assert.rejects(getWordPressPost('shoe-fit'), /could not return/)
  globalThis.fetch = async () => new Response('not JSON')
  await assert.rejects(getWordPressPost('shoe-fit'))
})

test('handles absent optional fields without invented dates or authors', async () => {
  respond({ data: { post: post({ dateGmt: null, modifiedGmt: 'invalid', author: null, excerpt: null, content: null }) } })
  const result = await getWordPressPost('shoe-fit')
  assert.equal(result.publishedAt, undefined)
  assert.equal(result.modifiedAt, undefined)
  assert.equal(result.author, undefined)
  assert.equal(result.featuredImage, undefined)
  assert.equal(result.contentHtml, '')
})

test('permits configured media, supplies dimensions and omits unsupported images', async () => {
  respond({ data: { post: post({ featuredImage: { node: { sourceUrl: 'https://cms.thesolemart.com/wp-content/uploads/shoe.jpg', altText: 'Shoe &amp; sole', mediaDetails: null } } }) } })
  const result = await getWordPressPost('shoe-fit')
  assert.equal(result.featuredImage.width, 1200)
  assert.equal(result.featuredImage.height, 800)
  assert.equal(result.featuredImage.alt, 'Shoe & sole')
  for (const sourceUrl of ['javascript:alert(1)', 'https://unconfigured.example/shoe.jpg']) {
    respond({ data: { post: post({ featuredImage: { node: { sourceUrl } } }) } })
    assert.equal((await getWordPressPost('shoe-fit')).featuredImage, undefined)
  }
})

test('keeps unconfigured development functional without fetching', async () => {
  delete process.env.WORDPRESS_GRAPHQL_URL
  globalThis.fetch = async () => { assert.fail('Must not fetch without configuration') }
  assert.equal(await getWordPressPost('shoe-fit'), null)
})

test('rejects invalid configuration and invalid slugs', async () => {
  globalThis.fetch = async () => { assert.fail('Invalid input must not fetch') }
  assert.equal(await getWordPressPost('bad/slug'), null)
  process.env.WORDPRESS_GRAPHQL_URL = 'file:///etc/passwd'
  await assert.rejects(getWordPressPost('shoe-fit'), /temporarily unavailable/)
})

test('lists published summaries newest-first with a bounded cursor query', async () => {
  globalThis.fetch = async (url, options) => {
    const body = JSON.parse(options.body)
    assert.deepEqual(body.variables, { after: null })
    assert.match(body.query, /posts\(first: 12, after: \$after/)
    assert.match(body.query, /status: PUBLISH/)
    assert.match(body.query, /field: DATE, order: DESC/)
    assert.doesNotMatch(body.query, /\bcontent\b/)
    assert.equal(options.next.revalidate, 60)
    assert.ok(options.next.tags.includes('wordpress:archive'))
    return Response.json({ data: { posts: {
      nodes: [post(), null, post({ status: 'draft' }), post({ status: 'private' }), post({ title: 'Older article', slug: 'older-article' })],
      pageInfo: { hasNextPage: true, endCursor: 'YXJyYXljb25uZWN0aW9uOjEy' },
    } } })
  }
  const result = await getWordPressPosts()
  assert.deepEqual(result.posts.map((item) => item.title), ['Shoes & Fit', 'Older article'])
  assert.equal(result.posts[0].excerpt, 'A & B')
  assert.equal(result.posts[0].publishedAt, '2026-10-20T12:00:00.000Z')
  assert.equal(result.posts[0].contentHtml, undefined)
  assert.equal(result.hasNextPage, true)
})

test('passes the older-page cursor as a variable and handles the final page', async () => {
  const cursor = 'YXJyYXljb25uZWN0aW9uOjEy'
  globalThis.fetch = async (url, options) => {
    assert.equal(JSON.parse(options.body).variables.after, cursor)
    return Response.json({ data: { posts: { nodes: [post()], pageInfo: { hasNextPage: false, endCursor: null } } } })
  }
  const result = await getWordPressPosts(cursor)
  assert.equal(result.posts.length, 1)
  assert.equal(result.hasNextPage, false)
})

test('distinguishes a genuinely empty archive from unconfigured development', async () => {
  respond({ data: { posts: { nodes: [], pageInfo: { hasNextPage: false, endCursor: null } } } })
  assert.deepEqual(await getWordPressPosts(), { posts: [], hasNextPage: false, endCursor: null })
  delete process.env.WORDPRESS_GRAPHQL_URL
  globalThis.fetch = async () => { assert.fail('Must not fetch without configuration') }
  assert.equal(await getWordPressPosts(), null)
})

test('rejects malformed cursors before making an upstream request', async () => {
  globalThis.fetch = async () => { assert.fail('Invalid cursors must not fetch') }
  for (const cursor of ['', 'bad cursor', 'a'.repeat(513), ['cursor', 'another']]) {
    await assert.rejects(getWordPressPosts(cursor), RangeError)
  }
})

test('archive failures and malformed pagination do not become an empty list', async () => {
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
  await assert.rejects(getWordPressPosts(), /temporarily unavailable/)
  respond({ errors: [{ message: 'Unavailable' }], data: { posts: null } })
  await assert.rejects(getWordPressPosts(), /could not return/)
  for (const value of [{ data: {} }, { data: { posts: { nodes: [] } } }, { data: { posts: { nodes: 'invalid', pageInfo: { hasNextPage: false } } } }]) {
    respond(value)
    await assert.rejects(getWordPressPosts(), /article listing/)
  }
  respond({ data: { posts: { nodes: [post()], pageInfo: { hasNextPage: true, endCursor: null } } } })
  await assert.rejects(getWordPressPosts(), /pagination/)
})

test('fetches published buying guides separately and sanitizes their body', async () => {
  const { getWordPressBuyingGuide } = await import('../lib/wordpress.ts')
  globalThis.fetch = async (_url, options) => {
    const payload = JSON.parse(options.body)
    assert.match(payload.query, /buyingGuide\(id: \$slug, idType: SLUG\)/)
    assert.doesNotMatch(payload.query, /author\s*\{/)
    assert.deepEqual(payload.variables, { slug: 'shoe-fit' })
    assert.ok(options.next.tags.includes('wordpress:buying-guide:shoe-fit'))
    return Response.json({ data: { buyingGuide: post({ content: '<p>Real guide</p><script>bad()</script>' }) } })
  }
  const result = await getWordPressBuyingGuide('shoe-fit')
  assert.equal(result.category, 'BUYING GUIDE')
  assert.equal(result.contentHtml, '<p>Real guide</p>')
  assert.equal(result.publishedAt, '2026-10-20T12:00:00.000Z')
  assert.equal(result.author, undefined)
})

test('buying guides distinguish missing/private content from API failures', async () => {
  const { getWordPressBuyingGuide } = await import('../lib/wordpress.ts')
  for (const value of [null, post({ status: 'draft' }), post({ status: 'private' })]) {
    respond({ data: { buyingGuide: value } })
    assert.equal(await getWordPressBuyingGuide('shoe-fit'), null)
  }
  respond({ data: {} })
  await assert.rejects(getWordPressBuyingGuide('shoe-fit'), /could not return/)
  respond({ data: { buyingGuide: post({ slug: 'wrong-guide' }) } })
  await assert.rejects(getWordPressBuyingGuide('shoe-fit'), /incomplete/)
  respond({ errors: [{ message: 'Schema unavailable' }] })
  await assert.rejects(getWordPressBuyingGuide('shoe-fit'), /could not return/)
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
  await assert.rejects(getWordPressBuyingGuide('shoe-fit'), /temporarily unavailable/)
})
