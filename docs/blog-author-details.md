# Blog author details

Every `/blog/[slug]` article has an author byline (when supplied), estimated reading time and publication/update dates. The separate author/profile/share card is **temporarily hidden at the owner's request**. The byline no longer links to a missing card, and the body uses a centered reading column instead of reserving sidebar space. Native WordPress profile data and the reusable `ArticleAuthor` component remain available for future use; no biography or avatar data is deleted.

## Edit the details in WordPress

1. Open **Users → Profile**, or edit the user assigned as the post's author.
2. Set a real public display name using **Nickname** and **Display name publicly as**. The frontend deliberately does not replace `admin` with an invented person/team.
3. Fill **Biographical Info** with an accurate short biography. Do not include private information; this field is public.
4. WordPress core generally supplies the avatar through Gravatar; follow the Profile Picture instructions in the profile screen if a photo is wanted. A missing avatar uses initials. A default Gravatar image can also be returned by WordPress.
5. Save the profile and ensure the article's native Author selection names the correct WordPress user.

The article adapter fetches the article through the existing GraphQL integration. It requests the author's native `databaseId` along with their display name. Public biography/avatar data comes from WordPress core REST:

```text
GET /wp-json/wp/v2/users/{id}?context=view&_fields=id,description,avatar_urls
```

No custom WordPress plugin or field is required. The optional `WORDPRESS_API_URL` can point to the REST base (`https://cms.thesolemart.com/wp-json/wp/v2`). When unset, the author lookup derives that base from the current CMS origin. A CMS installed under a subdirectory should set the explicit REST base.

Only public profile fields are requested, without credentials. Blocked/private/missing profile endpoints or a timeout do not prevent the article loading: the native display name remains visible while unavailable biography/avatar data is omitted. Profile requests have a three-second timeout and 60-second caching; the article's own regeneration also affects when profile changes appear. Native avatar URLs are accepted only from configured CMS uploads and standard Gravatar hosts, over HTTPS without URL credentials. Avatars are served directly through an unoptimized image rather than adding arbitrary image-optimizer hosts.

Reading time is an estimate at 220 words per minute, with a one-minute minimum, based on visible article text rather than author information or hidden scripts. It is calculated server-side. Article JSON-LD includes the same author name; the removed card's fragment URL and bio/avatar are no longer emitted. Actual contributor/reviewer associations require content-model support and are intentionally not fabricated.

This improves reader transparency. It is not a ranking guarantee or a substitute for accurate, original content, sources and demonstrable expertise.

## Verification

`pnpm test:wordpress` includes reading-time, sanitization, public profile and unavailable-profile tests. A production build and local browser fixture checks cover server-rendered names/bios, mobile/tablet/desktop layout, dates, schema, share destinations and absent authors/profiles. These checks do not verify the live CMS endpoint: this cloud's network proxy blocks direct access to that domain. Verify the real profile and article after deployment.

The buying-guide migration uses ACF with the existing GraphQL connection; it does not require changing this native author-profile lookup.
