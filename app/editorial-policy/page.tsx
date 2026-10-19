import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: "Editorial Policy | SOLEMART" },
  description: "Read SOLEMART’s standards for evidence, independent recommendations, fair comparisons, commercial disclosures, and corrections.",
}

export default function PolicyPage() {
  return (
    <TrustPage
      title="Editorial Policy"
      intro="SOLEMART’s editorial promise is simple: independent picks, clear advice, and more informed choices. This policy sets out the standards our footwear content should meet and explains how we handle evidence, commercial relationships, and corrections."
      updatedAt="2026-10-19"
      sections={[
        {
          "heading": "Who our content serves",
          "paragraphs": [
            "We write for people researching shoes for walking, running, work, everyday wear, and other practical needs. Our aim is to make the decision clearer by explaining what a product is designed for, what is known about it, and what a reader should verify before buying.",
            "Content should be readable and useful without requiring readers to accept a ranking on trust alone. We aim to explain why an option is included, who might consider it, and where its limitations lie."
          ]
        },
        {
          "heading": "Evidence and accurate descriptions",
          "paragraphs": [
            "Factual claims should have an identifiable basis. We distinguish manufacturer descriptions, retailer information, third-party research, customer experiences, and our own observations. These sources have different limits and should not be presented as interchangeable proof.",
            "We do not knowingly fabricate specifications, prices, certifications, qualifications, testimonials, awards, laboratory results, or hands-on experiences. When information is missing, it is better to say so than to fill the gap with an assumption. Template content must not be passed off as a completed review."
          ]
        },
        {
          "heading": "Opinions, rankings, and product comparisons",
          "paragraphs": [
            "Recommendations and rankings are editorial judgments within a particular context. They are not guarantees of performance, personal fit, medical benefit, or satisfaction. A “best” label should be supported by a stated use case and the alternatives actually considered.",
            "Comparisons should give reasonable attention to limitations as well as strengths. We should avoid treating an untested feature as a demonstrated benefit, or using a rating or review count without a verifiable basis."
          ]
        },
        {
          "heading": "Independence from affiliate income",
          "paragraphs": [
            "SOLEMART may earn commissions from qualifying purchases through affiliate links. Our editorial standard is that commission opportunities do not determine which product is described as suitable for a reader’s needs.",
            "An affiliate relationship does not make a product superior, and the absence of one does not make a product unsuitable. We disclose the commercial nature of relevant links so readers can evaluate our content with that information in mind."
          ],
          "links": [
            {
              "label": "How affiliate links work",
              "href": "/affiliate-disclosure"
            }
          ]
        },
        {
          "heading": "Sponsored content, samples, and partnerships",
          "paragraphs": [
            "A brand inquiry, a supplied product, or a proposed partnership does not guarantee inclusion or positive coverage. If content is paid for, sponsored, or affected by another material relationship, that relationship should be clearly disclosed in the content itself.",
            "Advertising and editorial recommendations should be distinguishable. We should not disguise a paid placement as an independent review or suggest that a retailer has endorsed SOLEMART merely because we link to its website."
          ]
        },
        {
          "heading": "Clear language and responsible claims",
          "paragraphs": [
            "We favour concrete explanations over exaggerated promises. We do not use invented countdowns, false scarcity, unsubstantiated savings, or claims that readers must buy immediately to avoid a fictional deadline.",
            "Foot health and workplace topics require particular care. We do not portray footwear as a guaranteed treatment or claim compliance with a safety standard without a reliable basis. Readers should seek appropriate professional advice and verify any requirements specific to their circumstances."
          ]
        },
        {
          "heading": "Authorship and the use of tools",
          "paragraphs": [
            "An author, reviewer, or professional title should reflect a real role rather than imply qualifications that cannot be supported. Editorial content should distinguish who prepared it from any manufacturer, retailer, or source quoted.",
            "Research, writing, and publishing tools can assist with organisation or presentation, but they do not establish that a product was tested or that a factual statement is true. The same evidence, accuracy, disclosure, and originality standards apply regardless of which tools were used."
          ]
        },
        {
          "heading": "Images, video, and intellectual property",
          "paragraphs": [
            "Photos and videos should be used with an appropriate permission, licence, or supported embedding method. Brand names and logos can identify the products discussed; their appearance should not imply an official partnership unless one has been established and disclosed.",
            "An illustrative photograph or embedded highlight is not evidence of a hands-on review and may not show the exact model discussed. Where an image is illustrative, its presentation should avoid misleading readers about the product’s appearance or features."
          ]
        },
        {
          "heading": "Updates and visible dates",
          "paragraphs": [
            "We may update content when products change, links stop working, new information becomes available, or an error is identified. Retailer prices and availability can change more quickly than an editorial page can be updated.",
            "Dates should accurately describe publication or a meaningful content revision. Updating a date alone should not imply that a fresh product test or complete re-evaluation has taken place."
          ]
        },
        {
          "heading": "Corrections and contact",
          "paragraphs": [
            "To request a correction, send the page URL, the disputed wording or detail, an explanation of the concern, and supporting sources where possible. We assess factual corrections separately from differences in personal preference or fit.",
            "We may correct, clarify, expand, or remove content after reviewing a concern. Please contact hello@thesolemart.com for editorial questions, corrections, or commercial inquiries, and identify the purpose of your message."
          ],
          "links": [
            {
              "label": "Contact SOLEMART",
              "href": "/contact"
            },
            {
              "label": "How We Review Shoes",
              "href": "/how-we-review"
            }
          ]
        }
      ]}
    />
  )
}
