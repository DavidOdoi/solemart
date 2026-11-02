import 'server-only'

import type { Product } from '../data/products.ts'
import { getAmazonProductOffers, isCurrentAmazonOffer, type AmazonProductOffer } from './amazon-creators.ts'
import { buildAmazonAffiliateUrl, marketplaces, normalizedIdentity, validateAmazonAsin, type AmazonMarketplace } from './affiliate-products.ts'

export function getTrackedGuideProducts(products: Product[]) {
  const marketplace = process.env.AMAZON_MARKETPLACE || 'www.amazon.com'
  const tag = process.env.AMAZON_PARTNER_TAG || ''
  if (!Object.hasOwn(marketplaces, marketplace)) return products
  return products.map(product => {
    const href = product.verificationStatus === 'VERIFIED' && product.asin ? buildAmazonAffiliateUrl(product.asin, tag, marketplace as AmazonMarketplace) : ''
    return href ? { ...product, affiliateUrl: href } : product
  })
}

/** Only verified, identity-matched records can receive live offer/image content. */
export async function getGuideAmazonOffers(products: Product[]) {
  const eligible = products.filter(product => product.cmsManaged && product.verificationStatus === 'VERIFIED'
    && validateAmazonAsin(product.asin) && product.model && product.brand)
  const offers = await getAmazonProductOffers(eligible.map(product => product.asin!))
  const accepted: Record<string, AmazonProductOffer> = {}
  for (const product of eligible) {
    const offer = offers.find(row => row.asin === product.asin && isCurrentAmazonOffer(row))
    if (!offer) continue
    const identity = normalizedIdentity(`${offer.title} ${offer.brand}`)
    if (!identity.includes(normalizedIdentity(product.brand!)) || !identity.includes(normalizedIdentity(product.model!))) continue
    accepted[product.slug] = offer
  }
  return accepted
}
