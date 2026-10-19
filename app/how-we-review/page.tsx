import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: "How We Review Shoes | SOLEMART Review Process" },
  description: "Understand how SOLEMART researches footwear, compares fit and features, selects recommendations, and distinguishes editorial research from hands-on testing.",
}

export default function PolicyPage() {
  return (
    <TrustPage
      title="How We Review Shoes"
      intro="A useful shoe recommendation starts with the person who will wear it. Our review approach focuses on intended use, fit, available evidence, and practical trade-offs, so you can make a more informed choice without mistaking a recommendation for a guarantee."
      updatedAt="2026-10-19"
      sections={[
        {
          "heading": "Our purpose and the limits of a review",
          "paragraphs": [
            "SOLEMART publishes footwear profiles, buying guides, and comparisons to help readers narrow their options. Different feet, activities, surfaces, and preferences call for different shoes. A model that works well for one person may feel unsuitable to another.",
            "Our content is a starting point for research. Before buying, confirm the exact model, size, width, intended use, and return conditions with the manufacturer or retailer. A category such as “best for walking” describes an editorial selection within the options considered, rather than every shoe on the market."
          ]
        },
        {
          "heading": "Research-based profiles and hands-on testing",
          "paragraphs": [
            "Research-based content draws on available product information and other identified sources. It does not establish that we have worn, purchased, laboratory-tested, or independently verified every feature of a shoe. Sample or template profiles should be identified as such and should not be treated as completed product testing.",
            "When a review is based on hands-on use, it should explain the testing context: the model tested, relevant sizing information, activities, surfaces, and the duration or distance of use. Observations from that experience should be separated from manufacturer claims and from opinions about personal comfort. We do not invent wear tests, measurements, test panels, professional credentials, or customer review counts."
          ]
        },
        {
          "heading": "The information we consider",
          "paragraphs": [
            "The sources available vary by product. Manufacturer specifications can explain intended features, while retailer listings can help confirm current variants and availability. Buyer feedback may highlight recurring questions, but individual reviews can be subjective, outdated, or about a different version."
          ],
          "bullets": [
            "Manufacturer information about construction, materials, intended activity, sizing, widths, and care.",
            "Current retailer information about the exact model, listed features, availability, and purchasing conditions.",
            "Relevant patterns in buyer feedback, considered alongside its limitations rather than presented as universal results.",
            "Clearly attributed independent research or professional guidance when it is relevant and can be checked."
          ]
        },
        {
          "heading": "Fit, comfort, and everyday usability",
          "paragraphs": [
            "We consider questions such as toe room, heel security, width options, fastening, and whether a shoe is designed for the reader’s activity. Cushioning, flexibility, stability, weight, and breathability may be useful comparison points when reliable information is available.",
            "Comfort is individual. We avoid promising that a particular shoe will fit everyone, eliminate discomfort, or perform equally well across activities. Size charts and descriptions cannot replace trying a shoe where possible and checking the retailer’s return policy."
          ]
        },
        {
          "heading": "Durability, materials, and value",
          "paragraphs": [
            "We distinguish the materials and construction a product is described as having from proven long-term durability. A material name, an advertised feature, or a high price alone does not demonstrate how long a shoe will last.",
            "Value involves more than the lowest advertised price. Intended use, available sizes, care needs, replacement expectations, and retailer conditions can affect the decision. Prices quoted in editorial content are snapshots, and a price-check link is an invitation to verify current terms rather than a promise of a discount."
          ]
        },
        {
          "heading": "How we select and compare recommendations",
          "paragraphs": [
            "A shortlist should follow the purpose of its guide. We consider whether a product is relevant to the intended activity and whether there is enough information to explain its strengths, limitations, and alternatives. We do not assume that a popular running shoe is suitable safety footwear or that one category’s winner must lead every other category.",
            "Comparisons should identify meaningful differences rather than declare a universal winner. Labels such as “budget,” “everyday,” or “cushioning” need an explanation in context. If the evidence is insufficient to support a ranking, we should describe the uncertainty rather than manufacture a score."
          ]
        },
        {
          "heading": "Foot health and workplace requirements",
          "paragraphs": [
            "Articles about plantar fasciitis, persistent pain, support, or similar topics are general information, not a diagnosis or treatment plan. A shoe recommendation does not replace assessment by a qualified healthcare professional.",
            "For work footwear, verify the protective features and certifications your employer or applicable workplace rules require. A comfort recommendation is not confirmation that a product meets safety-toe, electrical, slip-resistance, or other occupational standards."
          ]
        },
        {
          "heading": "Editorial independence and commercial relationships",
          "paragraphs": [
            "Our editorial standard is to explain recommendations through reader needs and the evidence available, rather than the commission a link might generate. Affiliate links should be disclosed where readers encounter them.",
            "If a product is supplied for review, a placement is sponsored, or another material relationship applies, that relationship should be clearly identified in the relevant content. Receiving a product or commercial inquiry should not be represented as proof of quality or a guarantee of a favourable review."
          ],
          "links": [
            {
              "label": "Editorial Policy",
              "href": "/editorial-policy"
            },
            {
              "label": "Affiliate Disclosure",
              "href": "/affiliate-disclosure"
            }
          ]
        },
        {
          "heading": "Updates, corrections, and reader feedback",
          "paragraphs": [
            "Products change between generations, and a familiar name may cover different constructions, widths, or regional versions. We may revise recommendations when the underlying information changes. A publication or update date does not guarantee live stock, live pricing, or continuous verification of every detail.",
            "If you spot an error, send the page URL, the product and version involved, the detail you believe is incorrect, and a reliable source if available. Personal fit experiences are useful feedback, but we distinguish those experiences from claims that apply to every reader. Contact hello@thesolemart.com or use our contact page."
          ],
          "links": [
            {
              "label": "Contact SOLEMART",
              "href": "/contact"
            }
          ]
        }
      ]}
    />
  )
}
