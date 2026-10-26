# Simple comparison template

Preview: `https://thesolemart.com/template-preview/comparison`.
Example: **Sneakers vs Walking Shoes: Which Should You Buy?**

This is a complete frontend design preview, not a newly published article or a
new WordPress integration. Existing buying guides, comparison routes, their
stored content and their publishing behavior remain unchanged. The preview is
noindex/nofollow and omits article/product/FAQ schema for sample content.

## Reading and buying flow

1. Descriptive headline, short introduction, real byline and estimated read time.
2. Direct answer followed by two choice cards and links to relevant buying guides.
3. Side-by-side differences table, in its own keyboard-accessible scroll region.
4. Situations that change the recommendation, trade-offs and a buying checklist.
5. Natural-language FAQs, methodology and citations within the article body.
6. Final decision and two editorial next steps; author details use the existing
   author component and genuine profile data when supplied.

Use the established SOLEMART colors and 17 px mobile / 19 px desktop reading
size. Optional featured images use the same 800 × 450 responsive frame as guides.
There are no ratings, winner scores, fake prices, stock claims or default
affiliate URLs. Calls to action lead to internal editorial pages; product-level
retailer recommendations can remain in the existing Shoe/buying-guide flow.

## Simpler editing model

Keep native WordPress Title, Slug, Excerpt, Author, Featured Image/alt, publish and
modified dates. Write the entire detailed comparison in the **one Gutenberg
body**: definitions, the native Table block, use cases, trade-offs, checklist,
FAQs and sources. The frontend generates contents links from H2/H3 headings.
Editors do not need a separate custom field for each table row or FAQ.

Only eight additional comparison fields are needed, of which the two guide
links are optional. Proposed ACF names and their frontend mapping:

| ACF name | Type | Frontend field |
| --- | --- | --- |
| `quick_answer` | WYSIWYG, Basic/minimal toolbar | `quickAnswer` |
| `left_name` | Text | `leftName` |
| `left_choose_if` | Textarea | `leftChooseIf` |
| `left_guide_url` | Text, frontend relative path | `leftGuideUrl` |
| `right_name` | Text | `rightName` |
| `right_choose_if` | Textarea | `rightChooseIf` |
| `right_guide_url` | Text, frontend relative path | `rightGuideUrl` |
| `final_verdict` | WYSIWYG, Basic/minimal toolbar | `finalVerdict` |

There are no repeaters, four recommendation slots, duplicate product records,
custom WordPress plugins or publishing webhooks. Optional SEO overrides can be
mapped separately; the native title and excerpt are suitable defaults. Rank Math
settings do not automatically control Next.js metadata.

`ComparisonTemplate` already accepts the native article view model plus these
eight fields. The subsequent CMS task is to configure the agreed WordPress
comparison location and map its published GraphQL response to this model,
retaining server-side fetching, 60-second revalidation and real missing-page 404s.
No ACF import, post type registration or API change is applied by this design
commit. Do not treat the preview as the `/comparisons/sneakers-vs-walking-shoes`
production article or add it to the sitemap.

## Editorial and SEO requirements

This query normally represents commercial investigation: help the reader decide
which category suits them, then offer a relevant next step. Avoid treating
“sneakers” and “walking shoes” as mutually exclusive categories. Explain that
model-specific fit and intended use matter more than a category label.

Before publishing, replace/review design copy against real evidence: verify
manufacturer details where individual models are mentioned, confirm source URLs
and what each citation supports, and describe only actual research or testing.
The sample AAOS link is a source example; live source access/content has not been
verified in this environment. Do not claim an expert reviewer, laboratory,
experience, award or review date that the editorial process does not support.
Keep a substantive update date tied to real changes.

The publishing template supports Article and BreadcrumbList schema from real
fields, escaped safely for script markup. It does not invent Product, Review,
AggregateRating or FAQ rich results for category comparisons. Next.js metadata,
canonicals and sitemap integration belong with the later publishing adapter.
E-E-A-T is a quality framework, not a score this layout can manufacture, and
the preview is not a live competitor/SERP audit or a ranking guarantee.

## Rendering boundaries

All article HTML goes through the existing trusted `sanitize-html` allowlist;
the comparison renderer adds only controlled table wrappers after sanitizing.
Captions and header scopes are preserved for accessible tables. Editorial rich
fields use the existing `EditorialRichText` component. Internal relative links
stay relative; editorial external links open with `noopener noreferrer`.
Recognized retailer links keep sponsored/nofollow protection. Guide CTA paths
are restricted to same-site relative paths. No new client-side runtime or CMS
credentials are introduced.

Preview copy lives in `data/comparison-template-preview.ts`; change the shared
`components/comparison-template.tsx` to refine the layout. Existing routes do
not fall back to this preview's sample content.

Validation: production build and TypeScript passed; all 58 automated tests passed.
Browser checks at 360, 390, 768, 1024, 1440 and 1920 px verified readable table
columns, keyboard scrolling, unique contents anchors, decision links, external
link attributes, matching reading sizes, no page overflow and preview metadata.
Content renders without JavaScript. The existing comparison route and populated
buying-guide preview were checked for regressions. Live Vercel deployment and
the source site's availability were not verified from this environment.
