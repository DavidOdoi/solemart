import 'server-only'

import { cache } from 'react'
import { decodeHTML } from 'entities'
import sanitizeHtml from 'sanitize-html'
import type { BlogPost } from '@/data/blog'

type WordPressPost = {
  title: string | null
  slug: string | null
  status: string | null
  content: string | null
  excerpt: string | null
  dateGmt: string | null
  modifiedGmt: string | null
  author: { node: { name: string | null } | null } | null
  featuredImage: { node: {
    sourceUrl: string | null
    altText: string | null
    mediaDetails: { width: number | null; height: number | null } | null
  } | null } | null
}

const postQuery = `
  query PublishedBlogPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      slug
      status
      content
      excerpt
      dateGmt
      modifiedGmt
      author { node { name } }
      featuredImage {
        node { sourceUrl altText mediaDetails { width height } }
      }
    }
  }
`

function plainText(html: string | null | undefined) {
  return decodeHTML(sanitizeHtml(html || '', { allowedTags: [], allowedAttributes: {} }))
    .replace(/\s+/g, ' ').trim()
}

function utcDate(value: string | null) {
  if (!value) return undefined
  const date = new Date(value.endsWith('Z') ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

function articleHtml(content: string) {
  return sanitizeHtml(content, {
    allowedTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'strong', 'b', 'em', 'i', 's', 'del', 'u', 'blockquote', 'pre', 'code', 'br', 'hr', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption', 'img', 'sup', 'sub', 'dl', 'dt', 'dd', 'span', 'div'],
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'],
      th: ['scope', 'colspan', 'rowspan'],
      td: ['colspan', 'rowspan'],
      ol: ['start', 'reversed'],
    },
    allowedSchemes: ['https', 'http', 'mailto'],
    allowedSchemesByTag: { img: ['https', 'http'] },
    allowProtocolRelative: false,
    transformTags: {
      h1: 'h2',
      a: (tagName, attributes) => ({
        tagName,
        attribs: attributes.target === '_blank'
          ? { ...attributes, rel: `${attributes.rel || ''} noopener noreferrer`.trim() }
          : attributes,
      }),
      img: (tagName, attributes) => ({ tagName, attribs: { ...attributes, loading: 'lazy', decoding: 'async' } }),
    },
  })
}

function featuredImage(image: NonNullable<WordPressPost['featuredImage']>['node']): BlogPost['featuredImage'] {
  if (!image?.sourceUrl) return undefined
  try {
    const url = new URL(image.sourceUrl)
    const permitted = url.protocol === 'https:' && (
      (url.hostname === 'cms.thesolemart.com' && url.pathname.startsWith('/wp-content/uploads/')) ||
      url.hostname === 'images.unsplash.com'
    )
    if (!permitted) return undefined
    return {
      src: url.href,
      alt: plainText(image.altText),
      width: image.mediaDetails?.width && image.mediaDetails.width > 0 ? image.mediaDetails.width : 1200,
      height: image.mediaDetails?.height && image.mediaDetails.height > 0 ? image.mediaDetails.height : 800,
    }
  } catch {
    return undefined
  }
}

/** Published public posts only. React cache shares the metadata/page request. */
export const getWordPressPost = cache(async (slug: string): Promise<BlogPost | null> => {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL
  if (!endpoint || !/^[^\s/?#\u0000-\u001f]{1,200}$/u.test(slug)) return null

  let response: Response
  try {
    const url = new URL(endpoint)
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
      throw new Error('Invalid WordPress endpoint configuration')
    }
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ query: postQuery, variables: { slug } }),
      signal: AbortSignal.timeout(10_000),
      cache: 'force-cache',
      next: { revalidate: 60, tags: ['wordpress:posts', `wordpress:post:${slug}`] },
    })
    if (!response.ok) throw new Error(`WordPress returned HTTP ${response.status}`)
  } catch (error) {
    // Infrastructure failures must not be mistaken for a missing article.
    throw new Error('WordPress articles are temporarily unavailable.', { cause: error })
  }

  const result = await response.json() as { data?: { post?: WordPressPost | null }; errors?: unknown[] }
  if (result.errors?.length || !result.data || !Object.hasOwn(result.data, 'post')) {
    throw new Error('WordPress could not return the requested article.')
  }
  const post = result.data.post
  if (!post || post.status !== 'publish') return null
  if (!post.slug || !plainText(post.title)) throw new Error('WordPress returned an incomplete article.')

  const publishedAt = utcDate(post.dateGmt)
  return {
    title: plainText(post.title),
    slug: post.slug,
    category: 'SHOE ADVICE',
    date: publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '',
    publishedAt,
    modifiedAt: utcDate(post.modifiedGmt),
    author: plainText(post.author?.node?.name) || undefined,
    excerpt: plainText(post.excerpt).slice(0, 200),
    paragraphs: [],
    contentHtml: articleHtml(post.content || ''),
    featuredImage: featuredImage(post.featuredImage?.node ?? null),
  }
})
