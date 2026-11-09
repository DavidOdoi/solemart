# First five buying guides from DAVID'S LIST

Current active scope: the user reduced this batch to the first three topics.
Complete text drafts now live in `data/best-guide-drafts.ts` and are reviewable at
`/template-preview/best-guides`. See `three-best-guide-drafts.md` for the supplied
research, variant boundaries and remaining checks. The other two topics are on
hold; the five-topic plan and earlier audit below are retained as reference.

The user selected the first five “best…” entries from DAVID'S LIST.xlsx for this
batch. The earlier nine green-keyword briefs remain a separate queue. Comparison
layout changes are deferred. Reuse `components/review-guide-template.tsx` and the
original `/template-preview/buying-guide` reference; do not create another layout.

## Scope and duplicate check

Checked on 2026-11-09 against the current Next.js guides, articles, comparisons,
categories and product-review records (18 records), plus a text search of the
application/data sources. None of the five target titles or planned guide paths
has an exact local match. The approved first five rows are 7, 14, 17, 22 and 23
in the Content Calendar sheet. Remove the spreadsheet's `-TRUE` suffix from the
cowhide keyword; it is not part of the search phrase.

| Keyword | Planned public path | Local result | Live site/CMS result |
| --- | --- | --- | --- |
| best cowhide boots | `/best-shoes/best-cowhide-boots` | No exact guide/title match | Not verified: network blocked |
| best exotic leather boots | `/best-shoes/best-exotic-leather-boots` | No exact guide/title match | Not verified: network blocked |
| best cowboy boots | `/best-shoes/best-cowboy-boots` | No exact guide/title match | Not verified: network blocked |
| best work boots for men | `/best-shoes/best-work-boots-for-men` | No exact guide/title match | Not verified: network blocked |
| best steel toe work boots | `/best-shoes/best-steel-toe-work-boots` | No exact guide/title match | Not verified: network blocked |

The existing `/work-boots` category and standing-all-day guide are related
content, not exact duplicates. The cowhide/leather, cowboy/work, steel/composite
and work/hiking comparison drafts are private editorial comparisons, not these
buying guides. They must not be counted as published duplicate roundups.

Fresh requests to the live `/sitemap.xml` and the CMS's public published-post
lookup received proxy CONNECT 403. The same restriction blocked manufacturer
requests to Ariat and Timberland. This is an environment access failure, not a
404, proof of an absent article, or proof that the destination website is down.
The saved environment draft and the enforced runtime policy are different;
saved domains do not establish live access.

Do not claim a complete live duplicate audit from this local check. Before
creating a public page, check published titles, canonical URLs, redirects and
search intent through the live site and, where accessible, the public CMS. If a
matching guide exists, update its established URL. A failed fetch or missing
search-engine result cannot establish that no page exists. Separate same-intent
duplicates from category hubs, supporting advice and comparison articles.

## Preserve the existing template

Keep the current section order, typography, Top Picks ribbon/cards, comparison
matrix, detailed product profiles, specifications, sticky navigation and shared
FAQ accordion. In the current component, FAQs precede Final Verdict; do not
reorder the component to match a contradictory planning note.

The current order is headline/short introduction; question-based quick answer;
four Top Picks; comparison; selection method; full product reviews; buying
advice; Who This Guide Is For; Common Mistakes to Avoid; FAQs; Final Verdict;
related guides. Product photos must match the exact model and variant.

| Editorial allocation | Words |
| --- | ---: |
| Introduction, two short paragraphs | 90 |
| Direct quick answer | 80 |
| Selection method | 90 |
| Four product profiles, 250 each | 1,000 |
| Buying advice | 160 |
| Who This Guide Is For, three paragraphs | 90 |
| Common Mistakes to Avoid, three paragraphs | 90 |
| Final Verdict | 150 |
| Four FAQs, including questions | 100 |
| Total | 1,850 |

The word allocation is the writing target, not permission to fill missing facts
with generic prose. The quick answer should identify the supported starting pick
and alternatives for specific readers. Awards reflect an explained editorial
judgment from documented features, not claimed hands-on testing. Full profiles
need reasons, trade-offs and limitations supported by evidence.

Use each keyword naturally in the H1, SEO title, opening paragraph and relevant
headings. Include contextual internal and external links. When approved guides
are published, add useful incoming links from public hubs/articles and verify
homepage reachability. Planned topics and private comparison drafts must not be
linked as though they are published guides.

## Topic distinctions and required evidence

- **Cowhide boots:** the leather source must be explicitly documented. Identify
  which boot components use it; “leather” alone is not proof of cowhide. Keep hide
  source separate from grain treatment, finish and construction.
- **Exotic leather boots:** identify the actual hide and the boot components that
  use it. Do not confuse an embossed animal pattern with the claimed leather.
  Explain material-specific care without unsupported superiority claims.
- **Cowboy boots:** compare documented Western-use options and relevant fit,
  construction and care. Avoid duplicating the material-led cowhide/exotic guides
  or treating every Western-looking model as riding or protective footwear.
- **Work boots for men:** choose candidates for documented tasks and requirements.
  A broad work label is not proof of a safety toe or every protective feature.
- **Steel toe work boots:** every candidate must explicitly document a steel cap,
  rather than composite, alloy or an unspecified safety toe. Verify required
  markings and separately documented protection before making safety claims.

There are 20 product positions across the five guides. A product may recur when
it genuinely fits distinct reader needs; do not repeat an identical shortlist
and article across overlapping keywords. Obtain an exact model/variant,
manufacturer specification, source excerpts and real-image evidence for each.

Amazon API access and tracking remain pending. Manufacturer-backed research can
continue without them. A missing ASIN is not permission to invent one; record it
as unresolved. Do not fabricate prices, availability, shipping, testing or image
permissions. Keep pending retailer controls inactive. No new guides, placeholder
product pages or guessed recommendations have been published by this preparation.

## Research and current writing state

The user supplied a correct three-topic report after the earlier upgraded file
still covered comparisons. The new material supports model-specific text drafts
within a Tecovas men's Western dress/lifestyle scope. It is not an independently
completed source check, an image reuse grant or a market-wide ranking.

All three complete text drafts now include direct answers naming candidates,
four profiles, specifications and final verdicts in the existing template. The
earlier partial-copy JSON and Markdown point to the complete draft module for
those topics. Their other two topics remain on hold. Neither file is a
publishable CLI ingestion payload. No image or guessed retailer URL has been
added, and no source verification or live duplicate audit is marked complete.

## Saved website-access proposal

The cloud-environment draft now preserves all 65 existing custom domain rules
and adds 25 apex/WWW rules for these source families:

- Ariat, Tecovas, Justin Boots, Tony Lama, Lucchese and Dan Post.
- Thorogood, Red Wing, Irish Setter and Timberland.
- OSHA, NIOSH's `wwwn.cdc.gov` and ASTM.

Existing SoleMart, CMS and Shopify CDN rules are preserved. Setup scripts,
repositories, credentials and selected package-manager presets are unchanged.
The save returned `status: saved` and `requires_publish: true`; it has not
activated those rules in the current runtime.

The user must review/save the proposal in Codex environment settings and publish
the environment. The runtime skill explicitly states: “The model saves draft
proposals; the user reviews them in environment settings.” After activation,
refresh environment status and require a fresh successful HTTPS request before
claiming source access works. Then complete the live duplicate audit, verify
four product positions per guide and resolve exact-photo rights before
publishing anything.
