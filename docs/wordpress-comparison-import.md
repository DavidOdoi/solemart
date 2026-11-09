# Comparison drafts in WordPress

The five local comparisons can now be imported as ordinary WordPress **Post
drafts**, preserving the existing `/blog/[slug]` article layout and native CMS
editing. This is separate from the Buying Guide/Shoe ingestion system. It needs
neither ACF nor the old ingestion plugin, and works in hybrid mode.

## Current connection boundary

The importer, five complete payloads and frontend reader are implemented and
tested locally. No real posts have been created in this session. The execution
environment currently blocks `cms.thesolemart.com` before a request reaches
WordPress, and no WordPress username/application password is configured. A saved
environment proposal includes the existing CMS/frontend domains, hybrid read
settings and a destination-limited application-password requirement. Saving that
proposal alone does not apply it or supply credentials.

## Secure configuration

In the Codex environment settings, provide `WORDPRESS_USERNAME` and an
application password in the `WORDPRESS_APPLICATION_PASSWORD` secret field. Create
the password at `https://cms.thesolemart.com/wp-admin/profile.php` under
Application Passwords, using an account allowed to edit Posts and inspect the
published, scheduled, draft, pending and private article inventory. Do not put
the password in chat, source control or a `NEXT_PUBLIC_` variable. The importer
sends credentials only to this CMS's HTTPS `/wp-json/wp/v2/` endpoint, refuses
redirects, and does not log credentials or upstream response bodies.

Review/save the prepared environment changes and publish the environment so its
network policy and runtime settings can apply. Verify readiness and a fresh
connection before relying on the change. The public frontend does not need these
writing credentials in Vercel; hybrid public reads use the existing GraphQL URL.

## Commands

Run from the repository with Node 24 and the pinned pnpm version:

```bash
# Offline export for review; no WordPress requests or writes.
pnpm wordpress:comparisons

# Read-only authentication, pagination and duplicate checks.
NODE_USE_ENV_PROXY=1 pnpm wordpress:comparisons --check

# Create only the missing ordinary Post drafts.
NODE_USE_ENV_PROXY=1 pnpm wordpress:comparisons --save
```

The proxy flag is for environments that supply an HTTPS proxy. Normal local
development can use the same commands without it. Explicit
`SOLEMART_CONTENT_SOURCE=local` blocks the importer before any request; use
`hybrid`. Full `wordpress` mode is not required for this Post import.

Exports go to `/tmp/solemart-wordpress-comparisons` by default. `--output directory`
selects another location. Each article has a Gutenberg HTML file, and
`comparison-post-drafts.json` contains all five draft payloads for inspection.
This JSON is a REST payload bundle, not a WordPress Tools → Import XML file.

## Existing articles and interrupted imports

Before any write, the importer reads every inventory page, 100 posts per page,
using actual WordPress pagination headers. It matches each topic by slug, slug
prefix or title prefix, including articles stored under an older canonical slug.
One existing match is returned unchanged with its editor URL; multiple matches
stop creation. Missing or malformed inventory data also stops creation. Existing
published posts, scheduled articles and manually edited drafts are never
overwritten or unpublished. A slug is checked again immediately before creation.

New requests always specify `status: draft`. The returned ID, slug and draft
status must be confirmed. Confirmed creation steps are awaited and recorded in
`created-posts.jsonl`; final results include actual WordPress editor URLs. There
are no automatic write retries. If a request has an uncertain result, inspect
WordPress and the journal first. A rerun performs the inventory checks again and
preserves drafts already created. A new post created concurrently under a
different matching topic URL can still require human review; there is no CMS
transaction or title uniqueness constraint.

## Editing and frontend behavior

Paragraphs, headings and the inline image use native Gutenberg blocks. Existing
tables and lists use an editable Classic block to retain their exact accessible
HTML without requiring a particular core Table/List block version. All supplied
sections, citations and four FAQ answers are preserved. The Quick Answer image
uses the existing frontend placeholder URL; no SVG upload or media-library
permission is required. Use the Image block's **Replace** action for the real
photo, then update its alt text.

Choose the article's real photo in **Featured Image**. Until it is set, a
published CMS article with one of these five known slugs receives the same
temporary featured-image placeholder on the frontend. An actual CMS image takes
precedence. Other blog posts do not receive this fallback. A missing, private or
draft CMS post never exposes the local draft at the public blog URL.

The importer does not assign a fake author, publication date, rating or testing
claim. WordPress supplies the actual author and dates. Native Title and Excerpt
drive the frontend's title and description fallbacks; Rank Math's separate CMS
SEO settings are not automatically copied to Next.js.

Review text and images in WordPress, then publish there when ready. The public
article appears at `https://thesolemart.com/blog/<actual-wordpress-slug>`, enters
the CMS blog listing and paginated sitemap, and uses the existing 60-second fetch
cache. Cache expiry plus a subsequent request is required; this is not an instant
publishing webhook. Local template previews remain local design/review pages;
editing a WordPress draft does not change them. No authenticated draft content
is exposed through a public preview route.

## Validation

All 151 tests, standalone TypeScript checking and the production build pass.
Tests cover inventories beyond 100 posts, older matching slugs, existing manual
edits, repeat runs, partial failures, awaited journaling, endpoint restrictions,
draft-only requests and placeholder replacement. Built-app browser checks render
all five exported bodies through a synthetic published GraphQL response, with
responsive images, tables, FAQs, metadata and no-JavaScript content. A local crawl
reaches all 34 fixture sitemap pages with no orphan pages or broken internal
links. These fixtures do not establish live WordPress access, successful real
imports or the production Vercel revision. No lint command is configured.
