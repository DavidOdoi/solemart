# Buying-guide draft automation

The existing Next.js App Router, WPGraphQL reads, ACF Free four-pick template and
manual WordPress editor remain in place. This adds a server-only Amazon Creators
client and a local ingestion CLI. There is no public ingestion endpoint, scheduled
publisher, new product directory, or browser API credential.

## Current delivery status

Nine approved green keywords are queued in
`data/ingestion/selected-keywords.json`, including the explicitly approved
partial-green kids hiking keyword. All target **1,700 editorial words**. The
other CSV rows are excluded. The tracking ID is deferred at the user's request.

The queue and `docs/green-keyword-content-briefs.md` are research plans, not
finished articles. No real ASIN has been verified and no live WordPress draft
has been saved by this implementation. Manufacturer pages, official Amazon
documentation and the CMS are blocked by this workspace's current network policy;
Amazon and WordPress credentials have not been configured. Those are live rollout
blockers, not test failures. Do not replace research with invented specifications.

**WordPress is paused by default.** The Next.js frontend uses local content until
`SOLEMART_CONTENT_SOURCE=wordpress` is explicitly selected and redeployed. See
[frontend-only mode](frontend-only-mode.md). The WordPress writer also respects
this switch.

**WordPress setup is deferred by the user's latest instruction.** Keep preparing
local editorial payloads and testing the frontend. The WordPress instructions
below are for a later rollout; do not require a WordPress login, install a snippet,
or write to the live CMS to continue local work. Product research still requires
access to public manufacturer sources. The tracking ID can be added later.

## Data flow and files

1. An editor/Codex researches official manufacturer product pages and documents
   each factual claim. Professional sources support buying advice; independent
   reviews can support limitations. Another affiliate roundup is not a primary
   specification source. Source excerpts, timestamps and a real reviewer are
   required. The CLI validates evidence records; it does **not** establish the
   truth of an arbitrary excerpt by reading or understanding its source page.
2. `lib/guide-ingestion.ts` checks the JSON model, editorial length, SEO essentials,
   safe content, manufacturer evidence, current Amazon identity, selected variant,
   images, tags, duplicate ASINs and batch overlap. A supplied `VERIFIED` flag never
   bypasses these checks. Unsupported medical/test claims and static offer text
   fail validation. Medical claims still require competent human review; pattern
   checks cannot detect every misleading statement.
3. `lib/wordpress-drafts.ts` discovers the actual REST bases for `shoe` and
   `buying_guides`, creates four Shoe **drafts**, then one Buying Guide **draft**.
   It maps to existing ACF fields and approved Rank Math meta. It refuses to
   overwrite an existing guide or materially different Shoe.
4. `lib/wordpress.ts` keeps existing public, published-only GraphQL reads. Optional
   new Shoe fields (`asin`, `model`, `verificationStatus`) are retried without those
   fields only when the schema explicitly says they are absent. Older groups keep
   working during rollout.
5. `lib/amazon-creators.ts` batches up to ten ASINs at a time. The existing buying
   guide route renders per request (`revalidate = 0`), so full-route ISR cannot
   replay an expired price. CMS data remains cached for
   60 seconds. Only verified, identity-matched records receive official offers.
6. `components/amazon-price.tsx` displays supplied prices, currency, availability,
   official savings, UTC timestamp and disclaimer. It receives data, not secrets,
   and hides expired content. Affiliate buttons retain
   `sponsored nofollow noopener noreferrer`.

The types are in `lib/affiliate-products.ts` and `lib/guide-ingestion.ts`.
`components/review-guide-template.tsx` preserves the design, adds an ItemList
alongside Article/Breadcrumb/Product markup, and puts disclosure near new ASIN
recommendations. Products have no invented review ratings or permanent Offer
schema. Valid schema.org Product markup does not guarantee Google's Product rich
results; those have additional eligibility requirements.

## WordPress setup

Use a staging copy first. The supplied PHP bridge has been syntax-parsed, but its
REST/ACF hooks still require a real WordPress acceptance test.

1. Keep ACF, WPGraphQL and WPGraphQL for ACF active. Import the updated
   `public/downloads/solemart-acf-fields.json` through ACF → Tools. Existing field
   names and keys are preserved. The existing ACF groups already enable REST.
2. In the maintained **Code Snippets** plugin, add
   `public/downloads/solemart-editorial-bridge.txt` as a PHP snippet, run everywhere,
   with **no opening PHP tag**. It registers a narrow REST metadata allowlist,
   excerpt/taxonomy support, a draft-only role and publication guards. It does not
   expose arbitrary metadata or add a custom plugin.
3. Create a dedicated WordPress user with the **SoleMart Draft Writer** role and
   generate that user's Application Password. Do not use an administrator login.
   The writer checks its capabilities and refuses an account with any publishing
   capability. It can create its own drafts and inspect media, not publish them.
4. When the real tag is available, set **Settings → Writing → SoleMart Amazon
   tracking ID** and **marketplace**, matching the Next.js/CLI settings. Optional
   `SOLEMART_AMAZON_PARTNER_TAG` / `SOLEMART_AMAZON_MARKETPLACE` constants override
   those WordPress options. A missing tag keeps new automated records blocked.
5. Enable Rank Math's **ACF** integration/module for field analysis. Its official
   implementation analyzes text/WYSIWYG fields:
   <https://github.com/rankmath/seo-by-rank-math/blob/master/includes/modules/acf/class-acf.php>.
   Linked `post_object` Shoe content is not automatically counted in the parent's
   score. A score is an editing aid, not a ranking or verification guarantee.
6. Review each draft in WordPress. Assign the real human author if appropriate,
   check all links and images, and publish the four reviewed Shoes before the
   Buying Guide. The bot never sends `status: publish`.

The new Shoe ACF fields are `model`, `asin`, `manufacturer_url`, `product_category`,
`sizing_information`, `available_colors`, `variant`, `evidence_sources`,
`verification_status`, `verification_date`, and `verification_notes`. Existing
`description`, `affiliate_url`, `specs`, `pros`, `cons`, `width_options`,
`main_strength` and `commentary` are reused. Award, best-for, avoid-if and pick
order remain guide-specific in the existing four pick slots.

Private `_solemart_*` workflow/proof metadata is writable only by the dedicated
ingestion capability or an administrator, and returned only in REST edit context.
Approved Rank Math title/description/focus/canonical/Open Graph metadata is also
registered in edit context. Normal public WPGraphQL does not expose application
passwords or these private proof records.

Product material hashes are checked before publication and after ACF/REST saves.
Changed material facts require renewed verification; a stale proof cannot approve
changed specifications. Guards apply to flagged automated records, leaving
existing unflagged editorial content unchanged. Manual prose edits still need a
human source review and revalidation; the WordPress hook is not a semantic fact
checker and does not continuously audit previously published linked guides.

Native `post.content` intentionally stays empty for these structured guides:
the template already renders all ACF sections and treats native content as
supplemental advice. Mirroring the full article there would duplicate it.

## Server environment

Copy the blank names in `.env.example` to secure local/Vercel settings. Never put
credentials in `NEXT_PUBLIC_*`, payloads, commits, screenshots or chat.

| Variable | Purpose |
| --- | --- |
| `SOLEMART_CONTENT_SOURCE` | Default `local`; select `wordpress` only when reconnecting |
| `WORDPRESS_GRAPHQL_URL` | Existing public endpoint, `https://cms.thesolemart.com/graphql` |
| `WORDPRESS_API_URL` | `https://cms.thesolemart.com/wp-json/wp/v2/` |
| `WORDPRESS_USERNAME` | Dedicated draft writer |
| `WORDPRESS_APPLICATION_PASSWORD` | That user's application password |
| `AMAZON_CREDENTIAL_ID` | Creators credential/client ID |
| `AMAZON_CREDENTIAL_SECRET` | Creators credential/client secret |
| `AMAZON_CREDENTIAL_VERSION` | Version issued for the credential, e.g. `2.1` or `3.1` |
| `AMAZON_PARTNER_TAG` | Actual marketplace-specific Associates tracking ID |
| `AMAZON_MARKETPLACE` | Hostname, default `www.amazon.com` |

The frontend only needs the public CMS read endpoint and Amazon settings.
WordPress write credentials can stay in the operator's secure CLI environment,
outside Vercel. Restart local servers/redeploy after changing server variables.
Marketplaces are explicitly allowlisted in `lib/affiliate-products.ts`; do not
infer the credential version or regional tag from the site's global audience.

## Creators API setup and verification

Register the appropriate application/credentials through your Associates account:

- <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api>
- <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/get-started/using-sdk>
- <https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference>

Confirm account eligibility, credential version, marketplace access, current
licensing/caching rules and required disclaimers in the official documentation
before enabling real offers. These live checks have **not** been completed here.

The independently implemented adapter uses the generated runtime contract shipped
in `amazon-creators-api@1.2.2` (an **unofficial** wrapper carrying Amazon-generated
runtime code), inspected without installing it as an application dependency. It
is not a claim that the wrapper is an official Amazon SDK or that current policy
compliance has been certified.

The API request is POST `https://creatorsapi.amazon/catalog/v1/getItems`, lower-camel
request/response fields, `x-marketplace`, and official OAuth. Versions 2.1–2.3 use
regional Cognito OAuth endpoints/form encoding; 3.1–3.3 use regional Login with
Amazon endpoints/JSON. The endpoint allowlist is fixed in the server module.
Never scrape Amazon pages or use another retailer's price as an Amazon price.

## Commands

```bash
pnpm ingest:guides --queue
pnpm ingest:guides --file /secure/editorial/best-hiking-shoes-for-kids.json
pnpm ingest:guides --batch /secure/editorial/approved-guides
pnpm ingest:guides --file /secure/editorial/guide.json --save
pnpm ingest:guides --file /secure/editorial/guide.json --save-incomplete-draft
```

Validation is the default and writes no WordPress records. `--save` requires a
PASS report and still creates drafts. `--save-incomplete-draft` explicitly permits
unfinished source/tag/word-count review in private drafts, but never bypasses
structural errors, unsafe copy, static offers, or fabricated testing/treatment
claims. Such records stay PENDING/NEEDS_REVIEW and cannot pass the publication
guard. Preparing prose does not require the tracking ID.

Only approved green keywords are accepted by this batch CLI. JSON files must be
under 2 MB; batch inputs are parsed once. Use `--output /secure/reports` to keep
reports beyond the default temporary `/tmp/solemart-ingestion-reports` directory.
Reports include PASS/FAIL, exact word count, field errors, warnings, accepted and
rejected ASINs, and CREATE_DRAFT/BLOCK. Partial-draft journals preserve IDs if an
upstream request fails. WordPress POSTs are not retried automatically: after a
timeout, inspect WordPress before rerunning to avoid ambiguous duplicate writes.

The blank `docs/examples/buying-guide.pending.json` shows every field and the four
slots. It is **not publishable** and deliberately fails validation. Add real
`featuredMediaId`, optional product `wordpressMediaId`, taxonomy IDs, your actual
research and actual review timestamps. Do not copy synthetic test data to the CMS.
`tests/fixtures/ingestion.mjs` provides a complete 1,700-word synthetic PASS case
for mocked tests only; it is not the requested real verified sample article.
A real verified sample remains blocked until source/API access is configured.

## Word count and editing

Use this flexible section budget; the validator requires the final sum, not each
individual allocation. Count unique editorial fields once, even where the layout
repeats their text. Exclude fixed UI headings, SEO metadata, disclosure, specs and
live offers. FAQ questions are included. Inline links do not add hidden words.

| Section | Words |
| --- | ---: |
| Introduction | 100 |
| Quick answer | 60 |
| Selection method | 90 |
| Four products, 250 each | 1,000 |
| Buying advice | 180 |
| Who it suits | 50 |
| Mistakes to avoid | 50 |
| Final verdict | 70 |
| Four FAQs including questions | 100 |
| **Total** | **1,700** |

Each 250-word product allocation can use summary 35, full commentary 155, best-for
10, avoid-if 15, pros 17 and cons 18. Rebalance naturally without filler.
The focus phrase goes in the H1, SEO title, slug, intro and the quick-answer H2
(`quickAnswerTitle`). Use short paragraphs and relevant internal/editorial source
links. WYSIWYG HTML is sanitized with the existing trusted allowlist; plain-text
content remains supported. Affiliate URLs stay in their structured fields.

## Images, offers and caching

Use real licensed product/editorial images and existing WordPress attachment IDs.
The writer validates attachment type and CMS origin, fills missing alt text on
its own uploads, and preserves existing human-written alt text. If another
author owns an image with no alt text, add it manually in WordPress first; the
writer does not need permission to edit other authors' media. It never downloads Amazon image bytes into
WordPress or persists current API prices/images/titles in evidence exports.
An image URL alone is not proof of ownership or that the photographed variant
matches: the researcher must compare it with the selected ASIN's returned image.

Amazon responses are cached **five minutes in server memory**, scoped by
credentials, marketplace and tag. Tokens use their issued lifetime with a
30-second buffer. API calls use `no-store`; there is no persistent Next cache for
offers. Expired entries are removed and never served after an API error. This
cache is per process, not shared across Vercel instances; a large rollout may
need a permitted shared cache/rate limiter. The client hides expired prices
without calling Amazon. API images use the official CDN directly with Next Image
`unoptimized`, avoiding a publisher image-proxy cache. CMS images keep existing
optimization and reserved dimensions.

Retryable network/429/5xx requests use at most three attempts and bounded
exponential backoff. Long Retry-After values defer to the affiliate-button fallback.
Invalid ASINs, missing credentials, identity conflicts, MAP restrictions and
unavailable/missing prices never produce an invented price. Valid ASINs plus the
configured real tag can build the correct fallback link when the API is down.
No tag means no invented tracking URL. Current prices are not persisted in ACF,
JSON-LD Offer data, or ingestion reports.

## Acceptance checks before enabling real articles

Run `pnpm test:wordpress`, `pnpm exec tsc --noEmit --incremental false`, and
`pnpm build`. The repository has no configured lint command; do not hide this by
disabling checks. Tests inject synthetic APIs and cover OAuth, batching, cache
expiry, timeouts, rate limits, wrong variants, unavailable prices, unsafe HTML,
draft authentication, duplicate records, partial failures and publication gates.

Then use staging with real credentials: verify an actual ASIN and variant, check
the image and manufacturer evidence, inspect the timestamp/disclaimer and DOM
affiliate URL, simulate an API outage, and confirm the fallback has the correct
tag. Check page source and browser requests for absence of secrets. Confirm
expired prices disappear, manual material edits block publication, and the bot
cannot publish. Test the bridge with your actual WordPress/ACF/CPT capability
configuration before publishing. A successful mocked test/build is not a live
Amazon or WordPress acceptance result.

## Implementation inventory and validation record

Created:

- `lib/affiliate-products.ts`, `lib/amazon-creators.ts`,
  `lib/amazon-guide-offers.ts`, `lib/guide-ingestion.ts`, `lib/wordpress-drafts.ts`
- `components/amazon-price.tsx`
- `scripts/ingest-buying-guide.mjs`
- `public/downloads/solemart-editorial-bridge.txt` (provided, not installed)
- `data/ingestion/selected-keywords.json`
- `docs/buying-guide-automation.md`, `docs/green-keyword-content-briefs.md`,
  `docs/examples/buying-guide.pending.json`
- `tests/amazon-creators.test.mjs`, `tests/commerce-fields.test.mjs`,
  `tests/guide-ingestion.test.mjs`, `tests/wordpress-drafts.test.mjs`,
  `tests/fixtures/ingestion.mjs`

Modified:

- `.env.example`, `package.json`
- `app/best-shoes/[slug]/page.tsx`, `components/review-guide-template.tsx`
- `data/products.ts`, `lib/guide-fields.ts`, `lib/wordpress.ts`
- `public/downloads/solemart-acf-fields.json` (all existing fields retained)

Validated on 2026-11-02:

- **117/117 tests passed**, including the original 80 regression tests.
- TypeScript check and production build passed. The buying-guide route is SSR.
- Production-browser checks passed at 390, 768 and 1440 pixels: no viewport
  overflow, current offer display/disclaimer, correct affiliate URL/rel,
  expired-price removal with the button retained, simulated API outage fallback,
  direct unproxied Amazon image URLs, valid JSON-LD parsing, no credential/token
  strings in browser HTML/bundles, laces labels and existing noindex preview.
  All CMS/Amazon services and product identities in these checks were synthetic.
- PHP snippet parsed with `php-parser@3.7.0` PHP 7+ grammar in a temporary tools
  directory. PHP/WordPress runtime execution was unavailable; syntax parsing is
  not a real WordPress integration test.
- ACF comparison confirmed every existing field definition/key was unchanged.
- `git diff --check` passed. No lint command or ESLint configuration exists in
  this project, so lint was unavailable rather than reported as passed.
- Real manufacturer access returned proxy CONNECT 403. No real source verification,
  Creators account call, WordPress write, or Vercel deployment inspection occurred.
