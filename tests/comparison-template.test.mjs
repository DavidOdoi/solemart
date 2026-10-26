import { test } from 'node:test'
import assert from 'node:assert/strict'
import { comparisonArticle, comparisonGuideHref } from '../lib/comparison-article.ts'

test('comparison guide buttons preserve internal paths and reject external, protocol-relative and unsafe URLs', () => {
  for (const href of ['/sneakers', '/best-shoes/a-guide?source=compare#fit']) assert.equal(comparisonGuideHref(href),href)
  for (const href of [undefined, '', '//retailer.example', 'https://retailer.example', 'javascript:alert(1)', '/\\retailer.example', '/bad\npath', ' /sneakers']) assert.equal(comparisonGuideHref(href),undefined)
})

test('comparison body is allowlist-sanitized and keeps editorial link semantics', () => {
  const result=comparisonArticle('<h2 onclick="bad()">Fit</h2><script>bad()</script><p><a href="/walking-shoes">Internal</a> <a href="https://source.example/fit">Source</a> <a href="javascript:bad()">Unsafe</a></p>')
  assert.doesNotMatch(result.html, /<script|onclick|javascript:/)
  assert.match(result.html, /href="\/walking-shoes"/)
  assert.match(result.html, /href="https:\/\/source.example\/fit" target="_blank" rel="noopener noreferrer"/)
  assert.equal(result.headings[0].label,'Fit')
})

test('each comparison table has an accessible scroll wrapper, a real caption and safe cells', () => {
  const table='<table style="width:9999px"><caption>Actual differences</caption><thead><tr><th scope="col">Category</th><th scope="col">Option</th></tr></thead><tbody><tr><th scope="row">Fit</th><td>Check sizing</td></tr></tbody></table>'
  const {html}=comparisonArticle(table+table)
  assert.equal((html.match(/class="comparison-table-scroll"/g)||[]).length,2)
  assert.equal((html.match(/role="region" aria-label="Comparison table" tabindex="0"/g)||[]).length,2)
  assert.equal((html.match(/<caption>Actual differences<\/caption>/g)||[]).length,2)
  assert.match(html,/<th scope="row">Fit<\/th>/)
  assert.doesNotMatch(html,/9999|style=/)
})

test('automatic comparison contents avoid duplicate headings and template anchor collisions', () => {
  const {html,headings}=comparisonArticle('<h2 id="comparison-verdict">A choice</h2><h2>Fit</h2><h2>Fit</h2><h3>Toe room</h3>')
  assert.deepEqual(headings.map(h=>h.id),['section-a-choice','section-fit','section-fit-2','section-toe-room'])
  assert.doesNotMatch(html,/id="comparison-verdict"/)
})

test('comparison body does not invent content or alter sponsored retailer attributes', () => {
  assert.equal(comparisonArticle('').html,'')
  assert.deepEqual(comparisonArticle('').headings,[])
  const {html}=comparisonArticle('<p><a href="https://www.amazon.com/dp/ABC">Retailer</a></p>')
  assert.match(html,/rel="sponsored nofollow noopener noreferrer"/)
})

test('Gutenberg FAQ headings become accordion data while surrounding article sections retain their order', () => {
  const article=comparisonArticle('<h2>Differences</h2><p>Compare fit.</p><h2>Frequently asked questions</h2><p>A short introduction.</p><h3>Can sneakers work?</h3><p><strong>Yes.</strong> Check the fit. <a href="/walking-shoes">Read more</a></p><h3>Which width?</h3><p>Check the brand sizing.</p><h2>Sources</h2><p>A source.</p>')
  assert.deepEqual(article.parts.map(part=>part.kind),['html','faqs','html'])
  const faq=article.parts[1]
  assert.equal(faq.heading.label,'Frequently asked questions')
  assert.match(faq.introductionHtml,/A short introduction/)
  assert.deepEqual(faq.faqs.map(item=>item.question),['Can sneakers work?','Which width?'])
  assert.equal(faq.faqs[0].id,'section-can-sneakers-work')
  assert.match(faq.faqs[0].answerHtml,/<strong>Yes\.<\/strong>/)
  assert.match(faq.faqs[0].answerHtml,/href="\/walking-shoes"/)
  assert.match(article.parts[2].html,/<h2 id="section-sources">Sources<\/h2>/)
})

test('FAQ conversion preserves incomplete blocks as normal article content rather than dropping text', () => {
  for(const html of ['<h2>FAQs</h2><p>No questions yet.</p>','<h2>FAQs</h2><h3>Unanswered?</h3>','<h2>Not FAQs</h2><h3>A heading</h3><p>Body text.</p>']){
    const article=comparisonArticle(html)
    assert(article.parts.every(part=>part.kind==='html'))
    assert.equal(article.parts.map(part=>part.html).join(''),article.html)
  }
})

test('FAQ extraction uses sanitized markup and retains real question anchors', () => {
  const article=comparisonArticle('<h2>FAQ</h2><h3 id="fit-question" onclick="bad()">Fit?</h3><p onclick="bad()">Choose a comfortable fit.<script>bad()</script></p>')
  const faq=article.parts[0]
  assert.equal(faq.kind,'faqs')
  assert.equal(faq.faqs[0].id,'fit-question')
  assert.doesNotMatch(faq.faqs[0].answerHtml,/script|onclick|bad\(\)/)
})
