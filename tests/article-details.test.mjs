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
