import { test } from 'node:test'
import assert from 'node:assert/strict'
import { bestGuideDrafts, getBestGuideDraft } from '../data/best-guide-drafts.ts'
import { editorialWordCount } from '../lib/guide-ingestion.ts'
import { GUIDE_WORD_TARGET } from '../lib/guide-editorial-settings.ts'
import { guides } from '../data/guides.ts'
import sitemap from '../app/sitemap.ts'

function editorialArticle({ guide: g, products }) {
  return {
    intro: g.intro, quickAnswerBody: g.quickAnswerBody, howWeChose: g.howWeChose,
    advice: [g.contentHtml, ...g.buyingGuideSections.flatMap(section => section.paragraphs)].join('\n'),
    whoItsFor: g.whoItsFor, mistakesToAvoid: g.mistakesToAvoid, finalVerdict: g.finalVerdict, faqs: g.faqs,
    products: products.map(product => ({ shortDescription: product.shortReason, bestFor: product.bestFor, avoidIf: product.avoidIf, detailedVerdict: product.reviewHtml, pros: product.pros, cons: product.cons })),
  }
}

test('three complete text drafts meet the editorial target and four-profile template contract', () => {
  assert.equal(bestGuideDrafts.length, 3)
  const ids = []
  for (const draft of bestGuideDrafts) {
    const { guide, products } = draft
    assert.strictEqual(getBestGuideDraft(guide.slug), draft)
    assert.equal(editorialWordCount(editorialArticle(draft)), GUIDE_WORD_TARGET, guide.slug)
    assert.equal(draft.targetWords, GUIDE_WORD_TARGET)
    assert.equal(products.length, 4)
    assert.equal(new Set(products.map(product => product.model)).size, 4)
    assert.deepEqual(guide.productSlugs, products.map(product => product.slug))
    assert.equal(guide.whoItsFor.length, 3)
    assert.equal(guide.mistakesToAvoid.length, 3)
    assert.equal(guide.faqs.length, 4)
    assert.ok(guide.quickAnswerBody.includes('The '))
    assert.ok(guide.intro.includes('Tecovas men’s'))
    assert.equal(guide.publishedAt, undefined)
    assert.equal(guide.reviewedBy, undefined)
    ids.push(...products.map(product => product.id))
  }
  assert.equal(new Set(ids).size, 12, 'Preview actions must not share IDs across guides')
  assert.ok(ids.every(id => id.startsWith('preview-')))
  assert.equal(getBestGuideDraft('not-a-guide'), undefined)
})

test('variant-specific evidence stays separate and missing assets or retailer matches cannot become verified', () => {
  for (const draft of bestGuideDrafts) {
    assert.equal(draft.publicationApproved, false)
    assert.equal(draft.sourceBasis, 'SUPPLIED_RESEARCH')
    assert.equal(draft.guide.image, '')
    assert.equal(draft.sourceRecords.length, 4)
    for (const product of draft.products) {
      const source = draft.sourceRecords.find(record => record.productSlug === product.slug)
      assert.ok(source)
      assert.ok(product.name.endsWith(source.variant))
      assert.equal(new URL(source.manufacturerUrl).hostname, 'www.tecovas.com')
      assert.equal(source.independentlyVerified, false)
      assert.equal(source.imageAssetUrl, null)
      assert.equal(source.imagePermission, 'UNCONFIRMED')
      assert.equal(source.amazonMatch, 'PENDING')
      assert.equal(product.verificationStatus, 'PENDING')
      assert.equal(product.image, '')
      assert.equal(product.affiliateUrl, undefined)
      assert.equal(product.asin, undefined)
    }
  }
  const cowhide = getBestGuideDraft('best-cowhide-boots')
  const exotic = getBestGuideDraft('best-exotic-leather-boots')
  const footbed = (draft, model) => draft.products.find(product => product.model === model).specs.find(spec => spec.label === 'Footbed').value
  assert.doesNotMatch(footbed(cowhide, 'The Warren'), /tri-layer/i)
  assert.match(footbed(exotic, 'The Warren'), /tri-layer/i)
  assert.doesNotMatch(footbed(cowhide, 'The Garrett'), /steel shank/i)
  assert.match(footbed(exotic, 'The Garrett'), /steel shank/i)
})

test('unapproved best guides never enter the public inventory or sitemap', async () => {
  const original = process.env.WORDPRESS_GRAPHQL_URL
  delete process.env.WORDPRESS_GRAPHQL_URL
  try {
    const entries = await sitemap()
    for (const draft of bestGuideDrafts) {
      assert.ok(!guides.some(guide => guide.slug === draft.guide.slug))
      assert.ok(!entries.some(entry => new URL(entry.url).pathname === `/best-shoes/${draft.guide.slug}`))
    }
    assert.ok(entries.every(entry => !new URL(entry.url).pathname.startsWith('/template-preview/')))
  } finally {
    if (original === undefined) delete process.env.WORDPRESS_GRAPHQL_URL
    else process.env.WORDPRESS_GRAPHQL_URL = original
  }
})
