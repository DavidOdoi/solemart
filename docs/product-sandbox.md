# Private product sandbox

Route: `/sandbox/product-preview?slug=YOUR-SAVED-SHOE-SLUG`.
There are no public navigation, product-card, search or sitemap links to it.
No public product directory routes or 250-product static build are introduced.

## Product directory and review preview

Open `https://thesolemart.com/template-preview/product` for the directory layout.
It now uses published WordPress Shoe records instead of the earlier illustrative
product. Cards form a four-column desktop grid with actual saved images/names,
links to on-page reviews and actual retailer destinations. A comparison matrix
and full review sections follow. Prices and bestseller labels are not fabricated.

This unlinked/noindex preview is anonymously reachable by its URL and uses only
already-published, anonymously readable WordPress data. It is not the password-
protected sandbox. Draft/private records remain excluded; the original sandbox
login is unchanged. The example-data module has been removed, and no sample
product is substituted when the CMS has no data or cannot respond.

Use `?q=sea+turtle+boots` to search the title/body of published Shoe records, or
`?article=your-published-post-slug` to include a real Gutenberg buying/research
article. Search is a WordPress title/body search, not an automatic material or
category classifier. No matching records produces an honest empty state, not
invented boots. See [directory editorial workflow](product-directory-preview.md).

## Enable access

Keep the existing server-only `WORDPRESS_GRAPHQL_URL`. Add these server-only
environment variables in `.env.local` for local work, or Vercel's environment
settings for the deployment you want to use:

```dotenv
SANDBOX_PREVIEW_USERNAME=your-chosen-username
SANDBOX_PREVIEW_PASSWORD=your-long-random-password
```

Do not prefix them with `NEXT_PUBLIC_`, place them in the URL, or commit actual
values. Usernames must not contain a colon; passwords may contain colons. Use
HTTPS outside localhost. Redeploy after changing Vercel environment variables.

With either credential missing/blank the sandbox returns **404**. When enabled,
anonymous or incorrect credentials return **401** with a browser HTTP Basic
login prompt. Correct credentials allow the SSR page to render. The protected
page/layout check authorization again before any WordPress lookup. There is no
development bypass, shared demo password or token in the query string. A private
URL alone, and robots metadata alone, would not enforce access.

`proxy.ts` applies only to `/sandbox/:path*`; it does not put a login prompt on
the rest of SOLEMART. Removing the two environment variables closes the sandbox
again without affecting public pages.

## Indexing and caching

The sandbox layout uses the App Router Metadata API to produce this tag inside
the server-rendered document head:

```html
<meta name="robots" content="noindex, nofollow, noarchive" />
```

All sandbox responses, including authentication failures and errors, also carry
`X-Robots-Tag: noindex, nofollow, noarchive`. Denied responses include the same
HTML meta tag. Proxy sets private/no-store response caching and no-referrer;
the page sets `dynamic = 'force-dynamic'` and `revalidate = 0`. Its WordPress
POST uses `cache: 'no-store'` with a ten-second timeout. There is no draft/page
JSON API or client-side CMS credential. The sandbox does not output Product
schema or a canonical pointing to a future public product page.

No robots.txt disallow rule is needed: unauthorized crawlers cannot fetch the
product, and authenticated responses explicitly forbid indexing. A disallow rule
alone would not secure data or ensure the robots meta tag can be read.

## Data source

Enter the saved **Shoe** slug, not a Buying Guide title/slug. The request is a
variable-based anonymous GraphQL POST to the configured WordPress endpoint:

```graphql
query SandboxShoe($slug: ID!) {
  shoe(id: $slug, idType: SLUG) {
    title slug status
    featuredImage { node { sourceUrl altText } }
    solemartShoeFields {
      brand description affiliateUrl pros cons specs
      cushioning widthOptions mainStrength commentary
      retailer2Name retailer2Url retailer3Name retailer3Url
    }
  }
}
```

Only published Shoe records render. Missing/private/draft records and malformed
slugs produce a real missing-page response. API/schema/network errors use the
private error state instead of borrowing local sample products. The sandbox
login is never forwarded to WordPress. Refreshing bypasses the usual sixty-second
CMS data cache; published buying guides retain their existing revalidation.

This is a private frontend preview of **published, anonymously readable CMS
records**, not authenticated WordPress draft preview. It does not change access
to the WordPress API or the CMS frontend itself.

The mapper sanitizes descriptions/commentary with the existing allowlist,
normalizes plain text and HTML entities, validates images against configured
hosts, and builds the spec matrix from `Label | Value` lines. Existing brand,
cushioning, width and main-strength fields fill missing spec rows. Duplicate
labels are omitted; absent facts/images are not replaced with sample content.

## Multiple retailers

The current `affiliate_url` remains the primary link. An Amazon destination is
labeled “Check Price on Amazon”; other destinations use their actual host name.
Two optional fixed slots are added to the existing **SOLEMART Shoe — ACF** group:

| Field | Type | GraphQL |
| --- | --- | --- |
| `retailer_2_name` | Text | `retailer2Name` |
| `retailer_2_url` | URL | `retailer2Url` |
| `retailer_3_name` | Text | `retailer3Name` |
| `retailer_3_url` | URL | `retailer3Url` |

For extra links, import the updated
`/downloads/solemart-acf-fields.json` through **ACF → Tools → Import Field Groups**,
then update your Shoe record. Existing group/field keys and stored data remain
unchanged. There is no custom plugin or Pro repeater. The export preserves both
existing groups; these four fields are optional additions to the Shoe group.

Before importing, the preview retries once without only these unsupported fields,
so existing single-retailer records still work. Unrelated schema errors are not
suppressed. The private page indicates when the additional slots are unavailable.

Buttons use actual, validated HTTPS destinations with
`target="_blank" rel="sponsored nofollow noopener noreferrer"`. Unsafe,
duplicate and known placeholder links are omitted. No sample prices, discounts,
stock levels, ratings, affiliate tags or retailer URLs are invented. Retailer
labels/links are structured fields, separate from editorial commentary.

## Files

- `app/sandbox/layout.tsx`: robots metadata and render-boundary access check.
- `app/sandbox/product-preview/page.tsx`: request-time slug handling and page.
- `app/sandbox/product-preview/error.tsx`: safe retry UI for real upstream errors.
- `proxy.ts` / `lib/sandbox-auth.ts`: authentication and response headers.
- `lib/product-preview.ts`: uncached GraphQL request and safe data mapping.
- `components/product-preview-template.tsx`: responsive product, specs and retailers.

The feature remains off until credentials are configured. No existing plugin,
GraphQL buying-guide query, article layout or public publication flow is removed.

## Verification

Production build and TypeScript passed; all **77 automated tests** passed.
Production-server checks verified disabled 404s, anonymous/wrong-login/RSC/HEAD
401s, zero WordPress calls before authorization, and real 404s for invalid,
missing and nonpublic Shoes. Authenticated pages have the exact robots tag in
`head`, no-store headers and no Product schema. API errors retain no-index
protection and are not converted to missing products.

Browser checks at 360, 390, 768, 1024, 1440 and 1920 px verified the matrix,
image containment, three retailer buttons, safe links and no overflow. With
JavaScript disabled the slug form and server-rendered product still work.
Changing the local CMS fixture and refreshing the same URL immediately shows
new data. The older ACF schema falls back to one real link; empty records do not
invent buttons. Public navigation has no sandbox link, public routes still
work, and the prerender manifest contains no sandbox product pages. Sandbox
credentials are absent from client chunks and never forwarded to WordPress.

These are local fixture/build checks. This environment could not verify the
public WordPress data or configure the new Vercel secrets; the deployed sandbox
remains deliberately closed until those credentials are supplied.
