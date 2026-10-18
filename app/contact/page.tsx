import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

const email = 'hello@thesolemart.com'

export const metadata: Metadata = {
  title: { absolute: 'Contact SOLEMART' },
  description: 'Contact SOLEMART for reader questions, product corrections, brand inquiries, partnerships, affiliate questions, and media inquiries.',
}

export default function ContactPage() {
  return <TrustPage
    title="Contact SOLEMART"
    intro="Have a question or something we should review? Choose the topic below and email our team."
    contactEmail={email}
    sections={[
      { heading: 'Reader Questions', paragraphs: ['Send questions about our guides, comparisons, or how to use the information on this site. We cannot determine the right shoe for every person, but we welcome suggestions that could make our coverage more useful.'] },
      { heading: 'Product Corrections', paragraphs: ['If you notice an outdated specification, sizing detail, product link, or other factual issue, tell us which page and product you mean and include a source when possible.'] },
      { heading: 'Brand and Partnership Inquiries', paragraphs: ['Brands and potential partners can contact us with relevant product information or partnership proposals. Inclusion in a guide is based on editorial relevance and is not guaranteed by an inquiry.'] },
      { heading: 'Affiliate or Media Inquiries', paragraphs: ['For affiliate program questions, interviews, or media requests, email us with the organization and a short description of your request.'] },
    ]}
  />
}
