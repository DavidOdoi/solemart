import 'server-only'

import { createHash } from 'node:crypto'
import { buildAmazonAffiliateUrl, marketplaces, publicHttpsUrl, validPartnerTag, validateAmazonAffiliateUrl, validateAmazonAsin, type AmazonMarketplace } from './affiliate-products.ts'

export { buildAmazonAffiliateUrl, validateAmazonAsin } from './affiliate-products.ts'

export type AmazonProductOffer = {
  asin: string
  title: string
  brand: string
  variant: string
  imageUrl: string
  url: string
  displayPrice?: string
  amount?: number
  currency?: string
  availability?: string
  savings?: string
  fetchedAt: string
  expiresAt: string
  marketplace: AmazonMarketplace
}

export type AmazonConfig = { credentialId: string; credentialSecret: string; version: string; partnerTag: string; marketplace: AmazonMarketplace }
const tokenEndpoints: Record<string, string> = {
  '2.1': 'https://creatorsapi.auth.us-east-1.amazoncognito.com/oauth2/token',
  '2.2': 'https://creatorsapi.auth.eu-south-2.amazoncognito.com/oauth2/token',
  '2.3': 'https://creatorsapi.auth.us-west-2.amazoncognito.com/oauth2/token',
  '3.1': 'https://api.amazon.com/auth/o2/token',
  '3.2': 'https://api.amazon.co.uk/auth/o2/token',
  '3.3': 'https://api.amazon.co.jp/auth/o2/token',
}
const resources = ['itemInfo.title', 'itemInfo.byLineInfo', 'images.primary.large', 'offersV2.listings.price', 'offersV2.listings.availability']
const TTL = 5 * 60_000
const cache = new Map<string, AmazonProductOffer>()
const tokens = new Map<string, { value: string; expiresAt: number }>()
const tokenRequests = new Map<string, Promise<string>>()
const inFlight = new Map<string, Promise<AmazonProductOffer[]>>()
type Options = { fetcher?: typeof fetch; now?: () => number; sleep?: (milliseconds: number) => Promise<void> }
type Json = Record<string, unknown>
function object(value: unknown): Json { return value && typeof value === 'object' && !Array.isArray(value) ? value as Json : {} }
function text(value: unknown) { return typeof value === 'string' ? value.trim().slice(0, 1000) : '' }

export function getAmazonConfig(): AmazonConfig | null {
  const credentialId = process.env.AMAZON_CREDENTIAL_ID || ''
  const credentialSecret = process.env.AMAZON_CREDENTIAL_SECRET || ''
  const version = process.env.AMAZON_CREDENTIAL_VERSION || ''
  const partnerTag = process.env.AMAZON_PARTNER_TAG || ''
  const marketplace = process.env.AMAZON_MARKETPLACE || 'www.amazon.com'
  if (!credentialId || !credentialSecret || !Object.hasOwn(tokenEndpoints, version) || !validPartnerTag(partnerTag) || !Object.hasOwn(marketplaces, marketplace)) return null
  return { credentialId, credentialSecret, version, partnerTag, marketplace: marketplace as AmazonMarketplace }
}

function configKey(config: AmazonConfig) {
  return createHash('sha256').update(JSON.stringify(config)).digest('hex')
}

async function request(url: string, init: RequestInit, options: Options): Promise<Response> {
  const fetcher = options.fetcher ?? fetch
  for (let attempt = 0; ; attempt++) {
    let response: Response
    try { response = await fetcher(url, { ...init, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(8000) }) }
    catch { if (attempt === 2) throw new Error('Amazon request unavailable'); await (options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms))))(250 * 2 ** attempt); continue }
    if (response.ok) return response
    if (attempt === 2 || ![429, 500, 502, 503, 504].includes(response.status)) throw new Error(`Amazon request failed (${response.status})`)
    const retry = response.headers.get('retry-after')
    const retryMs = retry ? (/^\d+$/.test(retry) ? Number(retry) * 1000 : Date.parse(retry) - (options.now ?? Date.now)()) : 0
    if (retryMs > 8000) throw new Error('Amazon retry deferred')
    await (options.sleep ?? (ms => new Promise(resolve => setTimeout(resolve, ms))))(Math.max(250 * 2 ** attempt + Math.floor(Math.random() * 100), Number.isFinite(retryMs) ? retryMs : 0))
  }
}

async function accessToken(config: AmazonConfig, options: Options): Promise<string> {
  const key = configKey(config)
  const saved = tokens.get(key)
  const now = (options.now ?? Date.now)()
  if (saved && saved.expiresAt > now) return saved.value
  if (tokenRequests.has(key)) return tokenRequests.get(key)!
  const pending = (async () => {
    const lwa = config.version.startsWith('3.')
    const body = { grant_type: 'client_credentials', client_id: config.credentialId, client_secret: config.credentialSecret, scope: lwa ? 'creatorsapi::default' : 'creatorsapi/default' }
    const response = await request(tokenEndpoints[config.version], {
      method: 'POST', headers: { 'Content-Type': lwa ? 'application/json' : 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: lwa ? JSON.stringify(body) : new URLSearchParams(body).toString(),
    }, options)
    const data = object(await response.json())
    if (typeof data.access_token !== 'string' || !data.access_token || typeof data.expires_in !== 'number' || data.expires_in <= 30) throw new Error('Amazon token response invalid')
    tokens.set(key, { value: data.access_token, expiresAt: (options.now ?? Date.now)() + (data.expires_in - 30) * 1000 })
    return data.access_token
  })()
  tokenRequests.set(key, pending)
  try { return await pending } finally { tokenRequests.delete(key) }
}

function parseItem(raw: unknown, config: AmazonConfig, at: number): AmazonProductOffer | null {
  const item = object(raw)
  if (!validateAmazonAsin(item.asin)) return null
  const official = publicHttpsUrl(item.detailPageURL)
  if (!official || new URL(official).hostname.replace(/^www\./, '') !== config.marketplace.replace(/^www\./, '')) return null
  const officialUrl = new URL(official)
  officialUrl.searchParams.set('tag', config.partnerTag)
  if (!validateAmazonAffiliateUrl(officialUrl.href, item.asin, config.partnerTag, config.marketplace)) return null
  const info = object(item.itemInfo)
  const title = text(object(info.title).displayValue)
  if (!title) return null
  const image = text(object(object(object(item.images).primary).large).url)
  const validImage = publicHttpsUrl(image) && ['m.media-amazon.com', 'images-na.ssl-images-amazon.com'].includes(new URL(image).hostname) ? image : ''
  const listings = object(item.offersV2).listings
  const listing = Array.isArray(listings) ? listings.map(object).find(row => row.isBuyBoxWinner === true) ?? object(listings[0]) : {}
  const price = object(listing.price)
  const money = object(price.money)
  const amount = money.amount
  const currency = text(money.currency)
  const displayPrice = text(money.displayAmount)
  const availability = text(object(listing.availability).message)
  const availabilityType = text(object(listing.availability).type).toLowerCase().replace(/[^a-z]/g, '')
  const canPrice = listing.violatesMAP !== true && ['instock', 'available', 'now', 'preorder', 'backorder'].includes(availabilityType)
    && typeof amount === 'number' && Number.isFinite(amount) && amount > 0 && currency === marketplaces[config.marketplace] && displayPrice.length > 0
  const savings = object(object(price.savings).money)
  return {
    asin: item.asin, title, brand: text(object(object(info.byLineInfo).brand).displayValue),
    variant: Array.isArray(item.variationAttributes) ? item.variationAttributes.map(value => text(object(value).value)).filter(Boolean).join(' ') : '',
    imageUrl: validImage, url: officialUrl.href,
    ...(canPrice ? { displayPrice, amount, currency, ...(savings.currency === currency && typeof savings.amount === 'number' && Number.isFinite(savings.amount) && savings.amount > 0 && text(savings.displayAmount) ? { savings: text(savings.displayAmount) } : {}) } : {}),
    ...(availability ? { availability } : {}), fetchedAt: new Date(at).toISOString(), expiresAt: new Date(at + TTL).toISOString(), marketplace: config.marketplace,
  }
}

/** No scraping. Failed requests return no offer, never a previously expired price. */
export async function getAmazonProductOffers(asins: string[], options: Options & { config?: AmazonConfig | null } = {}): Promise<AmazonProductOffer[]> {
  const config = options.config === undefined ? getAmazonConfig() : options.config
  if (!config || !Object.hasOwn(tokenEndpoints, config.version) || !Object.hasOwn(marketplaces, config.marketplace) || !validPartnerTag(config.partnerTag)) return []
  const ids = [...new Set(asins.filter(validateAmazonAsin))]
  const key = configKey(config)
  const now = (options.now ?? Date.now)()
  for (const [id, offer] of cache) if (Date.parse(offer.expiresAt) <= now) cache.delete(id)
  const missing = ids.filter(asin => !cache.has(`${key}:${asin}`))
  for (let offset = 0; offset < missing.length; offset += 10) {
    const batch = missing.slice(offset, offset + 10)
    const batchKey = `${key}:${batch.slice().sort().join(',')}`
    if (!inFlight.has(batchKey)) inFlight.set(batchKey, (async () => {
      try {
        const token = await accessToken(config, options)
        const response = await request('https://creatorsapi.amazon/catalog/v1/getItems', {
          method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'x-marketplace': config.marketplace, Authorization: config.version.startsWith('3.') ? `Bearer ${token}` : `Bearer ${token}, Version ${config.version}` },
          body: JSON.stringify({ partnerTag: config.partnerTag, itemIds: batch, resources }),
        }, options)
        const data = object(await response.json())
        const items = object(data.itemsResult).items
        if (!Array.isArray(items)) return []
        const at = (options.now ?? Date.now)()
        return items.map(value => parseItem(value, config, at)).filter((offer): offer is AmazonProductOffer => Boolean(offer && batch.includes(offer.asin)))
      } catch { tokens.delete(key); return [] }
    })())
    try { for (const offer of await inFlight.get(batchKey)!) cache.set(`${key}:${offer.asin}`, offer) }
    finally { inFlight.delete(batchKey) }
  }
  if (cache.size > 2000) { const current = new Set(ids.map(id => `${key}:${id}`)); for (const id of cache.keys()) if (!current.has(id) && cache.size > 1000) cache.delete(id) }
  const at = (options.now ?? Date.now)()
  return ids.flatMap(id => { const offer = cache.get(`${key}:${id}`); return offer && Date.parse(offer.expiresAt) > at ? [offer] : [] })
}

export async function getAmazonProductOffer(asin: string, options: Options & { config?: AmazonConfig | null } = {}) {
  return (await getAmazonProductOffers([asin], options))[0] ?? null
}

export function isCurrentAmazonOffer(offer: AmazonProductOffer | undefined, now = Date.now()) {
  return Boolean(offer && Date.parse(offer.fetchedAt) <= now && Date.parse(offer.expiresAt) > now && Date.parse(offer.expiresAt) - Date.parse(offer.fetchedAt) <= 3600_000)
}
