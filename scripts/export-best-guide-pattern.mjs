import { mkdir, writeFile } from 'node:fs/promises'
import { bestGuideBlocks } from '../lib/best-guide-blocks.ts'
import { nikeBestGuidePreview } from '../data/nike-best-guide-preview.ts'

const starter = bestGuideBlocks({
  introduction: ['Introduce the focus keyword and explain who this guide helps. Keep the introduction short and useful.'],
  quickAnswer: 'Name the best starting point for each main use case and explain the deciding difference.',
  methodology: 'Describe the sources you actually checked and how you selected the products. Link to supporting evidence and distinguish research from any testing you performed.',
  picks: [1, 2, 3].map(number => ({
    id: `product-${number}`, name: `Product name ${number}`, award: 'Best for a specific use',
    summary: 'Explain the main reason to consider this product in one or two sentences.',
    bestFor: 'State the specific reader or activity this option suits.',
    explanation: 'Explain the features that support the recommendation, include a relevant source link, and tell readers where the product has limitations.',
    pros: ['A specific, supported benefit.', 'Another useful benefit.'],
    cons: ['A meaningful limitation.', 'A reason to choose another option.'],
    amazonUrl: 'https://www.amazon.com/',
  })),
  advice: [
    { title: 'Match the product to your routine', body: 'Explain the main criteria that change the buying decision for this particular topic.' },
    { title: 'Check fit and sizing', body: 'Give topic-specific fit checks and link to the manufacturer’s relevant guidance.' },
    { title: 'Check the exact listing', body: 'Help readers confirm the model, size, seller and return terms. Avoid unsupported prices or availability claims.' },
  ],
  faqs: [
    { question: 'Add a real reader question', answer: 'Answer it directly and explain the relevant exception or next step.' },
    { question: 'Add another common question', answer: 'Give a useful answer specific to this buying guide.' },
  ],
  verdict: ['Recommend a starting point for the main use case, explain when another pick is more suitable, and give readers a clear next step.'],
})
const directory = new URL('../public/downloads/', import.meta.url)
await mkdir(directory, { recursive: true })
for (const [name, title, content] of [
  ['solemart-best-guide-pattern', 'SoleMart — Best buying guide', starter],
  ['solemart-nike-guide-example', 'SoleMart — Nike buying-guide example', nikeBestGuidePreview.contentHtml],
]) {
  await writeFile(new URL(`${name}.json`, directory), JSON.stringify({ __file: 'wp_block', title, content, syncStatus: 'unsynced' }, null, 2) + '\n')
  await writeFile(new URL(`${name}.html`, directory), content + '\n')
}
console.log('Exported the editable starter and Nike example as native WordPress patterns and Gutenberg HTML.')
