# Fully populated buying-guide design reference

Open `https://thesolemart.com/template-preview/buying-guide` to review the complete
template without editing or publishing WordPress records.

The original reference is **Best Walking Shoes for Men**. Comparing
`components/review-guide-template.tsx` with commit `46ea214` confirmed that the
original section headings, order, orange Top Picks ribbon, card layout,
comparison table, sticky navigation and contents sidebar remain in the shared
template. CMS pages omit sections whose fields are empty; the original walking
fixture also contains fewer optional values than a fully populated guide.

The preview supplies those values through `data/guide-template-preview.ts`:
four picks and full reviews, images, badge/reason, Best for, Avoid if, pros/cons,
specifications, comparison values, byline, dates, disclosure, Quick Answer,
methodology, article body, buying-advice sections, audience, mistakes, four FAQs
and final verdict. The original first two walking-guide picks retain their order.
The existing illustrative assets and sample product profiles supply the content.

`app/template-preview/buying-guide/page.tsx` renders the same
`ReviewGuideTemplate` used by published guides. Update that shared component when
improving the design so the preview and CMS pages stay aligned; do not create a
second copy of the page layout. The preview does not fetch WordPress or change
the `/best-shoes/[slug]` adapter and its real 404 behavior.

The preview is labeled as sample content and marked `noindex, nofollow`. Preview
mode displays disabled retailer buttons with the existing styling and omits
sample article/product structured data. Published guides keep real retailer
anchors and structured data. Preview bookmark IDs are prefixed with `preview-`
so testing them does not change saved states for live products. Review links
scroll to the populated detailed profiles within the preview.

The shared layout now displays only Home / Buying Guides above the headline,
omitting the repeated article title and category eyebrow. The complete breadcrumb
remains in structured data. Featured images use a centered 800 × 450 frame (16:9),
scale down on smaller screens and crop to fill the frame. Rank badges and the
shortlist introduction are larger, and the Final Verdict no longer has an
“Our take” eyebrow.

Specification tables reserve at least 160 px per column, with a 420 px minimum
table width. The table scrolls within its column instead of compressing each word
or expanding the page. The scroll region supports keyboard focus; small screens
keep the existing stacked specifications. WordPress field names, stored values
and the `Label | Value` entry format remain unchanged. Browser checks cover a
portrait featured image and seven specifications at 360, 390, 768, 1024, 1440
and 1920 px, alongside the complete preview and rendering without JavaScript.

Validation: production build/type checks, mobile/tablet/desktop browser checks
for complete sections and four cards, FAQ/bookmark/anchor interactions, no
horizontal overflow, metadata and disabled retailer controls. A CMS fixture
check verifies that published guides retain sponsored retailer links and schema.
External photographs were substituted in local browser tests; these tests do
not verify the public deployment or image host connectivity.
