# WordPress content → existing Next.js buying-guide template

## What this implements

WordPress stores and edits content; `ReviewGuideTemplate` in Next.js retains the original design, including Quick Answer, Top Picks ribbon and cards, comparison table, full reviews, buying advice, contents navigation, FAQs and verdict. The previous simplified CMS article component has been removed. CMS fields populate `Guide` and `Product` view models instead of replacing the frontend with WordPress layout HTML.

## Install in WordPress

Prerequisites: existing public `buying_guides` CPT, WPGraphQL enabled, GraphQL singular name `buyingGuide` and plural name `buyingGuides`. Enable Title, Editor, Featured Image, Excerpt and Revisions in CPT UI.

1. Download `https://thesolemart.com/downloads/solemart-guide-fields.zip` after this deployment. The same file is at `public/downloads/solemart-guide-fields.zip` in the repository.
2. In WordPress open **Plugins → Add New Plugin → Upload Plugin**.
3. Upload the ZIP, choose **Install Now**, then **Activate**.
4. Open **Buying Guides → Best Walking Shoes for Men**.
5. Find **SOLEMART — Your Next.js Template** below the content editor. If hidden, enable that panel in the editor's Preferences/Options. No additional field plugin, ACF subscription, PHP editing or JSON editing is required.

The companion plugin adds fields and GraphQL output only; it does not change the WordPress theme or create public frontend templates. It uses core WordPress post metadata, media picker, nonce/capability checks and allowlisted sanitization. CPT UI continues to own the content type. It does not delete saved fields on deactivation. Custom metadata is saved on normal editor updates; custom-field revision restore and preview integration are not implemented in this version.

## Fill the template

| WordPress location | Next.js display |
| --- | --- |
| Native title and slug | H1 and `/best-shoes/{slug}` |
| Introduction | Existing bold introduction beneath the title |
| Author / Reviewed by | Existing byline |
| Native publication/modification timestamps | Published/updated dates |
| Affiliate disclosure | Disclosure before recommendations |
| Quick Answer heading and text | Existing ivory Quick Answer box |
| Top Picks → Add item | Shoe cards in the existing orange ribbon section, in editor order (maximum four) |
| Shoe name, award, short verdict, best for | Card name, badge, summary and comparison details |
| Choose / upload image and Image description | Product image and alt text; upload to the CMS Media Library |
| Affiliate / retailer link | Price buttons with sponsored link attributes; Amazon URLs receive the Amazon CTA label |
| Optional published full-review URL | Links to a separate review; otherwise links scroll to that shoe's detailed analysis on this guide |
| Avoid if, pros, cons, specifications, full review | Existing Full Reviews cards |
| Cushioning, width options, main strength | Existing comparison table / mobile cards |
| How we chose | Existing methodology section |
| Buying advice and repeating buying-advice sections | Existing buying advice layout |
| Main WordPress editor | Additional rich buying-guide content, including links and inline images |
| Who this guide is for / Mistakes to avoid | Existing audience and mistakes sections |
| FAQs → Add item | Existing FAQ accordions |
| Final verdict | Existing verdict box |
| Native featured image | Optional guide image after the introduction/disclosure |
| Native excerpt, SEO title, meta description | Search/social metadata |

Enter one pro, con or checklist item per line. Enter specifications as `Label | Value`, one per line. Separate full-review and advice paragraphs with a blank line. Use Move up and Remove item to manage repeatable rows. Save using the normal WordPress **Update/Publish** button. Text fields are plain text; use the native content editor for richer body formatting and inline links/images.

Do not type JSON or try to recreate the page design inside Gutenberg. Empty CMS sections are omitted, and the contents menu only links to sections actually rendered. Missing images or retailer links do not create broken images or example affiliate buttons. A CMS guide never inherits sample product details, names or editorial claims from the local fixtures.

## GraphQL verification

After activating the plugin and saving fields, run:

```graphql
query TestGuideTemplate {
  buyingGuide(id: "best-walking-shoes-for-men", idType: SLUG) {
    title
    slug
    solemartGuideData
  }
}
```

`solemartGuideData` is a JSON string transport for the form values; editors never need to edit it. Verify anonymous access in an incognito window as well as the authenticated editor. The singular GraphQL type must be `BuyingGuide`, matching the CPT setup above.

No new environment variables or credentials are required. Next.js uses the existing server-only `WORDPRESS_GRAPHQL_URL=https://cms.thesolemart.com/graphql`. Structured data is fetched server-side with the same 60-second cache/revalidation and tags as the article. Metadata and page rendering share React-cached lookups. There is no publishing webhook yet: after cache expiry, a request can serve the old page while regeneration runs.

## Migration and scope

Published CMS content takes priority at `/best-shoes/{slug}`; new guide slugs render on demand without rebuilding. Until the companion plugin is activated, the original template shows only the available native WordPress content. Missing plugin fields are handled separately from network, authorization or GraphQL resolver failures, which produce an error screen rather than substitute examples.

Existing local guides with no published CMS match retain their template during migration. Unpublishing a migrated guide with a matching local record can reveal that sample again. Remove the corresponding local record when completing its migration. Unknown slugs return an actual 404.

Homepage/category/related-guide/search lists still use local records. This change connects individual buying-guide templates, not those archives. Separate review/comparison CPTs and reusable cross-guide product records remain future work; shoes in this first version are edited within each guide. WordPress custom-field previews, revalidation webhooks and metadata revision restore are not implemented.

## Validation and rebuilding

- `pnpm test:wordpress`: adapter and field mapping tests, including empty fields, unsafe URLs, missing companion schema, malformed data and upstream failures.
- `pnpm build`: production compilation and type checks.
- `node --check wordpress/solemart-guide-fields/editor.js`: editor syntax.
- PHP source was syntax-checked with a PHP parser. There is no PHP/WordPress runtime in this cloud, so activation, persistence in the real WordPress editor and the live GraphQL resolver still require a CMS check after installation.
- Production browser checks used a local GraphQL fixture: original template sections, CMS image and link values, metadata, single H1, mobile/tablet/desktop overflow, server HTML without JavaScript, FAQ interaction, absent/empty fields, genuine 404/500 statuses, local-guide compatibility. A browser harness also checked editor repeat controls, media selection/alt text and JSON serialization using a mocked WordPress media picker.
- Cloud network policy blocks direct CMS requests. The user's incognito screenshots confirm public native guide access; fixture tests do not establish live companion-plugin connectivity.
- `python3 scripts/package-wordpress-plugin.py` rebuilds the ZIP from the four source files using the standard library. Commit the updated ZIP when plugin sources change.

After Vercel deploys and the plugin is activated: fill one complete shoe, Quick Answer and FAQ; click Update; verify `/best-shoes/best-walking-shoes-for-men` displays those values in the existing design. Change one field and verify it refreshes after revalidation. If fields do not appear, check the GraphQL query above, plugin activation, panel preferences and deployment server logs.
