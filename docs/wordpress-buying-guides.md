# WordPress buying guides

## CMS setup

The user created the public `buying_guides` custom post type using Custom Post Type UI, with GraphQL singular name `buyingGuide` and plural name `buyingGuides`. Enable GraphQL visibility and support for Title, Editor, Featured Image, Excerpt and Revisions. The user confirmed an anonymous/incognito GraphQL request returns the published guide `best-walking-shoes-for-men` and its article body.

No new environment variables or credentials are required. The adapter uses the existing server-only `WORDPRESS_GRAPHQL_URL=https://cms.thesolemart.com/graphql`.

## Publishing

1. Create or edit a document under **Buying Guides**, rather than ordinary **Posts**.
2. Set the title and slug, add the body in the editor, and optionally set Excerpt and Featured Image.
3. Publish or update it. Its frontend URL is `https://thesolemart.com/best-shoes/{slug}`.
4. After deployment, confirm the test paragraph appears at `/best-shoes/best-walking-shoes-for-men`.

CMS data takes priority over a local guide with the same slug. New published guide slugs render on demand without a frontend rebuild. Responses and pages use 60-second time-based revalidation: a request after expiry can receive stale content while regeneration runs. There is no publishing webhook yet.

This stage maps title, body, excerpt metadata, dates and optional featured image. It retains the site's buying-guide typography, breadcrumbs, disclosure, header and footer. Sanitized article HTML is returned by the server, with canonical, social metadata, Article and BreadcrumbList structured data. Author support was not included in the supplied CPT setup, so this query does not request or invent an author. Enable Author support and deliberately map it in a subsequent change if required.

Structured shoe records, recommendation cards, comparison tables, quick verdicts, FAQs and reviewer fields are not yet connected. A migrated guide does not inherit recommendations or claims from sample data. Those blocks can be added after their CMS fields are configured. The WordPress body supports headings, paragraphs, lists, tables and links. Editors remain responsible for accurate affiliate URLs and applicable sponsored link attributes.

Existing local guides without a published CMS match retain their sample template during migration. This means unpublishing a migrated guide whose slug matches a local sample can reveal that sample again; remove the corresponding local record when completing its migration. Unknown slugs without any match return 404. HTTP, timeout and GraphQL errors raise an error with a retry screen instead of silently showing samples.

Homepage, category, related-guide lists and search still use local guide records; new CMS-only guides are accessible by URL but are not automatically added to those lists in this stage. Archive integration and structured fields remain separate work.

## Validation

Run `pnpm test:wordpress` and `pnpm build`. Adapter tests cover published guides, body sanitization, missing/private/draft guides, invalid responses and upstream failure. A local GraphQL fixture and a production Next.js server were used to check an existing and new slug with JavaScript disabled, correct metadata/schema, one H1, no sample picks, mobile/desktop overflow, real 404/500 statuses, and other local guides remaining intact.

The live CMS cannot be fetched directly from this cloud due to its network proxy. The user's incognito screenshot establishes anonymous collection access; local fixtures do not prove the complete deployed singular-query integration. After Vercel deploys, verify the public URL and test a WordPress update. If GraphQL fails, inspect the deployment's server logs and verify the `buyingGuide` GraphQL name and enabled CPT features.
