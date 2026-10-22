import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getReadingMinutes } from '../lib/article-details.ts'

test('reading time follows article length and has a one-minute minimum', () => {
  assert.equal(getReadingMinutes(''),1)
  assert.equal(getReadingMinutes('A brief article.'),1)
  assert.equal(getReadingMinutes('word '.repeat(220)),1)
  assert.equal(getReadingMinutes('word '.repeat(221)),2)
  assert.equal(getReadingMinutes('word '.repeat(660)),3)
})

test('reading time counts visible text, separates blocks and excludes scripts/styles', () => {
  assert.equal(getReadingMinutes('<script>'+ 'hidden '.repeat(500)+'</script><style>'+ 'hidden '.repeat(500)+'</style><p>Short article.</p>'),1)
  assert.equal(getReadingMinutes('<p>Word</p>'.repeat(221)),2)
  assert.equal(getReadingMinutes('<p>word&nbsp;</p>'.repeat(221)),2)
})

test('contents use real H2/H3 text, preserve markup and link to unique stable anchors', async () => {
  const { getArticleContents } = await import('../lib/article-details.ts')
  const source = '<p>Introduction.</p><h2>Fit &amp; comfort</h2><h3><strong>Toe room</strong></h3><h2>Fit &amp; comfort</h2><h4>Small detail</h4>'
  const result = getArticleContents(source)
  assert.deepEqual(result.headings,[
    {id:'section-fit-comfort',label:'Fit & comfort',level:2},
    {id:'section-toe-room',label:'Toe room',level:3},
    {id:'section-fit-comfort-2',label:'Fit & comfort',level:2},
  ])
  assert.match(result.html, /<h3 id="section-toe-room"><strong>Toe room<\/strong><\/h3>/)
  assert.match(result.html, /<h4>Small detail<\/h4>/)
  assert.deepEqual(getArticleContents(source),result)
})

test('contents preserve safe WordPress anchors while avoiding reserved and duplicate IDs', async () => {
  const { getArticleContents } = await import('../lib/article-details.ts')
  const result = getArticleContents('<h2>Fit</h2><h2 id="section-fit">Custom anchor</h2><h3 id="section-fit">Duplicate</h3><h2 id="about-author">About the fit</h2><h2 id="bad&quot;id">Safe heading</h2>')
  assert.deepEqual(result.headings.map(heading=>heading.id),['section-fit-2','section-fit','section-duplicate','section-about-the-fit','section-safe-heading'])
  assert.doesNotMatch(result.html,/id="about-author"|id="bad/)
})

test('contents handle empty headings, accents and headings without ASCII letters', async () => {
  const { getArticleContents } = await import('../lib/article-details.ts')
  assert.deepEqual(getArticleContents('<p>No headings.</p>').headings,[])
  const result = getArticleContents('<h2> </h2><h2>Café: sizing?</h2><h3>鞋子</h3><h3>鞋子</h3>')
  assert.deepEqual(result.headings.map(heading=>heading.id),['section-cafe-sizing','section-heading','section-heading-2'])
})
