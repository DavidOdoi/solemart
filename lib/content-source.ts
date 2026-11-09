import 'server-only'

/** Restore the original URL-based connection; the temporary source switch is obsolete. */
export function getContentSource(): 'local' | 'wordpress' {
  return getWordPressGraphqlUrl() ? 'wordpress' : 'local'
}

export function isWordPressEnabled() {
  return Boolean(getWordPressGraphqlUrl())
}

export function getWordPressGraphqlUrl() {
  return process.env.WORDPRESS_GRAPHQL_URL || ''
}

export function getWordPressBlogGraphqlUrl() {
  return getWordPressGraphqlUrl()
}
