import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sandboxAccess, sandboxRobots } from '../lib/sandbox-auth.ts'
import { getProductPreview, mapProductPreview, isProductPreviewSlug } from '../lib/product-preview.ts'

const originalFetch=globalThis.fetch, originalEndpoint=process.env.WORDPRESS_GRAPHQL_URL
const config={SANDBOX_PREVIEW_USERNAME:'test-editor',SANDBOX_PREVIEW_PASSWORD:'test-only-password:with:colons'}
const basic=(user,password)=>'Basic '+Buffer.from(user+':'+password).toString('base64')
const shoe=(overrides={})=>({title:'Actual Shoe &amp; Model',slug:'actual-shoe',status:'publish',featuredImage:{node:{sourceUrl:'https://cms.thesolemart.com/wp-content/uploads/shoe.png',altText:'Blue shoe'}},solemartShoeFields:{brand:'Brand',description:'<p>Real <strong>description.</strong><script>bad()</script></p>',affiliateUrl:'https://www.amazon.com/dp/B012345678?tag=sample-20',pros:'Roomy fit\nAdjustable closure',cons:'Limited colours',specs:'Weight | 240 g\nDrop | 8 mm\nWeight | duplicate',cushioning:'Balanced',widthOptions:'Wide',mainStrength:'Fit',commentary:'Existing plain-text notes.',retailer2Name:'REI',retailer2Url:'https://www.rei.com/product/123',retailer3Name:'Brand shop',retailer3Url:'https://www.brooksrunning.com/shoe'},...overrides})
beforeEach(()=>{process.env.WORDPRESS_GRAPHQL_URL='https://cms.thesolemart.com/graphql'})
afterEach(()=>{globalThis.fetch=originalFetch;if(originalEndpoint===undefined)delete process.env.WORDPRESS_GRAPHQL_URL;else process.env.WORDPRESS_GRAPHQL_URL=originalEndpoint})

test('sandbox is closed without both credentials and challenges incorrect credentials',()=>{
  assert.equal(sandboxAccess(null,{}),'disabled')
  assert.equal(sandboxAccess(null,{SANDBOX_PREVIEW_USERNAME:'editor'}),'disabled')
  assert.equal(sandboxAccess(null,{...config,SANDBOX_PREVIEW_PASSWORD:' '}),'disabled')
  assert.equal(sandboxAccess(null,config),'denied')
  assert.equal(sandboxAccess('Bearer not-basic',config),'denied')
  assert.equal(sandboxAccess(basic('test-editor','wrong'),config),'denied')
  assert.equal(sandboxAccess(basic('wrong',config.SANDBOX_PREVIEW_PASSWORD),config),'denied')
  assert.equal(sandboxAccess(basic(config.SANDBOX_PREVIEW_USERNAME,config.SANDBOX_PREVIEW_PASSWORD),config),'allowed')
  assert.equal(sandboxAccess(basic('editor','密碼'),{SANDBOX_PREVIEW_USERNAME:'editor',SANDBOX_PREVIEW_PASSWORD:'密碼'}),'allowed')
  assert.equal(sandboxRobots,'noindex, nofollow, noarchive')
})

test('preview fetch is a variable-based anonymous server POST with no-store and timeout',async()=>{
  globalThis.fetch=async(url,options)=>{
    assert.equal(String(url),'https://cms.thesolemart.com/graphql')
    assert.equal(options.method,'POST');assert.equal(options.cache,'no-store');assert.equal(options.next,undefined)
    assert(options.signal instanceof AbortSignal);assert.equal(options.headers.Authorization,undefined)
    const body=JSON.parse(options.body);assert.deepEqual(body.variables,{slug:'actual-shoe'});assert.match(body.query,/shoe\(id: \$slug, idType: SLUG\)/)
    return Response.json({data:{shoe:shoe()}})
  }
  const product=await getProductPreview('actual-shoe')
  assert.equal(product.name,'Actual Shoe & Model');assert.equal(product.retailers.length,3)
  assert.doesNotMatch(product.descriptionHtml,/<script/)
  assert.deepEqual(product.pros,['Roomy fit','Adjustable closure'])
  assert.equal(product.specs.filter(s=>s.label==='Weight').length,1)
})

test('optional extra retailer fields retry once on a genuinely older schema, for HTTP 200 and 400',async()=>{
  for(const status of [200,400]){
    let calls=0
    globalThis.fetch=async(url,options)=>{
      calls++;const query=JSON.parse(options.body).query
      if(calls===1){assert.match(query,/retailer2Name/);return Response.json({errors:[{message:'Cannot query field "retailer2Name" on type "SolemartShoeFields".'}]},{status})}
      assert.doesNotMatch(query,/retailer2Name/)
      const base=shoe();delete base.solemartShoeFields.retailer2Url;delete base.solemartShoeFields.retailer3Url
      return Response.json({data:{shoe:base}})
    }
    const product=await getProductPreview('actual-shoe');assert.equal(calls,2);assert.equal(product.retailerFieldsAvailable,false);assert.equal(product.retailers.length,1)
  }
})

test('missing or nonpublic shoes return null without local sample or affiliate fallback',async()=>{
  for(const value of [null,shoe({status:'draft'}),shoe({status:'private'}),shoe({status:'future'})]){
    globalThis.fetch=async()=>Response.json({data:{shoe:value}})
    assert.equal(await getProductPreview('actual-shoe'),null)
  }
  const product=mapProductPreview(shoe({featuredImage:null,solemartShoeFields:{}}),'actual-shoe')
  assert.equal(product.image,undefined);assert.deepEqual(product.retailers,[]);assert.deepEqual(product.specs,[])
})

test('retailer links reject unsafe and placeholder URLs, deduplicate and retain actual destinations',()=>{
  const product=mapProductPreview(shoe({featuredImage:{node:{sourceUrl:'https://bad.example/image.jpg'}},solemartShoeFields:{affiliateUrl:'https://amazon.com/dp/example?tag=solemart-20',retailer2Name:'Bad',retailer2Url:'javascript:alert(1)',retailer3Name:'Bad',retailer3Url:'https://user:pass@shop.test/anything'}}),'actual-shoe')
  assert.deepEqual(product.retailers,[]);assert.equal(product.image,undefined)
  const url='https://www.rei.com/product/123'
  const duplicate=mapProductPreview(shoe({solemartShoeFields:{affiliateUrl:url,retailer2Url:url,retailer3Url:'https://shop.example.com/product'}}),'actual-shoe')
  assert.deepEqual(duplicate.retailers,[{name:'rei.com',url}])
})

test('invalid slugs and endpoint configuration never fetch arbitrary destinations',async()=>{
  globalThis.fetch=async()=>assert.fail('Must not fetch')
  for(const slug of ['bad/slug','has spaces','?other', ['actual-shoe'],'a'.repeat(201)]){assert.equal(isProductPreviewSlug(slug),false);assert.equal(await getProductPreview(slug),null)}
  process.env.WORDPRESS_GRAPHQL_URL='file:///etc/passwd';await assert.rejects(getProductPreview('actual-shoe'),/not configured/)
})

test('real upstream and mixed schema errors do not become missing records or optional-field fallbacks',async()=>{
  for(const result of [Response.json({errors:[{message:'Cannot query field "retailer2Name" on type "SolemartShoeFields".'},{message:'Database failure'}]}),new Response('Unavailable',{status:503}),Response.json({data:{}}),Response.json({data:{shoe:shoe({slug:'different'})}})]){
    let calls=0;globalThis.fetch=async()=>{calls++;return result}
    await assert.rejects(getProductPreview('actual-shoe'));assert.equal(calls,1)
  }
})

test('the ACF export preserves the Shoe group and adds only optional structured retailer slots',()=>{
  const groups=JSON.parse(readFileSync(new URL('../public/downloads/solemart-acf-fields.json',import.meta.url),'utf8'))
  const group=groups.find(g=>g.key==='group_solemart_shoe_acf')
  for(const slot of [2,3])for(const kind of ['name','url']){
    const field=group.fields.find(f=>f.name===`retailer_${slot}_${kind}`)
    assert(field);assert.equal(field.required,0);assert.equal(field.type,kind==='url'?'url':'text');assert.equal(field.show_in_graphql,1)
  }
  assert(group.fields.some(f=>f.name==='affiliate_url'))
})
