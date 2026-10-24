# ACF setup for the existing Next.js buying-guide template

## Current stage

The downloadable JSON creates two ACF field groups; it contains no executable
plugin code and does not register post types or change existing content.

The Next.js buying-guide route now supports these ACF groups. ACF, WPGraphQL and
the separate **WPGraphQL for ACF** bridge must all be active. Importing groups
without that bridge leaves them unavailable through GraphQL. The existing blog
connection continues to use WPGraphQL.

Guides with substantive ACF content use the ACF adapter. If only the default
heading/disclosure is present, existing legacy fields are retained when available.
Guides with neither source can render their native title and sanitized Gutenberg
body. Missing optional schema fields are recognized whether WordPress returns
HTTP 200 or HTTP 400; real HTTP, resolver and malformed-schema failures remain
errors. A missing or unpublished guide returns 404 in configured production,
including slugs that also exist in local sample data.

The target remains WordPress + ACF + WPGraphQL for ACF → server-side Next.js
adapter → the existing `ReviewGuideTemplate`, with roughly 60-second revalidation.
There is no REST migration, new custom WordPress plugin, template redesign, or
publishing webhook in this setup.

## 1. Preparation

- Take a database backup using the hosting backup tool before importing fields.
- Keep WPGraphQL and CPT UI active. Keep any existing SOLEMART Guide Fields plugin
  and its saved metadata until migration is verified.
- Activate **Advanced Custom Fields (ACF)** and **WPGraphQL for ACF**. ACF Free is
  sufficient; this configuration uses text, textarea, WYSIWYG, URL, Post Object
  and Tab fields. There are no Pro repeater, flexible-content, or clone fields.
- Do not create a second Buying Guides post type in ACF. CPT UI continues to own
  the existing post type, whose slug must remain `buying_guides`.

## 2. Add reusable Shoes in CPT UI

Open **CPT UI → Add/Edit Post Types → Add New Post Type**:

| Setting | Value |
| --- | --- |
| Post Type Slug | `shoe` |
| Plural Label | `Shoes` |
| Singular Label | `Shoe` |
| Public | True |
| Show UI | True |
| Show in REST API | True |
| Show in GraphQL | True |
| GraphQL Single Name | `shoe` |
| GraphQL Plural Name | `shoes` |
| Has Archive | False |
| Hierarchical | False |
| Supports | Title, Featured Image, Revisions |

Save with **Add Post Type**. Its GraphQL object type should be `Shoe`.
Use the default post capabilities; do not add public write access or custom
permission rules. Shoes must be published to be used publicly.

For the existing Buying Guides type, retain GraphQL Single Name `buyingGuide`,
Plural Name `buyingGuides`, and enable Title, Editor, Featured Image, Excerpt,
Author and Revisions. Do not rename its slug or recreate the existing articles.

## 3. Import the field groups

Download `/downloads/solemart-acf-fields.json` from the deployed Next.js website.
If the browser displays JSON, use **Save link as** on the download link; preserve
the `.json` extension. The repository copy is
`public/downloads/solemart-acf-fields.json`.

Open **ACF → Tools → Import Field Groups**, choose the JSON file, and import it.
You should see these two active groups under **ACF → Field Groups**:

- **SOLEMART Buying Guide — ACF**, location: Post Type equals Buying Guides.
- **SOLEMART Shoe — ACF**, location: Post Type equals Shoe.

The import sets GraphQL visibility, native ACF REST visibility and stable field names.
Introduction, Buying Advice Text, Product Full Review/commentary, Final Verdict
and FAQ answers use WYSIWYG editors; see [rich-text setup](wordpress-rich-text.md)
for the optional exact minimal toolbar and link behavior. Check the GraphQL
settings if the group is missing from the API:

| Group | GraphQL Type Name | GraphQL location | Query field |
| --- | --- | --- | --- |
| Buying Guide | `SolemartBuyingGuideFields` | `BuyingGuide` | `solemartBuyingGuideFields` |
| Shoe | `SolemartShoeFields` | `Shoe` | `solemartShoeFields` |

All four shoe selectors use ACF **Post Object**, filtered to `shoe`, with a single
selection, optional value, ID return format and GraphQL **One to One Connection**.
GraphQL therefore exposes each selection through `pick1Shoe { node { ... } }`,
not a bare numeric ID or a `nodes` array. Do not change this connection setting
after the adapter starts querying it.

## 4. Enter one real Shoe

Open **Shoes → Add New**:

- Use the native title for the complete product/model name.
- Set a Featured Image from your Media Library. Add its accurate alternative text
  in the Media Library; there is no duplicate custom image or alt-text field.
- Fill the ACF fields with verified details. Use one pro or con per line and
  `Label | Value` for specifications, one specification per line.
- Enter a real retailer/affiliate URL or leave it blank. Leave Full-review URL
  blank unless that separate public review exists.
- Use the Product Full Review editor for formatted commentary and links. Publish the Shoe.

## 5. Fill one Buying Guide

Edit the existing guide, for example **Best Walking Shoes for Men**. Fill the
new **SOLEMART Buying Guide — ACF** panel; the legacy panel can remain alongside
it during migration. These fields use separate metadata and do not overwrite
`_solemart_guide_fields`.

- The native title and slug determine the headline and
  `/best-shoes/best-walking-shoes-for-men` URL in Next.js.
- Use the native excerpt for card summaries, native author for authorship, and
  native Featured Image for the guide's hero image.
- Put the formatted article body, inline images, headings and links in the main
  Gutenberg editor. Do not rebuild the frontend page layout in Gutenberg.
- Fill Overview, then choose the published Shoe under **Pick 1**. Enter an award,
  recommendation reason, Best for and Avoid if for this guide. Optional
  guide-specific commentary overrides the reusable Shoe commentary.
- Picks 2–4 are optional. The recommendation order is the numbered slot order.
- Fill actual methodology, advice, verdict and any applicable FAQs. The four FAQ
  pairs are optional; incomplete and blank pairs are omitted by the adapter.
- SEO title and meta description are optional overrides. Next.js continues to
  own canonical URLs, social metadata, breadcrumbs and structured data.
- Use genuine author/reviewer information and a disclosure appropriate to your
  actual affiliate membership and links. Save with the normal Update button.

## 6. Verify the public GraphQL response

Replace the entire GraphiQL editor contents with this query, then run it:

```graphql
query VerifyAcfGuide {
  buyingGuide(id: "best-walking-shoes-for-men", idType: SLUG) {
    title
    slug
    status
    solemartBuyingGuideFields {
      intro
      quickAnswerTitle
      quickAnswerBody
      pick1Award
      pick1Reason
      pick1Shoe {
        node {
          ... on Shoe {
            title
            slug
            status
            featuredImage { node { sourceUrl altText } }
            solemartShoeFields {
              brand
              description
              affiliateUrl
              pros
              cons
              specs
              cushioning
              widthOptions
              mainStrength
            }
          }
        }
      }
    }
  }
}
```

Also verify while logged out: paste this query into the public
`https://cms.thesolemart.com/graphql?query=...` endpoint, URL-encoded. Logged-in
GraphiQL can expose drafts and private records that Next.js must not publish.
A null selection usually means no Shoe was selected, saved or published.

If WordPress reports `Cannot query field "excerpt" on type "BuyingGuide"`, open
**CPT UI → Add/Edit Post Types → Buying Guides → Supports**, enable **Excerpt**,
and save the post type. The adapter also handles this capability being absent:
it retries the guide query once without `excerpt`, for both HTTP 200 and 400
validation responses. Explicit ACF meta descriptions still take precedence;
otherwise summaries use a native excerpt, the ACF introduction, or sanitized
visible article text. Unrelated API errors are not suppressed by this retry.

If `buyingGuide` is null, verify the actual public slug before changing code:

```graphql
query PublishedGuideSlugs {
  buyingGuides(first: 20) { nodes { title slug status } }
}
```

WordPress generates a slug from the full title unless the editor sets one. In
the live setup, the user confirmed the published sandal guide had slug
`best-wide-toe-box-sandals-for-2026-our-top-4-picks`, while the shorter
`best-wide-toe-box-sandals` lookup returned null. Public frontend URLs must use
the actual saved slug: `/best-shoes/{slug}`. The title and slug need not match.

The development environment cannot currently reach the live CMS due to its
network proxy. Import syntax/source checks are not a substitute for a successful
ACF import and anonymous query on the actual WordPress installation.

## Next.js connection

- `lib/wordpress.ts` fetches the guide's native content, ACF text fields and four
  single-Shoe references in one public query. Each distinct selected Shoe is then
  fetched concurrently through its global node ID with a separate 60-second
  cache. A native author lookup is optional when the ACF byline is empty. No
  administrator credentials are used.
- `lib/guide-fields.ts` maps these responses into the existing `Guide` and
  `Product` models. Only published Shoe nodes contribute products. Duplicate
  selections are omitted, slot order is retained, and guide-specific commentary
  takes precedence over reusable commentary. Native title and image alt text
  are decoded; URLs use the existing HTTPS/image-host allowlists.
- `app/best-shoes/[slug]/page.tsx` shares the complete server lookup between page
  rendering and metadata, then renders the original `ReviewGuideTemplate`.
  Missing CMS guides never substitute local samples when WordPress is configured.
- Existing template affiliate buttons retain `sponsored nofollow noopener
  noreferrer`. Amazon/amzn.to links and explicitly sponsored links in sanitized
  Gutenberg HTML also receive `sponsored nofollow`.

Set `WORDPRESS_GUIDE_FIELDS_SOURCE=legacy` in the deployment environment and
redeploy to use the old adapter during rollback. Unset it for normal ACF-first
operation. The old plugin, adapter and `_solemart_guide_fields` data are retained.
Starting to fill a guide's actual ACF content opts that guide into the new source;
copy its legacy values before switching. Never delete old metadata prematurely.

## Remaining live verification and launch work

1. The user has confirmed WPGraphQL for ACF is now active. Public API checks
   identified missing Excerpt support and the different saved guide slug, both
   covered above. Verify the complete guide response using its actual slug.
2. Check the actual published guide, pictures, recommendation slots and links.
   Change a guide field and a reused Shoe, then verify updates after the cache
   becomes eligible for revalidation. A first request may still serve stale HTML
   while regeneration runs; this is not an instant publishing webhook.
3. Integrate guide lists/search and sitemap with the CMS before claiming that new
   guides are discoverable throughout the site. These still use local records.
   Other legacy review/comparison routes also retain sample data and require a
   separate launch cleanup; this adapter does not migrate every content type.
4. Deactivate the legacy custom fields plugin only after migrating its values
   and verifying the new flow. Keep WPGraphQL and CPT UI active.

Automated adapter/mapping tests and production-browser fixture checks cover this
connection locally. The cloud cannot access the live CMS, so these do not replace
WordPress editor/public-API and deployment checks.

Local verification passed 53 automated tests, production compilation/type checks,
and browser checks at 390px, 768px and 1440px. Checks covered the unchanged template,
metadata/schema, sanitized body, product images, affiliate attributes, FAQ behavior,
JavaScript-disabled rendering, legacy/default-field migration, actual 404/500
responses and the existing blog. A running production fixture test observed a
guide-field edit and shared Shoe edit in two guides after 66 seconds, without a
rebuild. Fixture images and responses do not establish live CMS connectivity.
Additional production-browser checks reproduced missing Excerpt support for ACF,
native/legacy and empty-field guides, including summary fallbacks, mobile layout,
JavaScript-disabled content and real missing/private 404 responses.

## Exact imported fields

The following names are the ACF storage names. Each has an explicit camelCase
GraphQL name in the JSON. Tabs only organize the editor and are excluded below.

### SOLEMART Buying Guide — ACF

| ACF name | Field type | GraphQL field |
| --- | --- | --- |
| `intro` | wysiwyg | `intro` |
| `category` | text | `category` |
| `author` | text | `author` |
| `reviewed_by` | text | `reviewedBy` |
| `disclosure` | textarea | `disclosure` |
| `quick_answer_title` | text | `quickAnswerTitle` |
| `quick_answer_body` | textarea | `quickAnswerBody` |
| `pick_1_shoe` | post_object | `pick1Shoe` |
| `pick_1_award` | text | `pick1Award` |
| `pick_1_reason` | textarea | `pick1Reason` |
| `pick_1_best_for` | text | `pick1BestFor` |
| `pick_1_avoid_if` | text | `pick1AvoidIf` |
| `pick_1_commentary` | wysiwyg | `pick1Commentary` |
| `pick_2_shoe` | post_object | `pick2Shoe` |
| `pick_2_award` | text | `pick2Award` |
| `pick_2_reason` | textarea | `pick2Reason` |
| `pick_2_best_for` | text | `pick2BestFor` |
| `pick_2_avoid_if` | text | `pick2AvoidIf` |
| `pick_2_commentary` | wysiwyg | `pick2Commentary` |
| `pick_3_shoe` | post_object | `pick3Shoe` |
| `pick_3_award` | text | `pick3Award` |
| `pick_3_reason` | textarea | `pick3Reason` |
| `pick_3_best_for` | text | `pick3BestFor` |
| `pick_3_avoid_if` | text | `pick3AvoidIf` |
| `pick_3_commentary` | wysiwyg | `pick3Commentary` |
| `pick_4_shoe` | post_object | `pick4Shoe` |
| `pick_4_award` | text | `pick4Award` |
| `pick_4_reason` | textarea | `pick4Reason` |
| `pick_4_best_for` | text | `pick4BestFor` |
| `pick_4_avoid_if` | text | `pick4AvoidIf` |
| `pick_4_commentary` | wysiwyg | `pick4Commentary` |
| `how_we_chose` | textarea | `howWeChose` |
| `advice` | wysiwyg | `advice` |
| `who_its_for` | textarea | `whoItsFor` |
| `mistakes_to_avoid` | textarea | `mistakesToAvoid` |
| `final_verdict` | wysiwyg | `finalVerdict` |
| `faq_1_question` | text | `faq1Question` |
| `faq_1_answer` | wysiwyg | `faq1Answer` |
| `faq_2_question` | text | `faq2Question` |
| `faq_2_answer` | wysiwyg | `faq2Answer` |
| `faq_3_question` | text | `faq3Question` |
| `faq_3_answer` | wysiwyg | `faq3Answer` |
| `faq_4_question` | text | `faq4Question` |
| `faq_4_answer` | wysiwyg | `faq4Answer` |
| `seo_title` | text | `seoTitle` |
| `meta_description` | textarea | `metaDescription` |

### SOLEMART Shoe — ACF

| ACF name | Field type | GraphQL field |
| --- | --- | --- |
| `brand` | text | `brand` |
| `description` | textarea | `description` |
| `affiliate_url` | url | `affiliateUrl` |
| `review_url` | url | `reviewUrl` |
| `pros` | textarea | `pros` |
| `cons` | textarea | `cons` |
| `specs` | textarea | `specs` |
| `cushioning` | text | `cushioning` |
| `width_options` | text | `widthOptions` |
| `main_strength` | text | `mainStrength` |
| `commentary` | wysiwyg | `commentary` |
