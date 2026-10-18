import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: 'Affiliate Disclosure | SOLEMART' },
  description: 'Learn how SOLEMART may earn commissions from qualifying purchases through affiliate links while keeping recommendations reader-focused.',
}

export default function AffiliateDisclosurePage() {
  return <TrustPage
    title="Affiliate Disclosure"
    intro="SOLEMART uses affiliate links to help support the work involved in researching and publishing footwear guides and reviews."
    sections={[
      { heading: 'How Affiliate Links Work', paragraphs: ['If you follow an affiliate link and make a qualifying purchase, SOLEMART may earn a commission. This does not increase the price you pay.'] },
      { heading: 'Recommendations Remain Reader-Focused', paragraphs: ['Affiliate partnerships do not control our recommendations. We aim to feature products based on usefulness, relevance, quality signals, and the needs described in each guide.'] },
      { heading: 'Amazon Associate Statement', paragraphs: ['As an Amazon Associate, SOLEMART may earn from qualifying purchases.'] },
    ]}
  />
}
