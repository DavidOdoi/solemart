import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: 'How We Review Shoes | SOLEMART Review Process' },
  description: 'See how SOLEMART researches, compares, and recommends shoes using product details, buyer feedback, comfort signals, durability, and value.',
}

export default function HowWeReviewPage() {
  return <TrustPage
    title="How We Review Shoes"
    intro="Our review process is built to help you compare shoes for your needs. We explain the information behind a recommendation and distinguish research-based profiles from hands-on testing."
    sections={[
      { heading: 'Our Review Process', paragraphs: ['We start with the purpose of the guide or review, then research the available product information and compare options for that use case. We look for practical differences that can help a reader narrow the choices.'] },
      { heading: 'What We Look At', bullets: ['Product specifications, materials, construction, and care information.', 'Sizing guidance, available widths, fit notes, and comfort features.', 'Durability signals, relevant customer feedback, and price value.', 'The intended use, such as work, walking, running, or everyday wear.'] },
      { heading: 'How We Choose Top Picks', paragraphs: ['We organize recommendations by use case rather than popularity alone. Depending on the guide, categories may include Best Overall, Best Budget, Best for Wide Feet, Best for Work, Best for Walking, Best for Women, or Best for Men. A category label explains the role a shoe may fill in the comparison; it is not a guarantee that it will suit every reader.'] },
      { heading: 'Research-Based Reviews', paragraphs: ['Hands-on testing is not available for every product. When it is not, our recommendations may be based on product specifications, materials, expert analysis, and buyer feedback. We aim to make that distinction clear and do not claim a product was tested when it was not.'] },
      { heading: 'Updates and Accuracy', paragraphs: ['Product details, prices, sizing, and availability can change. We may update pages as products or buyer needs change, and we encourage readers to confirm current details with the retailer before making a decision.'] },
    ]}
  />
}
