'use client'

import { useEffect, useState } from 'react'
import type { AmazonProductOffer } from '@/lib/amazon-creators'

/** No browser API credentials or requests. Expired server-supplied prices disappear. */
export function AmazonPrice({ offer }: { offer: AmazonProductOffer }) {
  const [current, setCurrent] = useState(true)
  useEffect(() => {
    const delay = Date.parse(offer.expiresAt) - Date.now()
    setCurrent(delay > 0)
    if (delay <= 0) return
    const timer = setTimeout(() => setCurrent(false), delay)
    return () => clearTimeout(timer)
  }, [offer.expiresAt])
  if (!current) return null
  return <div className="mb-3 space-y-2" aria-label="Current Amazon offer">
    {offer.displayPrice && <p className="text-xl font-bold text-[#161616]">{offer.displayPrice}{offer.currency && <span className="ml-2 text-xs font-normal text-[#68675f]">{offer.currency}</span>}</p>}
    {offer.savings && <p className="text-sm text-[#46705e]">Savings: {offer.savings}</p>}
    {offer.availability && <p className="text-sm text-[#68675f]">{offer.availability}</p>}
    <p className="text-xs leading-5 text-[#77766f]">Checked <time dateTime={offer.fetchedAt}>{new Date(offer.fetchedAt).toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC</time>.</p>
    {offer.displayPrice && <p className="text-xs leading-5 text-[#77766f]">Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on {offer.marketplace.replace(/^www\./, '')} at the time of purchase will apply to the purchase of this product.</p>}
  </div>
}
