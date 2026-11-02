import 'server-only'

import { createHash } from 'node:crypto'
import { editorialPlainText, sanitizeCmsArticleHtml, sanitizeEditorialHtml } from './cms-rich-text.ts'
import { marketplaces, normalizedIdentity, publicHttpsUrl, validateAmazonAffiliateUrl, validateAmazonAsin, type AmazonMarketplace, type ClaimEvidence, type IngestionProduct } from './affiliate-products.ts'
import { getAmazonProductOffers, isCurrentAmazonOffer, type AmazonProductOffer } from './amazon-creators.ts'

export type IngestionArticle = {
  version: 1
  title: string
  targetKeyword: string
  secondaryKeywords: string[]
  slug: string
  excerpt: string
  seoTitle: string
  metaDescription: string
  category: string
  authorId?: number
  featuredMediaId?: number
  imageAltText: string
  intro: string
  quickAnswerTitle: string
  quickAnswerBody: string
  howWeChose: string[]
  advice: string
  whoItsFor: string[]
  mistakesToAvoid: string[]
  finalVerdict: string
  disclosure: string
  faqs: { question: string; answer: string }[]
  products: IngestionProduct[]
  claimEvidence: ClaimEvidence[]
  editorialReviewedBy: string
  editorialReviewedAt: string
  handsOnTestingEvidence: string[]
  categoryIds?: number[]
  tagIds?: number[]
}
export type GateIssue = { code: string; field: string; message: string }
export type IngestionReport = {
  status: 'PASS' | 'FAIL'
  articleTitle: string
  targetKeyword: string
  productsChecked: number
  wordCount: number
  criticalErrors: GateIssue[]
  warnings: GateIssue[]
  verifiedProducts: string[]
  rejectedProducts: string[]
  wordpressAction: 'CREATE_DRAFT' | 'BLOCK'
}

const requiredProduct = ['productName', 'brand', 'model', 'slug', 'category', 'awardLabel', 'bestFor', 'avoidIf', 'shortDescription', 'detailedVerdict', 'sizingInformation', 'availableWidths', 'availableColors', 'variant', 'imageAltText'] as const
const requiredArticle = ['title', 'targetKeyword', 'slug', 'excerpt', 'seoTitle', 'metaDescription', 'category', 'intro', 'quickAnswerTitle', 'quickAnswerBody', 'advice', 'finalVerdict', 'disclosure'] as const
const sources = ['MANUFACTURER', 'DOCUMENTATION', 'AMAZON_API', 'PROFESSIONAL', 'INDEPENDENT']
const volatile = /^(?:price|currentPrice|displayPrice|amount|currency|discount|stock|stockStatus|availability|prime|primeStatus|deliveryEstimate|offers|offersV2)$/i
const staticOffer = /(?:[$£€]\s*\d|\b(?:USD|GBP|EUR|JPY|CAD)\s*\d|\b\d+(?:\.\d+)?\s*%\s*off\b|\b(?:in stock|out of stock|prime eligible|delivery by)\b)/i
const unsupportedMedical = /\b(?:cures? (?:metatarsalgia|neuroma|foot pain)|guaranteed (?:pain )?relief|prevents? (?:all )?injuries|clinically proven to treat)\b/i
const testing = /\b(?:we|our (?:team|testers)|i)\s+(?:(?:have|personally|actually|extensively)\s+)*(?:tested|wore|ran in|walked in|used these shoes)\b/i
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
type Options = { marketplace?: AmazonMarketplace; partnerTag?: string; offers?: AmazonProductOffer[]; now?: number; existingArticles?: { slug: string; title: string; text: string }[] }
function string(value: unknown): value is string { return typeof value === 'string' && value.trim().length > 0 && value.length <= 30000 }
function list(value: unknown): value is string[] { return Array.isArray(value) && value.length > 0 && value.length <= 100 && value.every(string) }
function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {} }

export function editorialWordCount(article: IngestionArticle) {
  const texts = [article.intro, article.quickAnswerBody, ...(article.howWeChose || []), article.advice, ...(article.whoItsFor || []), ...(article.mistakesToAvoid || []), article.finalVerdict,
    ...(article.faqs || []).flatMap(row => [row.question, row.answer]),
    ...(article.products || []).flatMap(row => [row.shortDescription, row.bestFor, row.avoidIf, row.detailedVerdict, ...(row.pros || []), ...(row.cons || [])]),
  ].filter(value => typeof value === 'string')
  return texts.reduce((total, value) => total + (editorialPlainText(value).match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu)?.length || 0), 0)
}

function checkEvidence(value: unknown, expectedKey: string, expectedClaim: string, now: number, manufacturer?: string) {
  const row = record(value)
  if (row.key !== expectedKey || row.verdict !== 'SUPPORTED' || row.confidence !== 'HIGH' || !string(row.reviewedBy)
    || !string(row.sourceExcerpt) || row.sourceExcerpt.length < 20 || !sources.includes(String(row.sourceType))
    || !publicHttpsUrl(row.sourceUrl) || !string(row.checkedAt)) return false
  const checked = Date.parse(row.checkedAt)
  if (!Number.isFinite(checked) || checked > now + 300_000 || checked < now - 30 * 86400_000) return false
  if (!string(row.claim) || normalizedIdentity(row.claim) !== normalizedIdentity(expectedClaim)) return false
  if (row.correctedValue != null && normalizedIdentity(String(row.correctedValue)) !== normalizedIdentity(expectedClaim)) return false
  if (manufacturer && ['MANUFACTURER', 'DOCUMENTATION'].includes(String(row.sourceType))
    && new URL(String(row.sourceUrl)).hostname !== new URL(manufacturer).hostname) return false
  return true
}

/** Deterministic evidence and identity checks; a boolean 'verified' cannot bypass them. */
export async function validateBuyingGuide(input: unknown, options: Options = {}): Promise<IngestionReport> {
  const raw = record(input)
  const errors: GateIssue[] = []
  const warnings: GateIssue[] = []
  const add = (code: string, field: string, message: string) => errors.push({ code, field, message })
  const article = raw as unknown as IngestionArticle
  const report: IngestionReport = { status: 'FAIL', articleTitle: typeof raw.title === 'string' ? raw.title : '', targetKeyword: typeof raw.targetKeyword === 'string' ? raw.targetKeyword : '', productsChecked: 0, wordCount: 0, criticalErrors: errors, warnings, verifiedProducts: [], rejectedProducts: [], wordpressAction: 'BLOCK' }
  if (raw.version !== 1) add('FORMAT', 'version', 'Use ingestion format version 1.')
  for (const key of requiredArticle) if (!string(raw[key])) add('REQUIRED', key, 'Required editorial field is empty or invalid.')
  for (const key of ['howWeChose', 'whoItsFor', 'mistakesToAvoid']) if (!list(raw[key])) add('REQUIRED', key, 'Provide a nonempty list of text values.')
  if (!slugPattern.test(String(raw.slug || ''))) add('SLUG', 'slug', 'Use one lowercase hyphenated URL slug.')
  if (!Array.isArray(raw.products) || raw.products.length !== 4) add('PRODUCT_COUNT', 'products', 'The current template requires four distinct picks.')
  else for (const [index, value] of raw.products.entries()) {
    const product = record(value)
    if (!Object.keys(product).length || !['pros', 'cons', 'specifications', 'evidenceSources'].every(key => Array.isArray(product[key]) && product[key].length <= (key === 'evidenceSources' ? 500 : 100))) add('PRODUCT_SHAPE', `products.${index}`, 'Each product needs bounded specification, pros, cons and evidence arrays.')
  }
  if (!Array.isArray(raw.faqs) || raw.faqs.length !== 4 || raw.faqs.some(value => !string(record(value).question) || !string(record(value).answer))) add('FAQ', 'faqs', 'Provide four questions and answers.')
  if (!Array.isArray(raw.claimEvidence) || raw.claimEvidence.length > 500) add('EVIDENCE', 'claimEvidence', 'Provide a bounded claim-by-claim editorial source report.')
  if (!Array.isArray(raw.handsOnTestingEvidence) || raw.handsOnTestingEvidence.length > 100 || !raw.handsOnTestingEvidence.every(value => Boolean(publicHttpsUrl(value)))) add('TESTING_RECORD', 'handsOnTestingEvidence', 'Testing records must be an array of public HTTPS evidence URLs, or an empty array when no testing was performed.')
  const reviewed = Date.parse(String(raw.editorialReviewedAt))
  if (!string(raw.editorialReviewedBy) || !Number.isFinite(reviewed) || reviewed > (options.now ?? Date.now()) + 300_000 || reviewed < (options.now ?? Date.now()) - 30 * 86400_000) add('EDITORIAL_REVIEW', 'editorialReviewedBy', 'Record the real editor and a current review date; do not invent a reviewer.')
  for (const key of ['categoryIds', 'tagIds']) if (raw[key] !== undefined && (!Array.isArray(raw[key]) || raw[key].length > 50 || raw[key].some(value => !Number.isSafeInteger(value) || value < 1))) add('TAXONOMY', key, 'Use a bounded array of real positive WordPress term IDs.')
  if (errors.some(row => ['REQUIRED', 'FORMAT', 'PRODUCT_COUNT', 'PRODUCT_SHAPE', 'FAQ', 'EVIDENCE'].includes(row.code))) return report
  const keyword = normalizedIdentity(article.targetKeyword)
  for (const [field, value] of [['title', article.title], ['seoTitle', article.seoTitle], ['intro', editorialPlainText(article.intro)], ['quickAnswerTitle', article.quickAnswerTitle], ['slug', article.slug.replace(/-/g, ' ')]]) {
    if (!normalizedIdentity(value).includes(keyword)) add('KEYWORD', field, 'Include the focus phrase naturally in this SEO field.')
  }
  if (article.metaDescription.length > 160 || article.metaDescription.length < 90) warnings.push({ code: 'META_LENGTH', field: 'metaDescription', message: 'Review the search snippet length for clarity.' })
  if (!/<a\b[^>]*href=["']\/(?!\/)/i.test(`${article.intro} ${article.advice} ${article.finalVerdict}`)) warnings.push({ code: 'INTERNAL_LINK', field: 'advice', message: 'Add a relevant existing SoleMart article link in context.' })
  if (!/<a\b[^>]*href=["']https:\/\//i.test(`${article.intro} ${article.advice} ${article.finalVerdict}`)) warnings.push({ code: 'EXTERNAL_LINK', field: 'advice', message: 'Link an authoritative source naturally in the guide, as well as retaining its evidence record.' })
  if (!/\b(?:commission|qualifying purchases|affiliate links)\b/i.test(article.disclosure)) add('DISCLOSURE', 'disclosure', 'Provide a clear affiliate disclosure.')
  if (!article.featuredMediaId || !Number.isSafeInteger(article.featuredMediaId) || article.featuredMediaId < 1 || !string(article.imageAltText)) add('FEATURED_IMAGE', 'featuredMediaId', 'Select a real WordPress media attachment and meaningful alt text.')
  if (article.authorId !== undefined && (!Number.isSafeInteger(article.authorId) || article.authorId < 1)) add('AUTHOR', 'authorId', 'Use a real WordPress user ID.')
  const plain = [article.intro, article.quickAnswerBody, article.advice, article.finalVerdict, ...article.howWeChose, ...article.faqs.map(row => row.answer)].map(editorialPlainText).join(' ')
  if (staticOffer.test(plain)) add('STATIC_OFFER', 'content', 'Remove current-price, stock, discount, Prime and delivery claims from editorial copy.')
  if (testing.test(plain) && (!Array.isArray(article.handsOnTestingEvidence) || !article.handsOnTestingEvidence.length || !article.handsOnTestingEvidence.every(publicHttpsUrl))) add('UNPERFORMED_TESTING', 'content', 'Hands-on claims require a real testing record.')
  if (unsupportedMedical.test(plain)) add('MEDICAL_CLAIM', 'content', 'Remove unsupported treatment or injury-prevention promises.')
  for (const [index, evidence] of article.claimEvidence.entries()) if (!checkEvidence(evidence, String(record(evidence).key || ''), String(record(evidence).claim || ''), options.now ?? Date.now())) add('EDITORIAL_CLAIM', `claimEvidence.${index}`, 'A material editorial claim needs a current supported source and real review.')
  if (!article.claimEvidence.length) add('EDITORIAL_CLAIM', 'claimEvidence', 'Supply evidence for the material factual claims in the guide.')
  report.wordCount = editorialWordCount(article)
  if (report.wordCount !== 1700) add('WORD_COUNT', 'content', `This batch requires 1,700 editorial words; found ${report.wordCount}.`)
  const configuredMarket = options.marketplace || process.env.AMAZON_MARKETPLACE || 'www.amazon.com'
  if (!Object.hasOwn(marketplaces, configuredMarket)) add('MARKETPLACE', 'marketplace', 'Configure a supported Amazon marketplace.')
  const marketplace = (Object.hasOwn(marketplaces, configuredMarket) ? configuredMarket : 'www.amazon.com') as AmazonMarketplace
  const partnerTag = options.partnerTag || process.env.AMAZON_PARTNER_TAG || ''
  if (!partnerTag) warnings.push({ code: 'TAG_PENDING', field: 'amazonAffiliateUrl', message: 'Tracking ID is deferred. Editorial drafts may be saved, but verification/publication stays blocked.' })
  const candidates = article.products.map(record)
  const offers = options.offers ?? await getAmazonProductOffers(candidates.map(product => String(product.asin || '')))
  const seen = new Set<string>()
  for (const [index, product] of candidates.entries()) {
    const path = `products.${index}`
    const start = errors.length
    report.productsChecked++
    for (const key of requiredProduct) if (!string(product[key])) add('PRODUCT_REQUIRED', `${path}.${key}`, 'Required product detail is missing.')
    if (!slugPattern.test(String(product.slug || ''))) add('PRODUCT_SLUG', `${path}.slug`, 'Use a stable lowercase product slug.')
    if (!validateAmazonAsin(product.asin)) add('ASIN', `${path}.asin`, 'A product needs a valid ten-character ASIN.')
    else if (seen.has(product.asin)) add('DUPLICATE_ASIN', `${path}.asin`, 'The same ASIN cannot occupy two recommendation slots.')
    else seen.add(product.asin)
    if (!Number.isInteger(product.displayOrder) || product.displayOrder !== index + 1) add('ORDER', `${path}.displayOrder`, 'Keep pick order sequential from one through four.')
    if (!partnerTag || !validateAmazonAffiliateUrl(product.amazonAffiliateUrl, String(product.asin || ''), partnerTag, marketplace)) add('AFFILIATE_LINK', `${path}.amazonAffiliateUrl`, 'Provide the exact ASIN/marketplace link with the configured tracking tag.')
    const manufacturer = publicHttpsUrl(product.manufacturerUrl)
    if (!manufacturer || /(?:amazon\.|amzn\.to)/i.test(new URL(manufacturer).hostname)) add('MANUFACTURER', `${path}.manufacturerUrl`, 'Use the official manufacturer product page, not another affiliate article.')
    if (!publicHttpsUrl(product.productImage)) add('IMAGE', `${path}.productImage`, 'Provide the source image URL for variant review.')
    if (!list(product.pros) || !list(product.cons)) add('PROS_CONS', path, 'Provide sourced strengths and limitations.')
    if (!Array.isArray(product.specifications) || !product.specifications.length || product.specifications.some(value => !string(record(value).label) || !string(record(value).value))) add('SPECS', `${path}.specifications`, 'Provide labelled sourced specifications.')
    for (const key of Object.keys(product)) if (volatile.test(key)) add('STATIC_OFFER', `${path}.${key}`, 'Prices, discounts, stock and delivery details belong to the current Amazon response, not editorial storage.')
    const productText = [product.shortDescription, product.detailedVerdict, product.bestFor, product.avoidIf,
      ...(Array.isArray(product.pros) ? product.pros : []), ...(Array.isArray(product.cons) ? product.cons : []),
      ...(Array.isArray(product.specifications) ? product.specifications.flatMap(value => [record(value).label, record(value).value]) : []),
    ].filter(string).map(editorialPlainText).join(' ')
    if (staticOffer.test(productText)) add('STATIC_OFFER', path, 'Remove hard-coded prices, stock, discounts, Prime and delivery claims.')
    if (unsupportedMedical.test(productText)) add('MEDICAL_CLAIM', path, 'Remove unsupported treatment or injury-prevention promises.')
    if (testing.test(productText) && !article.handsOnTestingEvidence?.length) add('UNPERFORMED_TESTING', path, 'Do not claim testing without a documented testing record.')
    const offer = offers.find(value => value.asin === product.asin && value.marketplace === marketplace && isCurrentAmazonOffer(value, options.now))
    if (!offer) add('AMAZON_IDENTITY', path, 'A current official API response is required to check ASIN, title, variant and image.')
    else {
      const identity = normalizedIdentity(`${offer.title} ${offer.brand}`)
      for (const key of ['brand', 'model']) if (!identity.includes(normalizedIdentity(String(product[key] || '')))) add('IDENTITY_CONFLICT', `${path}.${key}`, 'The Amazon title/brand does not match this editorial product.')
      const available = new Set(normalizedIdentity(`${offer.title} ${offer.variant}`).split(' '))
      if (!normalizedIdentity(String(product.variant || '')).split(' ').every(token => available.has(token))) add('VARIANT_CONFLICT', `${path}.variant`, 'The selected size/color must match the API item.')
      if (!offer.imageUrl) add('IMAGE_MATCH', `${path}.productImage`, 'The API must return the selected item image for comparison.')
      if (/amazon\.com\//i.test(String(product.productImage)) && product.productImage !== offer.imageUrl) add('IMAGE_MATCH', `${path}.productImage`, 'The Amazon image URL must match the selected ASIN.')
    }
    const evidence = Array.isArray(product.evidenceSources) ? product.evidenceSources : []
    const claims: [string, string][] = requiredProduct.filter(key => !['productName', 'slug', 'category', 'awardLabel', 'imageAltText'].includes(key)).map(key => [key, editorialPlainText(String(product[key] || ''))])
    claims.push(['image', String(product.productImage || '')])
    if (Array.isArray(product.specifications)) product.specifications.forEach((row, i) => claims.push([`specifications.${i}`, `${record(row).label}: ${record(row).value}`]))
    if (Array.isArray(product.pros)) product.pros.forEach((row, i) => claims.push([`pros.${i}`, String(row)]))
    if (Array.isArray(product.cons)) product.cons.forEach((row, i) => claims.push([`cons.${i}`, String(row)]))
    for (const [key, claim] of claims) {
      const needsManufacturer = key.startsWith('specifications.') || ['brand', 'model', 'sizingInformation', 'availableWidths', 'availableColors', 'variant'].includes(key)
      if (!evidence.some(row => (!needsManufacturer || ['MANUFACTURER', 'DOCUMENTATION'].includes(String(record(row).sourceType))) && checkEvidence(row, key, claim, options.now ?? Date.now(), manufacturer || undefined))) add('PRODUCT_EVIDENCE', `${path}.${key}`, 'A critical product claim lacks a current supported source; identity, sizing and specifications require original manufacturer documentation.')
    }
    if (!evidence.some(row => ['MANUFACTURER', 'DOCUMENTATION'].includes(String(record(row).sourceType)))) add('MANUFACTURER_EVIDENCE', path, 'Include original manufacturer evidence.')
    if (errors.length === start) report.verifiedProducts.push(String(product.asin))
    else report.rejectedProducts.push(String(product.asin || product.slug || index + 1))
  }
  const currentTokens = new Set(normalizedIdentity(plain).split(' ').filter(word => word.length > 3))
  for (const previous of options.existingArticles ?? []) {
    if (previous.slug === article.slug) { add('DUPLICATE_SLUG', 'slug', 'An article already uses this canonical slug. Existing content will not be overwritten.'); continue }
    const tokens = new Set(normalizedIdentity(previous.text).split(' ').filter(word => word.length > 3))
    const shared = [...currentTokens].filter(word => tokens.has(word)).length
    if (currentTokens.size > 50 && tokens.size > 50 && shared / new Set([...currentTokens, ...tokens]).size > 0.8) add('DUPLICATE_CONTENT', 'content', 'This guide substantially overlaps an existing article; revise its scope or consolidate it.')
  }
  if (/metatarsalgia|ball of (?:the )?foot pain/i.test(article.targetKeyword)) warnings.push({ code: 'SEARCH_INTENT_OVERLAP', field: 'targetKeyword', message: 'Review these overlapping forefoot-pain terms together before publishing separate guides.' })
  if (!errors.length) { report.status = 'PASS'; report.wordpressAction = 'CREATE_DRAFT' }
  return report
}

export function sanitizeIngestionArticle(article: IngestionArticle): IngestionArticle {
  const retailers = article.products.map(product => product.amazonAffiliateUrl).filter(Boolean)
  return {
    ...article, intro: sanitizeEditorialHtml(article.intro, 'paragraphs', retailers), advice: sanitizeCmsArticleHtml(article.advice, retailers),
    finalVerdict: sanitizeEditorialHtml(article.finalVerdict, 'paragraphs', retailers),
    faqs: article.faqs.map(row => ({ question: editorialPlainText(row.question), answer: sanitizeEditorialHtml(row.answer, 'paragraphs', retailers) })),
    products: article.products.map(product => {
      const plain = Object.fromEntries((['productName', 'brand', 'model', 'category', 'awardLabel', 'bestFor', 'avoidIf', 'sizingInformation', 'availableWidths', 'availableColors', 'variant', 'imageAltText'] as const).map(key => [key, editorialPlainText(product[key])]))
      let affiliate = ''
      try {
        const url = new URL(publicHttpsUrl(product.amazonAffiliateUrl))
        if (!url.hash && Object.keys(marketplaces).some(market => url.hostname.replace(/^www\./, '') === market.replace(/^www\./, ''))
          && [`/dp/${product.asin}`, `/gp/product/${product.asin}`].includes(url.pathname.replace(/\/$/, ''))) affiliate = url.href
      } catch { /* Unverified or unsafe links stay empty in an editorial draft. */ }
      return { ...product, ...plain, manufacturerUrl: publicHttpsUrl(product.manufacturerUrl), amazonAffiliateUrl: affiliate,
        detailedVerdict: sanitizeEditorialHtml(product.detailedVerdict, 'paragraphs', retailers), shortDescription: editorialPlainText(product.shortDescription),
        pros: product.pros.map(editorialPlainText), cons: product.cons.map(editorialPlainText),
        specifications: product.specifications.map(row => ({ label: editorialPlainText(row.label), value: editorialPlainText(row.value) })),
      }
    }),
  }
}

export function articleFingerprint(article: IngestionArticle) {
  return createHash('sha256').update(JSON.stringify(sanitizeIngestionArticle(article))).digest('hex')
}
