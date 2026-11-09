import 'server-only'

/** Blog reads reconnect by default; local guides and draft writes stay isolated. */
export function getContentSource(): 'local' | 'hybrid' | 'wordpress' {
  const source = process.env.SOLEMART_CONTENT_SOURCE
  if (source === undefined || source === 'hybrid') return 'hybrid'
  return source === 'wordpress' ? 'wordpress' : 'local'
}

export function isWordPressEnabled() {
  return getContentSource() === 'wordpress'
}

export function getWordPressGraphqlUrl() {
  return isWordPressEnabled() ? process.env.WORDPRESS_GRAPHQL_URL || '' : ''
}

export function getWordPressBlogGraphqlUrl() {
  if (getContentSource() === 'hybrid') {
    return process.env.WORDPRESS_GRAPHQL_URL || 'https://cms.thesolemart.com/graphql'
  }
  return getWordPressGraphqlUrl()
}
