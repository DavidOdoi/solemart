import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getEditorialArticle } from '../lib/editorial-article.ts'
import { sanitizeCmsArticleHtml } from '../lib/cms-rich-text.ts'

// Mirrors Rank Math's published PHP renderer, including list-style variants.
const rankMath = (list='div', item='div', title='h3') => `<div id="rank-math-faq" class="rank-math-block custom-color" style="color:red"><${list} class="rank-math-list"><${item} id="rm-fit" class="rank-math-list-item"><${title} class="rank-math-question">Can sneakers work?</${title}><div class="rank-math-answer"><p><strong>Yes.</strong> Check fit and <a href="/walking-shoes">walking guides</a>.</p></div></${item}><${item} id="rm-return" class="rank-math-list-item"><${title} class="rank-math-question">What about returns?</${title}><div class="rank-math-answer"><p>Check the <a href="https://source.example/returns">retailer terms</a>.</p></div></${item}></${list}></div>`

test('Rank Math rendered FAQ becomes native accordion data without requiring a separate H2', () => {
  const article=getEditorialArticle(rankMath())
  assert.equal(article.parts.length,1)
  const faq=article.parts[0]
  assert.equal(faq.kind,'faqs')
  assert.equal(faq.heading.label,'Frequently asked questions')
  assert.deepEqual(faq.faqs.map(item=>item.id),['rm-fit','rm-return'])
  assert.deepEqual(faq.faqs.map(item=>item.question),['Can sneakers work?','What about returns?'])
  assert.match(faq.faqs[0].answerHtml,/<strong>Yes\.<\/strong>/)
  assert.match(faq.faqs[0].answerHtml,/href="\/walking-shoes"/)
  assert.match(faq.faqs[1].answerHtml,/target="_blank" rel="noopener noreferrer"/)
})

test('numbered and bulleted Rank Math lists and configurable title wrappers are supported', () => {
  for(const [list,item,title] of [['ol','li','h2'],['ul','li','h4'],['div','div','p']]){
    const article=getEditorialArticle(rankMath(list,item,title))
    assert.equal(article.parts[0].kind,'faqs')
    assert.equal(article.parts[0].faqs.length,2)
    assert.equal(article.headings.filter(h=>h.level===2).length,1)
  }
})

test('Rank Math saved Gutenberg markup is supported alongside an existing FAQ heading', () => {
  const html='<h2>Frequently asked questions about fit</h2><div class="wp-block-rank-math-faq-block"><div class="rank-math-faq-item"><h3 class="rank-math-question">What width?</h3><div class="rank-math-answer"><p>Check sizing.</p></div></div></div><h2>Final verdict</h2><p>Try both.</p>'
  const article=getEditorialArticle(html)
  assert.deepEqual(article.parts.map(p=>p.kind),['faqs','html'])
  assert.equal(article.parts[0].heading.label,'Frequently asked questions about fit')
  assert.equal(article.headings.filter(h=>h.label.startsWith('Frequently')).length,1)
  assert.match(article.parts[1].html,/Final verdict/)
})

test('Rank Math normalization survives upstream sanitization and keeps nested answer content safe', () => {
  const html=rankMath().replace('<strong>Yes.</strong>','<strong onclick="bad()">Yes.</strong><script>bad()</script><img src="https://cms.thesolemart.com/wp-content/uploads/shoe.jpg" onerror="bad()"><ul><li>Toe room</li></ul>')
  const upstream=sanitizeCmsArticleHtml(html)
  assert.doesNotMatch(upstream,/rank-math|custom-color|style=|onclick|onerror|<script/)
  const faq=getEditorialArticle(upstream).parts[0]
  assert.equal(faq.kind,'faqs')
  assert.match(faq.faqs[0].answerHtml,/<img/)
  assert.match(faq.faqs[0].answerHtml,/<li>Toe room<\/li>/)
})

test('Rank Math extra notes are preserved and incomplete blocks remain readable', () => {
  const html=rankMath().replace('<div class="rank-math-list">','<p>Additional guidance.</p><div class="rank-math-list">')
  const article=getEditorialArticle(html)
  assert.match(article.parts[0].introductionHtml,/Additional guidance/)
  const incomplete='<div class="rank-math-block"><div class="rank-math-list-item"><h3 class="rank-math-question">Unanswered?</h3></div></div>'
  assert.match(getEditorialArticle(incomplete).html,/Unanswered\?/)
})

test('the explicitly named first H3 becomes a quick-answer callout and stops at the next heading', () => {
  const article=getEditorialArticle('<p>Introduction.</p><h3>The quick answer</h3><p><strong>Choose by fit.</strong></p><ul><li>Check width.</li></ul><h2>Differences</h2><p>Compare soles.</p>'+rankMath(),{quickAnswer:true})
  assert.deepEqual(article.parts.map(p=>p.kind),['html','quick-answer','html','faqs'])
  assert.equal(article.parts[1].heading.id,'section-the-quick-answer')
  assert.match(article.parts[1].html,/<strong>Choose by fit\.<\/strong>/)
  assert.doesNotMatch(article.parts[1].html,/Differences|Compare soles/)
})

test('a random first H3, a later quick-answer heading or an empty quick answer is not mislabeled', () => {
  for(const html of ['<h3>Toe room</h3><p>Check fit.</p>','<h3>Toe room</h3><p>Check fit.</p><h3>Quick answer</h3><p>Later.</p>','<h3>Quick answer</h3><h2>Details</h2><p>Some text.</p>']){
    const article=getEditorialArticle(html,{quickAnswer:true})
    assert(article.parts.every(p=>p.kind!=='quick-answer'))
  }
})

test('article formatting preserves ordinary HTML and does not create empty FAQs or quick answers', () => {
  assert.deepEqual(getEditorialArticle('',{quickAnswer:true}).parts,[])
  const article=getEditorialArticle('<h2>Advice</h2><p>Try both.</p>',{quickAnswer:true})
  assert.equal(article.parts[0].kind,'html')
  assert.match(article.parts[0].html,/Try both/)
})
