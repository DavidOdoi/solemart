import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getWordPressGraphqlUrl, isWordPressEnabled } from '../lib/content-source.ts'
import { getWordPressPost, getWordPressPosts, getWordPressBuyingGuide, getWordPressGuideFields, getWordPressAcfBuyingGuide, getWordPressSitemapArticles, getWordPressAuthorProfile } from '../lib/wordpress.ts'
import { getWordPressWriteConfig, saveWordPressBuyingGuideDraft } from '../lib/wordpress-drafts.ts'
import sitemap from '../app/sitemap.ts'
import { guides } from '../data/guides.ts'
import { blogPosts } from '../data/blog.ts'

const originalFetch = globalThis.fetch
const keys = ['SOLEMART_CONTENT_SOURCE', 'WORDPRESS_GRAPHQL_URL', 'WORDPRESS_API_URL', 'WORDPRESS_USERNAME', 'WORDPRESS_APPLICATION_PASSWORD']
const environment = Object.fromEntries(keys.map(key => [key, process.env[key]]))
beforeEach(() => {
  delete process.env.SOLEMART_CONTENT_SOURCE
  process.env.WORDPRESS_GRAPHQL_URL = 'https://cms.thesolemart.com/graphql'
  process.env.WORDPRESS_API_URL = 'https://cms.thesolemart.com/wp-json/wp/v2/'
  process.env.WORDPRESS_USERNAME = 'fixture-writer'
  process.env.WORDPRESS_APPLICATION_PASSWORD = 'not-a-real-password'
  globalThis.fetch = async () => assert.fail('Local mode must not contact WordPress')
})
afterEach(() => {
  globalThis.fetch = originalFetch
  for (const key of keys) {
    if (environment[key] === undefined) delete process.env[key]
    else process.env[key] = environment[key]
  }
})

async function assertCmsIsPaused() {
  assert.equal(isWordPressEnabled(), false)
  assert.equal(getWordPressGraphqlUrl(), '')
  assert.equal(await getWordPressPost('known-post'), null)
  assert.equal(await getWordPressPosts(), null)
  assert.equal(await getWordPressBuyingGuide('known-guide'), null)
  assert.equal(await getWordPressGuideFields('known-guide'), null)
  assert.equal(await getWordPressAcfBuyingGuide('known-guide'), undefined)
  assert.equal(await getWordPressSitemapArticles(), null)
  assert.equal(await getWordPressAuthorProfile(7), undefined)
  assert.equal(getWordPressWriteConfig(), null)
}

test('frontend-only mode is the default despite stale CMS URLs and credentials', async () => {
  await assertCmsIsPaused()
})

test('explicit local mode skips malformed CMS configuration without parsing or fetching it', async () => {
  process.env.SOLEMART_CONTENT_SOURCE = 'local'
  process.env.WORDPRESS_GRAPHQL_URL = 'not a URL'
  process.env.WORDPRESS_API_URL = 'also invalid'
  await assertCmsIsPaused()
})

test('unrecognized source values cannot accidentally re-enable the CMS', async () => {
  for (const source of ['', 'true', 'WordPress', 'cms']) {
    process.env.SOLEMART_CONTENT_SOURCE = source
    await assertCmsIsPaused()
  }
})

test('local mode blocks even explicitly configured draft writes before validation or HTTP access', async () => {
  await assert.rejects(saveWordPressBuyingGuideDraft(null, {
    config: { apiUrl: 'https://cms.thesolemart.com/wp-json/wp/v2/', username: 'fixture', applicationPassword: 'not-real' },
    fetcher: async () => assert.fail('A supplied writer config must not bypass local mode'),
  }), /WordPress is paused/)
})

test('the local sitemap lists the available local articles and guides without CMS or draft-preview URLs', async () => {
  const entries = await sitemap()
  const urls = new Set(entries.map(entry => entry.url))
  for (const guide of guides) assert.ok(urls.has(`https://thesolemart.com/best-shoes/${guide.slug}`))
  for (const post of blogPosts) assert.ok(urls.has(`https://thesolemart.com/blog/${post.slug}`))
  assert.ok(entries.every(entry => !entry.url.includes('/template-preview/')))
  assert.equal(urls.size, entries.length)
})

test('an explicit wordpress selection restores GraphQL and public REST profile reads', async () => {
  process.env.SOLEMART_CONTENT_SOURCE = 'wordpress'
  const calls = []
  globalThis.fetch = async input => {
    const url = new URL(input)
    calls.push(url)
    return url.pathname.includes('/users/')
      ? Response.json({ id: 7, description: 'An actual fixture bio', avatar_urls: {} })
      : Response.json({ data: { post: null } })
  }
  assert.equal(isWordPressEnabled(), true)
  assert.equal(getWordPressGraphqlUrl(), process.env.WORDPRESS_GRAPHQL_URL)
  assert.equal(await getWordPressPost('missing-post'), null)
  assert.equal((await getWordPressAuthorProfile(7)).bio, 'An actual fixture bio')
  assert.equal(calls.length, 2)
  assert.ok(getWordPressWriteConfig())
})
