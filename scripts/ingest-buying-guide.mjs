import { readFile, readdir, mkdir, writeFile, appendFile } from 'node:fs/promises'
import { resolve, extname, basename } from 'node:path'
import { validateBuyingGuide } from '../lib/guide-ingestion.ts'
import { getWordPressWriteConfig, saveWordPressBuyingGuideDraft } from '../lib/wordpress-drafts.ts'
import { isWordPressEnabled } from '../lib/content-source.ts'

const args = process.argv.slice(2)
const value = name => { const index = args.indexOf(name); return index < 0 ? undefined : args[index + 1] }
const queue = JSON.parse(await readFile(new URL('../data/ingestion/selected-keywords.json', import.meta.url), 'utf8'))
const selected = new Set(queue.articles.map(row => row.keyword.toLowerCase()))

if (args.includes('--queue')) {
  console.log(JSON.stringify(queue, null, 2))
  process.exit(0)
}
if (!value('--file') && !value('--batch')) {
  console.log('Use --queue, --file guide.json, or --batch directory. Validation is the default. Add --save to create verified drafts, or --save-incomplete-draft to explicitly keep an unfinished editorial draft private.')
  process.exit(0)
}
const save = args.includes('--save') || args.includes('--save-incomplete-draft')
if (save && !isWordPressEnabled()) {
  console.error('WordPress is paused in local-content mode. Reconnect it explicitly before saving CMS drafts; no request was sent.')
  process.exit(1)
}
if (save && !getWordPressWriteConfig()) {
  console.error('WordPress credentials are not configured. Set WORDPRESS_USERNAME and WORDPRESS_APPLICATION_PASSWORD securely; no request was sent.')
  process.exit(1)
}
const directory = value('--batch') ? resolve(value('--batch')) : null
const files = directory ? (await readdir(directory)).filter(name => extname(name) === '.json').sort().map(name => resolve(directory, name)) : [resolve(value('--file'))]
const output = resolve(value('--output') || '/tmp/solemart-ingestion-reports')
await mkdir(output, { recursive: true })
let failed = false
const inputs = new Map()
for (const file of files) {
  try {
    const source = await readFile(file, 'utf8')
    if (source.length > 2_000_000) throw new Error('Payload too large')
    inputs.set(file, JSON.parse(source))
  } catch { inputs.set(file, null) }
}
for (const file of files) {
  const journal = []
  const job = basename(file, '.json').replace(/[^a-zA-Z0-9-]/g, '-').slice(0, 120) || 'guide'
  try {
    if (extname(file) !== '.json') throw new Error('Ingestion accepts JSON payload files only.')
    const article = inputs.get(file)
    if (!article) throw new Error('The article payload must be a readable JSON object under 2 MB. Its contents were not logged.')
    if (!article || typeof article.targetKeyword !== 'string' || !selected.has(article.targetKeyword.toLowerCase().trim())) throw new Error('This keyword is not in the user-approved green selection. Nothing was written to WordPress.')
    const existing = []
    for (const other of files.filter(candidate => candidate !== file)) {
      try { const row = inputs.get(other); if (row && typeof row.slug === 'string' && typeof row.title === 'string' && Array.isArray(row.products) && Array.isArray(row.faqs)) existing.push({ slug: row.slug, title: row.title, text: [row.intro, row.quickAnswerBody, row.advice, row.finalVerdict].filter(value => typeof value === 'string').join(' ') }) } catch { /* Each invalid file receives its own report. */ }
    }
    const report = await validateBuyingGuide(article, { existingArticles: existing })
    await writeFile(resolve(output, `${job}.report.json`), JSON.stringify(report, null, 2) + '\n')
    if (save) {
      const result = await saveWordPressBuyingGuideDraft(article, {
        allowIncomplete: args.includes('--save-incomplete-draft'),
        existingArticles: existing,
        onProgress(step) { journal.push(step) },
      })
      await writeFile(resolve(output, `${job}.draft.json`), JSON.stringify(result, null, 2) + '\n')
      console.log(JSON.stringify({ keyword: article.targetKeyword, action: result.status, id: result.id, editorUrl: result.editorUrl, published: false, verification: report.status }))
    } else {
      console.log(JSON.stringify({ keyword: article.targetKeyword, action: report.wordpressAction, verification: report.status, wordCount: report.wordCount, errors: report.criticalErrors.length, warnings: report.warnings.length }))
      if (report.status !== 'PASS') failed = true
    }
  } catch (error) {
    failed = true
    const message = error instanceof Error ? error.message : 'Ingestion failed.'
    await writeFile(resolve(output, `${job}.failure.json`), JSON.stringify({ status: 'FAIL', file: basename(file), message, journal, published: false }, null, 2) + '\n')
    console.error(JSON.stringify({ file: basename(file), status: 'FAIL', message, completedDraftSteps: journal }))
  } finally {
    if (journal.length) await appendFile(resolve(output, 'draft-journal.jsonl'), JSON.stringify({ job, steps: journal, at: new Date().toISOString() }) + '\n')
  }
}
if (!files.length) { console.error('No article JSON payloads were found. The keyword queue is a research plan, not completed article content.'); failed = true }
process.exitCode = failed ? 1 : 0
