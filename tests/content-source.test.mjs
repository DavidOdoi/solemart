import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getContentSource, getWordPressBlogGraphqlUrl, getWordPressGraphqlUrl, isWordPressEnabled } from '../lib/content-source.ts'
import { getWordPressPost, getWordPressPosts, getWordPressBuyingGuide, getWordPressGuideFields, getWordPressAcfBuyingGuide, getWordPressSitemapArticles, getWordPressAuthorProfile } from '../lib/wordpress.ts'
import { getWordPressWriteConfig, saveWordPressBuyingGuideDraft } from '../lib/wordpress-drafts.ts'
import sitemap from '../app/sitemap.ts'
import { guides } from '../data/guides.ts'
import { blogPosts } from '../data/blog.ts'

const originalFetch = globalThis.fetch
const keys = ['SOLEMART_CONTENT_SOURCE', 'WORDPRESS_GRAPHQL_URL', 'WORDPRESS_API_URL', 'WORDPRESS_USERNAME', 'WORDPRESS_APPLICATION_PASSWORD']
const original = Object.fromEntries(keys.map(key => [key, process.env[key]]))
beforeEach(() => {
  for (const key of keys) delete process.env[key]
  globalThis.fetch = async () => assert.fail('Unconfigured development must not fetch')
})
afterEach(() => {
  globalThis.fetch = originalFetch
  for (const key of keys) {
    if (original[key] === undefined) delete process.env[key]
    else process.env[key] = original[key]
  }
})

test('the original configured GraphQL URL enables posts and guides despite a stale temporary source switch', async () => {
  process.env.WORDPRESS_GRAPHQL_URL = 'https://cms.thesolemart.com/graphql'
  for (const value of [undefined, 'local', 'hybrid', 'wordpress', '', 'old-setting']) {
    if (value === undefined) delete process.env.SOLEMART_CONTENT_SOURCE
    else process.env.SOLEMART_CONTENT_SOURCE = value
    assert.equal(getContentSource(), 'wordpress')
    assert.equal(isWordPressEnabled(), true)
    assert.equal(getWordPressGraphqlUrl(), process.env.WORDPRESS_GRAPHQL_URL)
    assert.equal(getWordPressBlogGraphqlUrl(), process.env.WORDPRESS_GRAPHQL_URL)
    let reads = 0
    globalThis.fetch = async (url, options) => {
      reads++
      assert.equal(String(url), process.env.WORDPRESS_GRAPHQL_URL)
      assert.equal(options.headers.Authorization, undefined, 'Public reads need no application password')
      return Response.json({ data: { post: null, buyingGuide: null } })
    }
    assert.equal(await getWordPressPost('known-post'), null)
    assert.equal(await getWordPressBuyingGuide('known-guide'), null)
    assert.equal(await getWordPressAcfBuyingGuide('known-guide'), null)
    assert.equal(await getWordPressGuideFields('known-guide'), null)
    assert.equal(reads, 4)
  }
})

test('without a GraphQL URL, ordinary local development remains offline as it did before the bypass', async () => {
  process.env.SOLEMART_CONTENT_SOURCE = 'wordpress'
  assert.equal(getContentSource(), 'local')
  assert.equal(isWordPressEnabled(), false)
  assert.equal(await getWordPressPost('known-post'), null)
  assert.equal(await getWordPressPosts(), null)
  assert.equal(await getWordPressBuyingGuide('known-guide'), null)
  assert.equal(await getWordPressGuideFields('known-guide'), null)
  assert.equal(await getWordPressAcfBuyingGuide('known-guide'), undefined)
  assert.equal(await getWordPressSitemapArticles(), null)
  assert.equal(await getWordPressAuthorProfile(7), undefined)
})

test('the original optional REST writer follows its credentials rather than the temporary source switch', async () => {
  process.env.SOLEMART_CONTENT_SOURCE = 'local'
  assert.equal(getWordPressWriteConfig(), null)
  process.env.WORDPRESS_USERNAME = 'fixture-writer'
  process.env.WORDPRESS_APPLICATION_PASSWORD = 'not-a-real-password'
  const config = getWordPressWriteConfig()
  assert.equal(config.username, 'fixture-writer')
  assert.equal(config.apiUrl, 'https://cms.thesolemart.com/wp-json/wp/v2/')
  await assert.rejects(saveWordPressBuyingGuideDraft(null, { config, fetcher: async () => assert.fail('Invalid article validation must precede writes') }), /gate blocked|structurally incomplete/)
})

test('the local sitemap still includes existing local content when no CMS URL is configured', async () => {
  const entries = await sitemap()
  const urls = new Set(entries.map(entry => entry.url))
  for (const guide of guides) assert.ok(urls.has(`https://thesolemart.com/best-shoes/${guide.slug}`))
  for (const post of blogPosts) assert.ok(urls.has(`https://thesolemart.com/blog/${post.slug}`))
  assert.equal(urls.size, entries.length)
  assert.ok(entries.every(entry => !entry.url.includes('/template-preview/')))
})

test('the original public author profile URL remains independent of the temporary source switch', async () => {
  process.env.SOLEMART_CONTENT_SOURCE = 'local'
  process.env.WORDPRESS_API_URL = 'https://cms.thesolemart.com/wp-json/wp/v2/'
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(url).pathname, '/wp-json/wp/v2/users/7')
    assert.equal(options.headers.Authorization, undefined)
    return Response.json({ id: 7, description: 'An actual fixture biography', avatar_urls: {} })
  }
  assert.equal((await getWordPressAuthorProfile(7)).bio, 'An actual fixture biography')
})
