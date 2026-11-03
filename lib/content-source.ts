import 'server-only'

/** Local Next.js content is the default until the CMS is explicitly re-enabled. */
export function isWordPressEnabled() {
  return process.env.SOLEMART_CONTENT_SOURCE === 'wordpress'
}

export function getWordPressGraphqlUrl() {
  return isWordPressEnabled() ? process.env.WORDPRESS_GRAPHQL_URL || '' : ''
}
