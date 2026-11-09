# Comparison batch one

The five complete article drafts are available at
`/template-preview/comparisons`, with a child URL for each slug below. They use
the existing `BlogPostPage` renderer used by `/blog/[slug]`, including its
headline, byline, contents list, quick answer, accessible tables, shared FAQ
accordion and final verdict. Option guidance is ordinary article text. They are
separate from the old single sample at `/template-preview/comparison`.

The requested reference is the existing Derby vs Oxford article at
`https://www.thesolemart.com/blog/shoes-derby-vs-oxford-which-should-you-buy`.
Its route uses the same blog renderer. The user supplied screenshots showing the
actual layout and section order, plus the title **Shoes Derby vs Oxford: Which
Should You Buy?** All five draft headlines follow that buying-question pattern
without changing their slugs. The adapter now places the at-a-glance table after
the Quick Answer, details/use cases before the buying decision/checklist, and
the final verdict directly after FAQs. Citations are retained. See
`comparison-template.md` for the adapter and WordPress image replacement.

## Current state

These are written articles for review, not published comparisons. Their supplied
research has not passed independent live source checks. Fresh requests to OSHA,
NIOSH and SoleMart were denied by the environment proxy (CONNECT 403). This does
not establish a failure of the destination websites.

At the user's request, each preview now uses the existing `/placeholder.svg` in
two positions: the featured image and an inline image inside the Quick Answer.
Final photographs will be added in WordPress. No photographs were downloaded,
no generated images or unrelated stock photos were added, and no product model
was invented to fill an image slot.

The preview layout supplies noindex, nofollow and noarchive metadata. Preview
URLs are absent from the public sitemap and navigation, and the existing public
comparison inventory is unchanged. Article, product and FAQ schema are omitted
for these draft previews. Unknown preview slugs produce a real 404. The private
index links to all five articles, and each article links back to the index.
These controls exclude previews from normal discovery; they are not authentication.

These comparison drafts remain local even with hybrid WordPress blog reads
enabled. No CMS writes, record replacements or changes to the frontend
content-source selection were made for this layout update. The old public
comparison routes and design preview retain their current article content.

The [native Post importer](wordpress-comparison-import.md) now exports all five
Gutenberg bodies and can create missing WordPress drafts using an authenticated,
paginated duplicate check. Existing articles and editor changes are preserved.
Live import remains blocked by this session's unapplied network settings and
missing CMS writing credentials; these local previews are not proof of a live
WordPress import.

The uploadable **SoleMart Comparison Draft Import** package now provides a second
path using the user's normal WordPress admin session. Its download is linked on
the comparison index. It creates only missing drafts after the user reviews the
matches and submits a nonce-protected admin form. No Codex password setup is
needed for this path. Installation/import on the live CMS remains a user action;
the local package tests do not establish that it has happened.

## Drafts and remaining review

| Slug | Review needed |
| --- | --- |
| `cowhide-boots-vs-leather-boots` | Check the existing CMS record/canonical before publication; the workbook has conflicting status fields. Verify leather terminology. Cowhide is a source, while grain and suede terminology describe different aspects of leather. |
| `cowboy-boots-vs-work-boots` | Verify current official workplace guidance and named-model documentation before introducing protective-footwear examples. Work and Western styling can overlap. |
| `steel-toe-vs-composite-toe-boots` | Verify the performance-standard reference, required markings and manufacturer guidance. Equal specified impact/compression requirements do not imply identical protection against all hazards. |
| `work-boots-vs-hiking-boots` | Verify intended use and workplace requirements for any proposed hybrid. Avoid blanket statements about weight, flexibility or protection. |
| `wrestling-shoes-vs-boxing-shoes` | Obtain primary manufacturer evidence and current event-specific rules. The supplied weak third-party sports source is excluded from citations. No precise footwear-rule clause is claimed as verified. |

Each article contains an original short introduction, direct answer, comparison
table, use cases, buying checklist, four FAQ answers, sources and a fuller final
verdict. Bodies use short paragraphs. Internal article links resolve only to
existing local public routes; planned topics from the brief are not linked as
though they exist. External citations retain ordinary editorial-link semantics.
No prices, ASINs, ratings, testing claims or unverified model-specific specs were
added. The copy avoids assuming composite caps establish electrical protection,
all work boots are safety footwear, or collar height prevents injury.

Content lives in `data/comparison-drafts/`; the inventory and review notes are in
`data/comparison-drafts.ts`. The supplied report is research input, not an
instruction to copy its wording or claim its sources were independently checked.

## Before public publication

1. Confirm the existing cowhide article and canonical URL through the actual CMS
   or a fresh public check. Preserve an existing URL when updating its content.
2. Reopen the primary sources, confirm what each citation supports and amend the
   draft where needed. Record actual source-check dates; do not reuse the
   research provider's date as an independent verification date.
3. After moving each draft into WordPress, replace its Featured Image and the
   ordinary Image block below the Quick Answer heading. Use alt text and any
   caption that describe the actual photograph. Local previews retain their
   temporary images; this change does not import drafts into WordPress.
4. Review the text, images and metadata together, then use the existing public
   comparison path and sitemap only for approved, complete articles.
5. Add an incoming link from a relevant public hub/article and useful links among
   the approved comparisons. Crawl from the homepage to confirm reachability and
   check image loads, anchors and mobile tables. A sitemap entry is not an
   incoming editorial link.

Use `comparison-batch-one-research-request.txt` for a targeted follow-up research
request. It asks for missing evidence and approved images, not rewritten articles.

## Existing article layout validation

All 141 automated tests, standalone TypeScript checking and the production build
pass. Adapter tests confirm that the introduction, quick answer, option guidance,
body, FAQs, citations and verdict survive the conversion without changing the
stored source records. Browser checks cover all five drafts and the original
single preview at 360, 390, 768 and 1440 px, matching blog typography, one contents
list, loaded placeholders, reference section order, working FAQ toggles,
keyboard-scrollable tables, unique anchors and content without JavaScript.
Previews retain their noindex metadata and omit Article
schema; ordinary public blog pages retain their schema. These are local checks,
not confirmation of live source facts or Vercel deployment status. The supplied
screenshots establish the reference's visible article layout.

## Original draft validation

All 127 automated tests, TypeScript and the production build pass. Browser checks
cover all five drafts at 360, 390, 768 and 1440 px, FAQ toggles, keyboard-accessible
tables, unique working contents anchors, no page overflow, rendering without
JavaScript, canonical/robots metadata and real 404s for missing preview slugs.
The existing comparison pages retain their content. A homepage-first local crawl
reaches all 29 public sitemap pages, with no orphan pages, broken internal links
or public links to previews. These checks do not establish live source access,
image permissions or completion of the public Vercel deployment.
