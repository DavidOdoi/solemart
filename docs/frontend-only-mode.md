# Original WordPress connection restored

The temporary frontend-only bypass introduced in `dba84cb` has been removed.
As before that change, `WORDPRESS_GRAPHQL_URL` controls published CMS reads:

```dotenv
WORDPRESS_GRAPHQL_URL=https://cms.thesolemart.com/graphql
```

When that URL is configured, ordinary Posts supply `/blog` and `/blog/[slug]`,
the established ACF/legacy buying-guide adapters supply `/best-shoes/[slug]`,
and both published article collections supply the paginated sitemap. The
existing ACF, WPGraphQL, templates, media handling and 60-second data cache are
reused. No new plugin, import package or application password is needed for
published content reads.

`SOLEMART_CONTENT_SOURCE` is obsolete and ignored. Old `local` or `hybrid`
values cannot silently disable a configured WordPress connection. No replacement
source-mode variable is required. Without a GraphQL URL, local development can
still render the existing local articles and guides without CMS reads.

CMS errors remain availability errors. A successful missing-post response can
use an independently published local blog fallback, as before the bypass; a
missing CMS buying guide remains a real 404 while the CMS is configured. Draft
and private records are not exposed through the public frontend.

The optional pre-existing Buying Guide/Shoe writer again depends on its original
REST credentials and editorial checks, rather than the removed source-mode gate.
Restoring that behavior does not run an import or perform a CMS write.

Article drafts, placeholders and template-preview styling remain local review
content. Reconnecting the frontend does not insert repository drafts into
WordPress. Edit and publish existing CMS content using the normal WordPress
editor. The recently added comparison importer/plugin has been removed.

The request-time sitemap fix from `4cc6821` is retained. A disconnected CMS must
not be queried during `next build`; CMS content is requested at runtime. See
[route and deployment checks](restoring-published-routes.md).
