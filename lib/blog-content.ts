import 'server-only'

import { blogPosts } from '../data/blog.ts'
import { getContentSource } from './content-source.ts'
import { getWordPressPost, getWordPressPosts } from './wordpress.ts'

/** CMS content wins when available; hybrid outages retain published local copy. */
export async function getPublicBlogPost(slug: string) {
  const local = blogPosts.find(post => post.slug === slug)
  try {
    return await getWordPressPost(slug) ?? local
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
