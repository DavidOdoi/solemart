// Synthetic test data only. These names, ASINs and source records are not real
// recommendations and must never be sent to a live WordPress site.
import { editorialWordCount } from '../../lib/guide-ingestion.ts'
import { GUIDE_WORD_TARGET } from '../../lib/guide-editorial-settings.ts'

export function fixtureArticle() {
  const now = Date.now()
  const evidence = (key, claim, sourceUrl = 'https://manufacturer.example.test/fixture') => ({ key, claim, verdict: 'SUPPORTED', sourceUrl, sourceType: 'MANUFACTURER', correctedValue: null, confidence: 'HIGH', checkedAt: new Date(now).toISOString(), sourceExcerpt: 'Synthetic source excerpt for automated tests only; no real product verification has occurred.', reviewedBy: 'Fixture reviewer' })
  const products = Array.from({ length: 4 }, (_, index) => {
    const product = {
      productName: `Fixture Brand Model ${index + 1}`, brand: 'Fixture Brand', model: `Model ${index + 1}`,
      slug: `fixture-model-${index + 1}`, asin: `B0TEST000${index + 1}`,
      amazonAffiliateUrl: `https://www.amazon.com/dp/B0TEST000${index + 1}?tag=fixture-20`,
      manufacturerUrl: `https://manufacturer.example.test/products/model-${index + 1}`,
      category: 'Test fixture', awardLabel: 'Fixture category', bestFor: 'Fixture indoor use', avoidIf: 'Fixture unsuitable conditions',
      shortDescription: 'Synthetic editorial description for a non-existent fixture product.', detailedVerdict: '<p>Synthetic product commentary for automated tests.</p>',
      specifications: [{ label: 'Upper', value: 'Fixture textile' }, { label: 'Outsole', value: 'Fixture rubber' }],
      pros: ['Fixture fit option', 'Fixture material description'], cons: ['Fixture sizing limitation'],
      sizingInformation: 'Fixture size nine', availableWidths: 'Fixture standard width', availableColors: 'Fixture black', variant: 'black 9',
      productImage: `https://cms.thesolemart.com/wp-content/uploads/fixture-${index + 1}.png`, imageAltText: 'Synthetic fixture image for a test product', wordpressMediaId: 201 + index,
      evidenceSources: [], verificationStatus: 'PENDING', verificationDate: null, verificationNotes: '', displayOrder: index + 1,
    }
    for (const key of ['brand', 'model', 'bestFor', 'avoidIf', 'shortDescription', 'detailedVerdict', 'sizingInformation', 'availableWidths', 'availableColors', 'variant']) {
      product.evidenceSources.push(evidence(key, product[key].replace(/<[^>]+>/g, ''), product.manufacturerUrl))
    }
    product.evidenceSources.push(evidence('image', product.productImage, product.manufacturerUrl))
    product.specifications.forEach((row, i) => product.evidenceSources.push(evidence(`specifications.${i}`, `${row.label}: ${row.value}`, product.manufacturerUrl)))
    product.pros.forEach((row, i) => product.evidenceSources.push(evidence(`pros.${i}`, row, product.manufacturerUrl)))
    product.cons.forEach((row, i) => product.evidenceSources.push(evidence(`cons.${i}`, row, product.manufacturerUrl)))
    return product
  })
  const article = {
    version: 1, title: 'Best Fixture Shoes', targetKeyword: 'best fixture shoes', secondaryKeywords: ['fixture fit'], slug: 'best-fixture-shoes',
    excerpt: 'Synthetic fixture article used only for testing the draft-ingestion workflow.',
    seoTitle: 'Best Fixture Shoes: Test-Only Buying Guide', metaDescription: 'Synthetic fixture metadata for testing the complete buying-guide workflow, its structured fields, safe drafts, and deterministic publication checks.',
    category: 'Test fixture', authorId: 7, featuredMediaId: 101, imageAltText: 'Synthetic fixture featured image for automated tests',
    intro: '<p>Best fixture shoes is a synthetic keyword used to exercise the editorial pipeline safely.</p>', quickAnswerTitle: 'Best fixture shoes: quick answer', quickAnswerBody: 'This is synthetic test copy, not a product recommendation.',
    howWeChose: ['Synthetic manufacturer records and API responses are injected only by tests.'],
    advice: '', whoItsFor: ['Fixture test readers only.', 'A second synthetic audience paragraph.', 'A third synthetic audience paragraph.'], mistakesToAvoid: ['Do not publish this synthetic fixture.', 'Do not treat fixture facts as real evidence.', 'Do not send this fixture to the live CMS.'], finalVerdict: '<p>Keep fixture data separate from real editorial research.</p>',
    disclosure: 'SOLEMART may earn a commission from qualifying purchases through affiliate links.',
    faqs: Array.from({ length: 4 }, (_, i) => ({ question: `Fixture question ${i + 1}?`, answer: '<p>A synthetic answer for this test fixture.</p>' })),
    products, claimEvidence: [evidence('editorial.example', 'Synthetic article claim for a test fixture.')], editorialReviewedBy: 'Fixture reviewer', editorialReviewedAt: new Date(now).toISOString(), handsOnTestingEvidence: [],
  }
  const needed = GUIDE_WORD_TARGET - editorialWordCount(article)
  article.advice = `<p>${Array.from({ length: needed }, (_, i) => `fixtureword${i}`).join(' ')}</p>`
  const offers = products.map(product => ({ asin: product.asin, title: `${product.productName} Black 9`, brand: product.brand, variant: 'Black 9', imageUrl: 'https://m.media-amazon.com/images/I/FIXTURE.png', url: product.amazonAffiliateUrl, fetchedAt: new Date(now).toISOString(), expiresAt: new Date(now + 300000).toISOString(), marketplace: 'www.amazon.com' }))
  return { article, offers, now }
}

export function apiItem(asin = 'B0TEST0001', overrides = {}) {
  return {
    asin, detailPageURL: `https://www.amazon.com/dp/${asin}?tag=fixture-20`,
    itemInfo: { title: { displayValue: 'Fixture Brand Model 1 Black 9' }, byLineInfo: { brand: { displayValue: 'Fixture Brand' } } },
    variationAttributes: [{ name: 'Color', value: 'Black' }, { name: 'Size', value: '9' }],
    images: { primary: { large: { url: 'https://m.media-amazon.com/images/I/FIXTURE.png' } } },
    offersV2: { listings: [{ isBuyBoxWinner: true, availability: { type: 'IN_STOCK', message: 'Fixture available' }, price: { money: { amount: 123.45, currency: 'USD', displayAmount: '$123.45' }, savings: { money: { amount: 5, currency: 'USD', displayAmount: '$5.00' } } } }] },
    ...overrides,
  }
}
