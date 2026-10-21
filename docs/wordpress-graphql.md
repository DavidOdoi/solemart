# WordPress blog integration

Published **ordinary WordPress posts** supply the Shoe Advice listing at `/blog` and individual pages at `/blog/[slug]` using WPGraphQL. The frontend design is preserved. Published buying guides also supply `/best-shoes/[slug]`; see [buying-guide setup and migration limits](wordpress-buying-guides.md). Reviews, comparisons, homepage lists, and search still use local data; custom fields and publishing webhooks are later integration steps.

## Configuration

1. Activate WPGraphQL at `https://cms.thesolemart.com` and publish a normal post.
2. Verify the post is available in a private browser window, not just the authenticated WordPress GraphiQL editor.
3. For local development, copy `.env.example` to `.env.local` if that file does not already exist. Preserve any existing settings. Add:

   ```dotenv
   WORDPRESS_GRAPHQL_URL=https://cms.thesolemart.com/graphql
   ```

4. Add the same variable to the Vercel project for Production and, if wanted, Preview. Redeploy after adding or changing it.
5. No WordPress administrator password, application password, Apollo client, or `NEXT_PUBLIC_` variable is required for published public posts.

## Behaviour

- A WordPress post with the slug `hey` is rendered at `/blog/hey`.
- The listing shows only published CMS articles, newest first, when WordPress is configured. It requests twelve summaries at a time, with crawlable “Older articles” links and a “Latest articles” link back to the first page. Opaque cursors are encoded in the URL; malformed cursors and empty older pages return 404.
- A published WordPress article takes precedence over a local sample with the same slug, so listing cards open the corresponding CMS content. Existing local sample routes remain a fallback when no published WordPress article matches, preserving older homepage links during the migration. They are not mixed into the configured CMS listing.
- A successful but empty CMS listing shows a genuine empty state; it does not substitute sample posts. API failures show a retry screen rather than pretending no articles have been published.
- The server fetches content; primary article content does not depend on browser JavaScript.
- The existing blog template displays the title, author, dates, sanitized HTML, and optional featured image. The WordPress excerpt supplies metadata; the full article body supplies the introduction, avoiding a duplicated first paragraph.
- Featured media at `https://cms.thesolemart.com/wp-content/uploads/**` is permitted by Next.js image configuration. Unsupported featured-image hosts are omitted; additional media/CDN hosts require a deliberate configuration update in both the adapter and Next.js configuration.
- Scripts, forms, event attributes, unsafe URL schemes, and unsupported embeds are removed from article HTML. Body H1 headings are rendered as H2 headings to retain one page H1. Standard paragraphs, headings, lists, links, tables, quotes, figures, and images are supported.
- Canonical, Open Graph, Twitter, and Article metadata use the public frontend URL and real WordPress dates. Unavailable optional fields are omitted.
- A genuine missing, private, or draft post returns not-found. Network, HTTP, or GraphQL failures raise a temporary-unavailability error instead of pretending the post is missing.
- Requests have a ten-second timeout. Successful content is eligible for time-based revalidation after 60 seconds. The first request after expiry can receive cached content while regeneration happens; this is not an immediate publishing webhook.
- React request caching shares the WordPress lookup between metadata generation and page rendering. Next.js caches the upstream response for subsequent visits.
- Without `WORDPRESS_GRAPHQL_URL`, the first listing page and existing article routes use local samples; cursor pages and unknown blog slugs return 404.
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

Next stages: agree on custom post types and fields; migrate guide/review/product templates and listing/search queries; add authenticated on-demand revalidation; then complete sitewide sitemap, canonical, taxonomy, and CMS-indexing configuration.
