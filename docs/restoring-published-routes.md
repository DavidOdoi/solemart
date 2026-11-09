# Restoring the reported routes

The two reported 404s have different dependencies:

- `/template-preview/best-guides` and its three child previews already exist on
  GitHub `main` from commit `5553186`. They use local data and do not call
  WordPress. The production build includes these routes.
- `/blog/birkenstock-narrow-vs-regular-which-width-should-you-buy` is not in
  `data/blog.ts`. Explicit offline mode cannot resolve a CMS-only article. The
  hybrid source restores public WordPress blog reads without activating CMS
  buying-guide reads or draft writes.

The original Birkenstock article has not been copied, recreated or replaced with
invented content. It must still be a published post with that slug in WordPress.

## Production configuration

In the SoleMart Vercel project's **Production** environment, use:

```dotenv
SOLEMART_CONTENT_SOURCE=hybrid
WORDPRESS_GRAPHQL_URL=https://cms.thesolemart.com/graphql
```

Unset `SOLEMART_CONTENT_SOURCE` also selects hybrid mode. Change an existing
explicit `local` value to `hybrid`; deploying new source does not override saved
Vercel environment variables. Public blog reads need no WordPress administrator
password or application password. Full guide reads and draft writes remain off.

Deploy the latest `main` commit as Production after changing variables. Confirm
that `thesolemart.com` belongs to this project and points to that production
deployment. A successful preview deployment alone does not prove that the
custom domain serves the same revision.

## Check the deployed revision

Open `https://thesolemart.com/api/site-status`. Expected fields include:

```json
{
  "site": "SOLEMART",
  "revision": "the deployed Git commit SHA, or null outside Vercel",
  "contentSource": "hybrid",
  "publishedBlogReads": true,
  "guideSource": "local",
  "buyingGuidePreview": "/template-preview/best-guides"
}
```

This response exposes only deployment configuration, never credentials or CMS
content. It is noindex and no-store. `publishedBlogReads` is not a live CMS
health result.

- A 404 for this endpoint means the request is not reaching this version of the
  application. Check the production revision and domain assignment first.
- `contentSource: "local"` means the saved environment still selects offline
  mode. Update it and redeploy.
- With the correct revision and hybrid mode, a valid CMS missing/private/draft
  response still produces a genuine article 404. Verify the published post's
  exact slug in WordPress.
- A CMS connection/query failure remains an availability error for CMS-only
  articles. Check the CMS endpoint, DNS and any firewall restrictions. Known
  local articles and the first archive page retain their hybrid fallbacks;
  local template previews continue to work independently.

## Verification and limits

The production build completed with instrumentation confirming zero CMS
requests during the build. Unit tests cover published CMS-only URLs, draft and
private filtering, source selection, outage behavior and sitemap pagination
beyond 100 posts with local guides retained. Built-app browser checks use a
clearly labelled synthetic CMS response, never the original article.

Validation passed: 138 tests, standalone TypeScript checking and the production
build. Browser checks covered both reported route shapes, the three buying-guide
previews, responsive layouts, no-JavaScript content and CMS outage handling. A
local crawl with the synthetic published post reached all 30 sitemap pages with
no broken internal links, orphan pages or public links to the private previews.
The repository has no configured lint command.

Live requests to SoleMart and its CMS were blocked by the execution
environment's network proxy before reaching either host. GitHub deployment
metadata was also inaccessible, and no Vercel token was available. Consequently
these local checks do not verify the current production revision, saved Vercel
variables, or the real Birkenstock post's publication state.
