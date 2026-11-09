# Content sources and offline mode

SoleMart now defaults to **hybrid** mode. This restores published WordPress blog
posts such as older `/blog/[slug]` URLs while keeping the local buying guides,
reviews, comparisons and template previews independent of the CMS.

| `SOLEMART_CONTENT_SOURCE` | Blog reads | Buying-guide source | Draft writes |
| --- | --- | --- | --- |
| Unset or `hybrid` | Public WordPress posts with published local fallbacks | Local | Disabled |
| `local` | Local only, with zero CMS requests | Local | Disabled |
| `wordpress` | Configured WordPress endpoint with existing local not-found fallbacks | Configured CMS guides | Requires dedicated writer credentials |

Unrecognized explicit values, including an empty value, remain local. The public
blog endpoint in hybrid mode defaults to `https://cms.thesolemart.com/graphql`;
`WORDPRESS_GRAPHQL_URL` can override it. An existing Vercel value of `local` must
be changed to `hybrid` or removed when reconnecting the published blog.

## What stays local

Existing repository articles in `data/blog.ts` remain published fallbacks. Local
buying guides, product reviews, comparisons, categories and design previews keep
their current data and styling. Pending buying-guide drafts at
`/template-preview/best-guides` and comparison drafts remain noindex and outside
public navigation and the sitemap. These routes make no CMS request.

## Blog reads and outages

A published CMS post takes precedence over local copy with the same slug, so the
article and CMS listing agree. In hybrid mode an unavailable CMS can fall back
to an existing local article or the local first archive page. A CMS-only lookup
failure is an availability error, not proof that the article is missing. Valid
missing/private/draft responses still do not expose CMS content. A failed older
archive-page request remains an error instead of becoming a false 404.

Hybrid mode never queries the BuyingGuide/Shoe schema. Public author profiles
are optional reads; their failures cannot hide an article. No administrator or
application password is needed for published posts.

Blog pages load CMS content on request, and their existing fetches retain a
60-second cache. The build does not enumerate/fetch CMS posts. The sitemap is
also generated on request: hybrid mode paginates published posts beyond 100,
keeps the local guide entries and uses the actual post modification dates. A
failed CMS sitemap query is not replaced with a misleading successful partial
sitemap.

## Full CMS and explicit offline mode

`lib/content-source.ts` is the source selector. Full guide reads and server-side
draft writes still require the exact value `wordpress`. Hybrid mode does not
activate those writers even when old credentials remain configured.

For completely offline frontend work, set `SOLEMART_CONTENT_SOURCE=local` and
redeploy/restart. Even stale or malformed CMS URLs then cause no CMS read or
write. To restore CMS guides as well as blog posts, explicitly select `wordpress`,
configure the real endpoint and verify its guide schema first. Full CMS mode
retains strict upstream errors instead of silently showing local copy on a
failed migrated article request.

## Deployment checks

`/api/site-status` returns the deployed Vercel revision when available, source
mode and whether public blog reads are configured. It performs no CMS request,
contains no credentials/content and is marked noindex/no-store. The field
`publishedBlogReads` describes configuration, not a live CMS health check.
See `restoring-published-routes.md` for the two reported 404s and deployment steps.

Run `pnpm test:wordpress`, `pnpm exec tsc --noEmit --incremental false` and
`pnpm build`. Explicit-local tests retain the zero-request guarantee. Hybrid
tests cover published CMS-only URLs, private/draft filtering, outage fallbacks,
real unavailability errors and paginated sitemaps with local guides preserved.
