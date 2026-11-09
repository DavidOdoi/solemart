# Three buying-guide text drafts

Review index: `https://thesolemart.com/template-preview/best-guides`.

The user reduced the active batch from the first five spreadsheet keywords to
these three: best cowhide boots, best exotic leather boots and best cowboy boots.
The work-boots and steel-toe topics are on hold. The new supplied report now
covers the correct buying-guide topics; the earlier upgraded comparison report
was not used as a substitute for this research.

## Implementation and writing

`data/best-guide-drafts.ts` supplies three complete, 1,850-word editorial drafts
and twelve guide-specific profiles. Each guide uses four distinct models. Word
counts use the existing `editorialWordCount` rules: count the editorial fields
once, including FAQ questions, but exclude fixed UI labels, SEO metadata,
specifications and repeated display copies. The current keyword target remains
in `lib/guide-editorial-settings.ts`.

The pages render the original `ReviewGuideTemplate` with `preview` enabled.
The shared component, typography, section order, card design, comparison matrix,
specification layout, FAQ accordion and original buying-guide preview are
unchanged. The real component places FAQs before Final Verdict; this batch does
not reorder it. Each audience and mistakes section has three paragraphs. Quick
answers identify actual candidates, and verdicts explain specific choices.

The narrower research scope is explicit in the headlines, introductions,
selection method and index: Tecovas men's Western dress/lifestyle models. Choice
labels describe material disclosure or silhouette; they are not market-wide
awards, testing results or a best-overall claim. Each profile cites the exact
manufacturer variant reference supplied in the report. Editorial judgments are
separate from the reported measurements and materials.

## Evidence limits

The researcher reports access on 2026-11-09. That date is stored as a report date,
not our independent source-verification date. The workspace still has an enforced
policy without the required website access. Source records therefore remain
`independentlyVerified: false`, product verification remains PENDING and
`publicationApproved` is false. No live duplicate check or source retrieval is
claimed as completed.

The source report found search-index leads for older cowhide advice and
comparison articles under `/blog/`, while its sitemap/CMS fetches failed. Those
are not proof of an absent buying guide. The public site's existing canonicals
and CMS inventory still need confirmation before any new public guide URL is
created or an existing article is replaced.

## Product and variant boundaries

| Guide | Selected variants | Important boundary |
| --- | --- | --- |
| Cowhide | Warren Mesquite Cowhide; Garrett Midnight Cowhide; Cartwright Midnight Cowhide; Doc Midnight Cowhide | Warren/Garrett have explicit upper/lining component records. Cartwright/Doc remain provisional for full component-level cowhide attribution. A material selector does not establish every part's species. |
| Exotic leather | William Dark Pecan Caiman; Garrett Pecan Hornback Caiman; Warren Ash Brown Python; Jack Midnight Relic Lizard | Keep mixed hide components distinct. William's precise component map and Jack's unparameterized variant need confirmation; care and seller destination policies remain version-specific. |
| Cowboy | Cartwright, Doc, Warren and Garrett cowhide versions above | The focus is silhouette and dress/social use, not riding or protective work. This shares the cowhide guide's four models and needs an intent/consolidation review before public publication. |

The cowhide Warren and Garrett do not inherit insole or shank claims from their
exotic counterparts. D width is reported as shown, not as the only available
width. Insole feature names do not establish materials, removability or measured
comfort. No fixed high-instep sizing adjustment is prescribed because the report
found conflicting manufacturer guidance. No protective, riding or waterproof
claim is inferred from appearance or a boot category.

## Images and retailer controls

No images are inserted. The report provides no verified original asset URL or
reuse grant and explicitly describes manufacturer terms limiting website-content
reuse. No generated or unrelated stock images were used. The exact manufacturer
references remain available as ordinary links so reviewers can check the models
at their original source.

The preview buttons are disabled and reference the draft notice. No default
sample affiliate URL, invented ASIN, numeric SKU, price or stock claim is supplied.
Photo permissions and retailer matching remain separate from text completion.

## Publication boundaries and internal links

Only `/template-preview/best-guides` and its three children are created. The
layout outputs noindex, nofollow and noarchive; each page has a preview canonical.
Unknown slugs return 404. Preview mode omits article/product/FAQ schema. These
routes remain excluded from the public sitemap and public navigation. The index
links to every draft and each draft links back to it. These are discovery controls,
not authentication.

The current `/best-shoes/[slug]` adapter, public guide inventory, WordPress mode,
existing comparison drafts and original template preview remain unchanged.
Internal article links use existing local public content. Unconfirmed CMS-only
article URLs from the research are not linked as though verified. Before public
release, confirm duplicate status, differentiate or consolidate overlapping
buying intents, obtain approved photos, verify facts and add incoming public
hub/article links. Check homepage reachability rather than relying on XML alone.

The older partial-copy JSON and Markdown now point to these complete text drafts
for the first three topics. Their remaining two topics remain on hold.

## Validation

All 130 automated tests, TypeScript and the production build pass. The new tests
check the exact editorial counts, four-model/profile mapping, distinct preview
IDs, variant-specific footbed boundaries, unresolved evidence/asset/retailer
status and exclusion from public guides/sitemaps.

Browser checks cover all three guides at 360, 390, 768 and 1440 px: complete
sections, four Top Picks and full profiles, FAQ toggles, bookmark actions,
in-page review links, source-link attributes, disabled retailer controls and no
page overflow. Content also renders without JavaScript. Draft robots/canonicals,
absent draft schema, missing-route 404s and unchanged original previews were
checked. A homepage-first local crawl still reaches all 29 public sitemap pages,
with no orphan pages, broken internal links or public links to previews. These
checks do not establish live source access, photo permission or completion of a
public Vercel deployment.
