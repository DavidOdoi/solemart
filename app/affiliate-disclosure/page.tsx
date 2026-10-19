import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: "Affiliate Disclosure | SOLEMART" },
  description: "Understand SOLEMART’s affiliate links, Amazon Associate disclosure, commissions, retailer relationships, and price-check limitations.",
}

export default function PolicyPage() {
  return (
    <TrustPage
      title="Affiliate Disclosure"
      intro="Some links on SOLEMART are affiliate links. If you follow one and complete a qualifying purchase, we may receive a commission. We want you to understand that relationship before using our product recommendations or visiting a retailer."
      updatedAt="2026-10-19"
      sections={[
        {
          "heading": "Amazon Associate disclosure",
          "paragraphs": [
            "As an Amazon Associate I earn from qualifying purchases.",
            "This disclosure applies to qualifying Amazon links published by SOLEMART. Amazon decides whether a transaction qualifies under its programme rules. A link or recommendation does not guarantee that a commission will be paid."
          ]
        },
        {
          "heading": "How an affiliate link works",
          "paragraphs": [
            "An affiliate link can contain a tracking identifier or pass through a tracking service that tells a retailer where a visit originated. The retailer or affiliate programme may use cookies or similar technology to attribute a qualifying purchase for a period defined by that programme.",
            "Commissions and qualifying events differ between programmes. A commission may depend on factors such as what was purchased, the time between a visit and purchase, and whether the order is cancelled or returned."
          ]
        },
        {
          "heading": "What this means for the price you pay",
          "paragraphs": [
            "Using one of our affiliate links does not itself add a SOLEMART surcharge to your order. The retailer controls the price, available promotions, taxes, delivery charges, and other purchase conditions.",
            "We do not guarantee that an affiliate link leads to the lowest available price or that an advertised offer will still be available when you visit. Compare the final checkout price and conditions with any other options you are considering."
          ]
        },
        {
          "heading": "Where affiliate links may appear",
          "paragraphs": [
            "Affiliate links may appear in buying guides, product profiles, comparisons, price-check pages, and related editorial content. Buttons such as “Check Price on Amazon” or “See Latest Price” can lead to an affiliate destination.",
            "A sitewide disclosure explains the general relationship, while relevant pages should make the nature of their purchase links clear in context. Not every link is an affiliate link: some point to editorial pages, references, or other informational resources."
          ]
        },
        {
          "heading": "Recommendations and editorial judgment",
          "paragraphs": [
            "Our editorial standard is to explain product choices according to relevance, intended use, fit considerations, and the information available. Affiliate income should not replace those reasons or justify unsupported claims.",
            "A recommendation is an invitation to consider an option, not a guarantee that it suits every reader. We distinguish research-based content and illustrative profiles from any documented hands-on testing."
          ],
          "links": [
            {
              "label": "Editorial Policy",
              "href": "/editorial-policy"
            },
            {
              "label": "How We Review Shoes",
              "href": "/how-we-review"
            }
          ]
        },
        {
          "heading": "Prices, stock, and product versions",
          "paragraphs": [
            "Prices, sizes, widths, colourways, product versions, and stock can change without notice. A price-check link is not a live inventory feed, a reservation, or a promise of a specific discount.",
            "Before ordering, confirm that the retailer’s listing is for the exact product and version you want. Check sizing guidance, delivery costs, return restrictions, and the final price directly with the retailer."
          ]
        },
        {
          "heading": "Purchases are made with the retailer",
          "paragraphs": [
            "SOLEMART is a footwear information and recommendation site. A purchase made after following an external product link is handled by that retailer or marketplace seller, not through a SOLEMART checkout.",
            "The retailer is responsible for payment processing, order confirmation, shipping, returns, refunds, warranties, and customer service under its own terms. For an order problem, contact the seller or marketplace support identified on your purchase confirmation."
          ]
        },
        {
          "heading": "Other commercial relationships",
          "paragraphs": [
            "If content involves sponsorship, a supplied review product, or another material relationship beyond an ordinary affiliate link, that relationship should be separately disclosed where it is relevant. A brand’s inclusion on the site does not by itself establish a partnership or endorsement.",
            "References to Amazon or other brand names identify the services and products discussed. Those businesses operate independently of SOLEMART unless an explicit statement says otherwise."
          ]
        },
        {
          "heading": "Tracking, privacy, and questions",
          "paragraphs": [
            "Retailers and affiliate programmes may process information about a referral, click, or qualifying purchase under their own privacy notices. Their websites may set cookies or use tracking tools even when SOLEMART does not receive your checkout details.",
            "For questions about this disclosure or to report an unclear purchase link, contact hello@thesolemart.com and include the relevant page URL. This disclosure may be updated as our content or commercial arrangements change."
          ],
          "links": [
            {
              "label": "Privacy Policy",
              "href": "/privacy-policy"
            },
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
