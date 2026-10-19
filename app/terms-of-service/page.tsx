import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: "Terms of Service | SOLEMART" },
  description: "Terms for using SOLEMART, including informational content, permitted use, retailer links, intellectual property, disclaimers, and contact details.",
}

export default function PolicyPage() {
  return (
    <TrustPage
      title="Terms of Service"
      intro="These terms apply to your use of SOLEMART at thesolemart.com, including www.thesolemart.com, and the features and editorial content made available there. Please read them alongside our Privacy Policy and Affiliate Disclosure. If you do not agree to these terms, please discontinue use of the site."
      updatedAt="2026-10-19"
      sections={[
        {
          "heading": "What SOLEMART provides",
          "paragraphs": [
            "SOLEMART publishes footwear recommendations, buying guides, product profiles, comparisons, and related information. It is an editorial resource, not a footwear retailer, a healthcare service, or a provider of workplace safety certification.",
            "We may add, revise, suspend, or remove content and features as the site develops. Access to the site does not guarantee that a particular article, tool, product listing, or external link will remain available."
          ]
        },
        {
          "heading": "Using the site responsibly",
          "paragraphs": [
            "You may use the public site for lawful personal research and other uses permitted by applicable law. You are responsible for how you use the information and for complying with requirements that apply to you."
          ],
          "bullets": [
            "Do not attempt unauthorised access to accounts, systems, administrative interfaces, or non-public information.",
            "Do not introduce malicious code, exploit vulnerabilities, impersonate others, or interfere with normal site operation.",
            "Do not use automated requests in a way that harms availability or evades access controls.",
            "Do not copy or republish substantial site content for commercial distribution without permission, except where the law permits it."
          ]
        },
        {
          "heading": "Informational content and personal decisions",
          "paragraphs": [
            "Editorial content is provided for general information. A ranking, comparison, or product description is not a promise of comfort, durability, suitability, performance, or satisfaction for a particular person.",
            "Confirm product details with the manufacturer or retailer and consider your own feet, activity, budget, and circumstances. Content may contain errors or become outdated, and we do not promise that every statement is complete or current at all times."
          ]
        },
        {
          "heading": "Health and workplace information",
          "paragraphs": [
            "Content about pain, plantar fasciitis, support, mobility, or similar topics is not medical advice, diagnosis, or treatment. Consult a qualified healthcare professional about symptoms or personal health concerns rather than relying on a footwear article as a treatment plan.",
            "You are responsible for checking whether work footwear meets the protective features or standards required by your employer, occupation, or applicable rules. A comfort recommendation is not evidence of occupational safety compliance."
          ]
        },
        {
          "heading": "External retailers and purchases",
          "paragraphs": [
            "External product links take you to websites operated by third parties. Product prices, stock, descriptions, purchase contracts, payment processing, delivery, returns, warranties, and refunds are controlled by the relevant retailer or seller.",
            "SOLEMART is not a party to a purchase you make through an external retailer. Review that retailer’s terms and policies before ordering, and direct order-related questions to the business that sold the product."
          ]
        },
        {
          "heading": "Affiliate links and other third-party content",
          "paragraphs": [
            "We may receive a commission from qualifying purchases made through affiliate links. Sponsored placements or other material commercial relationships should be identified when applicable. An external link does not guarantee the accuracy, availability, security, or suitability of its destination.",
            "The site may also display third-party images and embedded videos. Their providers may have separate terms and privacy practices. We do not control their content, advertising, or continued availability."
          ],
          "links": [
            {
              "label": "Affiliate Disclosure",
              "href": "/affiliate-disclosure"
            },
            {
              "label": "Privacy Policy",
              "href": "/privacy-policy"
            }
          ]
        },
        {
          "heading": "Intellectual property and brand references",
          "paragraphs": [
            "SOLEMART’s original editorial material and website design are protected by applicable intellectual property laws. Content owned by manufacturers, image providers, video creators, or other third parties remains subject to their respective rights.",
            "Brand and product names are used to identify and discuss footwear and related services. Their appearance does not imply that SOLEMART owns those marks or has an official partnership with their owners. For permissions or a rights-related concern, contact us with the relevant URL and supporting details."
          ]
        },
        {
          "heading": "Messages and information you send us",
          "paragraphs": [
            "When contacting SOLEMART, provide information that is relevant to your inquiry and that you are entitled to share. Do not send payment-card details, passwords, or unnecessary sensitive information.",
            "Sending a suggestion, correction, or partnership inquiry does not guarantee publication, a commercial arrangement, or a response within a particular time. We use correspondence as described in our Privacy Policy."
          ]
        },
        {
          "heading": "Availability and disclaimers",
          "paragraphs": [
            "The site and its content are provided on an “as is” and “as available” basis. To the extent permitted by applicable law, we do not give warranties that the site will be uninterrupted, error-free, completely current, or suitable for every purpose.",
            "We cannot guarantee the operation or conduct of third-party services, including retailers, video providers, external links, and network services. You should take reasonable precautions when browsing and making purchases online."
          ]
        },
        {
          "heading": "Limits of responsibility and statutory rights",
          "paragraphs": [
            "To the extent permitted by applicable law, SOLEMART is not responsible for indirect or consequential losses arising from reliance on editorial content, interruptions to the site, or transactions with third parties.",
            "Nothing in these terms excludes or limits liability or rights that cannot lawfully be excluded or limited. Any mandatory consumer protections and other non-excludable rights available under applicable law continue to apply."
          ]
        },
        {
          "heading": "Changes to these terms",
          "paragraphs": [
            "We may revise these terms to reflect changes in the site or its operation. The updated version and revision date will appear on this page. Review the current version when you use the site.",
            "An update does not change rights that applicable law protects regardless of these terms. If you disagree with revised terms, stop using the site."
          ]
        },
        {
          "heading": "Contact and related policies",
          "paragraphs": [
            "For questions about these terms, permission requests, or reports of misuse, email hello@thesolemart.com. Include the relevant page URL and enough detail to explain the issue."
          ],
          "links": [
            {
              "label": "Contact SOLEMART",
              "href": "/contact"
            },
            {
              "label": "Privacy Policy",
              "href": "/privacy-policy"
            },
            {
              "label": "Editorial Policy",
              "href": "/editorial-policy"
            }
          ]
        }
      ]}
    />
  )
}
