# Rich-text links in buying-guide fields

The existing ACF fields now support formatted editorial content. The Next.js
template keeps the same sections, typography and layout. No custom WordPress
plugin, API endpoint or publishing webhook is added.

## Apply the editor configuration in WordPress

1. Export the current field groups through **ACF → Tools** as a configuration
   backup. Download the updated `/downloads/solemart-acf-fields.json` from the
   deployed frontend and import it through **ACF → Tools → Import Field Groups**.
   Use the `.json` extension. The existing group keys, field keys, storage names
   and GraphQL names are preserved, so this updates definitions rather than
   creating new storage fields. Existing post/Shoe values are not deleted or
   rewritten by the import.
2. For the exact minimal toolbar, install/activate the maintained **Code Snippets**
   plugin. Add a **PHP** snippet named **SOLEMART ACF minimal toolbar**, copy the
   contents of `/downloads/solemart-acf-minimal-toolbar.txt` into it, select
   **Only run in administration area**, and save/activate. The supplied text has
   no opening PHP tag and is configuration for the documented ACF
   `wysiwyg_tinymce_settings` JavaScript filter, loaded through
   `acf/input/admin_footer`. It targets only fields whose keys start with
   `field_solemart_`. It does not implement storage, post types or API resolvers.
3. Reload a Buying Guide or Shoe editor. The converted fields have Visual editing,
   no media-upload button, and a toolbar containing Paragraph, Bold, Italic,
   Bulleted list, Numbered list and Link. Select text and use the link button or
   Ctrl/Cmd+K. Without the snippet, ACF's built-in Basic toolbar remains usable;
   it contains extra controls and does not have the paragraph-format selector.
4. Save normally with Update/Publish. The existing roughly 60-second Next.js
   revalidation applies; a first request after expiry can still receive stale
   content while regeneration runs.

WordPress changes require this import/configuration in the real dashboard; a
frontend deployment cannot alter the installed ACF field definitions. The cloud
does not have access to that dashboard and cannot verify its live editor.

## Fields and API contract

| Editor location | Existing ACF storage name | Existing GraphQL field |
| --- | --- | --- |
| Introduction | `intro` | `intro` |
| Buying Advice Text | `advice` | `advice` |
| Product Full Review on a reusable Shoe | `commentary` | `commentary` |
| Guide-specific full-review overrides, slots 1–4 | `pick_1_commentary` … `pick_4_commentary` | `pick1Commentary` … `pick4Commentary` |
| Final Verdict | `final_verdict` | `finalVerdict` |
| FAQ Answer, pairs 1–4 | `faq_1_answer` … `faq_4_answer` | `faq1Answer` … `faq4Answer` |

These twelve fields use ACF Free's `wysiwyg` type. Affiliate/retailer URL and
optional separate full-review URL stay structured `url` fields. Award badges,
short recommendation reasons, Best for, Avoid if, pros/cons and specifications
retain their existing types. Guide-specific commentary overrides the reusable
Product Full Review; an empty WYSIWYG paragraph does not count as an override.

WPGraphQL for ACF formats WYSIWYG values through ACF's normal content filters and
returns HTML in the same existing GraphQL **String** fields. Queries, environment
variables, relationship types and post-type names are unchanged. For example:

```graphql
query GuideRichText {
  buyingGuide(id: "best-wide-toe-box-sandals-for-2026-our-top-4-picks", idType: SLUG) {
    title
    solemartBuyingGuideFields {
      intro
      advice
      finalVerdict
      faq1Answer
      pick1Commentary
      pick1Shoe {
        node {
          ... on Shoe {
            solemartShoeFields { commentary affiliateUrl reviewUrl }
          }
        }
      }
    }
  }
}
```

An Introduction response can now contain:

```json
{"intro":"<p>Read <a href=\"/blog/fit\">our fit guide</a> before choosing.</p>"}
```

The import also enables ACF's native REST visibility for both groups. The frontend
continues using GraphQL. With the documented default REST bases, a public REST
client can request formatted ACF values with:

```text
GET /wp-json/wp/v2/buying_guides?slug=YOUR-SLUG&status=publish&acf_format=standard&_fields=id,slug,title,acf
GET /wp-json/wp/v2/shoe/SHOE-ID?acf_format=standard&_fields=id,slug,title,acf
```

Use the actual REST base if it was customized in CPT UI. ACF's default lightweight
REST format can return raw stored values; `acf_format=standard` requests normal
ACF formatting, including WYSIWYG paragraphs. These REST examples describe the
maintained plugins' interface, not a locally verified live REST response.

## Link behavior

- Enter internal frontend paths such as `/blog/fit`, `/best-shoes/your-guide`,
  `#top-picks` or `../another-guide`. Relative URLs, queries and fragments remain
  relative, and own-site links use the current tab. Absolute URLs at
  `thesolemart.com` and `www.thesolemart.com` are also recognized as internal.
- Editorial HTTP/HTTPS links to other sites use `target="_blank"` and
  `rel="noopener noreferrer"`. They are not automatically marked sponsored or
  nofollow. Editors do not need to set these attributes manually.
- Keep purchase/affiliate destinations in the separate Shoe Affiliate / retailer
  URL field. The template's retailer controls still use
  `rel="sponsored nofollow noopener noreferrer"`. Known Amazon/amzn.to links,
  explicitly sponsored links, and external retailer hosts used in the guide's
  structured URLs also receive those attributes if pasted into rich text.
- Use public frontend paths when creating internal links. WordPress's link
  search can suggest CMS permalinks; this adapter does not guess how arbitrary
  CMS URLs should map to frontend routes.

## Sanitization and compatibility

`lib/cms-rich-text.ts` uses the existing trusted `sanitize-html` dependency.
Custom rich fields allow paragraphs, breaks, bold/italic, ordered/unordered lists
and links. Arbitrary classes/styles, handlers, scripts, forms, iframes, SVG and
field-level media are removed. Pasted heading tags become paragraphs so a field
cannot introduce an extra page H1. Dangerous schemes, protocol-relative URLs,
backslash URLs, control characters and URL credentials are rejected.

The native Gutenberg body retains its broader existing allowlist for safe
headings, images, figures and tables, using the same editorial-link policy.
Sanitization happens while building server-side view models and at the rich-text
rendering boundary. No primary content fetching or HTML sanitization moves into
client-side JavaScript.

Existing `Guide.intro`, `Guide.advice`, `Product.review`, FAQ answer and verdict
representations remain plain text for existing consumers and metadata/schema.
Derived HTML properties preserve formatting for the template. Old textarea
strings still render as text, product-review paragraphs keep their blank-line
breaks, and plain buying-advice lines keep their bullet list. Returned WYSIWYG
HTML respects the paragraphs/lists authored in the editor; use its list buttons
for a formatted checklist. The import itself does not bulk-convert stored text.

## Verification and rollback

The production build and 53 automated tests passed. Tests cover rich-field mapping, relative/external/affiliate links,
malicious HTML and schemes, plain-text compatibility, empty WYSIWYG overrides,
metadata text, stable ACF keys/API names and the scoped toolbar filter. Production
browser fixture checks cover all five rendered field locations at mobile, tablet
and desktop widths, real new-tab/same-tab navigation, formatting/lists, FAQ
behavior, no-script rendering and the existing template preview. PHP syntax for
the toolbar configuration is parsed; this is not a live WordPress execution test.

Disabling the Code Snippets configuration restores ACF's Basic toolbar without
affecting storage or frontend rendering. Reimport the exported field definitions
to restore textarea editors if needed; stored values and Next.js support for
plain text and sanitized HTML remain. Keep the legacy plugin and metadata until
the overall migration is complete.
