# Comparison batch one

The five complete article drafts are available at
`/template-preview/comparisons`, with a child URL for each slug below. They use
`ComparisonTemplate`, including its accessible tables, contents links, choice
cards, shared FAQ accordion and final verdict. They are separate from the old
single sample at `/template-preview/comparison`.

## Current state

These are written articles for review, not published comparisons. Their supplied
research has not passed independent live source checks. Fresh requests to OSHA,
NIOSH and SoleMart were denied by the environment proxy (CONNECT 403). This does
not establish a failure of the destination websites.

All image leads in the supplied brief have unconfirmed reuse permission. No
photographs were downloaded, no generated images or unrelated stock photos were
added, and no product model was invented to fill an image slot. Each preview lists
two specific photographic requirements outside the reader-facing article.

The preview layout supplies noindex, nofollow and noarchive metadata. Preview
URLs are absent from the public sitemap and navigation, and the existing public
comparison inventory is unchanged. Article, product and FAQ schema are omitted
for these draft previews. Unknown preview slugs produce a real 404. The private
index links to all five articles, and each article links back to the index.
These controls exclude previews from normal discovery; they are not authentication.

WordPress remains paused. No CMS writes, record replacements or changes to the
frontend content-source selection were made. The old public comparison routes
and design preview retain their current content.

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
3. Obtain exact-model photographs and documented usage rights. Record each source
   page, model/version/variant, image URL or asset file, owner, dimensions and
   permission/credit terms. All ten required image slots currently remain pending.
4. Review the text, images and metadata together, then use the existing public
   comparison path and sitemap only for approved, complete articles.
5. Add an incoming link from a relevant public hub/article and useful links among
   the approved comparisons. Crawl from the homepage to confirm reachability and
   check image loads, anchors and mobile tables. A sitemap entry is not an
   incoming editorial link.

Use `comparison-batch-one-research-request.txt` for a targeted follow-up research
request. It asks for missing evidence and approved images, not rewritten articles.

## Validation

All 127 automated tests, TypeScript and the production build pass. Browser checks
cover all five drafts at 360, 390, 768 and 1440 px, FAQ toggles, keyboard-accessible
tables, unique working contents anchors, no page overflow, rendering without
JavaScript, canonical/robots metadata and real 404s for missing preview slugs.
The existing comparison pages retain their content. A homepage-first local crawl
reaches all 29 public sitemap pages, with no orphan pages, broken internal links
or public links to previews. These checks do not establish live source access,
image permissions or completion of the public Vercel deployment.
