# ACF setup for the existing Next.js buying-guide template

## Current stage

This is the field-configuration stage of the migration. The downloadable JSON
creates two ACF field groups; it contains no executable plugin code and does not
register post types, change existing content, or switch the Next.js adapter.

The existing blog connection continues to use WPGraphQL. Buying guides still
read the legacy SOLEMART fields until the ACF adapter is implemented and tested.
Importing these groups alone does **not** make their values appear on the site.

The target remains WordPress + ACF + WPGraphQL for ACF → server-side Next.js
adapter → the existing `ReviewGuideTemplate`, with roughly 60-second revalidation.
There is no REST migration, new custom WordPress plugin, template redesign, or
publishing webhook in this setup.

## 1. Preparation

- Take a database backup using the hosting backup tool before importing fields.
- Keep WPGraphQL and CPT UI active. Keep any existing SOLEMART Guide Fields plugin
  and its saved metadata until migration is verified.
- Activate **Advanced Custom Fields (ACF)** and **WPGraphQL for ACF**. ACF Free is
  sufficient; this configuration uses text, textarea, URL, Post Object and Tab
  fields. There are no Pro repeater, flexible-content, or clone fields.
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

The import sets GraphQL visibility and stable field names. Check the GraphQL
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
- Separate commentary paragraphs with a blank line. Publish the Shoe.

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
  pairs are optional; blank pairs should be omitted by the future adapter.
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

The development environment cannot currently reach the live CMS due to its
network proxy. Import syntax/source checks are not a substitute for a successful
ACF import and anonymous query on the actual WordPress installation.

## Next.js connection and verification still to do

After verifying the actual schema and response:

1. Add an ACF query and server adapter alongside `getWordPressGuideFields` in
   `lib/wordpress.ts`; keep the existing blog connection.
2. Map native post data and ACF fields into the existing `Guide` and `Product`
   models in `lib/guide-fields.ts` or a dedicated ACF mapper. Native WordPress
   author supplies the default byline. Only published Shoe nodes may contribute
   products; do not fetch using WordPress administrator credentials.
3. For each of four numbered slots, combine the reusable Shoe values with that
   guide's badge, reason, Best for, Avoid if and commentary. A Shoe update then
   affects all guides referencing it after cache expiry and revalidation.
4. Use the same trusted-URL validation and HTML sanitization. Keep affiliate
   anchors marked `sponsored nofollow noopener noreferrer` in Next.js.
5. Switch the buying-guide route after testing fields, missing/private content,
   metadata, images, mobile layout, production build and revalidation. Remove
   production sample fallbacks and example affiliate destinations as a separate
   verified launch step; the existing setup files do not do this automatically.
6. Integrate guide lists/search and sitemap with the CMS before claiming that
   newly published guides are discoverable throughout the site.
7. Deactivate the legacy custom fields plugin only after migrating its values
   and confirming the new guide works. Keep WPGraphQL and CPT UI active for this
   architecture. Retain old metadata and a database backup for rollback.

Rollback during this configuration stage is simply to leave the existing
frontend adapter in use; it has not changed. Once switching the adapter, retain
an explicit source switch or revertible deployment until the migration is
verified. Do not delete old metadata, post types or plugin files prematurely.

## Exact imported fields

The following names are the ACF storage names. Each has an explicit camelCase
GraphQL name in the JSON. Tabs only organize the editor and are excluded below.

### SOLEMART Buying Guide — ACF

| ACF name | Field type | GraphQL field |
| --- | --- | --- |
| `intro` | textarea | `intro` |
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
| `pick_1_commentary` | textarea | `pick1Commentary` |
| `pick_2_shoe` | post_object | `pick2Shoe` |
| `pick_2_award` | text | `pick2Award` |
| `pick_2_reason` | textarea | `pick2Reason` |
| `pick_2_best_for` | text | `pick2BestFor` |
| `pick_2_avoid_if` | text | `pick2AvoidIf` |
| `pick_2_commentary` | textarea | `pick2Commentary` |
| `pick_3_shoe` | post_object | `pick3Shoe` |
| `pick_3_award` | text | `pick3Award` |
| `pick_3_reason` | textarea | `pick3Reason` |
| `pick_3_best_for` | text | `pick3BestFor` |
| `pick_3_avoid_if` | text | `pick3AvoidIf` |
| `pick_3_commentary` | textarea | `pick3Commentary` |
| `pick_4_shoe` | post_object | `pick4Shoe` |
| `pick_4_award` | text | `pick4Award` |
| `pick_4_reason` | textarea | `pick4Reason` |
| `pick_4_best_for` | text | `pick4BestFor` |
| `pick_4_avoid_if` | text | `pick4AvoidIf` |
| `pick_4_commentary` | textarea | `pick4Commentary` |
| `how_we_chose` | textarea | `howWeChose` |
| `advice` | textarea | `advice` |
| `who_its_for` | textarea | `whoItsFor` |
| `mistakes_to_avoid` | textarea | `mistakesToAvoid` |
| `final_verdict` | textarea | `finalVerdict` |
| `faq_1_question` | text | `faq1Question` |
| `faq_1_answer` | textarea | `faq1Answer` |
| `faq_2_question` | text | `faq2Question` |
| `faq_2_answer` | textarea | `faq2Answer` |
| `faq_3_question` | text | `faq3Question` |
| `faq_3_answer` | textarea | `faq3Answer` |
| `faq_4_question` | text | `faq4Question` |
| `faq_4_answer` | textarea | `faq4Answer` |
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
| `commentary` | textarea | `commentary` |
