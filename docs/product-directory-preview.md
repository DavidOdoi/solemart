# Product directory and substantive review pages

The reference screenshot is a product **collection grid**, rather than a single
product detail screen. The revised unlinked preview at
`/template-preview/product` combines a grid with comparison data and full on-page
reviews. It keeps `noindex, nofollow, noarchive` in the robots meta and HTTP
header. No 250-page public launch, indexable category route or sitemap entries
are created by this change.

## Actual data, not a mocked catalogue

The page now requests at most 12 published Shoe records per request using
server-side WPGraphQL, search variables and cursor pagination. Cards, images,
specifications, review text and retailer destinations come from those records.
The former fictional product fixture is deleted. An empty response stays empty;
schema/network errors have a real error state. Search, missing records and
upstream failures are not disguised with sample content.

`/template-preview/product?q=sea+turtle+boots` filters the native WordPress title
and content. It does not relabel unrelated sneakers as sea turtle boots. Records
need actual model names, appropriate materials and review content. Saved ACF
specification fields are not automatically included in WordPress native search.

The preview reads only records already public through WordPress, and is publicly
reachable by its unlinked URL. `/sandbox/product-preview` still requires its
existing login and remains closed when its credentials are absent. No WordPress
credentials are exposed and no draft/private records are published by either
adapter. This is a preview, not access control for WordPress itself.

## Long-form reviews without dozens of new fields

In **CPT UI → Add/Edit Post Types → Shoe**, enable native **Editor** support,
keeping Title, Featured Image and Revisions enabled. This is a maintained-plugin
setting, not a new custom plugin. Write the full model-specific review in the
normal Gutenberg editor. Existing ACF Product Full Review/commentary remains a
fallback when no native body has been supplied.

The product query requests native `content` when the schema supports it. A
specific unsupported `Shoe.content` validation error retries without that field;
it does not suppress unrelated failures or remove supported retailer fields.
Both directory and single-product previews display the supplied body through the
trusted sanitizer and shared article renderer, including headings, source links,
images, Rank Math FAQs and a first-H3 quick answer. Review anchors are scoped per
model so repeated Fit/FAQ headings remain unique across a collection page.

A useful record needs model-specific evidence, not a repeated generic paragraph:

- Exact model/brand, accurate photographs and image alt text.
- Sourced materials, construction, dimensions, sizing/width and intended use.
- Fit analysis, trade-offs, limitations and supported pros/cons.
- Actual research or testing methodology, with appropriate sources.
- A reasoned verdict explaining who should consider it and who should not.
- Real retailer destinations; absent prices are replaced by “Check current price,”
  not made-up amounts, stock, discounts, ratings or bestseller badges.

The renderer cannot turn incomplete or unverified inputs into an authoritative
review. Missing review text is explicitly flagged in this owner preview. No
arbitrary word-count rule is treated as a guarantee against thin content.

## Topic-level buying and review intent

For a broad term such as **sea turtle boots**, a curated category/buying page can
combine the collection and substantive research. A specific brand/model may also
deserve its own detailed review. Whether one URL should target both the category
term and its “review” variation depends on the actual products and search intent;
the code does not guarantee rankings or invent product identity.

Write the topic research in a normal published WordPress Post, then supply its
saved slug with `?article=POST-SLUG` in this preview. The native title/excerpt and
Gutenberg body are used without creating a second custom-field form. For a real
sea-turtle-related article, independently check material identity (including
turtle-pattern substitutes versus genuine material), provenance, condition and
applicable trade restrictions using authoritative sources. Do not fabricate
current sellers or assume a historical/auction listing is available stock.

Do not publish/index an empty category or a product with only a photo and a few
specs. The preview remains unindexed while real editorial content is prepared.
Its metadata is preview metadata, not production SEO metadata for a new category.

## What is preserved

Existing buying-guide layouts, blog publishing, private sandbox authentication,
ACF field names and stored records remain unchanged. The new paginated query
does not fetch/build all 250 products. Optional extra retailer schema fields and
native Editor support are detected without a custom WordPress plugin.

Workspace requests to the actual CMS returned HTTP 403 during this work. Local
fixtures can verify fetch/mapping/rendering, but real product facts and the live
CMS catalogue could not be independently verified here. Editors must supply and
verify the real products before the category can be considered publishable.

## Verification

Production build/TypeScript and all **81 automated tests** passed. Local CMS
fixtures verified a four-column desktop grid (two on tablet, one on mobile),
actual supplied names/images/specs/reviews, private-record exclusion, unique
anchors across repeated review headings, working review jumps, expandable FAQs,
complete per-model specification tables and no horizontal page overflow at
360, 390, 768, 1024, 1440 and 1920 px. Native and older schemas, empty records,
pagination, a real Post body and rendering without JavaScript were checked.
The original sandbox still requires authentication and displays a supplied
native review body after login. No fake or local product fixture is imported
by the application preview. Live CMS facts and deployment remain unverified.
