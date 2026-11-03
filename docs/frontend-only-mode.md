# Working with only Next.js

SoleMart now defaults to local frontend content. This implements the requested
WordPress pause: an existing `WORDPRESS_GRAPHQL_URL`, REST URL or application
password in Vercel does not activate the CMS by itself.

No Vercel environment-variable change is needed to use the default. Optional
`SOLEMART_CONTENT_SOURCE=local` makes it explicit. All other values also keep
WordPress paused except the exact value `wordpress`.

## What loads

- Existing repository articles in `data/blog.ts` / `data/articles/`, including the
  three completed shoe-advice articles and their local images.
- Local buying-guide, review, comparison, brand and category data already in the
  repository, with the existing templates and styling.
- `/blog`, local article URLs, local buying-guide URLs, search, `/robots.txt`, and
  `/sitemap.xml`, without a WordPress GraphQL or REST request.
- The nine article **briefs** at `/template-preview/articles`; these remain
  noindex draft previews, not complete 1,700-word buying guides.

The sitemap lists locally available pages and their recorded modification dates.
It excludes draft preview URLs and does not invent URLs for unavailable CMS-only
content. A page saved only in WordPress is not copied into the repository by this
switch; it needs a local content import or a later CMS reconnection. Existing
sample product/guide profiles remain sample content and are not newly verified
recommendations.

## How the switch works

`lib/content-source.ts` is the single selector. Public GraphQL readers, public
REST author-profile reads, guide-route fallback decisions and blog static params
use it. In local mode, readers return their existing unconfigured results before
any network access. The frontend then renders the existing local data. Server-side
WordPress draft writes and CLI `--save` operations are also blocked while paused,
including when credentials or an explicit writer configuration are present.
Read-only queue/validation tooling remains available.

The CMS integration, existing field names and sanitization code remain in place.
WordPress-enabled tests opt into the CMS explicitly, and local-mode tests assert
that stale or malformed endpoint settings cannot cause a request.

## Reconnect later

1. Restore/verify the real CMS endpoint and its public GraphQL schema.
2. Set `SOLEMART_CONTENT_SOURCE=wordpress` in the relevant Vercel environment.
3. Redeploy so page generation and runtime use the same source selection.
4. Recheck CMS guide/article URLs and the sitemap before relying on the CMS again.

`WORDPRESS_GRAPHQL_URL` remains the read endpoint; authenticated draft writes
still need the dedicated writer configuration documented in
`buying-guide-automation.md`. Enabling the selector does not bypass any existing
publication or content-verification checks.

## Checks

Run `pnpm test:wordpress`, `pnpm exec tsc --noEmit --incremental false`, and
`pnpm build`. The tests cover both paused and explicitly enabled modes. A
production check should keep an unreachable `WORDPRESS_GRAPHQL_URL` configured
and leave the selector unset; local pages and the sitemap must still return 200.
Instrumentation should record zero CMS requests at build time and runtime.
