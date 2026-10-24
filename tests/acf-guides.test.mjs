import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getWordPressAcfBuyingGuide, getWordPressBuyingGuide, getWordPressGuideFields } from '../lib/wordpress.ts'
import { hasAcfGuideContent, mapAcfGuideFields } from '../lib/guide-fields.ts'

const originalFetch = globalThis.fetch
const originalEndpoint = process.env.WORDPRESS_GRAPHQL_URL
const originalSource = process.env.WORDPRESS_GUIDE_FIELDS_SOURCE
const post = { id: 'guide-1', title: 'Best Wide Toe Box Sandals', slug: 'best-wide-toe-box-sandals', status: 'publish', content: '<h1>Fit guide</h1><p>Real article.</p>', excerpt: '<p>Real summary.</p>', dateGmt: '2026-10-24T08:00:00', modifiedGmt: '2026-10-24T09:00:00', featuredImage: null }
const fields = { intro: 'Real ACF introduction', author: 'David', quickAnswerTitle: 'Quick Answer', quickAnswerBody: 'Compare fit and intended use.', pick1Shoe: { node: { __typename: 'Shoe', id: 'shoe-1' } }, pick1Award: 'Best for everyday wear', pick1Reason: 'Guide-specific reason', pick1BestFor: 'Daily use', pick1AvoidIf: 'You need a different fit', pick1Commentary: 'Guide-specific analysis.', faq1Question: 'How should they fit?', faq1Answer: 'Check toe room.' }
const shoe = { id: 'shoe-1', title: 'Actual Sandal &amp; Model', slug: 'actual-sandal-model', status: 'publish', featuredImage: { node: { sourceUrl: 'https://cms.thesolemart.com/wp-content/uploads/sandal.jpg', altText: 'Sandal &amp; sole', mediaDetails: { width: 900, height: 700 } } }, solemartShoeFields: { brand: 'Actual brand', description: 'Verified general description.', affiliateUrl: 'https://www.amazon.com/dp/TEST?tag=sample-20', reviewUrl: '', pros: 'Adjustable straps\nRoomy fit', cons: 'Limited use', specs: 'Upper | Synthetic\nClosure | Adjustable', cushioning: 'Balanced', widthOptions: 'Standard', mainStrength: 'Fit', commentary: 'Reusable general analysis.' } }

beforeEach(() => { process.env.WORDPRESS_GRAPHQL_URL = 'https://cms.thesolemart.com/graphql'; delete process.env.WORDPRESS_GUIDE_FIELDS_SOURCE })
afterEach(() => {
 globalThis.fetch = originalFetch
 for (const [key,value] of [['WORDPRESS_GRAPHQL_URL',originalEndpoint],['WORDPRESS_GUIDE_FIELDS_SOURCE',originalSource]]) {
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
 }
})

test('ACF defaults do not opt an unmigrated guide out of its legacy content',()=>{
 assert.equal(hasAcfGuideContent({quickAnswerTitle:'Quick Answer',disclosure:'Default disclosure',pick1Shoe:null}),false)
 assert.equal(hasAcfGuideContent({intro:'Migrated introduction'}),true)
 assert.equal(hasAcfGuideContent({pick2Shoe:fields.pick1Shoe}),true)
 assert.equal(hasAcfGuideContent({faq1Question:'A real FAQ?'}),true)
})

test('HTTP 400 for a missing optional legacy field does not make a published guide fail', async () => {
 globalThis.fetch = async () => Response.json({errors:[{message:'Cannot query field "solemartGuideData" on type "BuyingGuide".'}]},{status:400})
 assert.equal(await getWordPressGuideFields(post.slug),null)
})

test('a CPT without Excerpt support still returns the ACF guide on HTTP 200 and 400', async () => {
 for (const status of [200,400]) {
  const calls=[]
  globalThis.fetch=async (_url,options)=>{
   const payload=JSON.parse(options.body);calls.push(payload)
   assert.equal(options.next.revalidate,60)
   if (/\bexcerpt\b/.test(payload.query))return Response.json({errors:[{message:'Cannot query field "excerpt" on type "BuyingGuide".',locations:[{line:3,column:32}]}]},{status})
   const {excerpt,...native}=post
   return Response.json({data:{buyingGuide:{...native,solemartBuyingGuideFields:{intro:'The real guide introduction.',author:'David'}}}})
  }
  const result=await getWordPressAcfBuyingGuide(post.slug)
  assert.equal(calls.length,2)
  assert.deepEqual(calls[0].variables,calls[1].variables)
  assert.match(calls[0].query,/\bexcerpt\b/);assert.doesNotMatch(calls[1].query,/\bexcerpt\b/)
  assert.equal(result.post.title,post.title)
  assert.equal(result.post.excerpt,'The real guide introduction.')
  assert.equal(mapAcfGuideFields(result.post,result.fields,result.shoes).guide.metaDescription,'The real guide introduction.')
 }
})

test('the legacy/native guide adapter also tolerates a missing Excerpt capability',async()=>{
 let calls=0
 globalThis.fetch=async(_url,options)=>{
  calls++
  const payload=JSON.parse(options.body)
  if (/\bexcerpt\b/.test(payload.query))return Response.json({errors:[{message:'Cannot query field "excerpt" on type "BuyingGuide".'}]},{status:400})
  const {excerpt,...native}=post
  return Response.json({data:{buyingGuide:native}})
 }
 const result=await getWordPressBuyingGuide(post.slug)
 assert.equal(calls,2);assert.equal(result.excerpt,'Fit guide Real article.')
})

test('excerpt retry preserves missing-ACF detection but never hides unrelated errors',async()=>{
 let calls=0
 globalThis.fetch=async(_url,options)=>{
  calls++
  const errors=[{message:'Cannot query field "solemartBuyingGuideFields" on type "BuyingGuide".'}]
  if (/\bexcerpt\b/.test(JSON.parse(options.body).query))errors.push({message:'Cannot query field "excerpt" on type "BuyingGuide".'})
  return Response.json({errors},{status:400})
 }
 assert.equal(await getWordPressAcfBuyingGuide(post.slug),undefined);assert.equal(calls,2)
 calls=0
 globalThis.fetch=async()=>{calls++;return Response.json({errors:[{message:'Cannot query field "excerpt" on type "BuyingGuide".'},{message:'Database unavailable'}]},{status:400})}
 await assert.rejects(getWordPressAcfBuyingGuide(post.slug),/could not return/);assert.equal(calls,1)
})

test('absent ACF schema is distinguishable from a missing guide and other HTTP 400 errors', async () => {
 globalThis.fetch = async () => Response.json({errors:[{message:'Cannot query field "solemartBuyingGuideFields" on type "BuyingGuide".'}]},{status:400})
 assert.equal(await getWordPressAcfBuyingGuide(post.slug),undefined)
 globalThis.fetch = async () => Response.json({data:{buyingGuide:null}})
 assert.equal(await getWordPressAcfBuyingGuide(post.slug),null)
 globalThis.fetch = async () => Response.json({errors:[{message:'Cannot query field "pick1Shoe" on type "SolemartBuyingGuideFields".'}]},{status:400})
 await assert.rejects(getWordPressAcfBuyingGuide(post.slug),error=>/could not return/.test(error.message)&&/pick1Shoe/.test(error.cause.message))
 globalThis.fetch = async () => Response.json({data:{buyingGuide:null}},{status:400})
 await assert.rejects(getWordPressAcfBuyingGuide(post.slug),/temporarily unavailable/)
})

test('loads ACF slots and published reusable shoes server-side with separate 60-second caches', async () => {
 const calls=[]
 globalThis.fetch=async (_url,options)=>{
  const payload=JSON.parse(options.body);calls.push(payload)
  assert.equal(options.method,'POST');assert.equal(options.headers.Authorization,undefined)
  assert.equal(options.cache,'force-cache');assert.equal(options.next.revalidate,60)
  if(payload.query.includes('PublishedAcfBuyingGuide')) {
   assert.deepEqual(payload.variables,{slug:post.slug})
   assert.match(payload.query,/pick4Shoe \{ node \{ __typename id \} \}/)
   assert.doesNotMatch(payload.query,/on Shoe|solemartGuideData/)
   assert.ok(options.next.tags.includes('wordpress:buying-guide:'+post.slug))
   return Response.json({data:{buyingGuide:{...post,solemartBuyingGuideFields:fields}}})
  }
  assert.match(payload.query,/PublishedAcfShoe/);assert.deepEqual(payload.variables,{id:'shoe-1'})
  assert.ok(options.next.tags.includes('wordpress:shoe:shoe-1'))
  return Response.json({data:{node:shoe}})
 }
 const result=await getWordPressAcfBuyingGuide(post.slug)
 assert.equal(calls.length,2)
 assert.equal(result.post.contentHtml,'<h2>Fit guide</h2><p>Real article.</p>')
 assert.equal(result.shoes[0].title,'Actual Sandal & Model')
 assert.equal(result.shoes[0].featuredImage.node.altText,'Sandal & sole')
 const view=mapAcfGuideFields(result.post,result.fields,result.shoes)
 assert.equal(view.guide.quickAnswerBody,fields.quickAnswerBody)
 assert.equal(view.products[0].id,'shoe-1');assert.equal(view.products[0].slug,shoe.slug)
 assert.equal(view.products[0].badge,fields.pick1Award)
 assert.equal(view.products[0].shortReason,fields.pick1Reason)
 assert.deepEqual(view.products[0].review,['Guide-specific analysis.'])
 assert.equal(view.products[0].affiliateUrl,shoe.solemartShoeFields.affiliateUrl)
 assert.deepEqual(view.guide.productSlugs,[shoe.slug])
 assert.equal(view.guide.topPicks[0].productSlug,shoe.slug)
 assert.equal(view.guide.topPicks[0].cushioning,'Balanced')
 assert.equal(view.guide.faqs.length,1)
})

test('native author is optional and supplied when the ACF byline is empty',async()=>{
 globalThis.fetch=async (_url,options)=>{
  const payload=JSON.parse(options.body)
  if(payload.query.includes('BuyingGuideAuthor'))return Response.json({data:{node:{author:{node:{name:'David &amp; Team'}}}}})
  return Response.json({data:{buyingGuide:{...post,solemartBuyingGuideFields:{intro:'Intro'}}}})
 }
 const result=await getWordPressAcfBuyingGuide(post.slug)
 assert.equal(mapAcfGuideFields(result.post,result.fields,result.shoes).guide.author,'David & Team')
})

test('missing, draft and private guides never fetch or publish recommendations',async()=>{
 for(const guide of [null,{...post,status:'draft'},{...post,status:'private'}]) {
  let count=0;globalThis.fetch=async()=>{count++;return Response.json({data:{buyingGuide:guide}})}
  assert.equal(await getWordPressAcfBuyingGuide(post.slug),null);assert.equal(count,1)
 }
})

test('missing or unpublished Shoe nodes are omitted and repeated selections are fetched once',async()=>{
 for(const node of [null,{...shoe,status:'draft'},{...shoe,status:'private'}]) {
  let shoeCalls=0
  globalThis.fetch=async(_url,options)=>{
   if(JSON.parse(options.body).query.includes('PublishedAcfShoe')){shoeCalls++;return Response.json({data:{node}})}
   return Response.json({data:{buyingGuide:{...post,solemartBuyingGuideFields:{...fields,pick2Shoe:fields.pick1Shoe}}}})
  }
  const result=await getWordPressAcfBuyingGuide(post.slug)
  assert.equal(shoeCalls,1);assert.equal(result.shoes.length,0)
  assert.equal(mapAcfGuideFields(result.post,result.fields,result.shoes).products.length,0)
 }
})

test('incomplete responses and upstream failures remain errors',async()=>{
 for(const guide of [{...post,slug:'wrong'},post,{...post,solemartBuyingGuideFields:'bad'}]) {
  globalThis.fetch=async()=>Response.json({data:{buyingGuide:guide}})
  await assert.rejects(getWordPressAcfBuyingGuide(post.slug),/incomplete|invalid/)
 }
 globalThis.fetch=async()=>Response.json({data:{}})
 await assert.rejects(getWordPressAcfBuyingGuide(post.slug),/could not return/)
 globalThis.fetch=async()=>new Response('Unavailable',{status:503})
 await assert.rejects(getWordPressAcfBuyingGuide(post.slug),/temporarily unavailable/)
})

test('unconfigured development, rollback mode and invalid slugs make no ACF request',async()=>{
 globalThis.fetch=async()=>assert.fail('Must not fetch')
 delete process.env.WORDPRESS_GRAPHQL_URL
 assert.equal(await getWordPressAcfBuyingGuide(post.slug),undefined)
 process.env.WORDPRESS_GRAPHQL_URL='https://cms.thesolemart.com/graphql'
 process.env.WORDPRESS_GUIDE_FIELDS_SOURCE='legacy'
 assert.equal(await getWordPressAcfBuyingGuide(post.slug),undefined)
 delete process.env.WORDPRESS_GUIDE_FIELDS_SOURCE
 assert.equal(await getWordPressAcfBuyingGuide('bad/slug'),null)
})

test('slot gaps retain the right awards, duplicates are omitted, and general commentary is the fallback',()=>{
 const second={...shoe,id:'shoe-2',slug:'second-model',title:'Second sandal'}
 const view=mapAcfGuideFields({title:post.title,slug:post.slug,excerpt:'',category:'BUYING GUIDE',date:'',paragraphs:[]},{
  pick2Shoe:fields.pick1Shoe,pick2Award:'Second slot award',
  pick3Shoe:fields.pick1Shoe,pick3Award:'Duplicate',
  pick4Shoe:{node:{id:'shoe-2',__typename:'Shoe'}},pick4Award:'Fourth slot award',
  faq1Question:'Incomplete FAQ',
 },[shoe,second])
 assert.equal(view.products.length,2)
 assert.equal(view.products[0].badge,'Second slot award')
 assert.equal(view.products[1].badge,'Fourth slot award')
 assert.deepEqual(view.products[0].review,['Reusable general analysis.'])
 assert.equal(view.guide.faqs.length,0)
})

test('empty ACF fields do not borrow samples; product URLs and images use the existing allowlists',()=>{
 const base={title:post.title,slug:post.slug,excerpt:'',category:'BUYING GUIDE',date:'',paragraphs:[]}
 assert.deepEqual(mapAcfGuideFields(base,{},[]).products,[])
 const view=mapAcfGuideFields(base,fields,[{...shoe,featuredImage:{node:{sourceUrl:'https://untrusted.test/shoe.jpg'}},solemartShoeFields:{...shoe.solemartShoeFields,affiliateUrl:'javascript:alert(1)',reviewUrl:'https://user:secret@example.test'}}])
 assert.equal(view.products[0].image,'');assert.equal(view.products[0].affiliateUrl,'');assert.equal(view.products[0].reviewUrl,'')
 assert.doesNotMatch(JSON.stringify(view),/Fresh Foam|Footwear Research Desk|dp\/example/)
})
