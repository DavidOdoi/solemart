# Product directory and substantive review pages

The reference screenshot is a product **collection grid**, rather than a single
product detail screen. The unlinked frontend-only preview at
`/template-preview/product` combines a grid with comparison data and full on-page
example reviews. It now reads local design data, not WordPress, as requested.
It keeps `noindex, nofollow, noarchive` in the robots meta and HTTP
header. No 250-page public launch, indexable category route or sitemap entries
are created by this change.

## Current frontend mode

The rendered preview imports `data/product-directory-preview.ts`. Four clearly
labeled fictional boot profiles demonstrate the complete UI without waiting for
WordPress. Their illustrative images are a local generated contact sheet, shown
as separate quadrants with CSS. There is no claim of authentic animal material,
real inventory or hands-on testing. Retailer actions are disabled; no placeholder
retailer URL is emitted. Hearts save only the example IDs to a separate local
storage key and do not affect real saved products.

The native controls, review anchors, tables and long-form example copy are all
available immediately. Query parameters no longer trigger a CMS lookup on this
page. The original protected `/sandbox/product-preview` still uses live data and
still requires credentials. The frontend fixtures are never a fallback for that
adapter or for a production product page.

## Backend retained for later integration

`getProductDirectory` remains available for a later connection: it requests at
most 12 published Shoe records using server-side WPGraphQL, search variables and
cursor pagination. Its title/body search does not relabel unrelated products;
empty responses stay empty and upstream errors remain errors. This adapter is
**not called by the current frontend design preview**. The CMS request failure
has been deferred rather than described as fixed.

## Long-form reviews without dozens of new fields

In **CPT UI → Add/Edit Post Types → Shoe**, enable native **Editor** support,
keeping Title, Featured Image and Revisions enabled. This is a maintained-plugin
setting, not a new custom plugin. Write the full model-specific review in the
normal Gutenberg editor. Existing ACF Product Full Review/commentary remains a
fallback when no native body has been supplied.

The product query requests native `content` when the schema supports it. A
specific unsupported `Shoe.content` validation error retries without that field;
it does not suppress unrelated failures or remove supported retailer fields.
When the CMS connection is resumed, the shared directory and single-product
components can display the supplied body through the
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

## Topic-level buying and review intent — future publishing

For a broad term such as **sea turtle boots**, a curated category/buying page can
combine the collection and substantive research. A specific brand/model may also
deserve its own detailed review. Whether one URL should target both the category
term and its “review” variation depends on the actual products and search intent;
the code does not guarantee rankings or invent product identity.

Write the topic research in a normal published WordPress Post, then map its saved slug when the CMS connection is resumed. The frontend-only
preview does not fetch articles through query parameters. The native title/excerpt and
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
native review body after login. Those checks described the earlier connected preview. The current frontend-only
mode is separately verified without any CMS access; live CMS facts and
deployment remain unverified.

### Frontend-only verification

The build succeeded with the CMS URL pointing to an unreachable local port;
the route is statically prerendered and makes no WordPress requests. All 81
existing automated tests passed. Production-browser checks at six widths
verified actual local image loading (without image interception), four correctly
cropped style photographs, save-heart persistence, disabled retailer controls,
unique review anchors, full spec panels, expandable FAQs and no page overflow.
The page also works without JavaScript, and stale search/article parameters
cannot trigger CMS requests. Robots metadata/headers remain intact and the
original live sandbox remains closed without its credentials.
