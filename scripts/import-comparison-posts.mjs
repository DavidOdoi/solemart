import { mkdir, writeFile, appendFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { checkWordPressComparisonImport, getComparisonWordPressDrafts, importWordPressComparisonDrafts } from '../lib/wordpress-comparison-import.ts'

const args = process.argv.slice(2)
const outputAt = args.indexOf('--output')
if (outputAt >= 0 && (!args[outputAt + 1] || args[outputAt + 1].startsWith('--'))) {
  console.error('--output requires a directory path.')
  process.exit(1)
}
const output = resolve(outputAt < 0 ? '/tmp/solemart-wordpress-comparisons' : args[outputAt + 1] || '')
if (args.some((arg, index) => !['--check', '--save', '--output'].includes(arg) && !(outputAt >= 0 && index === outputAt + 1))) {
  console.error('Use --check for read-only CMS checks, --save to create drafts, or no flag to export draft content. Optional: --output directory.')
  process.exit(1)
}
if (args.includes('--check') && args.includes('--save')) {
  console.error('Choose either --check or --save.')
  process.exit(1)
}
await mkdir(output, { recursive: true })
const drafts = getComparisonWordPressDrafts()
await writeFile(resolve(output, 'comparison-post-drafts.json'), JSON.stringify(drafts, null, 2) + '\n')
for (const post of drafts) await writeFile(resolve(output, `${post.slug}.html`), post.content + '\n')
try {
  if (args.includes('--check')) console.log(JSON.stringify({ action: 'READ_ONLY_CHECK', plan: await checkWordPressComparisonImport() }, null, 2))
  else if (args.includes('--save')) {
    const results = await importWordPressComparisonDrafts({
      async onProgress(step) {
        await appendFile(resolve(output, 'created-posts.jsonl'), JSON.stringify(step) + '\n')
      },
    })
    await writeFile(resolve(output, 'wordpress-results.json'), JSON.stringify(results, null, 2) + '\n')
    console.log(JSON.stringify({ action: 'IMPORT_FINISHED', results }, null, 2))
  } else console.log(JSON.stringify({ action: 'EXPORTED_ONLY', articles: drafts.length, output, wordpressWrites: 0 }))
} catch (error) {
  console.error(error instanceof Error ? error.message : 'WordPress comparison import failed.')
  process.exitCode = 1
}
