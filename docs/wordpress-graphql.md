# WordPress blog integration

The original connection from before the temporary frontend-only bypass is
restored. `WORDPRESS_GRAPHQL_URL` enables both published Posts and the existing
ACF/legacy buying-guide readers. `SOLEMART_CONTENT_SOURCE` is obsolete and ignored,
including old `local` or `hybrid` values. No new plugin/importer is required;
see [restoration details](frontend-only-mode.md).

Buying-guide configuration uses ACF and WPGraphQL for ACF; see
[ACF setup](wordpress-acf-setup.md). The existing GraphQL connection remains in
use. The companion-plugin instructions below describe the legacy guide adapter
retained during migration. The buying-guide route prefers populated ACF fields
and handles absent legacy fields on both HTTP 200 and HTTP 400.

Published **ordinary WordPress posts** supply the Shoe Advice listing at `/blog` and individual pages at `/blog/[slug]` using WPGraphQL. The frontend design is preserved. Published buying guides fill the original Next.js template at `/best-shoes/[slug]` using ACF and reusable Shoes, with the companion field editor retained as a migration fallback; see [ACF setup and remaining launch work](wordpress-acf-setup.md). Reviews, comparisons, homepage lists, and search still use local data; publishing webhooks remain a later integration step.

## Configuration

1. Activate WPGraphQL at `https://cms.thesolemart.com` and publish a normal post.
2. Verify the post is available in a private browser window, not just the authenticated WordPress GraphiQL editor.
3. For local development, copy `.env.example` to `.env.local` if that file does not already exist. Preserve any existing settings. Add:

   ```dotenv
   WORDPRESS_GRAPHQL_URL=https://cms.thesolemart.com/graphql
   ```

4. Keep the existing GraphQL URL in the Vercel project's Production environment and, if wanted, Preview. Redeploy the restored code; old source-mode settings no longer override this URL.
5. No WordPress administrator password, application password, Apollo client, or `NEXT_PUBLIC_` variable is required for published public posts.

## Behaviour

- A WordPress post with the slug `hey` is rendered at `/blog/hey`.
- The listing shows only published CMS articles, newest first, when WordPress is configured. It requests twelve summaries at a time, with crawlable “Older articles” links and a “Latest articles” link back to the first page. Opaque cursors are encoded in the URL; malformed cursors and empty older pages return 404.
- A published WordPress article takes precedence over a local sample with the same slug, so listing cards open the corresponding CMS content. Existing local sample routes remain a fallback when no published WordPress article matches, preserving older homepage links during the migration. They are not mixed into the configured CMS listing.
- A successful but empty CMS listing shows a genuine empty state. CMS failures retain the retry screen instead of inventing an empty collection, local replacement or missing page.
- The server fetches content; primary article content does not depend on browser JavaScript.
- The existing blog template displays the title, author, dates, sanitized HTML, and optional featured image. The WordPress excerpt supplies metadata; the full article body supplies the introduction, avoiding a duplicated first paragraph.
- Featured media at `https://cms.thesolemart.com/wp-content/uploads/**` is permitted by Next.js image configuration. Unsupported featured-image hosts are omitted; additional media/CDN hosts require a deliberate configuration update in both the adapter and Next.js configuration.
- Scripts, forms, event attributes, unsafe URL schemes, and unsupported embeds are removed from article HTML. Body H1 headings are rendered as H2 headings to retain one page H1. Standard paragraphs, headings, lists, links, tables, quotes, figures, and images are supported.
- Canonical, Open Graph, Twitter, and Article metadata use the public frontend URL and real WordPress dates. Unavailable optional fields are omitted.
- A missing, private or draft CMS post exposes no CMS content; an independently published local record can still be the existing fallback. Network/HTTP/GraphQL failures remain temporary-unavailability errors, matching the original CMS-first behavior.
- Requests have a ten-second timeout. Successful content is eligible for time-based revalidation after 60 seconds. The first request after expiry can receive cached content while regeneration happens; this is not an immediate publishing webhook.
- React request caching shares the WordPress lookup between metadata generation and page rendering. Next.js caches the upstream response for subsequent visits.
- A configured `WORDPRESS_GRAPHQL_URL` enables the original CMS readers. Without that URL, existing local development content remains available. The temporary source-mode flag no longer controls the connection.
- Listing requests use the same 60-second data-cache revalidation window. Publishing a post does not require a frontend rebuild, but cache expiry and a subsequent request are required until on-demand revalidation is added.

## Local checks

Use Node.js 24 and the pinned pnpm version from `package.json`:

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit --incremental false
pnpm test:wordpress
pnpm build
pnpm start
```

If the environment uses an HTTPS proxy, use its supported Node proxy configuration, such as `NODE_USE_ENV_PROXY=1`, while preserving certificate verification. Next.js generates `next-env.d.ts` files during build/dev; preserve any pre-existing user changes when restoring generated changes.

Check `/blog` and `/blog/hey` against published posts. Verify cards, pagination links, and article content are visible with browser JavaScript disabled and in the HTTP HTML response. Check canonical URLs, cursor validation, the empty state, upstream failures, and a migrated slug matching a local sample. Check the absence of a broken image when no featured image is set. Also check an unknown slug and unconfigured development. Do not call local fixture tests a live CMS connection test.

## Deployment and remaining validation

Pushing to `main` triggers deployment if the existing Vercel Git integration is enabled. The user confirmed the first real article was displayed at `https://thesolemart.com/blog/hey`. After deploying the listing update, visit `https://thesolemart.com/blog` and confirm the published post appears and its card opens the article. This cloud workspace still returns a proxy CONNECT 403 for the CMS; a successful fixture/build test does not establish live archive connectivity.

If deployment cannot load a post, inspect Vercel server logs for HTTP/GraphQL errors, verify the variable is set for the deployment's environment, and confirm the post is published and publicly queryable. Do not expose credentials in logs or source code. InMotion security rules must allow legitimate WPGraphQL POST requests from Vercel.

Next stages: verify the live ACF guide connection; migrate listing/search queries and remaining review/comparison templates; complete sitemap, taxonomy and CMS-indexing configuration. Authenticated on-demand revalidation can follow the initial time-based publishing flow.

## Deployment and sitemap availability

`/sitemap.xml` renders on demand (`app/sitemap.ts`, `revalidate = 0`). Its explicit
WordPress fetches retain their 60-second data cache. An unavailable CMS therefore
does not abort `next build`, including deployments of local template previews.
Published CMS posts/guides are still fetched with pagination and real modification
dates when the sitemap is requested. CMS errors are not replaced with an empty
article list or an incomplete sitemap presented as a successful response.

If Vercel reports `ECONNREFUSED` for the CMS, compilation and TypeScript may already
have passed. Check that the production `WORDPRESS_GRAPHQL_URL` is exactly
`https://cms.thesolemart.com/graphql`, then check that hostname's DNS, hosting,
HTTPS service and firewall. Moving the sitemap to request time removes the
build dependency; it does not repair the CMS connection. CMS-backed routes and
the sitemap still require a reachable CMS at request time.

Regression check: with no server listening at the test endpoint, run
`SOLEMART_CONTENT_SOURCE=local WORDPRESS_GRAPHQL_URL=http://127.0.0.1:39991/graphql pnpm build`. The stale source flag must not disable the configured connection, and the build must
succeed and list `/sitemap.xml` as dynamic. Serve that build and confirm the brief
preview pages still load during the outage. A sitemap request should fail instead
of returning a misleading static-only XML document; after a test CMS is available,
verify published posts and guides appear, including entries after the first 100.
Use local synthetic data for this check, never real credentials in a build log.
