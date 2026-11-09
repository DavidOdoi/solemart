import 'server-only'

import { blogPosts } from '../data/blog.ts'
import { getComparisonDraft } from '../data/comparison-drafts.ts'
import { comparisonBlogPost } from './comparison-article.ts'
import { getWordPressPost, getWordPressPosts } from './wordpress.ts'

/** Original CMS-first lookup; local articles remain a fallback for a missing post. */
export async function getPublicBlogPost(slug: string) {
  const local = blogPosts.find(post => post.slug === slug)
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
}

export async function getPublicBlogArchive(after?: string) {
  return getWordPressPosts(after)
}
