# First five buying guides from DAVID'S LIST

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

## Next input

`best-guide-batch-one-perplexity.txt` requests the live duplicate check first,
then source-backed product matrices and exact-image evidence. The response should
support writing the complete articles in the existing component. It is not a
request for Perplexity to redesign the template or generate finished prose.
