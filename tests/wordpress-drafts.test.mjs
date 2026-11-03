import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { saveWordPressBuyingGuideDraft } from '../lib/wordpress-drafts.ts'
import { fixtureArticle, apiItem } from './fixtures/ingestion.mjs'
import { GUIDE_WORD_TARGET } from '../lib/guide-editorial-settings.ts'

const originalFetch = globalThis.fetch
const keys = ['SOLEMART_CONTENT_SOURCE', 'AMAZON_CREDENTIAL_ID', 'AMAZON_CREDENTIAL_SECRET', 'AMAZON_CREDENTIAL_VERSION', 'AMAZON_PARTNER_TAG', 'AMAZON_MARKETPLACE']
const environment = Object.fromEntries(keys.map(key => [key, process.env[key]]))
const config = { apiUrl: 'https://cms.thesolemart.com/wp-json/wp/v2/', username: 'fixture-writer', applicationPassword: 'not-a-real-application-password' }
beforeEach(() => { for (const key of keys) delete process.env[key]; process.env.SOLEMART_CONTENT_SOURCE = 'wordpress' })
afterEach(() => { globalThis.fetch = originalFetch; for (const key of keys) { if (environment[key] === undefined) delete process.env[key]; else process.env[key] = environment[key] } })

function wordpress(options = {}) {
  const calls = []
  const shoes = new Map()
  const guides = new Map()
  let nextId = 1001
  const fetcher = async (raw, init = {}) => {
    const url = new URL(raw)
    calls.push({ url: url.href, init })
    if (url.hostname === 'creatorsapi.amazon') {
      assert.ok(init.headers.Authorization.startsWith('Bearer '))
      return Response.json({ itemsResult: { items: JSON.parse(init.body).itemIds.map(asin => apiItem(asin, { itemInfo: { title: { displayValue: `Fixture Brand Model ${asin.slice(-1)} Black 9` }, byLineInfo: { brand: { displayValue: 'Fixture Brand' } } } })) } })
    }
    if (url.hostname.endsWith('.amazoncognito.com')) return Response.json({ access_token: 'fixture-token', expires_in: 3600 })
    assert.equal(url.origin, 'https://cms.thesolemart.com')
    assert.equal(init.redirect, 'error')
    assert.equal(init.cache, 'no-store')
    assert.equal(init.headers.Authorization, `Basic ${Buffer.from(`${config.username}:${config.applicationPassword}`).toString('base64')}`)
    const path = url.pathname.replace('/wp-json/wp/v2/', '')
    if (path.startsWith('users/me')) return options.authFailure ? Response.json({ message: 'fixture secret must not appear in error logs' }, { status: 401 }) : Response.json({ id: 7, name: 'Fixture writer', capabilities: { edit_posts: true, solemart_ingest_guides: !options.noIngestionCapability, ...(options.privileged ? { publish_posts: true } : {}) } })
    if (path === 'types') return Response.json({ shoe: { rest_base: 'shoes' }, buying_guides: { rest_base: 'buying-guides' } })
    if (init.method === 'OPTIONS') return Response.json({ schema: { properties: { acf: {}, excerpt: {}, categories: {}, tags: {}, meta: { properties: options.noBridge ? {} : { _solemart_workflow_status: {}, _solemart_material_hash: {}, rank_math_title: {} } } } } })
    if (path.startsWith('media/')) {
      const id = Number(path.split('/')[1])
      if (init.method === 'POST') assert.ok(options.blankAlt && options.ownMedia, 'Other authors or existing media alt text must be preserved')
      else assert.equal(url.searchParams.get('context'), 'view', 'Reading another author\'s published image must not require edit capability')
      return Response.json({ id, author: options.ownMedia ? 7 : 99, media_type: options.badMedia ? 'file' : 'image', source_url: `https://cms.thesolemart.com/wp-content/uploads/fixture-${id}.png`, alt_text: options.blankAlt ? '' : 'Existing manually written alt text' })
    }
    const store = path === 'shoes' ? shoes : guides
    if (init.method === 'GET') {
      if (options.existingGuide && path === 'buying-guides') return Response.json([{ id: 99, slug: url.searchParams.get('slug'), status: 'publish', title: { raw: 'Existing article' } }])
      return Response.json([...store.values()].filter(row => row.slug === url.searchParams.get('slug')))
    }
    if (path === 'shoes' && options.failSecondProduct && shoes.size === 1) return new Response('', { status: 403 })
    const body = JSON.parse(init.body)
    assert.equal(body.status, 'draft', 'The client must never request publication')
    const row = { ...body, id: nextId++, status: 'draft', title: { raw: body.title } }
    store.set(row.id, row)
    return Response.json(row)
  }
  return { fetcher, calls, shoes, guides }
}

test('explicit incomplete mode writes five private drafts using actual REST bases, ACF and approved Rank Math fields', async () => {
  const { article } = fixtureArticle()
  article.products.forEach(product => { product.amazonAffiliateUrl = '' })
  const mock = wordpress()
  const result = await saveWordPressBuyingGuideDraft(article, { config, fetcher: mock.fetcher, allowIncomplete: true })
  assert.equal(result.published, false)
  assert.equal(result.status, 'DRAFT_CREATED')
  assert.equal(result.report.status, 'FAIL')
  assert.equal(mock.shoes.size, 4)
  assert.equal(mock.guides.size, 1)
  const guide = [...mock.guides.values()][0]
  assert.equal(guide.acf.pick_1_shoe, result.shoeIds[0])
  assert.equal(guide.acf.pick_4_commentary, article.products[3].detailedVerdict)
  assert.equal(guide.meta.rank_math_focus_keyword, article.targetKeyword)
  assert.equal(guide.meta.rank_math_canonical_url, 'https://thesolemart.com/best-shoes/best-fixture-shoes')
  assert.equal(guide.meta._solemart_workflow_status, 'NEEDS_REVIEW')
  assert.equal(guide.meta._solemart_word_target, GUIDE_WORD_TARGET)
  assert.equal(guide.content, '', 'Do not duplicate the full structured guide inside its supplemental body')
  assert.match(result.editorUrl, /post\.php\?post=\d+&action=edit/)
  assert.ok([...mock.shoes.values()].every(row => row.acf.verification_status === 'PENDING'))
})

test('strict mode does not write when live verification or tracking is incomplete', async () => {
  const { article } = fixtureArticle()
  await assert.rejects(saveWordPressBuyingGuideDraft(article, { config, fetcher: async () => assert.fail('Gate must block before WordPress access') }), /gate blocked/)
})

test('the draft writer can read existing public images, but only fills missing alt text on its own media', async () => {
  const own = wordpress({ blankAlt: true, ownMedia: true })
  await saveWordPressBuyingGuideDraft(fixtureArticle().article, { config, fetcher: own.fetcher, allowIncomplete: true })
  assert.equal(own.calls.filter(call => call.url.includes('/media/') && call.init.method === 'POST').length, 5)
  const other = wordpress({ blankAlt: true })
  await assert.rejects(saveWordPressBuyingGuideDraft(fixtureArticle().article, { config, fetcher: other.fetcher, allowIncomplete: true }), /Other authors' media/)
  assert.equal(other.shoes.size + other.guides.size, 0)
  assert.equal(other.calls.filter(call => call.url.includes('/media/') && call.init.method === 'POST').length, 0)
})

test('invalid WordPress authentication and overly privileged accounts are refused without mutations', async () => {
  for (const options of [{ authFailure: true }, { privileged: true }, { noIngestionCapability: true }]) {
    const mock = wordpress(options)
    await assert.rejects(saveWordPressBuyingGuideDraft(fixtureArticle().article, { config, fetcher: mock.fetcher, allowIncomplete: true }), /authentication|Draft Writer/)
    assert.equal(mock.shoes.size + mock.guides.size, 0)
  }
})

test('missing bridge, invalid media and an existing public slug block creation rather than overwriting', async () => {
  for (const options of [{ noBridge: true }, { badMedia: true }, { existingGuide: true }]) {
    const mock = wordpress(options)
    await assert.rejects(saveWordPressBuyingGuideDraft(fixtureArticle().article, { config, fetcher: mock.fetcher, allowIncomplete: true }), /bridge|attachment|already exists/)
    assert.equal(mock.shoes.size + mock.guides.size, 0)
  }
})

test('a partial failure reports completed draft IDs and is never retried as a duplicate write', async () => {
  const mock = wordpress({ failSecondProduct: true })
  const steps = []
  await assert.rejects(saveWordPressBuyingGuideDraft(fixtureArticle().article, { config, fetcher: mock.fetcher, allowIncomplete: true, onProgress: step => steps.push(step) }), /capability check failed/)
  assert.equal(mock.shoes.size, 1)
  assert.equal(mock.guides.size, 0)
  assert.equal(steps.length, 1)
  assert.equal(steps[0].kind, 'created-shoe-draft')
  assert.ok(Number.isInteger(steps[0].id))
})

test('unsafe REST configuration is rejected before credentials can leave the process', async () => {
  for (const apiUrl of ['http://cms.thesolemart.com/wp-json/wp/v2/', 'https://u:p@cms.thesolemart.com/wp-json/wp/v2/', 'https://cms.thesolemart.com/another-api/', 'https://cms.thesolemart.com/wp-json/wp/v2/?redirect=elsewhere']) {
    await assert.rejects(saveWordPressBuyingGuideDraft(fixtureArticle().article, { config: { ...config, apiUrl }, allowIncomplete: true, fetcher: async () => assert.fail('Invalid configuration must not fetch') }), /requires|requires|WordPress draft writing/)
  }
})

test('a rerun refuses an existing guide and preserves manual edits', async () => {
  const mock = wordpress()
  const { article } = fixtureArticle()
  await saveWordPressBuyingGuideDraft(article, { config, fetcher: mock.fetcher, allowIncomplete: true })
  const guide = [...mock.guides.values()][0]
  guide.acf.intro = '<p>A human editor changed this introduction.</p>'
  await assert.rejects(saveWordPressBuyingGuideDraft(article, { config, fetcher: mock.fetcher, allowIncomplete: true }), /already exists/)
  assert.equal(mock.guides.size, 1)
  assert.match([...mock.guides.values()][0].acf.intro, /human editor/)
})

test('a fully verified synthetic job saves READY drafts without persisting API prices or downloaded images', async () => {
  process.env.AMAZON_CREDENTIAL_ID = 'fixture-wordpress-ready'
  process.env.AMAZON_CREDENTIAL_SECRET = 'not-real'
  process.env.AMAZON_CREDENTIAL_VERSION = '2.1'
  process.env.AMAZON_PARTNER_TAG = 'fixture-20'
  process.env.AMAZON_MARKETPLACE = 'www.amazon.com'
  const mock = wordpress()
  globalThis.fetch = mock.fetcher
  const result = await saveWordPressBuyingGuideDraft(fixtureArticle().article, { config, fetcher: mock.fetcher })
  assert.equal(result.report.status, 'PASS')
  for (const row of [...mock.shoes.values(), ...mock.guides.values()]) {
    assert.equal(row.status, 'draft')
    assert.equal(row.meta._solemart_workflow_status, 'READY_FOR_REVIEW')
    assert.doesNotMatch(JSON.stringify(row), /\$123\.45|m\.media-amazon\.com/)
  }
  assert.ok(mock.calls.every(call => !call.url.includes('/wp-admin/') && !call.url.includes('m.media-amazon.com')))
})
