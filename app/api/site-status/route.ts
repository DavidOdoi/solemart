import { getContentSource, getWordPressBlogGraphqlUrl, isWordPressEnabled } from '@/lib/content-source'

export const dynamic = 'force-dynamic'

/** Public deployment diagnostics only: no credentials, CMS content or env dump. */
export function GET() {
  const revision = process.env.VERCEL_GIT_COMMIT_SHA || ''
  return Response.json({
    site: 'SOLEMART',
    revision: /^[a-f0-9]{7,40}$/i.test(revision) ? revision : null,
    contentSource: getContentSource(),
    publishedBlogReads: Boolean(getWordPressBlogGraphqlUrl()),
    guideSource: isWordPressEnabled() ? 'wordpress' : 'local',
    buyingGuidePreview: '/template-preview/best-guides',
  }, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  })
}
