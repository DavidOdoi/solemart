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

Validation: production build/type checks, mobile/tablet/desktop browser checks
for complete sections and four cards, FAQ/bookmark/anchor interactions, no
horizontal overflow, metadata and disabled retailer controls. A CMS fixture
check verifies that published guides retain sponsored retailer links and schema.
External photographs were substituted in local browser tests; these tests do
not verify the public deployment or image host connectivity.
