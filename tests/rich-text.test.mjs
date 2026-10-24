import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { editorialPlainText, sanitizeEditorialHtml, sanitizeCmsArticleHtml } from '../lib/cms-rich-text.ts'
import { mapGuideFields, mapAcfGuideFields, hasAcfGuideContent } from '../lib/guide-fields.ts'
import { getWordPressAcfBuyingGuide } from '../lib/wordpress.ts'

const post={title:'Real guide',slug:'real-guide',category:'BUYING GUIDE',date:'',excerpt:'Summary',paragraphs:[],contentHtml:'<p>Body</p>'}

test('rich fields retain paragraphs, emphasis, ordered and unordered lists',()=>{
 const source='<p>Compare <strong>fit</strong> and <em>comfort</em>.</p><ul><li>Toe room</li><li>Heel fit</li></ul><ol start="2"><li>Try on</li></ol>'
 const html=sanitizeEditorialHtml(source)
 assert.match(html,/<p>Compare <strong>fit<\/strong> and <em>comfort<\/em>\.<\/p>/)
 assert.match(html,/<ul><li>Toe room<\/li><li>Heel fit<\/li><\/ul>/)
 assert.match(html,/<ol start="2"><li>Try on<\/li><\/ol>/)
 assert.equal(sanitizeEditorialHtml(html),html)
})

test('internal relative, query, fragment and own-site links retain their destinations and same-tab navigation',()=>{
 for(const href of ['/blog/fit','../another-guide','./nearby','#fit','?page=2','https://thesolemart.com/blog/fit','https://www.thesolemart.com/blog/fit','mailto:editor@example.com']){
  const html=sanitizeEditorialHtml(`<p><a href="${href}" target="_blank" rel="noopener noreferrer">Source</a></p>`)
  assert(html.includes(`href="${href}"`),href)
  assert.doesNotMatch(html,/target=|rel=/)
 }
})

test('editorial external HTTP links receive a new tab and security attributes without affiliate tagging',()=>{
 for(const href of ['https://example.com/source','http://example.com/source','https://thesolemart.com.evil.test/','https://thesolemart.com:444/']){
  const html=sanitizeEditorialHtml(`<a href="${href}" target="named-frame" rel="opener">Source</a>`)
  assert.match(html,/target="_blank" rel="noopener noreferrer"/)
  assert.doesNotMatch(html,/sponsored|nofollow|named-frame|rel="opener"/)
 }
})

test('known retailers, explicit sponsored links and structured retailer domains keep the affiliate attributes',()=>{
 for(const href of ['https://www.amazon.com/dp/TEST?tag=test-20','https://amzn.to/test','https://shop.retailer.test/product']){
  const html=sanitizeEditorialHtml(`<a href="${href}">Retailer</a>`,'paragraphs',['https://shop.retailer.test/another-product'])
  assert.match(html,/rel="sponsored nofollow noopener noreferrer"/)
  assert.match(html,/target="_blank"/)
 }
 assert.match(sanitizeEditorialHtml('<a href="https://other.test/link" rel="sponsored">Retailer</a>'),/rel="sponsored nofollow noopener noreferrer"/)
 assert.doesNotMatch(sanitizeEditorialHtml('<a href="/blog/fit">Internal</a>','paragraphs',['https://thesolemart.com/go/product']),/sponsored|target=/)
})

test('untrusted markup, handlers, styles, credentials and dangerous link schemes cannot reach the rendered HTML',()=>{
 const html=sanitizeEditorialHtml('<h1>Heading</h1><p style="position:fixed" onclick="bad()">Safe</p><script>alert(1)</script><style>body{display:none}</style><svg onload="bad()"><script>bad()</script></svg><img src="x" onerror="bad()"><iframe src="https://evil.test"></iframe><form><input name="secret"></form>')
 assert.match(html,/<p>Heading<\/p><p>Safe<\/p>/)
 assert.doesNotMatch(html,/<h1|<script|<style|<svg|<img|<iframe|<form|<input|onclick|onerror|onload|position:|alert\(1\)/)
 for(const href of ['javascript:alert(1)','java&#x0a;script:alert(1)','data:text/html,bad','vbscript:bad','file:///etc/passwd','//evil.test/path','&#47;&#47;evil.test/path',String.raw`\\evil.test/path`,'https://user:secret@example.com/']){
  const cleaned=sanitizeEditorialHtml(`<a href="${href}">Text retained</a>`)
  assert.doesNotMatch(cleaned,/href=/,href);assert.match(cleaned,/Text retained/)
 }
})

test('plain text keeps its text, paragraph breaks and legacy buying-advice bullet structure',()=>{
 const input='First & second < 3.\nA new line.\n\nFinal paragraph.'
 const html=sanitizeEditorialHtml(input)
 assert.equal(editorialPlainText(input),input)
 assert.match(html,/<p>First &amp; second &lt; 3\.<br \/>A new line\.<\/p><p>Final paragraph\.<\/p>/)
 assert.equal(sanitizeEditorialHtml('Check fit\nCheck returns','list'),'<ul><li>Check fit</li><li>Check returns</li></ul>')
 assert.equal(sanitizeEditorialHtml(''),'')
})

test('the native article sanitizer retains safe headings/images while applying the same link policy',()=>{
 const html=sanitizeCmsArticleHtml('<h1>Title</h1><h2 id="fit">Fit</h2><img src="https://example.com/shoe.jpg" alt="Shoe" onerror="bad()"><a href="/blog/fit">Internal</a><a href="https://example.com/source">External</a>')
 assert.match(html,/<h2>Title<\/h2><h2 id="fit">Fit<\/h2>/)
 assert.match(html,/loading="lazy" decoding="async"/)
 assert.match(html,/<a href="\/blog\/fit">Internal<\/a>/)
 assert.match(html,/target="_blank" rel="noopener noreferrer">External/)
 assert.doesNotMatch(html,/onerror/)
})

test('the guide mapper preserves HTML in all requested fields and plain representations for existing consumers',()=>{
 const source='<p>Read <a href="/blog/fit">our fit guide</a> and <strong>compare</strong> options.</p><p>Second paragraph.</p>'
 const input={intro:source,advice:'<ul><li>Check <a href="https://example.com/source">the source</a>.</li></ul>',finalVerdict:source,
  faqs:[{question:'How to choose?',answer:source}],products:[{name:'Actual shoe',review:source,affiliateUrl:'https://shop.retailer.test/product',pros:'Fit',cons:'Availability',specs:'Width | Standard'}]}
 const {guide,products}=mapGuideFields(post,input)
 for(const html of [guide.introHtml,guide.finalVerdictHtml,guide.faqs[0].answerHtml,products[0].reviewHtml]){
  assert.match(html,/<a href="\/blog\/fit">our fit guide<\/a>/)
  assert.match(html,/<strong>compare<\/strong>/)
 }
 assert.match(guide.adviceHtml,/target="_blank" rel="noopener noreferrer"/)
 assert.doesNotMatch(guide.intro+guide.finalVerdict+guide.faqs[0].answer+products[0].review.join(' '),/<\/?[a-z]/)
 assert.deepEqual(products[0].review,['Read our fit guide and compare options.','Second paragraph.'])
 assert.equal(products[0].affiliateUrl,'https://shop.retailer.test/product')
 assert.deepEqual(products[0].pros,['Fit']);assert.deepEqual(products[0].specs,[{label:'Width',value:'Standard'}])
})

test('an empty WYSIWYG override falls back to the reusable Product Full Review',()=>{
 const fields={pick1Shoe:{node:{__typename:'Shoe',id:'shoe-1'}},pick1Commentary:'<p><br /></p>'}
 const shoes=[{id:'shoe-1',slug:'real-shoe',status:'publish',title:'Real shoe',solemartShoeFields:{commentary:'<p>See <a href="/how-we-review">our methodology</a>.</p>'}}]
 const result=mapAcfGuideFields(post,fields,shoes)
 assert.match(result.products[0].reviewHtml,/href="\/how-we-review"/)
 assert.equal(hasAcfGuideContent({intro:'<p><br /></p>',finalVerdict:'<p>&nbsp;</p>',faq1Answer:'<script>bad()</script>'}),false)
})

test('metadata summaries flatten rich introduction paragraphs without joining words or exposing markup',async()=>{
 const originalFetch=globalThis.fetch,endpoint=process.env.WORDPRESS_GRAPHQL_URL,source=process.env.WORDPRESS_GUIDE_FIELDS_SOURCE
 process.env.WORDPRESS_GRAPHQL_URL='https://cms.thesolemart.com/graphql';delete process.env.WORDPRESS_GUIDE_FIELDS_SOURCE
 try{
  globalThis.fetch=async()=>Response.json({data:{buyingGuide:{title:post.title,slug:post.slug,status:'publish',content:'<p>Body</p>',excerpt:null,dateGmt:null,modifiedGmt:null,featuredImage:null,solemartBuyingGuideFields:{author:'David',intro:'<p>First paragraph.</p><p>Second <a href="/blog/fit">paragraph</a>.</p>'}}}})
  assert.equal((await getWordPressAcfBuyingGuide(post.slug)).post.excerpt,'First paragraph. Second paragraph.')
 }finally{
  globalThis.fetch=originalFetch
  if(endpoint===undefined)delete process.env.WORDPRESS_GRAPHQL_URL;else process.env.WORDPRESS_GRAPHQL_URL=endpoint
  if(source===undefined)delete process.env.WORDPRESS_GUIDE_FIELDS_SOURCE;else process.env.WORDPRESS_GUIDE_FIELDS_SOURCE=source
 }
})

test('the ACF upgrade preserves storage keys/API names, adds twelve WYSIWYGs and leaves structured URLs as URLs',()=>{
 const groups=JSON.parse(readFileSync(new URL('../public/downloads/solemart-acf-fields.json',import.meta.url),'utf8'))
 const targets=[['intro','intro'],['advice','advice'],['final_verdict','finalVerdict'],...[1,2,3,4].map(i=>[`faq_${i}_answer`,`faq${i}Answer`]),...[1,2,3,4].map(i=>[`pick_${i}_commentary`,`pick${i}Commentary`])]
 const guide=groups.find(g=>g.key==='group_solemart_buying_guide_acf'),shoe=groups.find(g=>g.key==='group_solemart_shoe_acf')
 for(const [name,graphql] of targets){
  const field=guide.fields.find(f=>f.name===name)
  assert.equal(field.key,`field_solemart_guide_${name}`);assert.equal(field.graphql_field_name,graphql)
  assert.equal(field.type,'wysiwyg');assert.equal(field.toolbar,'basic');assert.equal(field.media_upload,0)
 }
 assert.equal(shoe.fields.find(f=>f.name==='commentary').key,'field_solemart_shoe_commentary')
 assert.equal(shoe.fields.find(f=>f.name==='commentary').type,'wysiwyg')
 assert.equal(shoe.fields.find(f=>f.name==='affiliate_url').type,'url')
 assert.equal(shoe.fields.find(f=>f.name==='review_url').type,'url')
 assert.equal(groups.flatMap(g=>g.fields).filter(f=>f.type==='wysiwyg').length,12)
 assert(groups.every(g=>g.show_in_graphql===1&&g.show_in_rest===1))
})

test('the toolbar configuration targets only SOLEMART ACF editors and contains exactly the requested controls',()=>{
 const snippet=readFileSync(new URL('../public/downloads/solemart-acf-minimal-toolbar.txt',import.meta.url),'utf8')
 const js=snippet.match(/<script>([\s\S]*?)<\/script>/)[1]
 let filter;let fieldKey='field_solemart_guide_intro'
 vm.runInNewContext(js,{window:{acf:true},acf:{addFilter(name,callback){assert.equal(name,'wysiwyg_tinymce_settings');filter=callback}},document:{getElementById(){return{closest(){return{getAttribute(){return fieldKey}}}}}}})
 const settings=filter({toolbar1:'old',toolbar2:'old'},'acf-editor-1')
 assert.equal(settings.toolbar1,'formatselect,bold,italic,bullist,numlist,link')
 assert.equal(settings.toolbar2,'');assert.equal(settings.block_formats,'Paragraph=p');assert.equal(settings.menubar,false)
 fieldKey='field_other_plugin_content';assert.equal(filter({toolbar1:'original'},'other-editor').toolbar1,'original')
})
