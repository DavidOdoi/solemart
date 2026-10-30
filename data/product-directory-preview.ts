import type { ProductPreview } from '@/lib/product-preview'

// Frontend-only examples: not inventory, verified specifications or test reports.
const styles = [
  { slug: 'classic-western-brown', name: 'Classic Western — Dark Brown', profile: 'Tall western', toe: 'Square', heel: 'Western-style', color: 'Dark brown', use: 'A pronounced western silhouette', summary: 'A taller profile with a broad square toe and an embossed-pattern vamp. Compare this shape when the boot is a visible part of the outfit.', fit: 'Start with the instep and heel hold. A broad-looking toe does not establish the internal width, and the shape of the last matters as much as the label on the box.', tradeoff: 'A tall shaft and pronounced heel can be part of the appeal, but they also change the feel compared with a low everyday shoe. Choose the actual model for the amount of walking you plan to do.' },
  { slug: 'roper-chestnut', name: 'Roper Profile — Chestnut', profile: 'Short roper', toe: 'Round', heel: 'Lower block', color: 'Chestnut', use: 'An understated everyday look', summary: 'A shorter-shaft roper-style design with a round toe and a lower-looking block heel. It offers a different visual balance from the taller western profiles.', fit: 'Check the opening, instep and how easily the foot settles into the boot. A shorter shaft does not guarantee a relaxed fit; compare the maker’s measurements and return terms.', tradeoff: 'This profile is worth comparing when you prefer less shaft height in an outfit. It is not evidence of greater comfort or better walking performance without trying the actual pair.' },
  { slug: 'dress-western-black', name: 'Dress Western — Black', profile: 'Dress western', toe: 'Snip', heel: 'Western-style', color: 'Black', use: 'A sharper dress-oriented profile', summary: 'A sleek black design with a narrower-looking toe and a patterned vamp. The silhouette puts more emphasis on its long line and dress-oriented appearance.', fit: 'Pay attention to where the toe taper begins. Judge usable toe space rather than the external tip, and do not assume that going up in length solves a width mismatch.', tradeoff: 'The shape may suit the look you want while still being unsuitable for your feet or routine. Check the actual sole, lining and heel construction instead of inferring them from the photograph.' },
  { slug: 'round-toe-sand', name: 'Round Toe — Sand', profile: 'Everyday western', toe: 'Round', heel: 'Lower block', color: 'Sand', use: 'A lighter-colored casual option', summary: 'A sand-colored, round-toe example with a medium-looking shaft and lower block heel. Its lighter finish gives the same directory layout a more casual option to compare.', fit: 'Compare heel security and pressure through the forefoot with your usual socks. A rounded outline may look generous but does not confirm the internal volume of a real boot.', tradeoff: 'The lighter color is a styling choice, not a durability rating. Check the material declaration, care instructions and whether the finish suits the weather and use you have in mind.' },
]

export const directoryDesignProducts: ProductPreview[] = styles.map(style => ({
  slug: `design-${style.slug}`, name: style.name, brand: 'Illustrative boot style',
  image: { src: '/preview/product/boot-styles.png', alt: `Illustrative ${style.color.toLowerCase()} ${style.profile.toLowerCase()} boot design, not a real product photograph` },
  descriptionHtml: `<p>${style.summary}</p>`,
  specs: [
    { label: 'Profile', value: style.profile }, { label: 'Toe shape', value: `${style.toe} — illustration` },
    { label: 'Heel profile', value: `${style.heel} — illustration` }, { label: 'Color', value: style.color },
    { label: 'Upper', value: 'Embossed faux-material design illustration' },
    { label: 'Style emphasis', value: style.use }, { label: 'Weight / sizing', value: 'Not specified in this design example' },
  ],
  pros: [style.use, 'A distinct profile to compare with the other styles.'],
  cons: ['The illustration cannot establish fit or comfort.', 'Actual materials and construction need model-specific evidence.'],
  commentaryHtml: '',
  reviewBodyHtml: `<h3>The quick answer</h3><p>${style.summary}</p>
<h2>Fit and sizing</h2><p>${style.fit}</p><p>For a real purchase, follow the manufacturer’s current size chart, check available widths and try both boots with your usual socks. Assess pressure points, heel movement and whether the pair feels secure while walking.</p>
<h2>Materials and construction</h2><p>This is a fictional textured-upper design. The illustration is not proof of leather type, animal species, a lining material or a particular sole construction.</p><p>A published review should identify the exact model and distinguish its stated upper, lining, outsole and construction method. If a seller uses the phrase “sea turtle,” ask what it means and check the material documentation rather than assuming that a pattern proves a source.</p>
<h2>Where this profile may suit you</h2><p>${style.tradeoff}</p>
<h2>What to check before buying</h2><ul><li>Usable toe room, instep pressure and heel security.</li><li>Current model specifications and material declaration.</li><li>Condition, repairs and sole wear if the pair is used.</li><li>Delivery, sizing exchanges and return terms in your location.</li></ul>
<h2>Review verdict</h2><p>Use this profile to narrow the appearance you prefer, then compare real models with reliable specifications. The final choice should depend on fit, intended use and supported construction details. This example does not claim that a real product has been tested.</p>`,
  retailers: [{ name: 'Check Price on Amazon', url: '' }, { name: 'Visit retailer', url: '' }],
  retailerFieldsAvailable: true,
}))

export const directoryBuyingGuideHtml = `
<h2>What does “sea turtle boots” describe?</h2><p>A search term is not a material declaration. Before comparing a particular pair, establish whether the seller is describing a visual pattern, a substitute material or a documented historical item. A photograph alone cannot establish origin, authenticity or the rules that apply to a transaction.</p><p>The four designs above are fictional illustrations with a textured faux-material appearance. They demonstrate the directory and review layout; they are not listings for genuine sea turtle material.</p>
<h2>How to compare before buying</h2>
<h3>Materials and provenance</h3><p>Identify the exact model and read its current material description. If a listing makes an unusual material claim, request supporting documentation and check the applicable trade rules through authoritative sources. Avoid treating an embossed pattern or an unsupported seller statement as proof.</p>
<h3>Fit and intended use</h3><p>Compare usable toe room, instep pressure, heel hold and the shaft opening. Consider how long you will wear the boots and how much walking your day involves. Appearance, price and a width label are not substitutes for assessing fit.</p>
<h3>Condition and construction</h3><p>For a used pair, examine the soles, heels, lining, stitching and any repairs. For a new pair, confirm the maker’s construction and care guidance. Condition should be judged from current photographs and a reliable description of the actual item.</p>
<h3>Retailer and return terms</h3><p>Confirm that the listing describes the exact model, size and condition you want. Read delivery and return conditions for your location before ordering, especially when fit cannot be checked in person.</p>
<h2>Frequently asked questions</h2>
<h3>Are turtle-pattern boots necessarily made from sea turtles?</h3><p>No. A texture or marketing phrase does not establish the source of a material. Read the material declaration and seek reliable documentation for the particular item.</p>
<h3>Can a photograph prove the material?</h3><p>A photograph can show appearance and some visible condition, but it cannot independently verify material origin, authenticity or the complete construction of a boot.</p>
<h3>What should I check in a used pair?</h3><p>Ask for clear current photographs of the upper, soles, heels and lining, plus details of repairs, sizing and return terms. An old catalogue photograph does not establish the condition of a particular used pair.</p>
<h3>Which style is best for walking?</h3><p>The shape in a picture cannot establish walking comfort. Compare the fit, sole feel and intended use of the real model, and try it with your usual socks where possible.</p>
<h2>Make the shortlist around your needs</h2><p>Start with the profile you prefer, then verify the actual model’s fit, materials and condition. Use the comparison table to identify questions you still need answered rather than assuming every missing specification is the same across products.</p>
`
