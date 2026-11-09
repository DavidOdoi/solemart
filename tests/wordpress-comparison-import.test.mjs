import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { comparisonDrafts } from '../data/comparison-drafts.ts'
import { checkWordPressComparisonImport, comparisonGutenbergContent, getComparisonWordPressDrafts, getWordPressPostImportConfig, importWordPressComparisonDrafts } from '../lib/wordpress-comparison-import.ts'
import { getEditorialArticle } from '../lib/editorial-article.ts'

const config = { apiUrl: 'https://cms.thesolemart.com/wp-json/wp/v2/', username: 'fixture-editor', applicationPassword: 'not-a-real-password' }
const originalMode = process.env.SOLEMART_CONTENT_SOURCE
beforeEach(() => { process.env.SOLEMART_CONTENT_SOURCE = 'hybrid' })
afterEach(() => {
  if (originalMode === undefined) delete process.env.SOLEMART_CONTENT_SOURCE
  else process.env.SOLEMART_CONTENT_SOURCE = originalMode
})

function fixture(options = {}) {
  const posts = [...(options.posts || [])]
  const calls = []
  let nextId = 900
  let writes = 0
  const fetcher = async (input, init) => {
    const url = new URL(input)
    assert.equal(url.origin, 'https://cms.thesolemart.com')
    assert.equal(init.redirect, 'error')
    assert.equal(init.cache, 'no-store')
    assert.equal(init.headers.Authorization, `Basic ${Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')}`)
    assert.ok(init.signal)
    calls.push({ method: init.method, url, body: init.body && JSON.parse(init.body) })
    if (options.denied) return new Response('', { status: 401 })
    const path = url.pathname.replace('/wp-json/wp/v2/', '')
    if (path === 'users/me') return Response.json({ id: 7, capabilities: { edit_posts: true } })
    assert.equal(path, 'posts', 'No guide, Shoe, media-upload or publishing endpoint is used')
    if (init.method === 'GET') {
      if (url.searchParams.has('slug')) return Response.json(posts.filter(post => post.slug === url.searchParams.get('slug')))
      const page = Number(url.searchParams.get('page'))
      return Response.json(posts.slice((page - 1) * 100, page * 100), {
        headers: options.noPagination ? {} : { 'X-WP-TotalPages': String(Math.ceil(posts.length / 100)) },
      })
    }
    writes++
    if (writes === options.failWrite) return new Response('', { status: 503 })
    const body = JSON.parse(init.body)
    assert.equal(body.status, 'draft')
    assert.equal(body.featured_media, undefined, 'The human editor selects the Featured Image; no unsupported SVG upload')
    assert.equal(body.date, undefined, 'No invented publication date')
    const created = { ...body, id: nextId++, title: { raw: body.title }, status: options.unexpectedStatus || 'draft' }
    posts.push(created)
    return Response.json(created)
  }
  return { posts, calls, fetcher }
}

test('all five exported articles are native Post drafts with editable Gutenberg images and complete article content', () => {
  const drafts = getComparisonWordPressDrafts()
  assert.equal(drafts.length, 5)
  for (const post of drafts) {
    assert.equal(post.status, 'draft')
    assert.equal(post.date, undefined)
    assert.match(post.content, /<!-- wp:paragraph -->/)
    assert.match(post.content, /<!-- wp:heading \{"level":3\} -->/)
    assert.match(post.content, /<!-- wp:image /)
    assert.match(post.content, /src="https:\/\/thesolemart\.com\/placeholder\.svg"/)
    assert.doesNotMatch(post.content, /src="\/placeholder\.svg"/)
    const rendered = getEditorialArticle(post.content, { quickAnswer: true })
    assert.equal(rendered.parts.find(part => part.kind === 'faqs').faqs.length, 4)
    assert.match(rendered.parts.find(part => part.kind === 'quick-answer').html, /<img /)
    assert.match(rendered.html, /<table>/)
    assert.equal(rendered.headings.at(-1).label, 'Final verdict')
    assert.equal(post.title, comparisonDrafts.find(item => item.content.post.slug === post.slug).content.post.title)
  }
  const unsafe = comparisonGutenbergContent('<h3 onclick="bad()">Quick answer</h3><p>Answer.</p><script>bad()</script>')
  assert.doesNotMatch(unsafe, /onclick|<script|bad\(\)/)
})

test('the read-only connection check paginates beyond 100 posts and detects an existing topic under its original slug', async () => {
  const posts = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, slug: `unrelated-${i}`, status: 'publish', title: { raw: `Unrelated ${i}` } }))
  posts.push({ id: 101, slug: 'original-cowhide-url', status: 'publish', title: { raw: 'Cowhide Boots vs Leather Boots: Existing editorial title' } })
  const mock = fixture({ posts })
  const plan = await checkWordPressComparisonImport({ config, fetcher: mock.fetcher })
  assert.equal(mock.calls.filter(call => call.url.searchParams.has('page')).length, 2)
  assert.ok(mock.calls.every(call => call.method === 'GET'))
  assert.equal(plan[0].action, 'EXISTING')
  assert.equal(plan[0].existing[0].slug, 'original-cowhide-url')
  assert.match(plan[0].existing[0].editorUrl, /post=101&action=edit/)
})

test('hybrid mode imports five draft Posts, awaits the journal and reruns without overwriting manual edits', async () => {
  const mock = fixture()
  const journal = []
  const options = { config, fetcher: mock.fetcher, onProgress: async step => { await Promise.resolve(); journal.push(step) } }
  const first = await importWordPressComparisonDrafts(options)
  assert.equal(first.length, 5)
  assert.equal(journal.length, 5)
  assert.ok(first.every(item => item.action === 'DRAFT_CREATED' && item.published === false))
  mock.posts[0].content = '<p>A manual editorial change.</p>'
  const writes = mock.calls.filter(call => call.method === 'POST').length
  const second = await importWordPressComparisonDrafts(options)
  assert.ok(second.every(item => item.action === 'EXISTING_UNCHANGED'))
  assert.equal(mock.calls.filter(call => call.method === 'POST').length, writes)
  assert.equal(mock.posts[0].content, '<p>A manual editorial change.</p>')
})

test('a previously published comparison is preserved, including a different canonical slug and its published state', async () => {
  const original = { id: 18, slug: 'cowhide-boots-vs-leather-boots-which-should-you-buy', status: 'publish', title: { raw: 'An edited title' }, content: 'Existing original article' }
  const mock = fixture({ posts: [original] })
  const results = await importWordPressComparisonDrafts({ config, fetcher: mock.fetcher })
  assert.equal(results[0].action, 'EXISTING_UNCHANGED')
  assert.equal(results[0].slug, original.slug)
  assert.equal(results[0].published, true)
  assert.equal(mock.posts[0].content, original.content)
  assert.equal(mock.calls.filter(call => call.method === 'POST').length, 4)
})

test('ambiguous duplicate matches and incomplete inventories block every mutation', async () => {
  const topic = comparisonDrafts[0].content.post.slug
  const posts = [1, 2].map(id => ({ id, slug: `${topic}-${id}`, status: 'draft', title: { raw: 'An existing draft' } }))
  for (const setup of [{ posts }, { noPagination: true }]) {
    const mock = fixture(setup)
    await assert.rejects(importWordPressComparisonDrafts({ config, fetcher: mock.fetcher }), /Multiple existing|complete paginated/)
    assert.ok(mock.calls.every(call => call.method === 'GET'))
  }
})

test('local mode and unsafe endpoint configuration block requests before credentials can leave the process', async () => {
  const fetcher = async () => assert.fail('No request should be sent')
  for (const apiUrl of ['https://other.example/wp-json/wp/v2/', 'http://cms.thesolemart.com/wp-json/wp/v2/', 'https://cms.thesolemart.com/wp-json/wp/v2/?redirect=evil', 'https://user:pass@cms.thesolemart.com/wp-json/wp/v2/']) {
    await assert.rejects(checkWordPressComparisonImport({ config: { ...config, apiUrl }, fetcher }), /credentials may only/)
  }
  process.env.SOLEMART_CONTENT_SOURCE = 'local'
  assert.equal(getWordPressPostImportConfig(), null)
  await assert.rejects(importWordPressComparisonDrafts({ config, fetcher }), /disabled in explicit local/)
})

test('authentication failures and partial write failures do not trigger retries or lose confirmed draft IDs', async () => {
  const denied = fixture({ denied: true })
  await assert.rejects(importWordPressComparisonDrafts({ config, fetcher: denied.fetcher }), /authentication or permission/)
  assert.equal(denied.calls.length, 1)
  const mock = fixture({ failWrite: 3 })
  const journal = []
  await assert.rejects(importWordPressComparisonDrafts({ config, fetcher: mock.fetcher, onProgress: step => journal.push(step) }), /HTTP 503/)
  assert.equal(journal.length, 2)
  assert.equal(mock.posts.length, 2)
  assert.equal(mock.calls.filter(call => call.method === 'POST').length, 3)
})

test('an unexpected server status is journaled and never reported as a successful draft import', async () => {
  const mock = fixture({ unexpectedStatus: 'publish' })
  const journal = []
  await assert.rejects(importWordPressComparisonDrafts({ config, fetcher: mock.fetcher, onProgress: step => journal.push(step) }), /did not confirm/)
  assert.equal(journal.length, 1)
  assert.equal(journal[0].action, 'UNCONFIRMED_RESULT')
  assert.equal(mock.calls.filter(call => call.method === 'POST').length, 1)
})
