import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildAmazonAffiliateUrl, validateAmazonAsin, validateAmazonAffiliateUrl, publicHttpsUrl } from '../lib/affiliate-products.ts'
import { getAmazonProductOffers, getAmazonProductOffer, isCurrentAmazonOffer } from '../lib/amazon-creators.ts'
import { apiItem } from './fixtures/ingestion.mjs'

let sequence = 0
function config(version = '2.1') { return { credentialId: `fixture-id-${++sequence}`, credentialSecret: 'not-a-real-credential', version, partnerTag: 'fixture-20', marketplace: 'www.amazon.com' } }
function fakeApi(items, calls) {
  return async (url, options) => {
    calls.push({ url: String(url), options })
    return String(url).includes('oauth2/token') || String(url).includes('/auth/o2/token')
      ? Response.json({ access_token: 'fixture-token', expires_in: 3600 })
      : Response.json({ itemsResult: { items } })
  }
}

test('ASIN, affiliate domain/tag and evidence URL validation reject malformed or unsafe input', () => {
  assert.equal(validateAmazonAsin('B0TEST0001'), true)
  for (const value of ['', null, 'b0test0001', 'B0TEST00010', 'B0TEST000/', ['B0TEST0001']]) assert.equal(validateAmazonAsin(value), false)
  assert.equal(buildAmazonAffiliateUrl('B0TEST0001', ''), '')
  const good = buildAmazonAffiliateUrl('B0TEST0001', 'fixture-20')
  assert.equal(good, 'https://www.amazon.com/dp/B0TEST0001?tag=fixture-20')
  assert.equal(validateAmazonAffiliateUrl(good, 'B0TEST0001', 'fixture-20', 'www.amazon.com'), true)
  for (const url of ['https://amazon.com.evil.test/dp/B0TEST0001?tag=fixture-20', 'https://user:pass@amazon.com/dp/B0TEST0001?tag=fixture-20', 'https://www.amazon.com/dp/B0TEST0002?tag=fixture-20', good + '&tag=fixture-20', good.replace('fixture-20', 'wrong-20'), good.replace('.com', '.co.uk')]) assert.equal(validateAmazonAffiliateUrl(url, 'B0TEST0001', 'fixture-20', 'www.amazon.com'), false)
  for (const url of ['http://example.com', 'https://localhost', 'https://127.0.0.1/path', 'https://[::1]/', 'https://u:p@example.com/']) assert.equal(publicHttpsUrl(url), '')
})

test('Creators API uses batched official getItems, scoped OAuth and server-only no-store requests', async () => {
  const calls = []
  const cfg = config()
  const offers = await getAmazonProductOffers(['B0TEST0001', 'B0TEST0002', 'B0TEST0001', 'bad'], { config: cfg, fetcher: fakeApi([apiItem(), apiItem('B0TEST0002')], calls) })
  assert.equal(calls.length, 2)
  assert.equal(calls[0].url, 'https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token')
  assert.equal(new URLSearchParams(calls[0].options.body).get('scope'), 'creatorsapi/default')
  assert.equal(calls[1].url, 'https://creatorsapi.amazon/catalog/v1/getItems')
  assert.equal(calls[1].options.headers.Authorization, 'Bearer fixture-token, Version 2.1')
  assert.equal(calls[1].options.headers['x-marketplace'], 'www.amazon.com')
  assert.deepEqual(JSON.parse(calls[1].options.body).itemIds, ['B0TEST0001', 'B0TEST0002'])
  assert.ok(JSON.parse(calls[1].options.body).resources.includes('offersV2.listings.price'))
  for (const call of calls) { assert.equal(call.options.cache, 'no-store'); assert.equal(call.options.redirect, 'error'); assert.ok(call.options.signal instanceof AbortSignal) }
  assert.equal(offers.length, 2)
  assert.equal(offers[0].displayPrice, '$123.45')
  assert.equal(offers[0].currency, 'USD')
  assert.equal(offers[0].availability, 'Fixture available')
  assert.equal(offers[0].savings, '$5.00')
  assert.equal(offers[0].url, 'https://www.amazon.com/dp/B0TEST0001?tag=fixture-20')
})

test('LWA version 3 uses JSON scope and a plain bearer header', async () => {
  const calls = []
  await getAmazonProductOffers(['B0TEST0001'], { config: config('3.1'), fetcher: fakeApi([apiItem()], calls) })
  assert.equal(calls[0].url, 'https://api.amazon.com/auth/o2/token')
  assert.equal(JSON.parse(calls[0].options.body).scope, 'creatorsapi::default')
  assert.equal(calls[1].options.headers.Authorization, 'Bearer fixture-token')
})

test('offers expire after five minutes and failures cannot replay an expired price', async () => {
  const cfg = config()
  let now = Date.now()
  const calls = []
  const options = { config: cfg, now: () => now, fetcher: fakeApi([apiItem()], calls), sleep: async () => {} }
  const offer = await getAmazonProductOffer('B0TEST0001', options)
  assert.ok(isCurrentAmazonOffer(offer, now))
  await getAmazonProductOffer('B0TEST0001', options)
  assert.equal(calls.length, 2)
  now += 300001
  assert.equal(isCurrentAmazonOffer(offer, now), false)
  const expired = await getAmazonProductOffer('B0TEST0001', { ...options, fetcher: async () => new Response('', { status: 503 }) })
  assert.equal(expired, null)
})

test('authentication failure and unconfigured credentials return safe empty fallback without leaking response data', async () => {
  assert.deepEqual(await getAmazonProductOffers(['B0TEST0001'], { config: null, fetcher: async () => assert.fail('Unconfigured must not fetch') }), [])
  let calls = 0
  assert.deepEqual(await getAmazonProductOffers(['B0TEST0001'], { config: config(), fetcher: async () => { calls++; return Response.json({ error: 'fixture credential response' }, { status: 401 }) } }), [])
  assert.equal(calls, 1)
})

test('429 and transient failures use bounded backoff and respect long Retry-After without sleeping', async () => {
  let count = 0
  const waits = []
  const cfg = config()
  const result = await getAmazonProductOffers(['B0TEST0001'], { config: cfg, sleep: async ms => waits.push(ms), fetcher: async url => {
    if (String(url).includes('oauth2')) return Response.json({ access_token: 'fixture', expires_in: 3600 })
    count++
    return count < 3 ? new Response('', { status: 429, headers: { 'Retry-After': '1' } }) : Response.json({ itemsResult: { items: [apiItem()] } })
  } })
  assert.equal(result.length, 1)
  assert.deepEqual(waits, [1000, 1000])
  const deferred = await getAmazonProductOffers(['B0TEST0001'], { config: config(), sleep: async () => assert.fail('Long rate limit must be deferred'), fetcher: async () => new Response('', { status: 429, headers: { 'Retry-After': '600' } }) })
  assert.deepEqual(deferred, [])
})

test('timeouts are retried a bounded number of times and fall back', async () => {
  let count = 0
  const waits = []
  const result = await getAmazonProductOffers(['B0TEST0001'], { config: config(), sleep: async ms => waits.push(ms), fetcher: async () => { count++; throw new DOMException('Fixture timeout', 'TimeoutError') } })
  assert.deepEqual(result, [])
  assert.equal(count, 3)
  assert.deepEqual(waits, [250, 500])
})

test('missing, restricted, unavailable or currency-mismatched prices do not appear as current prices', async () => {
  for (const mutation of [
    row => { delete row.offersV2 },
    row => { row.offersV2.listings[0].price.money.currency = 'EUR' },
    row => { row.offersV2.listings[0].violatesMAP = true },
    row => { row.offersV2.listings[0].availability.type = 'OUT_OF_STOCK' },
    row => { row.offersV2.listings[0].price.money.amount = 0 },
  ]) {
    const row = apiItem(); mutation(row)
    const offer = await getAmazonProductOffer(row.asin, { config: config(), fetcher: fakeApi([row], []) })
    assert.ok(offer)
    assert.equal(offer.displayPrice, undefined)
  }
})

test('wrong ASIN URLs and non-Amazon item URLs are rejected rather than linked', async () => {
  for (const url of ['https://evil.test/dp/B0TEST0001', 'https://www.amazon.com/dp/B0TEST0002']) {
    assert.equal(await getAmazonProductOffer('B0TEST0001', { config: config(), fetcher: fakeApi([apiItem('B0TEST0001', { detailPageURL: url })], []) }), null)
  }
})

test('savings are shown only when the official amount is positive and its currency matches the price', async () => {
  for (const savings of [{ amount: 5, currency: 'EUR', displayAmount: '€5' }, { amount: -5, currency: 'USD', displayAmount: '$5' }]) {
    const item = apiItem()
    item.offersV2.listings[0].price.savings.money = savings
    const offer = await getAmazonProductOffer(item.asin, { config: config(), fetcher: fakeApi([item], []) })
    assert.equal(offer.displayPrice, '$123.45')
    assert.equal(offer.savings, undefined)
  }
})

test('larger requests use chunks of ten and deduplicate identical concurrent batches', async () => {
  const cfg = config()
  const calls = []
  const ids = Array.from({ length: 23 }, (_, i) => `B0TEST${String(i).padStart(4, '0')}`)
  const fetcher = async (url, options) => {
    if (String(url).includes('oauth2')) return Response.json({ access_token: 'fixture', expires_in: 3600 })
    const body = JSON.parse(options.body); calls.push(body.itemIds)
    return Response.json({ itemsResult: { items: body.itemIds.map(id => apiItem(id)) } })
  }
  const [a, b] = await Promise.all([getAmazonProductOffers(ids, { config: cfg, fetcher }), getAmazonProductOffers(ids, { config: cfg, fetcher })])
  assert.equal(a.length, 23)
  assert.equal(b.length, 23)
  assert.deepEqual(calls.map(row => row.length), [10, 10, 3])
})
