# Best buying guides: editable WordPress layout

Preview: `/template-preview/buying-guide`.

The new preview combines the user's saved RunRepeat reference with the supplied
Perplexity Nike draft. It uses the SoleMart colors, a short intro/quick answer,
seven-row shortlist, research methodology, seven numbered product cards,
pros/considerations, Amazon buttons, buying advice, questions and verdict.
Desktop has a sticky contents sidebar; mobile uses an expandable contents list
and stacked product cards. There is no four-product limit.
Article paragraphs, product descriptions, lists, tables, contents navigation and supporting notes
share the introduction's font size: 21px on desktop and 19px on small screens.
The shared `--sm-body-size` token keeps those sizes aligned.

The sample is **not a published article**. It has noindex/nofollow metadata,
no sample Article/Product/Review schema, no fake ratings or dates, and generic
photo placeholders as requested. Unverified model-specific technology claims
were removed from the supplied copy. Model names and versions still need
editorial verification. Buttons explicitly open model-specific Amazon searches,
not verified product listings. No affiliate tag, price or availability is invented.

## Edit future articles in WordPress

Use ordinary **Posts**, not the legacy ACF Buying Guides screen. No custom
WordPress plugin, extra custom fields or change to the WordPress API is required
for this layout. The existing published-Post reader supplies title, author,
actual dates, excerpt, featured image and body to `/blog/<post-slug>`.

1. Download `/downloads/solemart-best-guide-pattern.json`. In WordPress's
   **Manage patterns**, choose **Import from JSON** and select the file. This is
   an **unsynced** pattern, so inserting it into a new Post makes an independent
   copy. Editing one article will not change another.
2. Create a Post. Enter its own title in the normal title field. Insert the
   **SoleMart — Best buying guide** pattern from the editor's Patterns panel.
3. Replace the introduction and section text. Duplicate/delete the outer product
   Group blocks as needed; edit each award, heading, description, lists, Image
   and Button using normal visual editor controls. Update the shortlist rows and
   their links when changing the number or names of products. Keep each product
   heading's HTML anchor unique and match the shortlist link to it.
4. Select each **Buy on Amazon** button and replace its starter destination with
   the exact product/affiliate link you want. Replace all photo placeholders using
   Image → Replace. Add a Featured Image in the normal Post settings if wanted.
   The sample's search-link note must be updated if a direct product link is used.
5. Save as Draft, review, then Publish when ready. The frontend's existing
   roughly 60-second WordPress cache applies. Native preview of unpublished
   WordPress drafts through Next.js is not added by this change.

If your WordPress version/theme doesn't expose pattern importing, create a Post,
open its **Code editor**, paste `/downloads/solemart-best-guide-pattern.html`,
then return to the Visual editor. The populated Nike example is available as
`/downloads/solemart-nike-guide-example.json` and `.html`. Enter its title
separately. These are block-layout files, not WXR Post imports: no Post is
created automatically by downloading them or importing a pattern.

The top-level Group has the Additional CSS class `solemart-best-guide`.
Product Groups and native Button blocks carry a small set of style hooks.
Keep these classes when editing. `getBestGuideArticle` detects that explicit
marker after sanitization; `BlogPostPage` selects the shared `BestGuidePostPage`
renderer. Ordinary articles and the existing ACF guide renderer keep their
existing layouts. There is no automatic migration or publishing of old articles.

## Implementation and verification

- `lib/best-guide-blocks.ts`: native Gutenberg block serialization.
- `data/nike-best-guide-preview.ts`: supplied-draft design fixture, excluded from
  published post registries and sitemaps.
- `scripts/export-best-guide-pattern.mjs`: regenerates both pattern/HTML pairs.
- `lib/cms-rich-text.ts`: finite article-only style classes; arbitrary classes,
  inline styles, handlers and unsafe URLs remain stripped. Known Amazon links
  retain sponsored/nofollow/security attributes and the editor's exact URL/tag.
- `components/best-guide-post.tsx` and `app/best-guide.css`: the shared visual
  template. Content remains server-rendered and readable without JavaScript.

Regenerate files with `pnpm export:best-guide-pattern`. Tests cover opt-in
detection, upstream sanitization, seven products, jump links, class restrictions,
retailer-link safety and export parity. No live WordPress write or draft-sync
connection is established by this template work.
