import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mapGuideFields } from '../lib/guide-fields.ts'

const post = { title: 'Real guide', slug: 'real-guide', category: 'BUYING GUIDE', date: 'October 21, 2026', publishedAt: '2026-10-21T08:00:00.000Z', modifiedAt: '2026-10-21T09:00:00.000Z', excerpt: 'Real summary', paragraphs: [], contentHtml: '<p>Editor body</p>' }
const shoe = { name: 'A real shoe', image: 'https://cms.thesolemart.com/wp-content/uploads/2026/10/shoe.jpg', imageAlt: 'Blue shoe', affiliateUrl: 'https://www.amazon.com/dp/TEST?tag=sample-20', badge: 'Best Overall', shortReason: 'Short verdict', bestFor: 'Daily walks', avoidIf: 'You need a waterproof shoe', pros: 'Comfort\nFit', cons: 'Limited colours', specs: 'Weight | 250 g\nDrop | 8 mm', review: 'Paragraph one.\n\nParagraph two.', cushioning: 'Soft', widthOptions: 'Wide', mainStrength: 'Comfort' }

test('maps structured CMS fields into the original template models', () => {
  const {guide,products} = mapGuideFields(post, {
    intro: 'Real introduction', quickAnswerBody: 'Real quick answer', author: 'Editor', reviewedBy: 'Reviewer',
    howWeChose: 'Checked fit\nCompared materials', advice: 'Check sizing', whoItsFor: 'Walkers', mistakesToAvoid: 'Buying the wrong size', finalVerdict: 'Our verdict',
    seoTitle: 'Custom SEO title', metaDescription: 'Custom description', products: [{}, shoe],
    faqs: [{question:'How does it fit?',answer:'Try your usual size.'}],
    buyingGuideSections: [{heading:'Fit', paragraphs:'First paragraph.\n\nSecond paragraph.'}],
  })
  assert.equal(guide.cmsManaged, true)
  assert.equal(guide.intro,'Real introduction')
  assert.equal(guide.contentHtml,post.contentHtml)
  assert.equal(guide.seoTitle,'Custom SEO title')
  assert.equal(guide.updatedAt,post.modifiedAt)
  assert.equal(guide.author,'Editor')
  assert.equal(guide.reviewedBy,'Reviewer')
  assert.deepEqual(guide.howWeChose,['Checked fit','Compared materials'])
  assert.equal(guide.faqs[0].answer,'Try your usual size.')
  assert.deepEqual(guide.buyingGuideSections[0].paragraphs,['First paragraph.','Second paragraph.'])
  assert.equal(products.length,1)
  assert.equal(products[0].image,shoe.image)
  assert.equal(products[0].affiliateUrl,shoe.affiliateUrl)
  assert.equal(products[0].avoidIf,shoe.avoidIf)
  assert.deepEqual(products[0].pros,['Comfort','Fit'])
  assert.deepEqual(products[0].specs,[{label:'Weight',value:'250 g'},{label:'Drop',value:'8 mm'}])
  assert.deepEqual(products[0].review,['Paragraph one.','Paragraph two.'])
  assert.equal(guide.topPicks[0].productSlug,products[0].slug)
  assert.equal(guide.topPicks[0].cushioning,'Soft')
})

test('empty or partial CMS fields never borrow example products, links or editorial claims', () => {
  for(const fields of [null,{}, {products:[{name:'Shoe with incomplete fields'}]}]) {
    const {guide,products}=mapGuideFields(post,fields)
    assert.equal(guide.author,'')
    assert.equal(guide.reviewedBy,'')
    assert.deepEqual(guide.faqs,[])
    assert.equal(guide.quickAnswerBody,'')
    assert.ok(products.every(product=>!product.affiliateUrl))
    assert.doesNotMatch(JSON.stringify({guide,products}),/amazon\.com\/dp\/example|Fresh Foam|Footwear Research Desk/)
  }
})

test('rejects unsafe links and unsupported image hosts and bounds the number of picks', () => {
  const {products}=mapGuideFields(post,{products:[
    {...shoe,affiliateUrl:'javascript:alert(1)',image:'https://untrusted.test/image.jpg',reviewUrl:'http://example.test/review'},
    {...shoe,affiliateUrl:'https://user:secret@example.test'}, shoe,shoe,shoe,
  ]})
  assert.equal(products.length,4)
  assert.equal(products[0].affiliateUrl,'')
  assert.equal(products[0].image,'')
  assert.equal(products[0].reviewUrl,'')
  assert.equal(products[1].affiliateUrl,'')
  assert.throws(()=>mapGuideFields(post,'invalid'),/Invalid/)
})
