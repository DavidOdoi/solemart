import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: 'Editorial Policy | SOLEMART' },
  description: 'Read SOLEMART’s editorial standards for shoe reviews, buying guides, comparisons, affiliate recommendations, and content updates.',
}

export default function EditorialPolicyPage() {
  return <TrustPage
    title="Editorial Policy"
    intro="Our content is written to help readers make better footwear decisions. We work to make our guides and reviews clear, useful, and transparent about their sources and limits."
    sections={[
      { heading: 'Clarity and Accuracy', paragraphs: ['We aim to describe products and buying considerations in plain language. Product details can change, so readers should check current sizing, features, availability, and pricing with the retailer.'] },
      { heading: 'Useful, Supported Recommendations', paragraphs: ['Recommendations should be relevant to the needs a page describes and supported by the information available to us. We avoid unsupported claims, invented test results, and guarantees about comfort or fit.'] },
      { heading: 'No Fake Urgency', paragraphs: ['We do not use misleading countdowns, false scarcity, or pressure tactics. Price and availability can change, and we direct readers to retailers for current listing details.'] },
      { heading: 'Affiliate Independence', paragraphs: ['Affiliate income does not decide what we recommend. We disclose affiliate relationships and aim to keep editorial choices focused on usefulness and buyer needs. See our Affiliate Disclosure page for more information.'] },
      { heading: 'Updates and Corrections', paragraphs: ['We may update articles when products, prices, availability, or buyer needs change. If you spot a factual error or outdated detail, please contact us so we can review it.'] },
    ]}
  />
}
