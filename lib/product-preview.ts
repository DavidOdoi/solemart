import 'server-only'
import { decodeHTML } from 'entities'
import { editorialPlainText, hasRichMarkup, sanitizeEditorialHtml } from './cms-rich-text.ts'

export type ProductPreview = {
  slug: string; name: string; brand: string; descriptionHtml: string; commentaryHtml: string
  image?: { src: string; alt: string }
  pros: string[]; cons: string[]; specs: { label: string; value: string }[]
  retailers: { name: string; url: string }[]
  retailerFieldsAvailable: boolean
}

const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
const text = (value: unknown) => typeof value === 'string' ? value.trim().slice(0, 30_000) : ''
const plain = (value: unknown) => hasRichMarkup(text(value)) ? editorialPlainText(text(value)) : decodeHTML(text(value))
const lines = (value: unknown) => plain(value).split(/\r?\n/).map(line => line.trim()).filter(Boolean)

export function isProductPreviewSlug(value: unknown): value is string {
  return typeof value === 'string' && /^[^\s/?#\u0000-\u001f]{1,200}$/u.test(value)
}

function retailerUrl(value: unknown): string | undefined {
  try {
    const url = new URL(text(value))
    if (url.protocol !== 'https:' || url.username || url.password || /(?:^|\.)example(?:\.com|\.org|\.net)?$/.test(url.hostname) || /\/dp\/example(?:\/|$)/i.test(url.pathname)) return undefined
    return url.href
  } catch { return undefined }
}

function retailerName(url: string) {
  const host = new URL(url).hostname.replace(/^www\./, '')
  return host === 'amzn.to' || /^amazon\.(?:com|ca|de|fr|it|es|nl|se|pl|in|ie|sg|ae|sa|eg|co\.uk|co\.jp|com\.au|com\.mx|com\.br|com\.be|com\.tr|co\.za)$/.test(host) ? 'Amazon' : host
}

export function mapProductPreview(input: unknown, slug: string, retailerFieldsAvailable = true): ProductPreview | null {
  if (input === null) return null
  const shoe = object(input)
  if (shoe.status === 'draft' || shoe.status === 'private' || shoe.status === 'pending' || shoe.status === 'future' || shoe.status === 'trash') return null
  if (shoe.status !== 'publish' || shoe.slug !== slug || !plain(shoe.title) || !Object.hasOwn(shoe, 'solemartShoeFields') || (shoe.solemartShoeFields !== null && (typeof shoe.solemartShoeFields !== 'object' || Array.isArray(shoe.solemartShoeFields)))) throw new Error('WordPress returned incomplete product data.')
  const fields = object(shoe.solemartShoeFields)
  const retailers: ProductPreview['retailers'] = []
  const seen = new Set<string>()
  for (const [name, candidate] of [[undefined, fields.affiliateUrl], [fields.retailer2Name, fields.retailer2Url], [fields.retailer3Name, fields.retailer3Url]]) {
    const url = retailerUrl(candidate)
    if (url && !seen.has(url)) { retailers.push({ name: plain(name) || retailerName(url), url }); seen.add(url) }
  }
  const image = object(object(shoe.featuredImage).node)
  let featured: ProductPreview['image']
  try {
    const url = new URL(text(image.sourceUrl))
    if (url.protocol === 'https:' && !url.username && !url.password && ((url.hostname === 'cms.thesolemart.com' && url.pathname.startsWith('/wp-content/uploads/')) || url.hostname === 'images.unsplash.com')) featured = { src: url.href, alt: plain(image.altText) || plain(shoe.title) }
  } catch { /* No fabricated or unapproved image fallback. */ }
  const specs: ProductPreview['specs'] = []
  const specLabels = new Set<string>()
  const addSpec = (label: string, value: string) => {
    const key = label.toLocaleLowerCase()
    if (label && value && !specLabels.has(key)) { specs.push({ label, value }); specLabels.add(key) }
  }
  for (const line of lines(fields.specs)) {
    const separator = line.indexOf('|')
    if (separator > 0) addSpec(line.slice(0, separator).trim(), line.slice(separator + 1).trim())
  }
  for (const [label, value] of [['Brand', fields.brand], ['Cushioning', fields.cushioning], ['Width options', fields.widthOptions], ['Main strength', fields.mainStrength]]) addSpec(String(label), plain(value))
  const retailerUrls = retailers.map(retailer => retailer.url)
  return {
    slug, name: plain(shoe.title), brand: plain(fields.brand), image: featured,
    descriptionHtml: sanitizeEditorialHtml(text(fields.description), 'paragraphs', retailerUrls),
    commentaryHtml: sanitizeEditorialHtml(text(fields.commentary), 'paragraphs', retailerUrls),
    pros: lines(fields.pros), cons: lines(fields.cons), specs, retailers, retailerFieldsAvailable,
  }
}

const extraRetailerFields = ['retailer2Name', 'retailer2Url', 'retailer3Name', 'retailer3Url']
const productQuery = (retailers: boolean) => `query SandboxShoe($slug: ID!) {
  shoe(id: $slug, idType: SLUG) {
    title slug status
    featuredImage { node { sourceUrl altText } }
    solemartShoeFields {
      brand description affiliateUrl pros cons specs cushioning widthOptions mainStrength commentary
      ${retailers ? extraRetailerFields.join(' ') : ''}
    }
  }
}`

/** Only this private preview bypasses ISR; published buying guides keep 60-second caching. */
export async function getProductPreview(slug: string): Promise<ProductPreview | null> {
  if (!isProductPreviewSlug(slug)) return null
  let endpoint: URL
  try {
    endpoint = new URL(process.env.WORDPRESS_GRAPHQL_URL || '')
    if (!['http:', 'https:'].includes(endpoint.protocol) || endpoint.username || endpoint.password) throw new Error()
  } catch { throw new Error('WordPress is not configured for product previews.') }
  for (const expanded of [true, false]) {
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: productQuery(expanded), variables: { slug } }),
      cache: 'no-store', signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok && response.status !== 400) throw new Error('WordPress product previews are temporarily unavailable.')
    const result = await response.json() as { data?: { shoe?: unknown }; errors?: { message?: string }[] }
    const missingOnlyRetailers = expanded && result.errors?.length && result.errors.every(error => extraRetailerFields.some(field => error.message?.startsWith(`Cannot query field "${field}" on type `)))
    if (missingOnlyRetailers) continue
    if (!response.ok || result.errors?.length || !result.data || !Object.hasOwn(result.data, 'shoe')) throw new Error('WordPress could not return the requested product.')
    return mapProductPreview(result.data.shoe, slug, expanded)
  }
  throw new Error('WordPress could not return the requested product.')
}
