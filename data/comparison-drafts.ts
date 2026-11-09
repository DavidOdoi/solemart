import type { ComparisonTemplateContent } from './comparison-template'
import { cowhideBootsComparison } from './comparison-drafts/cowhide-boots-vs-leather-boots.ts'
import { cowboyBootsComparison } from './comparison-drafts/cowboy-boots-vs-work-boots.ts'
import { safetyToeComparison } from './comparison-drafts/steel-toe-vs-composite-toe-boots.ts'
import { hikingBootsComparison } from './comparison-drafts/work-boots-vs-hiking-boots.ts'
import { combatShoesComparison } from './comparison-drafts/wrestling-shoes-vs-boxing-shoes.ts'

export type ComparisonDraft = {
  content: ComparisonTemplateContent
  reviewNotes: string[]
  imageNeeds: string[]
}

// Written from the supplied research briefs. These remain review-only drafts:
// source access and image permissions have not been independently confirmed.
export const comparisonDrafts: ComparisonDraft[] = [
  {
    content: cowhideBootsComparison,
    reviewNotes: [
      'The spreadsheet marks this topic PUBLISHED in one field and Draft in another. Check the existing CMS record and canonical URL before publishing or replacing anything.',
      'Reopen the leather terminology references and verify each material claim. Cowhide, grain treatment and suede must not be presented as mutually exclusive categories.',
    ],
    imageNeeds: ['A named boot with documented cowhide leather and a confirmed image licence.', 'A documented leather-source or finish comparison, labelled to explain the overlapping categories; image rights and exact identity required.'],
  },
  {
    content: cowboyBootsComparison,
    reviewNotes: [
      'Check the current official workplace guidance and the edition of any safety standard cited. Do not treat every work boot or Western-style work boot as protective footwear.',
      'Any named product example will need its own manufacturer specification and exact model/version before it can be added.',
    ],
    imageNeeds: ['A named traditional cowboy boot, with its intended use and photo rights documented.', 'A named safety-rated work boot or Western-style work boot with matching model documentation and confirmed photo rights.'],
  },
  {
    content: safetyToeComparison,
    reviewNotes: [
      'Verify the official performance-standard summary and current workplace requirements. The same specified impact/compression requirements do not imply identical protection against all hazards.',
      'Recheck manufacturer guidance before adding weight, thermal or screening comparisons. A non-metallic toe cap does not establish metal-free or electrically protective footwear.',
    ],
    imageNeeds: ['A documented steel-toe model with an approved exact-model photograph.', 'A documented composite-toe model with an approved exact-model photograph; a technical cutaway requires its own permission.'],
  },
  {
    content: hikingBootsComparison,
    reviewNotes: [
      'Verify manufacturer intended-use guidance and official workplace requirements. Remove blanket claims that all work boots are heavy or all hiking boots lack every protective feature.',
      'A proposed hybrid example needs documentation for both intended use and the specific protective features discussed.',
    ],
    imageNeeds: ['A named work boot with documented intended use, protection where discussed and confirmed image rights.', 'A named hiking boot with documented intended use and confirmed image rights.'],
  },
  {
    content: combatShoesComparison,
    reviewNotes: [
      'The supplied sports brief relies heavily on a weak third-party source; it is excluded from article citations. Obtain primary manufacturer documentation for any construction or outsole claims.',
      'No precise competition footwear clause has been verified. Check the current rulebook for the organisation, discipline, age group and event before adding one.',
    ],
    imageNeeds: ['An exact wrestling-shoe model/version and colourway with manufacturer documentation and photo permission.', 'An exact boxing-shoe model/version and colourway with manufacturer documentation and photo permission.'],
  },
]

export function getComparisonDraft(slug: string) {
  return comparisonDrafts.find(({ content }) => content.post.slug === slug)
}
