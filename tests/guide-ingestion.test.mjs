import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validateBuyingGuide, sanitizeIngestionArticle, editorialWordCount } from '../lib/guide-ingestion.ts'
import { fixtureArticle } from './fixtures/ingestion.mjs'

const validate = ({ article, offers, now }, extra = {}) => validateBuyingGuide(article, { offers, now, partnerTag: 'fixture-20', ...extra })

test('a complete synthetic 1,700-word article passes the evidence/identity gate and can only create a draft', async () => {
  const fixture = fixtureArticle()
  assert.equal(editorialWordCount(fixture.article), 1700)
  const result = await validate(fixture)
  assert.deepEqual(result.criticalErrors, [])
  assert.equal(result.status, 'PASS')
  assert.equal(result.wordpressAction, 'CREATE_DRAFT')
  assert.equal(result.productsChecked, 4)
  assert.equal(result.verifiedProducts.length, 4)
  assert.equal(result.wordCount, 1700)
})

test('missing/invalid ASIN, wrong affiliate tracking and duplicate picks block verification', async () => {
  for (const [code, mutate] of [
    ['ASIN', row => { row.products[0].asin = '' }],
    ['ASIN', row => { row.products[0].asin = 'invalid' }],
    ['AFFILIATE_LINK', row => { row.products[0].amazonAffiliateUrl = 'https://www.amazon.com/dp/B0TEST0001?tag=wrong-20' }],
    ['DUPLICATE_ASIN', row => { row.products[1].asin = row.products[0].asin }],
    ['MANUFACTURER', row => { row.products[0].manufacturerUrl = '' }],
    ['FEATURED_IMAGE', row => { row.featuredMediaId = 0 }],
    ['FEATURED_IMAGE', row => { row.featuredMediaId = -1 }],
  ]) {
    const fixture = fixtureArticle(); mutate(fixture.article)
    const result = await validate(fixture)
    assert.equal(result.status, 'FAIL')
    assert.equal(result.wordpressAction, 'BLOCK')
    assert.ok(result.criticalErrors.some(row => row.code === code), code)
  }
})

test('unsupported, conflicting, missing, stale and low-confidence claims never become verified from an input flag', async () => {
  for (const mutate of [
    row => { row.evidenceSources[0].verdict = 'UNSUPPORTED' },
    row => { row.evidenceSources[0].verdict = 'CONFLICTING' },
    row => { row.evidenceSources[0].verdict = 'NOT_FOUND' },
    row => { row.evidenceSources[0].confidence = 'LOW' },
    row => { row.evidenceSources[0].checkedAt = '2000-01-01T00:00:00Z' },
    row => { row.evidenceSources[0].sourceUrl = 'https://localhost/private' },
    row => { row.evidenceSources = [] },
  ]) {
    const fixture = fixtureArticle()
    fixture.article.products[0].verificationStatus = 'VERIFIED'
    mutate(fixture.article.products[0])
    const result = await validate(fixture)
    assert.equal(result.status, 'FAIL')
    assert.ok(!result.verifiedProducts.includes(fixture.article.products[0].asin))
    assert.ok(result.criticalErrors.some(row => row.code === 'PRODUCT_EVIDENCE'))
  }
})

test('current official identity, correct variant and returned image are critical, independently of authored evidence', async () => {
  for (const mutate of [
    row => { row.offers = [] },
    row => { row.offers[0].title = 'Different product'; row.offers[0].brand = 'Other brand' },
    row => { row.article.products[0].variant = 'purple 12' },
    row => { row.offers[0].imageUrl = '' },
    row => { row.offers[0].expiresAt = new Date(row.now - 1).toISOString() },
  ]) {
    const fixture = fixtureArticle(); mutate(fixture)
    const result = await validate(fixture)
    assert.equal(result.status, 'FAIL')
    assert.ok(result.criticalErrors.some(row => ['AMAZON_IDENTITY', 'IDENTITY_CONFLICT', 'VARIANT_CONFLICT', 'IMAGE_MATCH'].includes(row.code)))
  }
})

test('static offer fields/text, unsupported treatment promises and unperformed testing are blocked', async () => {
  for (const [code, mutate] of [
    ['STATIC_OFFER', row => { row.products[0].currentPrice = '$99.00' }],
    ['STATIC_OFFER', row => { row.products[0].shortDescription += ' In stock for $99.' }],
    ['STATIC_OFFER', row => { row.intro += '<p>Save 25% off today.</p>' }],
    ['MEDICAL_CLAIM', row => { row.products[0].detailedVerdict = 'Guaranteed pain relief from these shoes.' }],
    ['UNPERFORMED_TESTING', row => { row.products[0].detailedVerdict = 'We personally tested these shoes.' }],
  ]) {
    const fixture = fixtureArticle(); mutate(fixture.article)
    const result = await validate(fixture)
    assert.equal(result.status, 'FAIL')
    assert.ok(result.criticalErrors.some(row => row.code === code), code)
  }
})

test('tracking ID deferral permits preparation but never marks an untracked recommendation verified', async () => {
  const fixture = fixtureArticle()
  const result = await validate(fixture, { partnerTag: '' })
  assert.equal(result.status, 'FAIL')
  assert.ok(result.warnings.some(row => row.code === 'TAG_PENDING'))
  assert.ok(result.criticalErrors.some(row => row.code === 'AFFILIATE_LINK'))
  assert.equal(result.verifiedProducts.length, 0)
})

test('required fields, exact word count, selected keyword and existing canonical slugs are checked', async () => {
  for (const [code, mutate] of [
    ['REQUIRED', row => { row.intro = '' }],
    ['KEYWORD', row => { row.seoTitle = 'A different guide' }],
    ['WORD_COUNT', row => { row.advice += ' extra' }],
    ['DISCLOSURE', row => { row.disclosure = 'A product guide.' }],
  ]) {
    const fixture = fixtureArticle(); mutate(fixture.article)
    const result = await validate(fixture)
    assert.ok(result.criticalErrors.some(row => row.code === code), code)
  }
  const fixture = fixtureArticle()
  const duplicate = await validate(fixture, { existingArticles: [{ slug: fixture.article.slug, title: fixture.article.title, text: fixture.article.intro }] })
  assert.ok(duplicate.criticalErrors.some(row => row.code === 'DUPLICATE_SLUG'))
})

test('substantially duplicate articles are blocked even if their titles and slugs differ', async () => {
  const fixture = fixtureArticle()
  const prior = [fixture.article.intro, fixture.article.quickAnswerBody, fixture.article.advice, fixture.article.finalVerdict].join(' ')
  const report = await validate(fixture, { existingArticles: [{ slug: 'another-slug', title: 'Another article', text: prior }] })
  assert.ok(report.criticalErrors.some(row => row.code === 'DUPLICATE_CONTENT'))
})

test('malformed JSON values return structured errors rather than throwing or writing', async () => {
  for (const value of [null, [], {}, { version: 1 }, { ...fixtureArticle().article, products: [null, null, null, null] }, { ...fixtureArticle().article, faqs: ['wrong'] }]) {
    const result = await validateBuyingGuide(value, { offers: [] })
    assert.equal(result.status, 'FAIL')
    assert.equal(result.wordpressAction, 'BLOCK')
    assert.ok(result.criticalErrors.length > 0)
  }
})

test('safe article HTML keeps editorial links while removing executable content', () => {
  const { article } = fixtureArticle()
  article.intro = '<p onclick="bad()">Text <a href="/blog/how-to-choose-walking-shoes">internal</a> <a href="https://source.example.test/reference">source</a></p><script>bad()</script>'
  article.advice = '<h3>Advice</h3><img src="https://cms.thesolemart.com/wp-content/uploads/image.png" onerror="bad()"><iframe src="https://bad.test"></iframe>'
  const clean = sanitizeIngestionArticle(article)
  assert.doesNotMatch(clean.intro + clean.advice, /onclick|onerror|<script|<iframe/)
  assert.match(clean.intro, /href="\/blog\/how-to-choose-walking-shoes"/)
  assert.match(clean.intro, /rel="noopener noreferrer"/)
})

test('keyword queue includes only eight green rows plus the user-approved partial-green hiking row', async () => {
  const queue = JSON.parse(await readFile(new URL('../data/ingestion/selected-keywords.json', import.meta.url), 'utf8'))
  assert.equal(queue.articles.length, 9)
  assert.ok(queue.articles.some(row => row.keyword === 'best hiking shoes for kids'))
  assert.ok(queue.articles.every(row => row.targetWords === 1700 && row.productsRequired === 4))
  assert.equal(queue.articles.filter(row => row.searchIntentOverlap === 'forefoot-pain').length, 2)
  assert.ok(!queue.articles.some(row => /pickleball|achilles|morton|bowling|aqua/.test(row.keyword)))
  assert.equal(queue.autoPublish, false)
})

test('malformed testing records, invalid taxonomy IDs and future reviews cannot pass the gate', async () => {
  for (const [code, mutate] of [
    ['TESTING_RECORD', row => { row.handsOnTestingEvidence = 'claimed evidence' }],
    ['TAXONOMY', row => { row.categoryIds = [-1] }],
    ['TAXONOMY', row => { row.tagIds = 'all tags' }],
    ['EDITORIAL_REVIEW', row => { row.editorialReviewedAt = '2099-01-01T00:00:00Z' }],
  ]) {
    const fixture = fixtureArticle(); mutate(fixture.article)
    const report = await validate(fixture)
    assert.equal(report.status, 'FAIL')
    assert.ok(report.criticalErrors.some(row => row.code === code), code)
  }
})

test('a technical specification cited only to an independent publication cannot replace manufacturer evidence', async () => {
  const fixture = fixtureArticle()
  const row = fixture.article.products[0].evidenceSources.find(row => row.key === 'specifications.0')
  row.sourceType = 'INDEPENDENT'
  row.sourceUrl = 'https://publication.example.test/review'
  const report = await validate(fixture)
  assert.equal(report.status, 'FAIL')
  assert.ok(report.criticalErrors.some(row => row.field === 'products.0.specifications.0'))
})
