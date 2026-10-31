import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import robots from '../app/robots.ts'
import sitemap from '../app/sitemap.ts'
import { getWordPressSitemapArticles } from '../lib/wordpress.ts'

const originalFetch = globalThis.fetch
const originalEndpoint = process.env.WORDPRESS_GRAPHQL_URL
const endpoint = 'https://cms.thesolemart.com/graphql'

beforeEach(() => { process.env.WORDPRESS_GRAPHQL_URL = endpoint })
afterEach(() => {
  globalThis.fetch = originalFetch
  if (originalEndpoint === undefined) delete process.env.WORDPRESS_GRAPHQL_URL
  else process.env.WORDPRESS_GRAPHQL_URL = originalEndpoint
})

function node(slug, overrides = {}) {
  return { slug, status: 'publish', modifiedGmt: '2026-10-30T14:15:16', ...overrides }
}

function connection(nodes = [], hasNextPage = false, endCursor = null) {
  return { nodes, pageInfo: { hasNextPage, endCursor } }
}

function respond(posts = connection(), buyingGuides = connection()) {
  globalThis.fetch = async () => Response.json({ data: { posts, buyingGuides } })
}

test('robots allows public assets and pages while excluding private, admin, API and search routes', () => {
  const result = robots()
  assert.equal(result.sitemap, 'https://thesolemart.com/sitemap.xml')
  assert.equal(result.rules.userAgent, '*')
  assert.equal(result.rules.allow, '/')
  for (const path of ['/api/', '/admin/', '/wp-admin/', '/wp-login.php', '/wp-json/', '/graphql', '/private/', '/sandbox/', '/template-preview/', '/search']) {
    assert.ok(result.rules.disallow.includes(path), `Missing exclusion for ${path}`)
  }
  assert.ok(result.rules.disallow.includes('/*?s='))
  assert.ok(result.rules.disallow.includes('/*?*&s='))
  assert.ok(result.rules.disallow.every(path => !path.includes('_next') && !path.includes('/blog') && !path.includes('/best-shoes')))
})

test('sitemap walks every page beyond 100 posts and buying guides using server POST variables', async () => {
  const calls = { posts: [], buyingGuides: [] }
  const totals = { posts: 205, buyingGuides: 103 }
  globalThis.fetch = async (url, options) => {
    assert.equal(String(url), endpoint)
    assert.equal(options.method, 'POST')
    assert.equal(options.headers.Authorization, undefined)
    assert.equal(options.cache, 'force-cache')
    assert.equal(options.next.revalidate, 60)
    assert.ok(options.next.tags.includes('wordpress:sitemap'))
    assert.ok(options.signal instanceof AbortSignal)
    const { query, variables } = JSON.parse(options.body)
    const root = query.includes('Sitemap_posts') ? 'posts' : 'buyingGuides'
    assert.match(query, /first: 100, after: \$after/)
    assert.match(query, /status: PUBLISH/)
    assert.match(query, /modifiedGmt/)
    assert.doesNotMatch(query, /\b(content|excerpt|featuredImage|solemartBuyingGuideFields)\b/)
    const offset = variables.after ? Number(Buffer.from(variables.after, 'base64').toString()) : 0
    calls[root].push(variables.after)
    const count = Math.min(100, totals[root] - offset)
    const nextOffset = offset + count
    return Response.json({ data: { [root]: connection(
      Array.from({ length: count }, (_, index) => node(`${root}-${offset + index}`)),
      nextOffset < totals[root],
      nextOffset < totals[root] ? Buffer.from(String(nextOffset)).toString('base64') : null,
    ) } })
  }
  const entries = await sitemap()
  assert.equal(entries.filter(entry => entry.url.startsWith('https://thesolemart.com/blog/posts-')).length, 205)
  assert.equal(entries.filter(entry => entry.url.startsWith('https://thesolemart.com/best-shoes/buyingGuides-')).length, 103)
  assert.equal(calls.posts.length, 3)
  assert.equal(calls.buyingGuides.length, 2)
  assert.equal(calls.posts[0], null)
  assert.equal(calls.buyingGuides[0], null)
  assert.equal(entries.find(entry => entry.url.endsWith('/posts-204')).lastModified, '2026-10-30T14:15:16.000Z')
})

test('only published safe slugs are included and duplicate nodes keep their latest real modification', async () => {
  respond(connection([
    node('same'), node('same', { modifiedGmt: '2026-10-31T01:02:03Z' }),
    node('same', { modifiedGmt: '2026-10-29T01:02:03' }),
    node('draft', { status: 'draft' }), node('private', { status: 'private' }),
    node('pending', { status: 'pending' }), node('future', { status: 'future' }), null,
    ...['', '.', '..', 'bad/path', 'bad?query', 'bad#fragment', 'bad space', 'bad\\path', '\u0000', 'a'.repeat(201)].map(slug => node(slug)),
    node('no-date', { modifiedGmt: null }), node('invalid-date', { modifiedGmt: 'invalid' }),
    node('toe-room-été'),
  ]))
  const entries = await getWordPressSitemapArticles()
  assert.deepEqual(entries.map(entry => entry.slug), ['same', 'no-date', 'invalid-date', 'toe-room-été'])
  assert.equal(entries[0].modifiedAt, '2026-10-31T01:02:03.000Z')
  assert.equal(entries[1].modifiedAt, undefined)
  assert.equal(entries[2].modifiedAt, undefined)
})

test('canonical frontend routes are unique, encoded, and exclude noindex or unavailable guide fallbacks', async () => {
  respond(connection([node('how-to-choose-walking-shoes'), node('toe-room-été')]), connection([node('best-wide-toe-box-sandals')]))
  const entries = await sitemap()
  const urls = entries.map(entry => entry.url)
  assert.equal(new Set(urls).size, urls.length)
  assert.equal(urls.filter(url => url.endsWith('/blog/how-to-choose-walking-shoes')).length, 1)
  assert.equal(entries.find(entry => entry.url.endsWith('/blog/how-to-choose-walking-shoes')).lastModified, '2026-10-30T14:15:16.000Z')
  assert.ok(urls.includes('https://thesolemart.com/blog/toe-room-%C3%A9t%C3%A9'))
  assert.ok(urls.includes('https://thesolemart.com/best-shoes/best-wide-toe-box-sandals'))
  for (const path of ['', '/about', '/affiliate-disclosure', '/blog', '/brands', '/contact', '/deals', '/editorial-policy', '/how-we-review', '/privacy-policy', '/terms-of-service', '/walking-shoes', '/running-shoes', '/work-boots', '/sneakers', '/shoes-for-standing-all-day', '/shoes-for-plantar-fasciitis', '/reviews/on-cloud-5', '/comparisons/walking-shoes-vs-running-shoes']) {
    assert.ok(urls.includes(`https://thesolemart.com${path}`), `Missing indexable page ${path}`)
  }
  for (const entry of entries) {
    const url = new URL(entry.url)
    assert.equal(url.origin, 'https://thesolemart.com')
    assert.equal(url.search, '')
    assert.equal(url.hash, '')
    if (url.pathname !== '/') assert.doesNotMatch(url.pathname, /\/$/)
    assert.doesNotMatch(url.pathname, /^\/(?:search|api|admin|wp-admin|sandbox|template-preview)\b|^\/brands\//)
  }
  assert.ok(!urls.includes('https://thesolemart.com/best-shoes/best-shoes-for-standing-all-day'))
  assert.equal(entries.find(entry => entry.url === 'https://thesolemart.com/about').lastModified, undefined)
})

test('unconfigured development mirrors local article fallback routes without contacting WordPress', async () => {
  delete process.env.WORDPRESS_GRAPHQL_URL
  globalThis.fetch = async () => { assert.fail('Unconfigured development must not fetch') }
  assert.equal(await getWordPressSitemapArticles(), null)
  const entries = await sitemap()
  assert.ok(entries.some(entry => entry.url === 'https://thesolemart.com/best-shoes/best-shoes-for-standing-all-day'))
  assert.ok(entries.some(entry => entry.url === 'https://thesolemart.com/blog/how-to-choose-walking-shoes'))
})

test('empty published collections stay empty without inserting unpublished CMS or sample guides', async () => {
  respond()
  assert.deepEqual(await getWordPressSitemapArticles(), [])
  const entries = await sitemap()
  assert.ok(!entries.some(entry => entry.url.startsWith('https://thesolemart.com/best-shoes/')))
})

test('broken or cyclic pagination fails instead of publishing a truncated sitemap', async () => {
  for (const value of [
    {}, { nodes: [] }, { nodes: 'invalid', pageInfo: { hasNextPage: false } },
    connection([node('real-post')], true, null),
    connection([node('real-post')], true, 'bad cursor'),
    connection([node('real-post')], true, 'cmVwZWF0ZWQ='),
  ]) {
    respond(value, value)
    await assert.rejects(sitemap(), /listing|pagination/)
  }
})

test('CMS outages, GraphQL errors and invalid endpoints never produce a misleading static-only sitemap', async () => {
  globalThis.fetch = async () => new Response('Unavailable', { status: 503 })
  await assert.rejects(sitemap(), /temporarily unavailable/)
  globalThis.fetch = async () => Response.json({ data: { posts: connection() }, errors: [{ message: 'Schema unavailable' }] })
  await assert.rejects(sitemap(), /could not return/)
  globalThis.fetch = async () => Response.json({ data: {} })
  await assert.rejects(sitemap(), /listing/)
  globalThis.fetch = async () => new Response('not JSON')
  await assert.rejects(sitemap(), SyntaxError)
  process.env.WORDPRESS_GRAPHQL_URL = 'file:///etc/passwd'
  globalThis.fetch = async () => { assert.fail('Invalid endpoint must not fetch') }
  await assert.rejects(sitemap(), /temporarily unavailable/)
})
