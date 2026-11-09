# Restore the connection from before the temporary bypass

The user's requested restoration targets `dba84cb`, which added
`SOLEMART_CONTENT_SOURCE=local` while investigating a site-loading failure.
The original URL-based connection has now been restored for all existing CMS
readers, rather than adding another migration or importer workflow.

## Connection

The existing production setting is the only public-read configuration required:

```dotenv
WORDPRESS_GRAPHQL_URL=https://cms.thesolemart.com/graphql
```

Old `SOLEMART_CONTENT_SOURCE` values are ignored. Both Posts and ACF/legacy
Buying Guides use the configured CMS again. Published article reads do not use
WordPress administrator credentials or an application password. The new custom
comparison import plugin, package, download links and native import CLI have
been removed; the site's established WordPress/ACF setup is retained.

## Reported URLs

- `/template-preview/best-guides` uses the existing local design previews and
  makes no CMS request. A live 404 here requires checking the deployed revision
  and production domain assignment, independently of the CMS connection.
- `/blog/birkenstock-narrow-vs-regular-which-width-should-you-buy` is CMS-only.
  It resolves when the original WordPress Post is published under that slug.
  No replacement article has been fabricated.
- `/best-shoes/[slug]` uses the original ACF adapter and legacy field fallback
  when WordPress is configured. Missing records remain genuine 404s.

`/api/site-status` reports the deployed Git revision and configured sources,
without credentials or content. With the original URL set, expect
`contentSource: "wordpress"`, `publishedBlogReads: true` and
`guideSource: "wordpress"`, even if an old source-mode variable says `local`.
These fields describe configuration, not a successful live CMS health check.

## Build and verification

Keep the request-time sitemap fix from `4cc6821`. The restored connection must
not reintroduce CMS requests during the production build. CMS fetches retain
their 60-second cache, and the sitemap still paginates both article collections
beyond 100 with actual modification dates and canonical frontend paths.

Run the tests, standalone TypeScript checking and build with a deliberately
unavailable GraphQL URL and a stale `SOLEMART_CONTENT_SOURCE=local` value. The
build must complete without CMS requests. At runtime the site should read both
published Posts and Buying Guides from a healthy endpoint; outages must not
become a false 404 or a successful incomplete sitemap.

The current execution environment blocks live CMS/frontend requests at the
network proxy and has not loaded CMS credentials. This is separate from the
frontend's Vercel configuration. Local fixtures establish code behavior, not
the live CMS's publication state or successful production deployment.

Restoration checks passed: 141 automated tests, standalone TypeScript checking,
and a production build with an unavailable endpoint and the stale local flag.
Instrumentation recorded zero CMS requests during that build. Built-app browser
checks used synthetic CMS responses to verify a published Post, an ACF guide,
their canonicals/sitemap entries, missing-guide 404s, outage errors and preserved
preview collections/placeholders. The unwanted importer link and ZIP return no
active download; no live CMS records were created or changed.
