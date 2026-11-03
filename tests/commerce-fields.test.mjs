import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getWordPressAcfBuyingGuide } from '../lib/wordpress.ts'
import { mapAcfGuideFields } from '../lib/guide-fields.ts'
import { getTrackedGuideProducts, getGuideAmazonOffers } from '../lib/amazon-guide-offers.ts'

const originalFetch = globalThis.fetch
const keys = ['SOLEMART_CONTENT_SOURCE', 'WORDPRESS_GRAPHQL_URL', 'AMAZON_CREDENTIAL_ID', 'AMAZON_CREDENTIAL_SECRET', 'AMAZON_CREDENTIAL_VERSION', 'AMAZON_PARTNER_TAG', 'AMAZON_MARKETPLACE']
const saved = Object.fromEntries(keys.map(key => [key, process.env[key]]))
beforeEach(() => { for (const key of keys) delete process.env[key]; process.env.SOLEMART_CONTENT_SOURCE = 'wordpress'; process.env.WORDPRESS_GRAPHQL_URL = 'https://cms.thesolemart.com/graphql' })
afterEach(() => { globalThis.fetch = originalFetch; for (const key of keys) { if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key] } })

const guide = { id: 'fixture-guide', title: 'Fixture guide', slug: 'fixture-guide', status: 'publish', content: '', excerpt: '', dateGmt: null, modifiedGmt: null, featuredImage: null, solemartBuyingGuideFields: { author: 'Fixture author', intro: 'Fixture introduction.', pick1Shoe: { node: { __typename: 'Shoe', id: 'fixture-shoe' } } } }
const shoe = { id: 'fixture-shoe', title: 'Fixture Brand Model 1', slug: 'fixture-model-1', status: 'publish', featuredImage: null, solemartShoeFields: { brand: 'Fixture Brand', description: 'Fixture description.', affiliateUrl: 'https://www.amazon.com/dp/B0TEST0001?tag=fixture-20', pros: 'Fixture strength', cons: 'Fixture limitation', specs: 'Upper | Fixture mesh', model: 'Model 1', asin: 'B0TEST0001', verificationStatus: 'VERIFIED' } }

test('old ACF schemas retry once without only the optional commerce selections on HTTP 200 and 400', async () => {
  for (const status of [200, 400]) {
    let shoeCalls = 0
    globalThis.fetch = async (_url, init) => {
      const { query } = JSON.parse(init.body)
      if (query.includes('PublishedAcfBuyingGuide')) return Response.json({ data: { buyingGuide: guide } })
      shoeCalls++
      if (/\basin\b/.test(query)) return Response.json({ errors: [{ message: 'Cannot query field "asin" on type "SolemartShoeFields".' }, { message: 'Cannot query field "verificationStatus" on type "SolemartShoeFields".' }] }, { status })
      const legacy = structuredClone(shoe)
      delete legacy.solemartShoeFields.asin
      delete legacy.solemartShoeFields.model
      delete legacy.solemartShoeFields.verificationStatus
      return Response.json({ data: { node: legacy } })
    }
    const result = await getWordPressAcfBuyingGuide('fixture-guide')
    assert.equal(result.post.title, guide.title)
    assert.equal(result.shoes.length, 1)
    assert.equal(shoeCalls, 2)
    assert.equal(result.shoes[0].solemartShoeFields.asin, undefined)
  }
})

test('unrelated schema errors and mixed failures remain errors instead of silently hiding them', async () => {
  globalThis.fetch = async (_url, init) => JSON.parse(init.body).query.includes('PublishedAcfBuyingGuide')
    ? Response.json({ data: { buyingGuide: guide } })
    : Response.json({ errors: [{ message: 'Cannot query field "asin" on type "SolemartShoeFields".' }, { message: 'Database unavailable.' }] }, { status: 400 })
  await assert.rejects(getWordPressAcfBuyingGuide('fixture-guide'), /could not return/)
})

test('commerce fields map without introducing API content or bogus ASINs into editorial models', () => {
  const post = { title: guide.title, slug: guide.slug, date: '', category: '', paragraphs: [], excerpt: '' }
  const result = mapAcfGuideFields(post, guide.solemartBuyingGuideFields, [shoe])
  assert.equal(result.products[0].asin, 'B0TEST0001')
  assert.equal(result.products[0].model, 'Model 1')
  assert.equal(result.products[0].verificationStatus, 'VERIFIED')
  const bad = structuredClone(shoe); bad.solemartShoeFields.asin = 'not-an-asin'
  assert.equal(mapAcfGuideFields(post, guide.solemartBuyingGuideFields, [bad]).products[0].asin, undefined)
})

test('missing tracking/API credentials keep existing links and make no Amazon request', async () => {
  const products = [{ cmsManaged: true, name: 'Fixture Brand Model 1', slug: 'fixture', asin: 'B0TEST0001', brand: 'Fixture Brand', model: 'Model 1', verificationStatus: 'VERIFIED', affiliateUrl: 'https://www.amazon.com/dp/B0TEST0001?tag=oldfixture-20' }]
  globalThis.fetch = async () => assert.fail('No live request without credentials')
  assert.equal(getTrackedGuideProducts(products)[0].affiliateUrl, products[0].affiliateUrl)
  assert.deepEqual(await getGuideAmazonOffers(products), {})
  process.env.AMAZON_PARTNER_TAG = 'newfixture-20'
  assert.equal(getTrackedGuideProducts(products)[0].affiliateUrl, 'https://www.amazon.com/dp/B0TEST0001?tag=newfixture-20')
})
