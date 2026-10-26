# Automatic blog contents

Blog articles generate an "On this page" list from the WordPress body’s H2 and H3 headings. In Gutenberg use Heading blocks and select level H2 for main sections and H3 for subsections. No manual contents block or WordPress plugin is required. The list appears after the featured image, before the body. Articles without matching headings omit it.

The list is rendered on the server and uses native links and a collapsible details element, including with JavaScript disabled. H3 entries are indented. Headings have scroll margin for the sticky header. Duplicate labels receive unique IDs; safe custom WordPress anchors are preserved unless duplicated or reserved by the page. Reserved IDs include the author panel and contents panel. Reading time is still based on the article itself, excluding the generated list.

`getArticleContents` in `lib/article-details.ts` expects the canonical **sanitized** article markup. The WordPress adapter allows only the `id` attribute on H2/H3, removing styles, classes and event handlers. The helper modifies that limited heading markup, retaining inline formatting and generating safe IDs. Any future REST adapter must apply the article sanitizer before passing HTML to this helper. This helper is not a replacement for HTML sanitization.

Verification: unit tests cover duplicate labels, custom/reserved IDs, inline formatting, accents, empty headings and sanitizer attribute handling. Production browser checks using a local CMS fixture cover server HTML, each target link, collapse/expand without JavaScript, sticky-header clearance and mobile/tablet/desktop overflow. Content updates follow the existing cache revalidation behavior.

Blogs now pass through `getEditorialArticle` before rendering. Rank Math FAQ
blocks are normalized to semantic headings and answers before sanitization, so
their questions appear in the contents list and retain safe question anchors.
The first H3 named **Quick answer** or **The quick answer** becomes a callout;
its existing contents link still targets that heading. See
[blog block formatting](blog-block-formatting.md).
