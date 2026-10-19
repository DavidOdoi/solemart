import type { Metadata } from 'next'
import { TrustPage } from '@/components/trust-page'

export const metadata: Metadata = {
  title: { absolute: "Privacy Policy | SOLEMART" },
  description: "How SOLEMART handles browsing information, search terms, Vercel analytics, saved picks, YouTube embeds, affiliate referrals, and privacy inquiries.",
}

export default function PolicyPage() {
  return (
    <TrustPage
      title="Privacy Policy"
      intro="This policy explains information associated with using SOLEMART at thesolemart.com, including www.thesolemart.com. It covers browsing, searching, saving picks, viewing embedded media, and contacting us. It also explains where third-party services have their own data practices."
      updatedAt="2026-10-19"
      sections={[
        {
          "heading": "Who this policy covers and how to contact us",
          "paragraphs": [
            "This policy applies to SOLEMART’s public website. It does not replace the privacy notices of retailers, video platforms, linked websites, or other businesses whose services you choose to use.",
            "For questions about this policy or information you have sent to SOLEMART, contact hello@thesolemart.com. Tell us the nature of your request and the page or interaction involved; please avoid including unnecessary sensitive information."
          ]
        },
        {
          "heading": "Information you choose to provide",
          "paragraphs": [
            "If you contact us by email, we receive your email address, message, and any other information or attachments you include. Your email provider and ours may also process message metadata as part of delivering and storing that correspondence.",
            "We use correspondence to respond to questions, investigate corrections, consider inquiries, and keep relevant records. Please do not send passwords, payment-card information, detailed medical records, or information about other people that you are not entitled to share."
          ]
        },
        {
          "heading": "Browsing and technical information",
          "paragraphs": [
            "When a browser requests a page or file, hosting, delivery, and security providers may process technical information such as an IP address, requested URL, browser or device characteristics, timestamps, and request errors. This processing supports delivering content, operating the site, and investigating misuse or failures.",
            "The public website does not currently provide a SOLEMART customer account or process retail checkout payments. If you follow a retailer link and buy a product, your payment and delivery details are handled by that retailer under its own policy."
          ]
        },
        {
          "heading": "Search terms",
          "paragraphs": [
            "Searches place the entered terms in the page URL so the site can return matching content. For example, a search may use a URL ending in /search?q=walking.",
            "Search terms can therefore appear in browser history, request logs, and information available to services that process the URL. Avoid entering personal, confidential, or sensitive information into a shoe search. Searching the site does not require you to identify yourself."
          ]
        },
        {
          "heading": "Site analytics",
          "paragraphs": [
            "The public website uses Vercel Web Analytics to help understand how the site is used and which pages are useful. Depending on the provider’s operation, analytics can involve page routes, referrers, timestamps, browser and device details, and approximate location derived from network information.",
            "Vercel describes its Web Analytics service as using aggregated information without third-party cookies for tracking visitors across websites. Its documentation explains the data it processes and its current retention practices. This does not mean that other services, embeds, or external websites are cookie-free."
          ],
          "links": [
            {
              "label": "Vercel Web Analytics privacy information",
              "href": "https://vercel.com/docs/analytics/privacy-policy"
            },
            {
              "label": "Vercel Privacy Notice",
              "href": "https://vercel.com/legal/privacy-policy"
            }
          ]
        },
        {
          "heading": "Saved picks and the clipboard",
          "paragraphs": [
            "The save-shoe feature stores product identifiers in your browser’s local storage under the key solemart:saved-picks. This lets the same browser remember a selection between visits. That feature does not itself send your saved list to SOLEMART, create an account, or synchronise it across devices.",
            "You can remove individual selections with the save controls or erase the list through your browser’s site-data settings. Local storage can remain until you clear it or your browser removes it. If storage is blocked, unavailable, or cleared, a selection may not persist.",
            "When you choose “Copy review link,” the site asks the browser to write that URL to your clipboard. This action does not require the feature to read your existing clipboard contents. Browser settings or permissions may prevent the copy operation."
          ]
        },
        {
          "heading": "Embedded YouTube videos",
          "paragraphs": [
            "Some homepage highlights use YouTube video embeds. When a video highlight becomes active, the site loads YouTube’s player and uses a youtube-nocookie.com embed. Loading the player or playing a video makes requests to YouTube or Google services, which can receive technical and interaction information.",
            "Privacy-enhanced embedding is not a guarantee that no information is processed. Muting a video affects its sound; it does not disable network requests or provider processing. Videos can play automatically where the browser allows it. The homepage provides a pause control and respects a preference for reduced motion when deciding whether to start its slideshow.",
            "Google and YouTube explain their handling of data, cookies, and user choices in their own privacy information. You may be able to limit processing through browser controls, content blockers, or provider settings, although blocking a service can stop its player from working."
          ],
          "links": [
            {
              "label": "Google Privacy Policy",
              "href": "https://policies.google.com/privacy"
            },
            {
              "label": "YouTube embedded-player information",
              "href": "https://support.google.com/youtube/answer/171780"
            }
          ]
        },
        {
          "heading": "Images, logos, and other external resources",
          "paragraphs": [
            "The site uses external imagery from Unsplash and brand-logo resources from Simple Icons. Some images are delivered through the site’s image optimisation service, while other resources can be requested directly by your browser.",
            "When your browser requests a resource directly from an external provider, that provider can receive information needed to handle the request, such as your IP address, browser characteristics, and request metadata. The provider’s own policy governs that processing."
          ],
          "links": [
            {
              "label": "Unsplash Privacy Policy",
              "href": "https://unsplash.com/privacy"
            }
          ]
        },
        {
          "heading": "Affiliate links and retailer websites",
          "paragraphs": [
            "Product and price-check links may contain affiliate identifiers. When you follow one, the retailer or affiliate programme may record the referral and use cookies or other tracking methods to determine whether a purchase qualifies for commission.",
            "Retailers control their own checkout, account information, payment processing, cookies, and privacy practices. SOLEMART’s ordinary affiliate link does not give the site your payment-card details. Information made available through an affiliate programme depends on that programme and its terms."
          ],
          "links": [
            {
              "label": "Affiliate Disclosure",
              "href": "/affiliate-disclosure"
            },
            {
              "label": "Amazon Privacy Notice",
              "href": "https://www.amazon.com/gp/help/customer/display.html?nodeId=GX7NJQ4ZB8MHFRNJ"
            }
          ]
        },
        {
          "heading": "How information is used and when it may be disclosed",
          "paragraphs": [
            "Information associated with the site is used to deliver content, respond to correspondence, understand usage, improve reliability, and protect against abuse. Providers supporting hosting, analytics, media, or email process information connected with the functions they perform.",
            "Information may also need to be disclosed when legally required or reasonably necessary to address fraud, security incidents, or the protection of rights. We seek to avoid requesting information that is unnecessary for an inquiry. External providers and retailers may process information for additional purposes described in their own notices."
          ]
        },
        {
          "heading": "Retention, security, and processing locations",
          "paragraphs": [
            "Saved picks remain in your browser as described above. Correspondence may be retained while an inquiry is being handled and for relevant follow-up, ordinary recordkeeping, or legal obligations. Hosting, analytics, media, and email providers apply their own retention arrangements; this policy does not promise a single retention period for every service.",
            "Online transmission and storage cannot be guaranteed completely secure. Use appropriate care with what you send by email and protect your own browser and device. Providers may process information in countries other than the one where you live, under their applicable service terms and safeguards."
          ]
        },
        {
          "heading": "Your choices and privacy requests",
          "paragraphs": [
            "You can clear browser history and site data, remove saved picks, restrict cookies, or use browser tools to block external resources. These choices may affect analytics, saved selections, images, videos, or other features. A pause control stops the relevant playback; it does not undo information already sent to an external provider.",
            "Depending on your location and the laws that apply, you may have rights to request access, correction, deletion, restriction, portability, or to object to certain processing. Contact hello@thesolemart.com to explain your request. We may need reasonable information to confirm your identity and locate relevant records, and some requests may be limited by applicable law or by the fact that a browser-only feature does not identify you to us.",
            "For information controlled by a retailer or an external service, use that provider’s privacy-request process. You may also have the right to raise a concern with the relevant privacy authority where applicable."
          ]
        },
        {
          "heading": "Children and sensitive information",
          "paragraphs": [
            "SOLEMART is a general-audience footwear information site. Its public features are not designed to require children to submit personal information, and we ask readers not to include sensitive information in searches or routine correspondence.",
            "If you believe a child has sent personal information to SOLEMART, contact us with enough detail to identify the message or interaction so the concern can be reviewed. Product information about children’s shoes, if published, does not itself make the site an account service for children."
          ]
        },
        {
          "heading": "Changes to this policy",
          "paragraphs": [
            "We may update this policy when features, providers, or information practices change. The revision date at the top identifies the current published version.",
            "This policy covers the website features described above. Additional features, such as accounts, forms, newsletters, advertising, or new tracking tools, may require updated notices and appropriate user choices before they are introduced."
          ],
          "links": [
            {
              "label": "Contact SOLEMART",
              "href": "/contact"
            },
            {
              "label": "Terms of Service",
              "href": "/terms-of-service"
            }
          ]
        }
      ]}
    />
  )
}
