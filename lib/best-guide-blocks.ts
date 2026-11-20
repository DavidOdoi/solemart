import { escapeAttribute, escapeText } from 'entities'
import { guideCtaNote } from './guide-cta-copy.ts'

export type BestGuidePick = {
  id: string; name: string; award: string; summary: string; bestFor: string
  explanation: string; pros: string[]; cons: string[]; amazonUrl?: string
}
export type BestGuideCopy = {
  shortlistTitle?: string
  introduction: string[]; quickAnswer: string; methodology: string
  picks: BestGuidePick[]; advice: { title: string; body: string }[]
  faqs: { question: string; answer: string }[]; verdict: string[]
}

// Core Gutenberg blocks only: no custom plugin, shortcode or ACF dependency.
function block(name: string, html: string, attributes?: Record<string, unknown>) {
  const json = attributes ? ` ${JSON.stringify(attributes).replace(/--/g, '\\u002d\\u002d').replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')}` : ''
  return `<!-- wp:${name}${json} -->\n${html}\n<!-- /wp:${name} -->`
}
const group = (name: string, children: string[]) => block('group', `<div class="wp-block-group ${name}">${children.join('\n\n')}</div>`, { className: name, layout: { type: 'default' } })
const paragraph = (text: string, name?: string) => block('paragraph', `<p${name ? ` class="${name}"` : ''}>${text}</p>`, name ? { className: name } : undefined)
const heading = (text: string, id?: string, level = 2) => block('heading', `<h${level}${id ? ` id="${escapeAttribute(id)}"` : ''} class="wp-block-heading">${escapeText(text)}</h${level}>`, { ...(level !== 2 ? { level } : {}), ...(id ? { anchor: id } : {}) })
const list = (items: string[]) => block('list', `<ul class="wp-block-list">${items.map(text => block('list-item', `<li>${escapeText(text)}</li>`)).join('')}</ul>`)

export function bestGuideBlocks(copy: BestGuideCopy) {
  const rows = copy.picks.map(pick => `<tr><td>${escapeText(pick.award)}</td><td><a href="#${escapeAttribute(pick.id)}">${escapeText(pick.name)}</a></td><td>${escapeText(pick.bestFor)}</td></tr>`).join('')
  return group('solemart-best-guide', [
    group('sm-guide-intro', [...copy.introduction.map(text => paragraph(text)), paragraph('<strong>The quick answer:</strong> ' + copy.quickAnswer)]),
    paragraph('Some links below lead to Amazon. We may earn a commission from qualifying purchases, at no extra cost to you.', 'sm-disclosure'),
    group('sm-quick-picks', [paragraph('YOUR SHORTLIST', 'sm-eyebrow'), heading(copy.shortlistTitle || 'Your shortlist, at a glance', 'quick-picks'), paragraph('Start with what you do most. Select a model to jump to its strengths, trade-offs and buying link.'), block('table', `<figure class="wp-block-table"><table class="has-fixed-layout"><thead><tr><th>Best for</th><th>Our pick</th><th>Start here if…</th></tr></thead><tbody>${rows}</tbody></table></figure>`, { hasFixedLayout: true })]),
    group('sm-method', [paragraph('BEHIND THE PICKS', 'sm-eyebrow'), heading('How we chose', 'how-we-chose'), paragraph(copy.methodology)]),
    ...copy.picks.map((pick, index) => group('sm-pick', [
      paragraph(`<strong>${String(index + 1).padStart(2, '0')}</strong> ${escapeText(pick.award)}`, 'sm-pick-label'),
      heading(pick.name, pick.id),
      group('sm-pick-layout', [
        group('sm-pick-visual', [block('image', `<figure class="wp-block-image size-full sm-product-image"><img src="https://thesolemart.com/placeholder.svg" alt="${escapeAttribute('Placeholder for ' + pick.name + ' product photograph')}"/><figcaption class="wp-element-caption">${escapeText(pick.name)}</figcaption></figure>`, { sizeSlug: 'full', linkDestination: 'none', className: 'sm-product-image' })]),
        group('sm-pick-content', [
          paragraph(escapeText(pick.summary), 'sm-pick-lede'),
          paragraph('<strong>Best for:</strong> ' + escapeText(pick.bestFor)),
          heading('Why it makes the shortlist', undefined, 3), paragraph(pick.explanation),
          group('sm-pros-cons', [group('sm-pros', [heading('Pros', undefined, 3), list(pick.pros)]), group('sm-cons', [heading('Consider', undefined, 3), list(pick.cons)])]),
          block('buttons', `<div class="wp-block-buttons">${block('button', `<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="${escapeAttribute(pick.amazonUrl || 'https://www.amazon.com/s?' + new URLSearchParams({ k: pick.name + ' men' }))}" target="_blank" rel="sponsored nofollow noopener noreferrer">Buy on Amazon</a></div>`)}</div>`),
          paragraph(guideCtaNote([pick.amazonUrl || 'https://www.amazon.com/s?' + new URLSearchParams({ k: pick.name + ' men' })]), 'sm-cta-note'),
        ]),
      ]),
    ])),
    group('sm-buying-advice', [paragraph('BEFORE YOU BUY', 'sm-eyebrow'), heading('Choose the shoe for your day', 'buying-advice'), ...copy.advice.flatMap(item => [heading(item.title, undefined, 3), paragraph(item.body)])]),
    group('sm-faq', [heading('Your questions, answered', 'faqs'), ...copy.faqs.flatMap(item => [heading(item.question, undefined, 3), paragraph(item.answer)])]),
    group('sm-verdict', [paragraph('THE TAKEAWAY', 'sm-eyebrow'), heading('The right pair starts with your routine', 'final-verdict'), ...copy.verdict.map(text => paragraph(text)), paragraph('<a href="#quick-picks">Back to the shortlist ↑</a>')]),
  ])
}
