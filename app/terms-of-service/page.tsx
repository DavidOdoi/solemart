import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: 'Terms of Service | SOLEMART' },
  description: 'Read the terms for using SOLEMART shoe reviews, recommendations, and buying guides.',
}

export default function TermsOfServicePage() {
  return <TrustPage
    title="Terms of Service"
    intro="These terms explain the basic rules for using SOLEMART. By using this site, you agree to use its content and features responsibly."
    sections={[
      { heading: 'Using this site', paragraphs: ['You may browse SOLEMART for personal, non-commercial use. Please do not misuse the site, interfere with its operation, attempt unauthorized access, or copy and republish substantial content without permission.'] },
      { heading: 'Guides and recommendations', paragraphs: ['Our reviews, comparisons, and buying guides are general informational content to help with research. They are not a guarantee that a shoe will suit your feet, needs, workplace, or budget, and they are not medical or professional advice. Consider your own circumstances and consult an appropriate professional when needed.'] },
      { heading: 'Product details and prices', paragraphs: ['Product availability, specifications, colorways, sizes, and prices can change. Retailer listings are the source for current purchase details, and you should confirm them before ordering. We work to keep our content useful, but do not promise that every page is complete, current, or error-free.'] },
      { heading: 'Retailer and affiliate links', paragraphs: ['Some links lead to third-party retailers, including Amazon. A purchase through an affiliate link may earn SOLEMART a commission at no added cost to you. Retailer websites are operated independently and have their own terms, policies, prices, and purchase processes.'] },
      { heading: 'Content and site availability', paragraphs: ['SOLEMART and its content are provided on an “as available” basis. We may update, change, or remove content and features over time. To the extent permitted by applicable law, SOLEMART is not responsible for losses arising from reliance on site content or from the availability or conduct of third-party sites. Nothing in these terms limits rights that cannot legally be limited.'] },
      { heading: 'Changes and contact', paragraphs: ['We may revise these terms as the site changes. Continued use after an update means you accept the revised terms. For questions, contact us at hello@thesolemart.com.'] },
    ]}
  />
}
