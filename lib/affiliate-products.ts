export type EvidenceSourceType = 'MANUFACTURER' | 'DOCUMENTATION' | 'AMAZON_API' | 'PROFESSIONAL' | 'INDEPENDENT'
export type ClaimEvidence = {
  key: string
  claim: string
  verdict: 'SUPPORTED' | 'UNSUPPORTED' | 'CONFLICTING' | 'NOT_FOUND'
  sourceUrl: string
  sourceType: EvidenceSourceType
  correctedValue: string | null
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  checkedAt: string
  sourceExcerpt: string
  reviewedBy: string
}

export type IngestionProduct = {
  productName: string
  brand: string
  model: string
  slug: string
  asin: string
  amazonAffiliateUrl: string
  manufacturerUrl: string
  category: string
  awardLabel: string
  bestFor: string
  avoidIf: string
  shortDescription: string
  detailedVerdict: string
  specifications: { label: string; value: string }[]
  pros: string[]
  cons: string[]
  sizingInformation: string
  availableWidths: string
  availableColors: string
  variant: string
  productImage: string
  imageAltText: string
  evidenceSources: ClaimEvidence[]
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  verificationDate: string | null
  verificationNotes: string
  displayOrder: number
  wordpressId?: number
  wordpressMediaId?: number
}

export const marketplaces = {
  'www.amazon.com': 'USD',
  'www.amazon.co.uk': 'GBP',
  'www.amazon.co.jp': 'JPY',
  'www.amazon.ca': 'CAD',
  'www.amazon.de': 'EUR',
  'www.amazon.fr': 'EUR',
  'www.amazon.it': 'EUR',
  'www.amazon.es': 'EUR',
  'www.amazon.com.au': 'AUD',
  'www.amazon.in': 'INR',
} as const
export type AmazonMarketplace = keyof typeof marketplaces

export function validateAmazonAsin(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Z0-9]{10}$/.test(value)
}

export function validPartnerTag(value: unknown): value is string {
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9-]{2,63}$/.test(value)
}

export function buildAmazonAffiliateUrl(asin: string, partnerTag: string, marketplace: AmazonMarketplace = 'www.amazon.com') {
  if (!validateAmazonAsin(asin) || !validPartnerTag(partnerTag) || !Object.hasOwn(marketplaces, marketplace)) return ''
  const url = new URL(`https://${marketplace}/dp/${asin}`)
  url.searchParams.set('tag', partnerTag)
  return url.href
}

export function validateAmazonAffiliateUrl(value: unknown, asin: string, partnerTag: string, marketplace: AmazonMarketplace) {
  if (typeof value !== 'string' || !validateAmazonAsin(asin) || !validPartnerTag(partnerTag)) return false
  try {
    const url = new URL(value)
    const expected = marketplace.replace(/^www\./, '')
    return url.protocol === 'https:' && !url.username && !url.password && !url.port && !url.hash
      && [expected, `www.${expected}`].includes(url.hostname)
      && [`/dp/${asin}`, `/dp/${asin}/`, `/gp/product/${asin}`, `/gp/product/${asin}/`].includes(url.pathname)
      && url.searchParams.getAll('tag').length === 1 && url.searchParams.get('tag') === partnerTag
  } catch { return false }
}

/** Evidence is never fetched with WordPress or Amazon credentials. */
export function publicHttpsUrl(value: unknown): string {
  if (typeof value !== 'string' || value.length > 2048 || /[\\\u0000-\u001f\u007f]/.test(value)) return ''
  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    if (url.protocol !== 'https:' || url.username || url.password || url.port
      || !host.includes('.') || host.endsWith('.local') || host.endsWith('.localhost')
      || host === 'localhost' || /^\d+\./.test(host) || host.includes(':') || host.startsWith('[')) return ''
    return url.href
  } catch { return '' }
}

export function normalizedIdentity(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

export function isAmazonProductImage(value: string) {
  try { return ['m.media-amazon.com', 'images-na.ssl-images-amazon.com'].includes(new URL(value).hostname) } catch { return false }
}
