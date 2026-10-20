# First WordPress article integration

This step connects published **ordinary WordPress posts** to `/blog/[slug]` using WPGraphQL. It preserves the existing frontend and sample blog posts. Buying guides, reviews, comparisons, the blog index, homepage lists, and search still use local data; custom fields, archives, and publishing webhooks are later integration steps.

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
- The three existing local sample articles retain their current routes and take precedence if a WordPress slug collides. Rename a new post or explicitly migrate a conflicting sample when moving more content to WordPress.
- The server fetches content; primary article content does not depend on browser JavaScript.
- The existing blog template displays the title, author, dates, sanitized HTML, and optional featured image. The WordPress excerpt supplies metadata; the full article body supplies the introduction, avoiding a duplicated first paragraph.
- Featured media at `https://cms.thesolemart.com/wp-content/uploads/**` is permitted by Next.js image configuration. Unsupported featured-image hosts are omitted; additional media/CDN hosts require a deliberate configuration update in both the adapter and Next.js configuration.
- Scripts, forms, event attributes, unsafe URL schemes, and unsupported embeds are removed from article HTML. Body H1 headings are rendered as H2 headings to retain one page H1. Standard paragraphs, headings, lists, links, tables, quotes, figures, and images are supported.
- Canonical, Open Graph, Twitter, and Article metadata use the public frontend URL and real WordPress dates. Unavailable optional fields are omitted.
- A genuine missing, private, or draft post returns not-found. Network, HTTP, or GraphQL failures raise a temporary-unavailability error instead of pretending the post is missing.
- Requests have a ten-second timeout. Successful content is eligible for time-based revalidation after 60 seconds. The first request after expiry can receive cached content while regeneration happens; this is not an immediate publishing webhook.
- React request caching shares the WordPress lookup between metadata generation and page rendering. Next.js caches the upstream response for subsequent visits.
- Without `WORDPRESS_GRAPHQL_URL`, sample content remains usable and unknown blog slugs return 404.

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

Check `/blog/hey` against a published post. Verify its content is visible with browser JavaScript disabled and in the HTTP HTML response; check the public canonical and the absence of a broken image when no featured image is set. Also check an unknown slug, a local sample article, and a simulated upstream failure. Do not call local fixture tests a live CMS connection test.

## Deployment and remaining validation

Pushing to `main` triggers deployment if the existing Vercel Git integration is enabled. After deployment, visit `https://thesolemart.com/blog/hey` and confirm the article content matches WordPress. This cloud workspace initially returned a proxy CONNECT 403 for the CMS; a successful fixture/build test does not establish Vercel-to-CMS connectivity. A public query test in the user's private browser returned the `hey` post.

If deployment cannot load a post, inspect Vercel server logs for HTTP/GraphQL errors, verify the variable is set for the deployment's environment, and confirm the post is published and publicly queryable. Do not expose credentials in logs or source code. InMotion security rules must allow legitimate WPGraphQL POST requests from Vercel.

Next stages: agree on custom post types and fields; migrate guide/review/product templates and listing/search queries; add authenticated on-demand revalidation; then complete sitewide sitemap, canonical, taxonomy, and CMS-indexing configuration.
