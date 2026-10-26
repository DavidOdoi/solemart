# Automatic blog FAQ and quick-answer formatting

All `/blog/[slug]` posts use this formatting automatically. Editors continue to
work in Gutenberg with the existing Rank Math plugin. No new ACF fields,
WordPress plugin, publishing webhook or database migration is required.

## Rank Math FAQ

Add questions and answers using **Rank Math FAQ** and publish/update normally.
Next.js recognizes the plugin's rendered FAQ block and displays the same
`EditorialFaqList` used by buying guides and the comparison preview: circular
arrow controls, bold questions, separators and expandable answers. The controls
work without JavaScript. Formatted answers, inline images, lists and links are
kept through the trusted article allowlist.

An existing H2 named **Frequently asked questions** or **FAQs** is reused; when
there is no FAQ heading, a heading is added to the rendered page. The original
WordPress article is not edited. Native H2/H3 question-and-answer sections still
work. Incomplete blocks remain readable rather than losing their text.

Compatibility was checked against Rank Math's source at commit `50fc595`:
`includes/modules/schema/blocks/faq/class-block-faq.php` and
`includes/modules/schema/blocks/faq/assets/src/save.js`. Both published
`rank-math-list-item` and saved `rank-math-faq-item` structures are recognized,
including numbered/bulleted lists and configurable question title wrappers.
Native question IDs are moved to the normalized headings, validated, then
deduplicated by the existing contents helper.

This changes frontend presentation. Rank Math's separate JSON-LD/SEO output is
not copied from WordPress; the frontend continues to own its metadata and schema.

## Quick answer

Use **The quick answer** or **Quick answer** as the article's **first H3**.
The following paragraphs/lists become the existing neutral callout with an
orange top border, stopping at the next heading. An arbitrary first H3 and a
later heading named Quick answer are left as ordinary sections. Empty answers
are left unchanged. The H3 level and original/generated anchor stay intact.

## Author sidebar

The separate **Behind the article** profile/share card is hidden on all blog
posts until requested again. The author byline and actual publication/update
dates remain. The page no longer links to the removed author panel or includes
that fragment in its Article schema. Profile fields and their existing lookup
code remain available; no WordPress data is removed.

The reading column is centered and the featured image keeps its responsive
800 × 450 maximum frame.

## Security and verification

The server-only `htmlparser2` normalizer reads the known Rank Math structure
before the existing `sanitize-html` allowlist removes classes, styles, scripts,
events and unsafe links. It does not read hidden FAQ items from serialized block
attributes. The parser was already a transitive sanitizer dependency and is
now declared directly. No parser or CMS fetch is added to the client bundle.

The shared renderer safely handles plain article fragments, FAQ lists and quick
answers; editorial external and sponsored retailer links retain the established
attributes. Native contents links and question anchors remain unique.

Validation: production build and TypeScript, all **69 automated tests**, and
browser checks at 360, 390, 768, 1024, 1440 and 1920 px. Local GraphQL fixtures
exercise the complete fetch/sanitize/render path, both Rank Math markup forms,
native FAQs, incomplete blocks, unrelated first H3s, links, formatting, keyboard
interaction, no overflow, hidden author panels and rendering without JavaScript.
Buying-guide and comparison preview FAQ styling remains the same. These checks
do not establish that a particular public CMS post or Vercel deployment is live.
