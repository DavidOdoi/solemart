import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { getProductDirectory, getProductPreview } from '../lib/product-preview.ts'

const originalFetch=globalThis.fetch, originalEndpoint=process.env.WORDPRESS_GRAPHQL_URL
const shoe=(slug='boot-one',status='publish')=>({title:'An actual boot',slug,status,content:'<h2>Fit and sizing</h2><p>Source-based analysis.</p><h2>FAQs</h2><h3>What width?</h3><p>Compare the size chart.</p>',solemartShoeFields:{brand:'Verified brand',specs:'Upper | Verified material',commentary:'Existing commentary.'}})
beforeEach(()=>{process.env.WORDPRESS_GRAPHQL_URL='https://cms.thesolemart.com/graphql'})
afterEach(()=>{globalThis.fetch=originalFetch;if(originalEndpoint===undefined)delete process.env.WORDPRESS_GRAPHQL_URL;else process.env.WORDPRESS_GRAPHQL_URL=originalEndpoint})

test('directory requests are bounded, paginated and filtered through GraphQL variables',async()=>{
  globalThis.fetch=async(_url,options)=>{
    const body=JSON.parse(options.body)
    assert.match(body.query,/shoes\(first: 12/);assert.match(body.query,/status: PUBLISH, search: \$search/)
    assert.deepEqual(body.variables,{search:'sea turtle boots',after:'Y3Vyc29yMQ=='})
    assert.equal(options.cache,'no-store')
    return Response.json({data:{shoes:{nodes:[shoe(),shoe('draft-boot','draft')],pageInfo:{hasNextPage:true,endCursor:'Y3Vyc29yMg=='}}}})
  }
  const result=await getProductDirectory('sea turtle boots','Y3Vyc29yMQ==')
  assert.equal(result.products.length,1);assert.equal(result.hasNextPage,true)
  assert.match(result.products[0].reviewBodyHtml,/<h2>Fit and sizing<\/h2>/)
})

test('a genuinely empty directory remains empty without a sample-data fallback',async()=>{
  globalThis.fetch=async()=>Response.json({data:{shoes:{nodes:[],pageInfo:{hasNextPage:false,endCursor:null}}}})
  assert.deepEqual(await getProductDirectory(),{products:[],hasNextPage:false,endCursor:null})
})

test('missing native Editor support does not break existing Shoe records',async()=>{
  let calls=0
  globalThis.fetch=async(_url,options)=>{
    calls++;const body=JSON.parse(options.body)
    if(calls===1)return Response.json({errors:[{message:'Cannot query field "content" on type "Shoe".'}]},{status:400})
    assert.doesNotMatch(body.query,/status content/);assert.match(body.query,/retailer2Name/)
    return Response.json({data:{shoe:shoe()}})
  }
  const result=await getProductPreview('boot-one');assert.equal(calls,2);assert.equal(result.retailerFieldsAvailable,true)
})

test('malformed pagination, invalid filters and real upstream failures do not become an empty catalogue',async()=>{
  globalThis.fetch=async()=>assert.fail('Must not fetch invalid input')
  await assert.rejects(getProductDirectory('a'.repeat(151)));await assert.rejects(getProductDirectory('','not a cursor'))
  globalThis.fetch=async()=>Response.json({data:{shoes:{nodes:[],pageInfo:{hasNextPage:true,endCursor:null}}}})
  await assert.rejects(getProductDirectory(),/incomplete/)
  globalThis.fetch=async()=>Response.json({errors:[{message:'Database failure'}]})
  await assert.rejects(getProductDirectory(),/could not return/)
})
