import 'server-only'

import { blogPosts } from '../data/blog.ts'
import { getComparisonDraft } from '../data/comparison-drafts.ts'
import { comparisonBlogPost } from './comparison-article.ts'
import { getContentSource } from './content-source.ts'
import { getWordPressPost, getWordPressPosts } from './wordpress.ts'

/** CMS content wins when available; hybrid outages retain published local copy. */
export async function getPublicBlogPost(slug: string) {
  const local = blogPosts.find(post => post.slug === slug)
  try {
    const published = await getWordPressPost(slug)
    if (published) {
      const comparison = getComparisonDraft(published.slug)
      // Only an already published CMS post may receive this temporary image.
      // Never expose the local comparison body as a public draft fallback.
      return comparison && !published.featuredImage
        ? { ...published, featuredImage: comparisonBlogPost(comparison.content, { imagePlaceholders: true }).featuredImage }
        : published
    }
    return local
  } catch (error) {
    if (getContentSource() === 'hybrid' && local) return local
    // A failed CMS request is not evidence that an older article is missing.
    throw error
  }
}

export async function getPublicBlogArchive(after?: string) {
  try {
    return await getWordPressPosts(after)
  } catch (error) {
    if (getContentSource() === 'hybrid' && after === undefined) return null
    // A failed older-page lookup must not become a false pagination 404.
    throw error
  }
}
